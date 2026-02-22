import requests
import sys
import json
from datetime import datetime
from pathlib import Path

class PlacementAITester:
    def __init__(self, base_url="https://job-matcher-pro-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.student_id = None
        self.company_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api}{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers, timeout=30)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            
            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test("API Root", "GET", "/", 200)
        return success

    def test_create_student(self):
        """Test student creation"""
        test_data = {
            "name": "John Doe Test",
            "email": f"john.test.{datetime.now().strftime('%H%M%S')}@example.com",
            "cgpa": 8.5,
            "internships": 2,
            "skills": "Python, React, Machine Learning"
        }
        
        success, response = self.run_test(
            "Create Student", 
            "POST", 
            "/students", 
            200, 
            data=test_data
        )
        
        if success and 'id' in response:
            self.student_id = response['id']
            print(f"   Student ID: {self.student_id}")
        
        return success

    def test_get_students(self):
        """Test getting all students"""
        success, response = self.run_test("Get Students", "GET", "/students", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} students")
        return success

    def test_get_student_by_id(self):
        """Test getting specific student"""
        if not self.student_id:
            print("⚠️  Skipping - No student ID available")
            return False
            
        success, response = self.run_test(
            "Get Student by ID", 
            "GET", 
            f"/students/{self.student_id}", 
            200
        )
        return success

    def test_upload_resume(self):
        """Test resume upload and NLP processing"""
        if not self.student_id:
            print("⚠️  Skipping - No student ID available")
            return False
        
        # Create a test resume content
        resume_content = """John Doe
Software Engineer

SKILLS:
- Python programming with 3 years experience
- React and JavaScript development
- Machine Learning using TensorFlow and PyTorch  
- AWS cloud services and Docker
- SQL databases and MongoDB

EXPERIENCE:
Software Development Intern at TechCorp (6 months)
- Built web applications using React and Node.js
- Implemented machine learning models for data analysis
- Worked with agile development methodologies

EDUCATION:
Computer Science, University XYZ
CGPA: 8.5/10

I am passionate about technology and excited to contribute to innovative projects.
I believe in continuous learning and adapting to new technologies."""

        # Create a temporary file
        with open('/tmp/test_resume.txt', 'w') as f:
            f.write(resume_content)
        
        try:
            with open('/tmp/test_resume.txt', 'rb') as f:
                files = {'file': ('test_resume.txt', f, 'text/plain')}
                success, response = self.run_test(
                    "Upload Resume", 
                    "POST", 
                    f"/students/{self.student_id}/upload-resume", 
                    200,
                    files=files
                )
                
                if success:
                    print(f"   Extracted Skills: {response.get('extracted_skills', [])}")
                    print(f"   Sentiment: {response.get('sentiment_label', 'Unknown')} ({response.get('sentiment_score', 0)})")
                
                return success
        except Exception as e:
            print(f"❌ Resume upload error: {e}")
            return False

    def test_create_company(self):
        """Test company creation"""
        test_data = {
            "name": "TechCorp Inc Test",
            "required_skills": "Python, React, Machine Learning, AWS, JavaScript",
            "min_cgpa": 7.5,
            "job_description": "We are looking for a talented full-stack developer with strong skills in Python and React. Experience with machine learning and cloud technologies is preferred. Join our dynamic team working on cutting-edge AI projects."
        }
        
        success, response = self.run_test(
            "Create Company", 
            "POST", 
            "/companies", 
            200, 
            data=test_data
        )
        
        if success and 'id' in response:
            self.company_id = response['id']
            print(f"   Company ID: {self.company_id}")
        
        return success

    def test_get_companies(self):
        """Test getting all companies"""
        success, response = self.run_test("Get Companies", "GET", "/companies", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} companies")
        return success

    def test_get_company_by_id(self):
        """Test getting specific company"""
        if not self.company_id:
            print("⚠️  Skipping - No company ID available")
            return False
            
        success, response = self.run_test(
            "Get Company by ID", 
            "GET", 
            f"/companies/{self.company_id}", 
            200
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test("Dashboard Stats", "GET", "/dashboard/stats", 200)
        if success:
            print(f"   Students: {response.get('total_students', 0)}")
            print(f"   Companies: {response.get('total_companies', 0)}")
            print(f"   Processed Resumes: {response.get('students_with_resume', 0)}")
        return success

    def test_ai_matching(self):
        """Test AI matching engine"""
        if not self.company_id:
            print("⚠️  Skipping - No company ID available")
            return False
            
        success, response = self.run_test(
            "AI Matching", 
            "POST", 
            f"/match/{self.company_id}", 
            200
        )
        
        if success:
            print(f"   Total Matches: {response.get('total_matches', 0)}")
        
        return success

    def test_get_rankings(self):
        """Test getting rankings"""
        if not self.company_id:
            print("⚠️  Skipping - No company ID available")
            return False
            
        success, response = self.run_test(
            "Get Rankings", 
            "GET", 
            f"/rankings/{self.company_id}", 
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} ranked matches")
            if response:
                print(f"   Top candidate: {response[0].get('student_name')} ({response[0].get('final_score')}%)")
        
        return success

def main():
    print("🚀 Starting PlacementAI Backend API Tests\n")
    print("=" * 60)
    
    tester = PlacementAITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_root_endpoint),
        ("Student Registration", tester.test_create_student),
        ("Resume Upload & NLP", tester.test_upload_resume),
        ("Get Students", tester.test_get_students),
        ("Get Student by ID", tester.test_get_student_by_id),
        ("Company Registration", tester.test_create_company),
        ("Get Companies", tester.test_get_companies),
        ("Get Company by ID", tester.test_get_company_by_id),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("AI Matching Engine", tester.test_ai_matching),
        ("Get Rankings", tester.test_get_rankings),
    ]
    
    print(f"\n📋 Running {len(tests)} API tests...\n")
    
    for test_name, test_func in tests:
        print(f"\n{'='*40}")
        print(f"🔬 {test_name}")
        print('='*40)
        test_func()
    
    # Final results
    print(f"\n{'='*60}")
    print(f"📊 TEST RESULTS")
    print(f"{'='*60}")
    print(f"✅ Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"📈 Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())