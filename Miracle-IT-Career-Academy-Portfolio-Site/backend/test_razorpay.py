#!/usr/bin/env python
"""
Test script to verify Razorpay integration
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
import razorpay

def test_razorpay_connection():
    """Test if Razorpay credentials are working"""
    try:
        print("Testing Razorpay connection...")
        print(f"Key ID: {settings.RAZORPAY_KEY_ID}")
        print(f"Key Secret: {'*' * len(settings.RAZORPAY_KEY_SECRET)}")
        
        # Initialize client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Try to create a test order
        order_data = {
            'amount': 100,  # 1 rupee in paise
            'currency': 'INR',
            'receipt': 'test_receipt_123',
            'notes': {
                'test': 'true'
            }
        }
        
        order = client.order.create(data=order_data)
        print("✅ Razorpay connection successful!")
        print(f"Test order created: {order['id']}")
        print(f"Order amount: {order['amount']} paise")
        print(f"Order currency: {order['currency']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Razorpay connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_razorpay_connection()