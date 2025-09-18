import { Injectable } from '@nestjs/common';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  country?: string;
  error?: string;
}

export interface PhoneNumberInfo {
  original: string;
  formatted: string;
  countryCode: string;
  nationalNumber: string;
  isValid: boolean;
}

@Injectable()
export class PhoneValidationService {
  
  // Common country codes and their patterns
  private readonly countryPatterns = {
    // North America
    '1': { name: 'US/Canada', minLength: 10, maxLength: 10 },
    // UK
    '44': { name: 'United Kingdom', minLength: 10, maxLength: 10 },
    // Germany
    '49': { name: 'Germany', minLength: 10, maxLength: 12 },
    // France
    '33': { name: 'France', minLength: 9, maxLength: 9 },
    // Syria (based on your test number)
    '963': { name: 'Syria', minLength: 8, maxLength: 9 },
    // Add more as needed
  };

  /**
   * Validates and formats a phone number
   */
  validatePhoneNumber(phoneNumber: string): PhoneValidationResult {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return {
        isValid: false,
        formatted: '',
        error: 'Phone number is required'
      };
    }

    // Clean the phone number (remove spaces, dashes, parentheses)
    const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
    
    // Check if it's empty after cleaning
    if (!cleaned) {
      return {
        isValid: false,
        formatted: '',
        error: 'Phone number cannot be empty'
      };
    }

    // Basic format validation
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
      return {
        isValid: false,
        formatted: cleaned,
        error: 'Phone number must contain only digits and optionally start with +'
      };
    }

    // Normalize format (ensure it starts with +)
    const normalized = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    
    // Extract country code and validate
    const countryCodeMatch = normalized.match(/^\+(\d{1,3})/);
    if (!countryCodeMatch) {
      return {
        isValid: false,
        formatted: normalized,
        error: 'Invalid country code format'
      };
    }

    const countryCode = countryCodeMatch[1];
    const nationalNumber = normalized.substring(countryCode.length + 1);

    // Validate total length (E.164 standard: max 15 digits including country code)
    if (normalized.length > 16) { // +15 digits max
      return {
        isValid: false,
        formatted: normalized,
        error: 'Phone number too long (max 15 digits)'
      };
    }

    if (normalized.length < 8) { // +7 digits min
      return {
        isValid: false,
        formatted: normalized,
        error: 'Phone number too short (min 7 digits)'
      };
    }

    // Validate against known country patterns if available
    const countryInfo = this.getCountryInfo(countryCode);
    if (countryInfo) {
      if (nationalNumber.length < countryInfo.minLength || 
          nationalNumber.length > countryInfo.maxLength) {
        return {
          isValid: false,
          formatted: normalized,
          error: `Invalid length for ${countryInfo.name} (expected ${countryInfo.minLength}-${countryInfo.maxLength} digits)`
        };
      }
    }

    // Additional validation rules
    if (nationalNumber.startsWith('0')) {
      return {
        isValid: false,
        formatted: normalized,
        error: 'National number cannot start with 0'
      };
    }

    return {
      isValid: true,
      formatted: normalized,
      country: countryInfo?.name
    };
  }

  /**
   * Get country information by country code
   */
  private getCountryInfo(countryCode: string) {
    // Try exact match first
    if (this.countryPatterns[countryCode]) {
      return this.countryPatterns[countryCode];
    }

    // Try partial matches for longer country codes
    for (const [code, info] of Object.entries(this.countryPatterns)) {
      if (countryCode.startsWith(code)) {
        return info;
      }
    }

    return null;
  }

  /**
   * Parse phone number into components
   */
  parsePhoneNumber(phoneNumber: string): PhoneNumberInfo {
    const validation = this.validatePhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      return {
        original: phoneNumber,
        formatted: '',
        countryCode: '',
        nationalNumber: '',
        isValid: false
      };
    }

    const normalized = validation.formatted;
    const countryCodeMatch = normalized.match(/^\+(\d{1,3})/);
    const countryCode = countryCodeMatch ? countryCodeMatch[1] : '';
    const nationalNumber = normalized.substring(countryCode.length + 1);

    return {
      original: phoneNumber,
      formatted: normalized,
      countryCode,
      nationalNumber,
      isValid: true
    };
  }

  /**
   * Format phone number for display
   */
  formatForDisplay(phoneNumber: string): string {
    const validation = this.validatePhoneNumber(phoneNumber);
    return validation.isValid ? validation.formatted : phoneNumber;
  }

  /**
   * Validate phone number and throw error if invalid
   */
  validateAndThrow(phoneNumber: string): string {
    const validation = this.validatePhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: validation.error || 'Invalid phone number format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    return validation.formatted;
  }

  /**
   * Check if two phone numbers are the same
   */
  arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
    const validation1 = this.validatePhoneNumber(phone1);
    const validation2 = this.validatePhoneNumber(phone2);
    
    if (!validation1.isValid || !validation2.isValid) {
      return false;
    }

    return validation1.formatted === validation2.formatted;
  }
}
