/**
 * Test script to verify Department status management bug fixes
 * Tests both CREATE and UPDATE operations with INACTIVE status
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:12001/api/v1';
const ADMIN_ENDPOINT = `${API_BASE_URL}/admin/department`;

// Test configuration
const TEST_CONFIG = {
    // You'll need to replace this with a valid JWT token for testing
    authToken: 'Bearer YOUR_JWT_TOKEN_HERE',
    testDepartmentName: `Test-Department-${Date.now()}`,
    testDescription: 'Test department for status management verification'
};

/**
 * Test 1: Create department with INACTIVE status
 */
async function testCreateWithInactiveStatus() {
    console.log('\n🧪 TEST 1: Creating department with INACTIVE status...');
    
    try {
        const response = await axios.post(ADMIN_ENDPOINT, {
            name: TEST_CONFIG.testDepartmentName,
            description: TEST_CONFIG.testDescription,
            status: 'INACTIVE'
        }, {
            headers: {
                'Authorization': TEST_CONFIG.authToken,
                'Content-Type': 'application/json'
            }
        });

        const department = response.data;
        console.log('✅ Department created successfully');
        console.log(`📋 Department ID: ${department.id}`);
        console.log(`📋 Department Name: ${department.name}`);
        console.log(`📋 Department Status: ${department.status}`);
        
        if (department.status === 'INACTIVE') {
            console.log('✅ SUCCESS: Department created with INACTIVE status correctly!');
            return department.id;
        } else {
            console.log(`❌ FAILURE: Expected status 'INACTIVE', but got '${department.status}'`);
            return null;
        }
        
    } catch (error) {
        console.log('❌ ERROR creating department:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test 2: Update department status from ACTIVE to INACTIVE
 */
async function testUpdateStatusToInactive(departmentId) {
    console.log('\n🧪 TEST 2: Updating department status to INACTIVE...');
    
    try {
        // First, update to ACTIVE to ensure we have a baseline
        await axios.put(`${ADMIN_ENDPOINT}/${departmentId}`, {
            status: 'ACTIVE'
        }, {
            headers: {
                'Authorization': TEST_CONFIG.authToken,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📋 Set department to ACTIVE first');
        
        // Now update to INACTIVE
        const response = await axios.put(`${ADMIN_ENDPOINT}/${departmentId}`, {
            status: 'INACTIVE'
        }, {
            headers: {
                'Authorization': TEST_CONFIG.authToken,
                'Content-Type': 'application/json'
            }
        });

        const department = response.data;
        console.log('✅ Department updated successfully');
        console.log(`📋 Department ID: ${department.id}`);
        console.log(`📋 Department Status: ${department.status}`);
        
        if (department.status === 'INACTIVE') {
            console.log('✅ SUCCESS: Department status updated to INACTIVE correctly!');
            return true;
        } else {
            console.log(`❌ FAILURE: Expected status 'INACTIVE', but got '${department.status}'`);
            return false;
        }
        
    } catch (error) {
        console.log('❌ ERROR updating department:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Test 3: Verify status persistence by fetching the department
 */
async function testStatusPersistence(departmentId) {
    console.log('\n🧪 TEST 3: Verifying status persistence...');
    
    try {
        const response = await axios.get(`${ADMIN_ENDPOINT}/${departmentId}`, {
            headers: {
                'Authorization': TEST_CONFIG.authToken
            }
        });

        const department = response.data;
        console.log('✅ Department fetched successfully');
        console.log(`📋 Department Status: ${department.status}`);
        
        if (department.status === 'INACTIVE') {
            console.log('✅ SUCCESS: Status persisted correctly in database!');
            return true;
        } else {
            console.log(`❌ FAILURE: Expected persisted status 'INACTIVE', but got '${department.status}'`);
            return false;
        }
        
    } catch (error) {
        console.log('❌ ERROR fetching department:', error.response?.data || error.message);
        return false;
    }
}

/**
 * Cleanup: Delete test department
 */
async function cleanup(departmentId) {
    console.log('\n🧹 CLEANUP: Deleting test department...');
    
    try {
        await axios.delete(`${ADMIN_ENDPOINT}/${departmentId}`, {
            headers: {
                'Authorization': TEST_CONFIG.authToken
            }
        });
        console.log('✅ Test department deleted successfully');
    } catch (error) {
        console.log('⚠️  Warning: Could not delete test department:', error.response?.data || error.message);
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🚀 Starting Department Status Management Bug Fix Tests');
    console.log('=' .repeat(60));
    
    // Check if auth token is configured
    if (TEST_CONFIG.authToken === 'Bearer YOUR_JWT_TOKEN_HERE') {
        console.log('❌ ERROR: Please configure a valid JWT token in TEST_CONFIG.authToken');
        console.log('💡 You can get a token by logging in to the admin panel and copying it from the browser dev tools');
        return;
    }
    
    let departmentId = null;
    let allTestsPassed = true;
    
    try {
        // Test 1: Create with INACTIVE status
        departmentId = await testCreateWithInactiveStatus();
        if (!departmentId) {
            allTestsPassed = false;
        }
        
        if (departmentId) {
            // Test 2: Update status to INACTIVE
            const updateSuccess = await testUpdateStatusToInactive(departmentId);
            if (!updateSuccess) {
                allTestsPassed = false;
            }
            
            // Test 3: Verify persistence
            const persistenceSuccess = await testStatusPersistence(departmentId);
            if (!persistenceSuccess) {
                allTestsPassed = false;
            }
            
            // Cleanup
            await cleanup(departmentId);
        }
        
    } catch (error) {
        console.log('❌ Unexpected error during testing:', error.message);
        allTestsPassed = false;
    }
    
    // Final results
    console.log('\n' + '=' .repeat(60));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Department status management bug is FIXED!');
    } else {
        console.log('❌ SOME TESTS FAILED! Department status management bug still exists.');
    }
    console.log('=' .repeat(60));
}

// Run the tests
runTests().catch(console.error);
