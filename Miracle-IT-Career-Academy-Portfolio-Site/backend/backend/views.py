import razorpay
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json

# Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@csrf_exempt
def create_order(request):
    data = json.loads(request.body)
    amount = data.get("amount") * 100  # in paise
    payment = razorpay_client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })
    return JsonResponse({"order_id": payment["id"]})

@csrf_exempt
def verify_payment(request):
    data = json.loads(request.body)
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"]
        })
        return JsonResponse({"status": "Payment Verified"})
    except:
        return JsonResponse({"status": "Verification Failed"}, status=400)