#!/usr/bin/env python3
"""
Test script to check if API endpoints are working correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(endpoint, description):
    """Test a specific API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        print(f"\nTesting: {description}")
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"Response: List with {len(data)} items")
                if len(data) > 0:
                    print(f"First item keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'Not a dict'}")
            elif isinstance(data, dict):
                print(f"Response: Dict with keys: {list(data.keys())}")
                # Print some values for fee reports
                if 'total_students' in data:
                    print(f"  - Total Students: {data.get('total_students')}")
                    print(f"  - Total Fees Collected: {data.get('total_fees_collected')}")
                    print(f"  - Recent Payments: {len(data.get('recent_payments', []))}")
            else:
                print(f"Response: {type(data)} - {data}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to server. Is Django server running?")
    except requests.exceptions.Timeout:
        print("ERROR: Request timed out")
    except Exception as e:
        print(f"ERROR: {e}")

def main():
    print("API Endpoint Testing Tool")
    print("=" * 50)
    
    # Test the endpoints that AdminDashboard uses
    endpoints = [
        ("/users/fee-reports/", "Fee Reports (Admin Dashboard Data)"),
        ("/users/faculty/", "Faculty List"),
        ("/courses/courses/", "Courses List"),
        ("/users/admin-notifications/", "Admin Notifications"),
    ]
    
    for endpoint, description in endpoints:
        test_endpoint(endpoint, description)
    
    print("\n" + "=" * 50)
    print("If all endpoints return 200 status, the issue might be:")
    print("1. Frontend not making requests correctly")
    print("2. CORS issues")
    print("3. Authentication token issues")
    print("4. Frontend not handling the response correctly")

if __name__ == "__main__":
    main()