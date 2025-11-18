import requests
import sys
from datetime import datetime
import time

class AnalyticsPlatformTester:
    def __init__(self, base_url=""):
        self.base_url = base_url
        self.token = None
        self.tenant_id = None
        self.project_id = None
        self.tracking_code = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return False, {}

        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/",
            200
        )
        return success

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        email = f"test_user_{timestamp}@example.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            data={
                "name": f"Test User {timestamp}",
                "email": email,
                "password": "TestPass123!"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.tenant_id = response.get('tenant', {}).get('id')
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   Tenant ID: {self.tenant_id}")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # First register a new user
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        email = f"login_test_{timestamp}@example.com"
        password = "TestPass123!"
        
        # Register
        success, response = self.run_test(
            "Register for Login Test",
            "POST",
            "/auth/register",
            200,
            data={
                "name": f"Login Test User {timestamp}",
                "email": email,
                "password": password
            }
        )
        
        if not success:
            return False
        
        # Now test login
        success, response = self.run_test(
            "User Login",
            "POST",
            "/auth/login",
            200,
            data={
                "email": email,
                "password": password
            }
        )
        
        if success and 'token' in response:
            print(f"   Login successful with token: {response['token'][:20]}...")
            return True
        return False

    def test_create_project(self):
        """Test project creation"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "/projects",
            200,
            data={
                "name": f"Test Project {timestamp}",
                "domain": f"test{timestamp}.example.com"
            }
        )
        
        if success and 'id' in response:
            self.project_id = response['id']
            self.tracking_code = response.get('tracking_code')
            print(f"   Project ID: {self.project_id}")
            print(f"   Tracking Code: {self.tracking_code}")
            return True
        return False

    def test_get_projects(self):
        """Test getting all projects"""
        success, response = self.run_test(
            "Get All Projects",
            "GET",
            "/projects",
            200
        )
        
        if success:
            print(f"   Found {len(response)} project(s)")
            return True
        return False

    def test_get_project_by_id(self):
        """Test getting a specific project"""
        if not self.project_id:
            print("   ⚠️  SKIPPED - No project ID available")
            return True
        
        success, response = self.run_test(
            "Get Project by ID",
            "GET",
            f"/projects/{self.project_id}",
            200
        )
        
        if success:
            print(f"   Project Name: {response.get('name')}")
            print(f"   Project Domain: {response.get('domain')}")
            return True
        return False

    def test_track_event(self):
        """Test event tracking"""
        if not self.project_id or not self.tracking_code:
            print("   ⚠️  SKIPPED - No project ID or tracking code available")
            return True
        
        success, response = self.run_test(
            "Track Pageview Event",
            "POST",
            "/track",
            200,
            data={
                "project_id": self.project_id,
                "tracking_code": self.tracking_code,
                "session_id": f"sess_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "event_type": "pageview",
                "page_url": "https://example.com/test-page",
                "page_title": "Test Page",
                "referrer": "https://google.com",
                "user_agent": "Mozilla/5.0 Test Browser",
                "ip_address": "192.168.1.1",
                "consent_given": True
            }
        )
        
        if success:
            print(f"   Event tracked: {response.get('event_id')}")
            # Track a few more events for analytics testing
            for i in range(3):
                self.run_test(
                    f"Track Additional Event {i+1}",
                    "POST",
                    "/track",
                    200,
                    data={
                        "project_id": self.project_id,
                        "tracking_code": self.tracking_code,
                        "session_id": f"sess_{datetime.now().strftime('%Y%m%d%H%M%S')}_{i}",
                        "event_type": "pageview",
                        "page_url": f"https://example.com/page-{i}",
                        "page_title": f"Test Page {i}",
                        "consent_given": True
                    }
                )
            return True
        return False

    def test_get_analytics(self):
        """Test analytics overview"""
        if not self.project_id:
            print("   ⚠️  SKIPPED - No project ID available")
            return True
        
        success, response = self.run_test(
            "Get Analytics Overview",
            "GET",
            f"/analytics/{self.project_id}/overview?days=7",
            200
        )
        
        if success:
            print(f"   Total Pageviews: {response.get('total_pageviews', 0)}")
            print(f"   Unique Sessions: {response.get('unique_sessions', 0)}")
            print(f"   Total Events: {response.get('total_events', 0)}")
            print(f"   Top Pages: {len(response.get('top_pages', []))}")
            return True
        return False

    def test_nlq_query(self):
        """Test Natural Language Query with GPT-5"""
        if not self.project_id:
            print("   ⚠️  SKIPPED - No project ID available")
            return True
        
        print("   ⏳ This may take a few seconds (AI processing)...")
        success, response = self.run_test(
            "NLQ Query (GPT-5)",
            "POST",
            "/nlq",
            200,
            data={
                "project_id": self.project_id,
                "question": "What is my total traffic?",
                "date_range": "7d"
            }
        )
        
        if success:
            print(f"   Question: {response.get('question')}")
            print(f"   Answer: {response.get('answer', '')[:100]}...")
            print(f"   Insights: {len(response.get('insights', []))}")
            return True
        return False

    def test_invalid_auth(self):
        """Test authentication failure"""
        # Save current token
        original_token = self.token
        self.token = "invalid_token_12345"
        
        success, response = self.run_test(
            "Invalid Authentication",
            "GET",
            "/projects",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed} ✅")
        print(f"Failed: {len(self.failed_tests)} ❌")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {test.get('test')}")
                print(f"   Endpoint: {test.get('endpoint')}")
                if 'expected' in test:
                    print(f"   Expected: {test.get('expected')}, Got: {test.get('actual')}")
                if 'error' in test:
                    print(f"   Error: {test.get('error')}")
        
        print("\n" + "="*60)
        return len(self.failed_tests) == 0

def main():
    print("="*60)
    print("🚀 Intellica Analytics Platform - Backend API Tests")
    print("="*60)
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api"
    print(f"📍 Base URL: {base_url}\n")
    
    tester = AnalyticsPlatformTester(base_url)
    
    # Run all tests in sequence
    print("\n📋 Running Backend API Tests...\n")
    
    # Basic tests
    tester.test_health_check()
    
    # Auth tests
    if not tester.test_register():
        print("\n⚠️  Registration failed - stopping tests")
        tester.print_summary()
        return 1
    
    tester.test_login()
    
    # Project tests
    if not tester.test_create_project():
        print("\n⚠️  Project creation failed - stopping tests")
        tester.print_summary()
        return 1
    
    tester.test_get_projects()
    tester.test_get_project_by_id()
    
    # Tracking tests
    tester.test_track_event()
    
    # Analytics tests
    tester.test_get_analytics()
    
    # NLQ tests (AI-powered)
    tester.test_nlq_query()
    
    # Security tests
    tester.test_invalid_auth()
    
    # Print summary
    all_passed = tester.print_summary()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
