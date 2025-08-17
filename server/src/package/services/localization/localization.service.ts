import { getEnvService } from '@Infrastructure/config';
import { Injectable } from '@nestjs/common';
@Injectable()
export class LocalizationService {
  constructor() {}
//   price({ obj, priceKey }: { obj: any; priceKey: string }): number {
//     return obj[priceKey] || obj[serverConfig.defaultPrice];
//   }

  string({ obj, languageKey }: { obj: any; languageKey: string }): string {
    const env = getEnvService();
    return obj[languageKey] || obj[env.get("app.defaultLanguage")];
  }
}