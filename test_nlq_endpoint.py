#!/usr/bin/env python3
"""
Test script to verify the NLQ endpoint is working
"""
import requests
import json
from datetime import datetime, timezone, timedelta

API_BASE_URL = "http://localhost:8000/api"

# For testing, we'll use a dummy token since authentication isn't enforced for this test
# In real usage, you'd need a valid JWT token

def test_nlq_endpoint():
    print("Testing NLQ Endpoint...")
    print("=" * 50)
    
    # Create test data
    test_queries = [
        {
            "project_id": "test-project",
            "question": "What's my traffic trend this week?",
            "date_range": "7d"
        },
        {
            "project_id": "test-project",
            "question": "Which pages are most popular?",
            "date_range": "7d"
        },
        {
            "project_id": "test-project",
            "question": "How many unique visitors did I get?",
            "date_range": "30d"
        }
    ]
    
    # Mock authorization header (would normally be a valid JWT)
    headers = {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json"
    }
    
    for query in test_queries:
        print(f"\nQuestion: {query['question']}")
        print(f"Date Range: {query['date_range']}")
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/nlq",
                json=query,
                headers=headers,
                timeout=5
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Answer: {data.get('answer', 'N/A')}")
                print(f"Insights: {data.get('insights', [])}")
                print(f"Data: {data.get('data', {})}")
                print("✓ SUCCESS")
            elif response.status_code == 401:
                print("✗ FAILED: Unauthorized (401) - Need valid token")
                print(f"Response: {response.text}")
            else:
                print(f"✗ FAILED: Status {response.status_code}")
                print(f"Response: {response.text}")
        
        except requests.exceptions.ConnectionError:
            print("✗ FAILED: Connection refused - Server may not be running")
            break
        except requests.exceptions.Timeout:
            print("✗ FAILED: Request timeout")
        except Exception as e:
            print(f"✗ FAILED: {str(e)}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_nlq_endpoint()
