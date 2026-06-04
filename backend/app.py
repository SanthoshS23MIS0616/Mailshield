"""
app.py - Flask REST API for Phishing Email Detection
Serves ML predictions, metrics, and real-time analysis
"""
import json
import time
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

from model import load_model, predict, train_model
from features import get_feature_explanation, extract_features

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Global model state ────────────────────────────────────────────────────
pipeline = None
feature_names = None
metrics = None
model_loading = True
model_error = None


def initialize_model():
    global pipeline, feature_names, metrics, model_loading, model_error
    try:
        print("🚀 Loading/training model...")
        pipeline, feature_names, metrics = load_model()
        model_loading = False
        print("✅ Model ready!")
    except Exception as e:
        model_error = str(e)
        model_loading = False
        print(f"❌ Model error: {e}")


# Load model in background thread on startup
threading.Thread(target=initialize_model, daemon=True).start()


# ─── ROUTES ───────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "loading" if model_loading else ("error" if model_error else "ready"),
        "model_ready": not model_loading and model_error is None,
        "error": model_error,
    })


@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    """Return model performance metrics"""
    if model_loading:
        return jsonify({"status": "loading", "message": "Model is being trained..."}), 202
    if model_error:
        return jsonify({"status": "error", "message": model_error}), 500
    return jsonify({"status": "ok", "metrics": metrics})


@app.route("/api/predict", methods=["POST"])
def predict_email():
    """Predict whether an email is phishing or safe"""
    if model_loading:
        return jsonify({"status": "loading", "message": "Model is still training, please wait..."}), 202
    if model_error:
        return jsonify({"status": "error", "message": model_error}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    subject = data.get("subject", "").strip()
    body = data.get("body", "").strip()

    if not body:
        return jsonify({"error": "Email body is required"}), 400

    start_time = time.time()
    result = predict(pipeline, subject, body)
    elapsed = round((time.time() - start_time) * 1000, 1)

    # Get human-readable explanations
    explanations = get_feature_explanation(result["features"])

    # Compute a risk score (0-100)
    risk_score = result["phishing_probability"]

    # Risk level
    if risk_score >= 80:
        risk_level = "Critical"
        risk_color = "#dc2626"
    elif risk_score >= 60:
        risk_level = "High"
        risk_color = "#ea580c"
    elif risk_score >= 40:
        risk_level = "Medium"
        risk_color = "#d97706"
    elif risk_score >= 20:
        risk_level = "Low"
        risk_color = "#65a30d"
    else:
        risk_level = "Minimal"
        risk_color = "#16a34a"

    return jsonify({
        "status": "ok",
        "prediction": result["prediction"],
        "is_phishing": result["is_phishing"],
        "confidence": result["confidence"],
        "phishing_probability": result["phishing_probability"],
        "safe_probability": result["safe_probability"],
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "explanations": explanations,
        "features": result["features"],
        "analysis_time_ms": elapsed,
    })


@app.route("/api/analyze-bulk", methods=["POST"])
def analyze_bulk():
    """Analyze multiple emails at once"""
    if model_loading:
        return jsonify({"status": "loading"}), 202

    data = request.get_json()
    emails = data.get("emails", [])
    if not emails or len(emails) > 50:
        return jsonify({"error": "Provide 1-50 emails"}), 400

    results = []
    for email in emails:
        subject = email.get("subject", "")
        body = email.get("body", "")
        result = predict(pipeline, subject, body)
        results.append({
            "id": email.get("id", len(results)),
            "subject": subject[:60] + ("..." if len(subject) > 60 else ""),
            "prediction": result["prediction"],
            "is_phishing": result["is_phishing"],
            "risk_score": result["phishing_probability"],
        })

    total = len(results)
    phishing_count = sum(1 for r in results if r["is_phishing"])

    return jsonify({
        "status": "ok",
        "results": results,
        "summary": {
            "total": total,
            "phishing": phishing_count,
            "safe": total - phishing_count,
            "phishing_rate": round(phishing_count / total * 100, 1) if total else 0,
        }
    })


@app.route("/api/retrain", methods=["POST"])
def retrain():
    """Trigger model retraining"""
    global pipeline, feature_names, metrics, model_loading, model_error
    model_loading = True
    threading.Thread(target=initialize_model, daemon=True).start()
    return jsonify({"status": "ok", "message": "Retraining started..."})


@app.route("/api/examples", methods=["GET"])
def get_examples():
    """Return example emails for demo"""
    examples = [
        {
            "id": 1,
            "type": "phishing",
            "label": "Classic Credential Phish",
            "subject": "URGENT: Your PayPal account has been suspended!",
            "body": """Dear Valued Customer,

We have detected unusual activity on your PayPal account. Your account has been temporarily suspended for security reasons.

To restore access, you must verify your identity immediately:
CLICK HERE TO VERIFY: http://paypa1-secure-login.xyz/verify?user=victim

You will need to provide:
- Full name and address
- Credit card number and CVV
- Social Security Number
- Current password

WARNING: Failure to verify within 24 HOURS will result in PERMANENT account closure.

PayPal Security Team""",
        },
        {
            "id": 2,
            "type": "phishing",
            "label": "Prize Scam",
            "subject": "CONGRATULATIONS! You've won $1,000,000 - Claim NOW!",
            "body": """CONGRATULATIONS!!!

You have been SELECTED as our lucky winner for this month's lottery!
PRIZE: $1,000,000 USD CASH PRIZE!!!

To claim your prize immediately, click: http://prize-claim-2024.ru/winner?id=98765

You MUST provide your bank account number and routing number to transfer funds.
Also needed: Date of birth, mother's maiden name.

ACT NOW - Offer expires in 24 HOURS!!! Do NOT miss this incredible opportunity!

International Lottery Commission""",
        },
        {
            "id": 3,
            "type": "safe",
            "label": "Professional Work Email",
            "subject": "Q3 Project Update and Team Meeting",
            "body": """Hi Team,

I wanted to share a quick update on our Q3 project progress.

We've successfully completed the first two milestones and are on track for the final delivery by end of month. The client feedback has been very positive so far.

I'd like to schedule a team meeting for this Thursday at 2pm to review progress and align on next steps. Please let me know if that time works for everyone.

Also, please find the updated project timeline attached.

Best regards,
Sarah Johnson
Senior Project Manager""",
        },
        {
            "id": 4,
            "type": "safe",
            "label": "Order Confirmation",
            "subject": "Your Amazon order has shipped",
            "body": """Hello,

Good news! Your order has shipped and is on its way.

Order #112-3456789-9876543
Items: Wireless Keyboard (x1), USB Hub (x1)
Estimated delivery: December 15-17

You can track your package on the Amazon website under Your Orders.

Thank you for shopping with us!

Amazon Customer Service""",
        },
        {
            "id": 5,
            "type": "phishing",
            "label": "Bank Phishing",
            "subject": "Security Alert: Suspicious Transaction Detected",
            "body": """SECURITY ALERT - Bank of America

We have detected a SUSPICIOUS TRANSACTION on your account ending in 4521.

Amount: $2,847.00
Location: Unknown Device

If this was NOT you, verify your account IMMEDIATELY:
http://bankofamerica-secure-verify.phish.net/auth

To complete verification, provide:
- Account number and PIN
- Date of birth
- Social Security Number

FAILURE TO VERIFY WITHIN 2 HOURS WILL RESULT IN ACCOUNT FREEZE AND LEGAL ACTION.

Bank of America Fraud Department""",
        },
    ]
    return jsonify({"status": "ok", "examples": examples})


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
