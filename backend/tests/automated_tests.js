/**
 * KL UNIVERSITY PORTAL - AUTOMATED API TEST SUITE
 * 
 * This script executes functional test cases against the running backend server.
 * It covers Authentication, Events, and Announcements modules.
 * 
 * Prerequisites:
 * 1. Backend must be running on http://localhost:5000
 * 2. Database must be set up
 * 3. Node.js v18+ (for native fetch)
 * 
 * Usage: node tests/automated_tests.js
 */

const BASE_URL = 'http://localhost:5000/api';
const COLORS = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

// State variables to hold data between tests
let authToken = null; // In this app, we use ID/Role stored on client, but let's sim successful login data
let testUserId = null;
let createdAnnouncementId = null;

// Helper to log results
const logResult = (testId, description, status, errorMsg = '') => {
    const statusColor = status === 'PASS' ? COLORS.green : COLORS.red;
    console.log(
        `${COLORS.cyan}[${testId}]${COLORS.reset} ${description.padEnd(50)} ` +
        `${COLORS.bold}${statusColor}${status}${COLORS.reset} ${errorMsg ? `(${errorMsg})` : ''}`
    );
};

// Helper for HTTP requests
const request = async (endpoint, method = 'GET', body = null) => {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        
        const res = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await res.json();
        return { status: res.status, data };
    } catch (err) {
        return { status: 500, error: err.message };
    }
};

