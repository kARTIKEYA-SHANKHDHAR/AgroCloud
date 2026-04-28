import boto3
import json
import time
import random
import os

# --- AWS Configuration ---
# Make sure you have your AWS credentials configured or environment variables set
REGION = "ap-south-1"
IOT_TOPIC = "agrocloud/sensors/node1"
THING_ID = "AgroSensorNode"

def simulate_sensors():
    """
    Simulates agricultural sensors and publishes data to AWS IoT Core.
    Requires AWS credentials with 'iot:Publish' permissions.
    """
    print(f"🚀 AgroCloud IoT Simulator Starting...")
    print(f"📡 Topic: {IOT_TOPIC}")
    print(f"🆔 Thing ID: {THING_ID}")
    
    try:
        # Initialize IoT Data Plane client
        # In a real device, you'd use MQTT with certificates, 
        # but for simulation, the AWS SDK is more convenient.
        iot_client = boto3.client('iot-data', region_name=REGION)
    except Exception as e:
        print(f"❌ Failed to initialize AWS IoT client: {e}")
        return

    while True:
        # Simulate realistic agricultural sensor data
        # Soil Moisture: 0-100% (Low < 30 triggers alert)
        # Temperature: 10-50°C (High > 35 triggers alert)
        # Humidity: 20-90%
        # Water Level: 0-100% (Low < 20 triggers alert)
        
        payload = {
            "thing_id": THING_ID,
            "moisture": random.randint(20, 55),
            "temperature": round(random.uniform(22.0, 38.0), 1),
            "humidity": random.randint(40, 75),
            "water_level": random.randint(15, 95),
            "timestamp": int(time.time() * 1000)
        }
        
        try:
            iot_client.publish(
                topic=IOT_TOPIC,
                qos=1,
                payload=json.dumps(payload)
            )
            print(f"✅ Published: Moisture: {payload['moisture']}% | Temp: {payload['temperature']}°C | Water: {payload['water_level']}%")
        except Exception as e:
            print(f"⚠️  Publish Error: {e}")
            print("💡 Hint: Ensure your AWS credentials are valid and have IoT permissions.")
            
        time.sleep(10) # Send data every 10 seconds

if __name__ == "__main__":
    simulate_sensors()
