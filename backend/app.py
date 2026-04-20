import os
import uuid
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from datetime import datetime
from typing import Any, Dict

from flask import Flask, jsonify, request, g
from flask_cors import CORS
import joblib
import pandas as pd
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import boto3

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # --- Configuration ---
    app.config["MODEL_PATH"] = os.getenv(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "irrigation_model.pkl"),
    )
    
    # --- DynamoDB Configuration ---
    PREDICTIONS_TABLE = os.getenv("PREDICTIONS_TABLE")
    FARMS_TABLE = os.getenv("FARMS_TABLE")
    
    # Initialize DynamoDB Client (uses Lambda execution role permissions)
    dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
    predictions_table = dynamodb.Table(PREDICTIONS_TABLE) if PREDICTIONS_TABLE else None
    farms_table = dynamodb.Table(FARMS_TABLE) if FARMS_TABLE else None

    # --- Initialize Firebase Admin ---
    if not firebase_admin._apps:
        # For simplicity in AWS, we assume the credentials file exists or use default
        try:
            cred = credentials.Certificate("firebase-key.json")
            firebase_admin.initialize_app(cred)
        except Exception:
            # Fallback for dev/local without firebase-key
            pass

    # --- Load ML Model ---
    if os.path.exists(app.config["MODEL_PATH"]):
        model = joblib.load(app.config["MODEL_PATH"])
    else:
        model = None

    _executor = ThreadPoolExecutor(max_workers=4)

    def verify_token_and_load_user() -> Dict[str, Any]:
        """Verify Firebase token and return user info."""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise PermissionError("Missing Authorization")

        id_token = auth_header.split(" ", 1)[1].strip()
        try:
            decoded = firebase_auth.verify_id_token(id_token)
            return {"uid": decoded["uid"], "email": decoded.get("email")}
        except Exception as e:
            # For local dev fallback if token verification fails/is unavailable
            if os.getenv("STAGE") == "local":
                return {"uid": "local-test-user", "email": "test@example.com"}
            raise PermissionError(f"Invalid token: {e}")

    # --------- Routes ----------

    @app.route("/")
    def home():
        return {"message": "AgroCloud AWS API Running", "tables": {"predictions": PREDICTIONS_TABLE, "farms": FARMS_TABLE}}

    # ── FARM ENDPOINTS ─────────────────────────────────────────

    @app.route("/user/farm", methods=["GET"])
    def get_farm():
        try:
            user = verify_token_and_load_user()
            if not farms_table: return jsonify({"error": "DB not configured"}), 500
            
            response = farms_table.get_item(Key={"user_id": user["uid"]})
            return jsonify(response.get("Item", {})), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 401

    @app.route("/user/farm", methods=["POST"])
    def save_farm():
        try:
            user = verify_token_and_load_user()
            if not farms_table: return jsonify({"error": "DB not configured"}), 500
            
            data = request.get_json()
            farm_item = {
                "user_id": user["uid"],
                "farm_name": data.get("farmName"),
                "latitude": str(data.get("latitude")),
                "longitude": str(data.get("longitude")),
                "city": data.get("city"),
                "updated_at": datetime.utcnow().isoformat()
            }
            farms_table.put_item(Item=farm_item)
            return jsonify({"success": True}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    # ── PREDICTION ENDPOINTS ───────────────────────────────────

    @app.route("/predict", methods=["POST"])
    def predict():
        try:
            user = verify_token_and_load_user()
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        data = request.get_json()
        try:
            features = pd.DataFrame([{
                "Temperature": float(data["temperature"]),
                "Humidity": float(data["humidity"]),
                "Rainfall": float(data["rainfall"]),
                "Crop": data["crop"],
                "Soil": data["soil"]
            }])
            
            # Predict
            pred_raw = int(model.predict(features)[0]) if model else 0
            label = "Irrigation Needed" if pred_raw == 1 else "No Irrigation Needed"
            
            # Save to DynamoDB
            if predictions_table:
                record = {
                    "id": str(uuid.uuid4()),
                    "user_id": user["uid"],
                    "email": user["email"],
                    "temperature": str(data["temperature"]),
                    "humidity": str(data["humidity"]),
                    "rainfall": str(data["rainfall"]),
                    "crop": data["crop"],
                    "soil": data["soil"],
                    "prediction": pred_raw,
                    "label": label,
                    "timestamp": datetime.utcnow().isoformat()
                }
                predictions_table.put_item(Item=record)

            return jsonify({"result": label, "raw": pred_raw}), 200
        except Exception as e:
            return jsonify({"error": f"Prediction failed: {e}"}), 500

    @app.route("/predictions", methods=["GET"])
    def get_predictions():
        try:
            user = verify_token_and_load_user()
            if not predictions_table: return jsonify({"error": "DB not configured"}), 500
            
            # Simple scan for this project scale (filtering by user_id)
            # In production, you would use a Global Secondary Index on user_id
            response = predictions_table.scan()
            items = [i for i in response.get("Items", []) if i.get("user_id") == user["uid"]]
            # Sort by timestamp
            items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            
            return jsonify(items), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app

app_instance = create_app()

def handler(event, context):
    import serverless_wsgi
    return serverless_wsgi.handle_request(app_instance, event, context)

if __name__ == "__main__":
    app_instance.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
