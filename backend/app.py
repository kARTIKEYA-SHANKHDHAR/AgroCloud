import os
from datetime import datetime
from typing import Any, Dict

from flask import Flask, jsonify, request, g
from flask_cors import CORS
import joblib
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # --- Configuration ---
    app.config["MODEL_PATH"] = os.getenv(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "irrigation_model.pkl"),
    )
    app.config["FIREBASE_SERVICE_ACCOUNT"] = os.getenv("FIREBASE_SERVICE_ACCOUNT")

    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "firebase-key.json"

    # --- Initialize Firebase Admin ---
    if not firebase_admin._apps:
        cred = None
        service_account_path = app.config["FIREBASE_SERVICE_ACCOUNT"] or os.getenv(
            "GOOGLE_APPLICATION_CREDENTIALS"
        )
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
        else:
            raise RuntimeError(
                "Firebase service account JSON path not configured. "
                "Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS."
            )

        firebase_admin.initialize_app(cred)

    db = firestore.client()

    # --- Load ML Model ---
    if not os.path.exists(app.config["MODEL_PATH"]):
        raise RuntimeError(
            f"Model file not found at {app.config['MODEL_PATH']}. "
            "Run model/train_model.py to generate the model."
        )

    model = joblib.load(app.config["MODEL_PATH"])

    # --------- Helpers ----------
    def verify_token_and_load_user(require_admin: bool = False) -> Dict[str, Any]:
        """Verify Firebase ID token from Authorization header and optionally enforce admin role."""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise PermissionError("Missing or invalid Authorization header.")

        id_token = auth_header.split(" ", 1)[1].strip()
        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception:
            raise PermissionError("Invalid or expired token.")

        uid = decoded.get("uid")
        if not uid:
            raise PermissionError("Unable to extract user id from token.")

        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise PermissionError("User record not found.")

        user_data = user_doc.to_dict()

        if not user_data.get("active", True):
            raise PermissionError("User is deactivated.")

        if require_admin and user_data.get("role") != "admin":
            raise PermissionError("Admin privileges required.")

        g.user = {
            "uid": uid,
            "email": user_data.get("email"),
            "role": user_data.get("role"),
            "active": user_data.get("active", True),
        }
        return g.user

    def log_event(event_type: str, payload: Dict[str, Any]) -> None:
        """Persist lightweight system log to Firestore."""
        try:
            db.collection("logs").add(
                {
                    "type": event_type,
                    "payload": payload,
                    "timestamp": datetime.utcnow(),
                }
            )
        except Exception:
            # Logging must never break main flow
            pass

    # --------- Routes ----------
    @app.route("/")
    def home():
        return {
            "message": "AgroCloud Smart Irrigation API running",
            "status": "ok"
        }
    @app.route("/health", methods=["GET"])
    def health() -> Any:
        return jsonify({"status": "ok", "service": "AgroCloud Backend"}), 200

    @app.route("/predict", methods=["POST"])
    def predict() -> Any:
        try:
            user = verify_token_and_load_user(require_admin=False)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        data = request.get_json() or {}
        required_fields = ["temperature", "humidity", "rainfall", "crop", "soil"]

        missing = [f for f in required_fields if f not in data]
        if missing:
            return (
                jsonify({"error": f"Missing fields: {', '.join(missing)}"}),
                400,
            )

        try:
            features = pd.DataFrame([{
                "Temperature": float(data["temperature"]),
                "Humidity": float(data["humidity"]),
                "Rainfall": float(data["rainfall"]),
                "Crop": data["crop"],
                "Soil": data["soil"]
            }])
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid feature types."}), 400

        prediction = model.predict(features)[0]
        label = "Irrigation Needed" if int(prediction) == 1 else "No Irrigation Needed"

        record = {
            "userId": user["uid"],
            "email": user.get("email"),
            "temperature": features["Temperature"][0],
            "humidity": features["Humidity"][0],
            "rainfall": features["Rainfall"][0],
            "crop": features["Crop"][0],
            "soil": features["Soil"][0],
            "prediction": int(prediction),
            "label": label,
            "timestamp": datetime.utcnow(),
        }

        try:
            db.collection("predictions").add(record)
            log_event(
                "prediction",
                {"userId": user["uid"], "prediction": int(prediction)},
            )
        except Exception as e:
            return jsonify({"error": f"Failed to persist prediction: {e}"}), 500

        return jsonify({"result": label, "raw": int(prediction)}), 200

    @app.route("/stats/overview", methods=["GET"])
    def stats_overview() -> Any:
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        try:
            users_ref = db.collection("users")
            farmers = users_ref.where("role", "==", "farmer").stream()
            total_farmers = sum(1 for _ in farmers)

            preds_ref = db.collection("predictions")
            preds = list(preds_ref.stream())
            total_predictions = len(preds)

            irrigation_needed = sum(
                1 for p in preds if p.to_dict().get("prediction") == 1
            )

            no_irrigation = total_predictions - irrigation_needed

            return (
                jsonify(
                    {
                        "totalFarmers": total_farmers,
                        "totalPredictions": total_predictions,
                        "irrigationNeeded": irrigation_needed,
                        "noIrrigationNeeded": no_irrigation,
                    }
                ),
                200,
            )
        except Exception as e:
            return jsonify({"error": f"Failed to compute stats: {e}"}), 500

    @app.route("/stats/predictions", methods=["GET"])
    def stats_predictions() -> Any:
        """Return prediction counts grouped by date for charting."""
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        try:
            preds_ref = db.collection("predictions")
            preds = preds_ref.order_by("timestamp").stream()

            series: Dict[str, Dict[str, int]] = {}
            for p in preds:
                doc = p.to_dict()
                ts = doc.get("timestamp")
                if isinstance(ts, datetime):
                    day = ts.date().isoformat()
                else:
                    # Firestore timestamp might be its own type; coerce via string
                    day = str(ts)[:10]

                if day not in series:
                    series[day] = {"irrigationNeeded": 0, "noIrrigationNeeded": 0}

                if doc.get("prediction") == 1:
                    series[day]["irrigationNeeded"] += 1
                else:
                    series[day]["noIrrigationNeeded"] += 1

            labels = sorted(series.keys())
            irrigation_needed_data = [series[d]["irrigationNeeded"] for d in labels]
            no_irrigation_data = [series[d]["noIrrigationNeeded"] for d in labels]

            return (
                jsonify(
                    {
                        "labels": labels,
                        "irrigationNeeded": irrigation_needed_data,
                        "noIrrigationNeeded": no_irrigation_data,
                    }
                ),
                200,
            )
        except Exception as e:
            return jsonify({"error": f"Failed to compute prediction trends: {e}"}), 500

    @app.route("/stats/crops", methods=["GET"])
    def stats_crops() -> Any:
        """Return irrigation counts grouped by crop."""
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        try:
            preds_ref = db.collection("predictions")
            preds = preds_ref.stream()

            crop_counts: Dict[str, int] = {}
            for p in preds:
                doc = p.to_dict()
                crop = doc.get("crop", "Unknown")
                if doc.get("prediction") == 1:
                    crop_counts[crop] = crop_counts.get(crop, 0) + 1

            labels = list(crop_counts.keys())
            values = [crop_counts[c] for c in labels]

            return jsonify({"labels": labels, "values": values}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to compute crop stats: {e}"}), 500

    @app.route("/admin/users", methods=["GET"])
    def admin_users() -> Any:
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        try:
            users_ref = db.collection("users").stream()
            users = []
            for doc in users_ref:
                data = doc.to_dict()
                data["id"] = doc.id
                users.append(data)

            return jsonify({"users": users}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to fetch users: {e}"}), 500

    @app.route("/admin/users/<user_id>", methods=["PATCH"])
    def admin_update_user(user_id: str) -> Any:
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        body = request.get_json() or {}
        if "active" not in body:
            return jsonify({"error": "Field 'active' is required."}), 400

        try:
            db.collection("users").document(user_id).set(
                {"active": bool(body["active"])}, merge=True
            )
            log_event(
                "user_status_change",
                {"targetUserId": user_id, "active": bool(body["active"])},
            )
            return jsonify({"success": True}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to update user: {e}"}), 500

    @app.route("/admin/dataset/upload", methods=["POST"])
    def admin_upload_dataset() -> Any:
        """Accept a CSV file and overwrite the irrigation dataset."""
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        if "file" not in request.files:
            return jsonify({"error": "Missing file field."}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty filename."}), 400

        try:
            data_dir = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "..", "data")
            )
            os.makedirs(data_dir, exist_ok=True)
            target_path = os.path.join(data_dir, "irrigation.csv")
            file.save(target_path)
            log_event(
                "dataset_upload",
                {"uploadedBy": g.user["uid"], "path": target_path},
            )
            return jsonify({"success": True}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to save dataset: {e}"}), 500

    @app.route("/admin/model/retrain", methods=["POST"])
    def admin_retrain_model() -> Any:
        """Trigger model retraining using the current dataset."""
        try:
            verify_token_and_load_user(require_admin=True)
        except PermissionError as e:
            return jsonify({"error": str(e)}), 401

        try:
            # Import locally to avoid circular imports
            from model.train_model import train_and_save_model

            model_paths = train_and_save_model()
            # Reload model in memory for new predictions
            nonlocal model
            model = joblib.load(model_paths["backend_model_path"])

            log_event("model_retrain", {"triggeredBy": g.user["uid"]})

            return jsonify(
                {
                    "success": True,
                    "message": "Model retrained successfully.",
                    "paths": model_paths,
                }
            ), 200
        except Exception as e:
            return jsonify({"error": f"Failed to retrain model: {e}"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)

