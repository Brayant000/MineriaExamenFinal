#!/usr/bin/env python3
"""
Netflix Dashboard Backend API Testing
Tests all backend endpoints for the Netflix data visualization dashboard
"""

import requests
import sys
import json
from datetime import datetime

class NetflixDashboardTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and "total_titles" in data:
                    total_titles = data.get("total_titles", 0)
                    self.log_test("Health Check", True, f"Status: {data['status']}, Titles: {total_titles}")
                    return True, total_titles
                else:
                    self.log_test("Health Check", False, "Missing required fields in response")
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
        
        return False, 0

    def test_stats_endpoint(self):
        """Test general statistics endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_titles", "movies_count", "shows_count", "directors_count"]
                
                if all(field in data for field in required_fields):
                    details = f"Total: {data['total_titles']}, Movies: {data['movies_count']}, Shows: {data['shows_count']}, Directors: {data['directors_count']}"
                    self.log_test("Stats Endpoint", True, details)
                    return True, data
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Stats Endpoint", False, f"Missing fields: {missing}")
            else:
                self.log_test("Stats Endpoint", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Stats Endpoint", False, f"Error: {str(e)}")
        
        return False, {}

    def test_top_directors_endpoint(self):
        """Test top directors endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/top-directors", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "directors" in data and "counts" in data:
                    directors = data["directors"]
                    counts = data["counts"]
                    
                    if len(directors) == len(counts) and len(directors) <= 10:
                        top_director = directors[0] if directors else "None"
                        top_count = counts[0] if counts else 0
                        details = f"Top director: {top_director} ({top_count} titles), Total returned: {len(directors)}"
                        self.log_test("Top Directors", True, details)
                        return True, data
                    else:
                        self.log_test("Top Directors", False, "Mismatched directors/counts arrays")
                else:
                    self.log_test("Top Directors", False, "Missing directors or counts fields")
            else:
                self.log_test("Top Directors", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Top Directors", False, f"Error: {str(e)}")
        
        return False, {}

    def test_type_distribution_endpoint(self):
        """Test type distribution endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/type-distribution", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["labels", "values", "percentages"]
                
                if all(field in data for field in required_fields):
                    labels = data["labels"]
                    values = data["values"]
                    percentages = data["percentages"]
                    
                    if len(labels) == len(values) == len(percentages) == 2:
                        details = f"Movies: {values[0]} ({percentages[0]}%), Shows: {values[1]} ({percentages[1]}%)"
                        self.log_test("Type Distribution", True, details)
                        return True, data
                    else:
                        self.log_test("Type Distribution", False, "Expected 2 items for movies/shows")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Type Distribution", False, f"Missing fields: {missing}")
            else:
                self.log_test("Type Distribution", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Type Distribution", False, f"Error: {str(e)}")
        
        return False, {}

    def test_top_categories_endpoint(self):
        """Test top categories endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/top-categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "categories" in data and "counts" in data:
                    categories = data["categories"]
                    counts = data["counts"]
                    
                    if len(categories) == len(counts) and len(categories) <= 5:
                        top_category = categories[0] if categories else "None"
                        top_count = counts[0] if counts else 0
                        details = f"Top category: {top_category} ({top_count} titles), Total returned: {len(categories)}"
                        self.log_test("Top Categories", True, details)
                        return True, data
                    else:
                        self.log_test("Top Categories", False, "Mismatched categories/counts arrays")
                else:
                    self.log_test("Top Categories", False, "Missing categories or counts fields")
            else:
                self.log_test("Top Categories", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Top Categories", False, f"Error: {str(e)}")
        
        return False, {}

    def test_sample_data_endpoint(self):
        """Test sample data endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/sample-data", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "data" in data:
                    sample_data = data["data"]
                    
                    if len(sample_data) <= 10 and len(sample_data) > 0:
                        # Check first item structure
                        first_item = sample_data[0]
                        required_fields = ["title", "type", "director", "country", "release_year"]
                        
                        if all(field in first_item for field in required_fields):
                            details = f"Returned {len(sample_data)} items, First: {first_item['title']} ({first_item['type']})"
                            self.log_test("Sample Data", True, details)
                            return True, data
                        else:
                            missing = [f for f in required_fields if f not in first_item]
                            self.log_test("Sample Data", False, f"Missing fields in data items: {missing}")
                    else:
                        self.log_test("Sample Data", False, f"Expected 1-10 items, got {len(sample_data)}")
                else:
                    self.log_test("Sample Data", False, "Missing data field")
            else:
                self.log_test("Sample Data", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Sample Data", False, f"Error: {str(e)}")
        
        return False, {}

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🎬 Starting Netflix Dashboard Backend API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test all endpoints
        health_success, total_titles = self.test_health_endpoint()
        stats_success, stats_data = self.test_stats_endpoint()
        directors_success, directors_data = self.test_top_directors_endpoint()
        distribution_success, distribution_data = self.test_type_distribution_endpoint()
        categories_success, categories_data = self.test_top_categories_endpoint()
        sample_success, sample_data = self.test_sample_data_endpoint()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

    def get_test_summary(self):
        """Get test summary for reporting"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = NetflixDashboardTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    summary = tester.get_test_summary()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())