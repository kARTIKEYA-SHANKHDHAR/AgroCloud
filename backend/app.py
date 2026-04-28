import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Any, Dict

from flask import Flask, jsonify, request, g
from flask_cors import CORS
import joblib
import pandas as pd
import boto3

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # --- AWS Configuration ---
    REGION = "ap-south-1"
    PREDICTIONS_TABLE = os.getenv("PREDICTIONS_TABLE")
    FARMS_TABLE = os.getenv("FARMS_TABLE")
    SENSOR_DATA_TABLE = os.getenv("SENSOR_DATA_TABLE")
    COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")

    # Initialize AWS Clients
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    cognito = boto3.client("cognito-idp", region_name=REGION)
    
    predictions_table = dynamodb.Table(PREDICTIONS_TABLE) if PREDICTIONS_TABLE else None
    farms_table = dynamodb.Table(FARMS_TABLE) if FARMS_TABLE else None
    sensor_data_table = dynamodb.Table(SENSOR_DATA_TABLE) if SENSOR_DATA_TABLE else None

    # --- Load ML Model ---
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "irrigation_model.pkl")
    model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

    _executor = ThreadPoolExecutor(max_workers=4)

    def verify_aws_token() -> Dict[str, Any]:
        """Verify AWS Cognito Access Token."""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise PermissionError("Missing AWS Auth Token")

        access_token = auth_header.split(" ", 1)[1].strip()
        
        try:
            # Call Cognito to get user details using the access token
            # This implicitly validates the token
            user_response = cognito.get_user(AccessToken=access_token)
            
            # Extract email from attributes
            email = next((attr['Value'] for attr in user_response['UserAttributes'] if attr['Name'] == 'email'), "unknown@aws.com")
            
            return {
                "uid": user_response["Username"],
                "email": email
            }
        except Exception as e:
            # Fallback for local testing
            if os.getenv("STAGE") == "local":
                return {"uid": "aws-local-user", "email": "farmer@example.com"}
            raise PermissionError(f"Cognito Auth Failed: {e}")

    # --------- Routes ----------

    @app.route("/")
    def home():
        return {"status": "AgroCloud Pure AWS Stack Online", "region": REGION}

    # ── FARM ENDPOINTS ─────────────────────────────────────────

    @app.route("/user/farm", methods=["GET"])
    def get_farm():
        try:
            user_info = verify_aws_token()
            if not farms_table: return jsonify({"error": "DB missing"}), 500
            
            response = farms_table.get_item(Key={"user_id": user_info["uid"]})
            return jsonify(response.get("Item", {})), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 401

    @app.route("/user/farm", methods=["POST"])
    def save_farm():
        try:
            user_info = verify_aws_token()
            data = request.get_json()
            farms_table.put_item(Item={
                "user_id": user_info["uid"],
                "farm_name": data.get("farmName"),
                "latitude": str(data.get("latitude")),
                "longitude": str(data.get("longitude")),
                "city": data.get("city"),
                "updated_at": datetime.utcnow().isoformat()
            })
            return jsonify({"success": True}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    # ── PREDICTION ENDPOINTS ───────────────────────────────────

    @app.route("/predict", methods=["POST"])
    def predict():
        try:
            user_info = verify_aws_token()
            data = request.get_json()
            
            features = pd.DataFrame([{
                "Temperature": float(data["temperature"]),
                "Humidity": float(data["humidity"]),
                "Rainfall": float(data["rainfall"]),
                "Crop": data["crop"],
                "Soil": data["soil"]
            }])
            
            pred_raw = int(model.predict(features)[0]) if model else 0
            label = "Irrigation Needed" if pred_raw == 1 else "No Irrigation Needed"
            
            # Save to DynamoDB
            record = {
                "id": str(uuid.uuid4()),
                "user_id": user_info["uid"],
                "email": user_info["email"],
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
            user_info = verify_aws_token()
            response = predictions_table.scan()
            items = [i for i in response.get("Items", []) if i.get("user_id") == user_info["uid"]]
            items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return jsonify(items), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # ── IOT SENSOR ENDPOINTS ───────────────────────────────────

    @app.route("/sensors/latest", methods=["GET"])
    def get_latest_sensors():
        try:
            # In a real scenario, we might filter by user's thing_id
            # For this simulation, we'll fetch the 'AgroSensorNode'
            if not sensor_data_table:
                return jsonify({"error": "Sensor table not configured"}), 500

            response = sensor_data_table.get_item(Key={"thing_id": "AgroSensorNode"})
            item = response.get("Item", {})

            if not item:
                return jsonify({
                    "moisture": 0,
                    "temperature": 0,
                    "humidity": 0,
                    "water_level": 0,
                    "alerts": []
                }), 200

            # Add logic for alerts
            alerts = []
            moisture = float(item.get("moisture", 100))
            temp = float(item.get("temperature", 0))
            water = float(item.get("water_level", 100))
            ph = float(item.get("soil_ph", 7.0))

            if moisture < 30:
                alerts.append({"sensor": "Soil Moisture", "level": "critical", "msg": "Low soil moisture detected!"})
            elif moisture < 45:
                alerts.append({"sensor": "Soil Moisture", "level": "warning", "msg": "Soil moisture below optimal."})
            if temp > 35:
                alerts.append({"sensor": "Temperature", "level": "critical", "msg": "High temperature warning!"})
            elif temp > 30:
                alerts.append({"sensor": "Temperature", "level": "warning", "msg": "Temperature above normal."})
            if water < 20:
                alerts.append({"sensor": "Water Level", "level": "critical", "msg": "Critical low water level!"})
            elif water < 40:
                alerts.append({"sensor": "Water Level", "level": "warning", "msg": "Water level is low."})
            if ph < 5.5 or ph > 7.5:
                alerts.append({"sensor": "Soil pH", "level": "critical", "msg": f"Soil pH {ph} is out of optimal range (5.5-7.5)!"})
            elif ph < 6.0 or ph > 7.0:
                alerts.append({"sensor": "Soil pH", "level": "warning", "msg": "Soil pH slightly outside ideal range."})

            item["alerts"] = alerts
            return jsonify(item), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app

app_instance = create_app()

def handler(event, context):
    import serverless_wsgi
    return serverless_wsgi.handle_request(app_instance, event, context)

if __name__ == "__main__":
    app_instance.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