const runTests = async () => {
    console.log(`${COLORS.bold}\nStarting Automated System Tests...${COLORS.reset}`);
    console.log(`Target: ${BASE_URL}\n`);
    console.log("-".repeat(70));

    // =========================================================================
    // MODULE 1: AUTHENTICATION
    // =========================================================================
    
    // TC-API-01: Health Check
    {
        try {
            const res = await fetch('http://localhost:5000/');
            if (res.status === 200) logResult('TC-API-01', 'Server Health Check', 'PASS');
            else logResult('TC-API-01', 'Server Health Check', 'FAIL', `Status ${res.status}`);
        } catch (e) {
            logResult('TC-API-01', 'Server Health Check', 'FAIL', 'Server likely down');
            process.exit(1);
        }
    }

    // TC-API-02: Login Failure (Invalid Credentials)
    {
        const { status, data } = await request('/auth/login', 'POST', {
            email: 'wrong@test.com',
            password: 'wrongpassword'
        });
        if (status === 400 && data.error === 'User not found') {
            logResult('TC-API-02', 'Login Validation (User Not Found)', 'PASS');
        } else {
            logResult('TC-API-02', 'Login Validation (User Not Found)', 'FAIL');
        }
    }

    // TC-API-03: Login Success (Admin)
    // Note: Assuming the database has the initial seed user or you must create one manually first.
    // For this test to pass out-of-box, we will try to login with the known credentials from your code context 
    // or you might need to sign up a user first via the app.
    // Let's create a temporary user for testing flow properly.
    const testUser = {
        first_name: "Test",
        last_name: "Bot",
        email: `test_bot_${Date.now()}@kl.in`,
        password: "password123"
    };

    // TC-API-04: User Signup
    {
        // Signup expects FormData usually for image, but our backend handles text fields too.
        // We will mock the fetch call slightly different for FormData if strictly required, 
        // but let's try standard JSON as the controller reads req.body for text fields.
        const { status, data } = await request('/auth/signup', 'POST', testUser);
        
        if (status === 200 || data.message === "Signup successful") {
            logResult('TC-API-04', 'Student Signup', 'PASS');
        } else {
            logResult('TC-API-04', 'Student Signup', 'FAIL', data.error);
        }
    }

    // TC-API-05: Login newly created user (Should fail due to approval)
    {
        const { status, data } = await request('/auth/login', 'POST', {
            email: testUser.email,
            password: testUser.password
        });
        
        if (status === 403 && data.error === 'Awaiting admin approval') {
            logResult('TC-API-05', 'Login Check (Unapproved User)', 'PASS');
            
            // We need the ID to approve them manually for next test
            // Since we can't get ID from failed login, let's fetch pending students
        } else {
            logResult('TC-API-05', 'Login Check (Unapproved User)', 'FAIL', `Got ${status}`);
        }
    }

    // TC-API-06: Admin Fetch Pending Students
    {
        const { status, data } = await request('/auth/pending-students', 'GET');
        if (status === 200 && Array.isArray(data)) {
            const found = data.find(u => u.email === testUser.email);
            if (found) {
                testUserId = found.id;
                logResult('TC-API-06', 'Fetch Pending Students', 'PASS');
            } else {
                logResult('TC-API-06', 'Fetch Pending Students', 'FAIL', 'Created user not found in pending list');
            }
        } else {
            logResult('TC-API-06', 'Fetch Pending Students', 'FAIL');
        }
    }

    // TC-API-07: Approve Student
    if (testUserId) {
        const { status, data } = await request('/auth/approve', 'POST', { student_id: testUserId });
        if (status === 200) {
            logResult('TC-API-07', 'Admin Approve Student', 'PASS');
        } else {
            logResult('TC-API-07', 'Admin Approve Student', 'FAIL');
        }
    }

    // TC-API-08: Login Success (Approved User)
    {
        if (testUserId) {
            const { status, data } = await request('/auth/login', 'POST', {
                email: testUser.email,
                password: testUser.password
            });
            if (status === 200 && data.message === 'Login success') {
                logResult('TC-API-08', 'Login Success (Approved User)', 'PASS');
            } else {
                logResult('TC-API-08', 'Login Success (Approved User)', 'FAIL');
            }
        } else {
            logResult('TC-API-08', 'Login Success (Approved User)', 'SKIPPED');
        }
    }

    // =========================================================================
    // MODULE 2: EVENTS
    // =========================================================================

    // TC-API-09: Fetch Events
    {
        const { status, data } = await request('/events', 'GET');
        if (status === 200 && Array.isArray(data)) {
            logResult('TC-API-09', 'Fetch All Events', 'PASS', `${data.length} events found`);
        } else {
            logResult('TC-API-09', 'Fetch All Events', 'FAIL');
        }
    }

    // =========================================================================
    // MODULE 3: ANNOUNCEMENTS (CRUD)
    // =========================================================================

    // TC-API-10: Create Announcement
    {
        const payload = {
            title: "Automated Test Announcement",
            message: "This is a test message generated by the automation script.",
            is_active: true
        };
        const { status, data } = await request('/announcements/add', 'POST', payload);
        if (status === 200) {
            logResult('TC-API-10', 'Create Announcement', 'PASS');
        } else {
            logResult('TC-API-10', 'Create Announcement', 'FAIL');
        }
    }

    // TC-API-11: Verify Announcement Creation & Get ID
    {
        const { status, data } = await request('/announcements', 'GET');
        if (status === 200 && Array.isArray(data)) {
            const found = data.find(a => a.title === "Automated Test Announcement");
            if (found) {
                createdAnnouncementId = found.id;
                logResult('TC-API-11', 'Verify Announcement Exists', 'PASS');
            } else {
                logResult('TC-API-11', 'Verify Announcement Exists', 'FAIL');
            }
        } else {
            logResult('TC-API-11', 'Verify Announcement Exists', 'FAIL');
        }
    }

    // TC-API-12: Update Announcement
    if (createdAnnouncementId) {
        const payload = {
            title: "Automated Test Announcement (Updated)",
            message: "Updated message.",
            is_active: false
        };
        const { status } = await request(`/announcements/update/${createdAnnouncementId}`, 'PUT', payload);
        if (status === 200) {
            logResult('TC-API-12', 'Update Announcement', 'PASS');
        } else {
            logResult('TC-API-12', 'Update Announcement', 'FAIL');
        }
    }

    // TC-API-13: Delete Announcement
    if (createdAnnouncementId) {
        const { status } = await request(`/announcements/delete/${createdAnnouncementId}`, 'DELETE');
        if (status === 200) {
            logResult('TC-API-13', 'Delete Announcement', 'PASS');
        } else {
            logResult('TC-API-13', 'Delete Announcement', 'FAIL');
        }
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log("-".repeat(70));
    console.log(`${COLORS.bold}Test Execution Completed.${COLORS.reset}\n`);
};

// Execute
runTests();