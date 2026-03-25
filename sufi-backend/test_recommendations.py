#!/usr/bin/env python3

import requests
import json

def test_intelligent_recommendations():
    """Test the intelligent recommendations API endpoint"""
    try:
        # Test the intelligent recommendations endpoint
        url = "http://localhost:8000/restaurants/recommendations/intelligent?limit=5"
        
        print("Testing intelligent recommendations API...")
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Response Success!")
            print(f"Recommendation count: {data.get('count', 0)}")
            print(f"Algorithm: {data.get('algorithm', 'Unknown')}")
            print(f"Weights: {data.get('weights', {})}")
            
            if data.get('recommendations'):
                print("\nTop Recommendations:")
                for i, rec in enumerate(data['recommendations'][:3], 1):
                    print(f"{i}. {rec.get('name', 'Unknown')} - Score: {rec.get('intelligent_score', 0):.2f}")
                    print(f"   Rating: {rec.get('rating', 0)}, Reviews: {rec.get('total_reviews', 0)}")
                    print(f"   Score Breakdown: {rec.get('score_breakdown', {})}")
            else:
                print("No recommendations found in response")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server may not be running")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    test_intelligent_recommendations()
