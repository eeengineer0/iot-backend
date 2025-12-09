from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import paho.mqtt.client as mqtt
import json
import os

USERS_FILE = "users.json"

# -----------------------------------------------------
# USER STORAGE
# -----------------------------------------------------
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    else:
        default_users = {
            "admin": {"password": "admin123", "role": "admin"},
            "user": {"password": "user123", "role": "user"}
        }
        save_users(default_users)
        return default_users

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

users = load_users()

# -----------------------------------------------------
# FASTAPI APP
# -----------------------------------------------------
app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://ee495smarthome.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# DEVICE STORAGE
# -----------------------------------------------------
latest_data = {}
system_limits = {}     

# -----------------------------------------------------
# MODELS
# -----------------------------------------------------
class Command(BaseModel):
    device: str
    action: str

class LimitUpdate(BaseModel):
    device: str
    temp_th: float | None = None
    gas_th: float | None = None

class LoginRequest(BaseModel):
    username: str
    password: str

class NewUser(BaseModel):
    username: str
    password: str
    role: str

# -----------------------------------------------------
# LOGIN ENDPOINT
# -----------------------------------------------------
@app.post("/login")
def login(req: LoginRequest):
    global users
    if req.username in users and users[req.username]["password"] == req.password:
        return {"success": True, "role": users[req.username]["role"]}
    return {"success": False, "message": "Invalid username or password"}

# -----------------------------------------------------
# CREATE NEW USER
# -----------------------------------------------------
@app.post("/create_user")
def create_user(new_user: NewUser):
    global users

    if new_user.username in users:
        return {"success": False, "message": "User already exists"}

    users[new_user.username] = {
        "password": new_user.password,
        "role": new_user.role
    }

    save_users(users)

    return {"success": True, "message": "User created successfully"}

# -----------------------------------------------------
# RETURN ALL USERS
# -----------------------------------------------------
@app.get("/users")
def get_users():
    return users

# -----------------------------------------------------
# EXISTING REALTIME, MQTT, AND LIMIT API
# -----------------------------------------------------
def parse_sensor_message(raw: str):
    result = {}
    try:
        start = raw.find("[") + 1
        end = raw.find("]")
        result["node"] = raw[start:end]

        parts = raw.split("] - ")[1]
        time_str = parts.split()[0]
        result["time"] = time_str

        sensors_str = parts[len(time_str):].strip()
        sensor_parts = sensors_str.split("|")

        for part in sensor_parts:
            part = part.strip()
            if ":" in part:
                key, val = part.split(":", 1)
                key = key.strip()
                val = val.strip()

                val = (
                    val.replace("C", "")
                    .replace("%", "")
                    .replace("V", "")
                    .replace("ms", "")
                    .replace("(MANUAL)", "")
                    .strip()
                )

                try:
                    if "." in val:
                        val = float(val)
                    else:
                        val = int(val)
                except:
                    pass

                result[key.lower()] = val

    except Exception as e:
        print("Parse error:", e)

    return result


def on_connect(client, userdata, flags, rc):
    print("MQTT connected:", rc)
    client.subscribe("iot/pi/data")


def on_message(client, userdata, msg):
    global latest_data, system_limits
    raw = msg.payload.decode()
    parsed = parse_sensor_message(raw)

    if parsed:
        node = parsed["node"]

        if node not in system_limits:
            system_limits[node] = {"temp_th": 30.0, "gas_th": 1.20}

        parsed["temp_th"] = system_limits[node]["temp_th"]
        parsed["gas_th"] = system_limits[node]["gas_th"]

        latest_data[node] = parsed


mqtt_client = mqtt.Client()
mqtt_client.username_pw_set("p_user", "P_user123")
mqtt_client.tls_set()

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

mqtt_client.connect("08d5c716cf9f46518abcda4d565e5141.s1.eu.hivemq.cloud", 8883)
mqtt_client.loop_start()

@app.get("/")
def root():
    return {"message": "Backend working!"}

@app.get("/realtime")
def realtime():
    return latest_data

@app.post("/command")
def send_command(cmd: Command):
    msg = f"{cmd.device}:{cmd.action.replace('_',' ')}"
    mqtt_client.publish("iot/pi/command", msg)
    return {"sent": msg}

@app.post("/set_limits")
def set_limits(limit: LimitUpdate):
    device = limit.device

    if device not in system_limits:
        system_limits[device] = {"temp_th": 30.0, "gas_th": 1.20}

    if limit.temp_th is not None:
        system_limits[device]["temp_th"] = limit.temp_th
        mqtt_client.publish("iot/pi/command", f"{device}:TEMP={limit.temp_th}")

    if limit.gas_th is not None:
        system_limits[device]["gas_th"] = limit.gas_th
        mqtt_client.publish("iot/pi/command", f"{device}:GAS={limit.gas_th}")

    return {"device": device, "limits": system_limits[device]}