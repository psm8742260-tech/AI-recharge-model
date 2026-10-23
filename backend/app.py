import os
import time
import random
import string
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# --- Configuration & Env Vars ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
DB_PATH = os.environ.get("DB_PATH", "gateway_store.json")

# Admin Credentials
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "psm8742260@gmail.com")
ADMIN_MOBILE = os.environ.get("ADMIN_MOBILE", "8466062260")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "2634T")

# --- In-Memory Database ---
class Store:
    def __init__(self):
        self.users = []
        self.receipts = []
        self.transactions = []
        self.system_config = {
            "gatewayName": "AI Recharge HYBRID GATEWAY",
            "tokenDeductionMultiplier": 1.15,
            "defaultDailyLimitMB": 800,
            "isMaintenanceMode": False,
            "hybridEngineStatus": "ACTIVE",
            "adminEmail": ADMIN_EMAIL,
            "adminMobile": ADMIN_MOBILE,
            "adminPassword": ADMIN_PASSWORD,
            "masterPin": "6606"
        }
        self.load()

    def load(self):
        if os.path.exists(DB_PATH):
            try:
                with open(DB_PATH, 'r') as f:
                    data = json.load(f)
                    self.users = data.get('users', [])
                    self.receipts = data.get('receipts', [])
                    self.transactions = data.get('transactions', [])
                    # Merge config
                    stored_config = data.get('system_config', {})
                    self.system_config.update(stored_config)
            except Exception as e:
                print(f"Load error: {e}")

    def save(self):
        try:
            with open(DB_PATH, 'w') as f:
                json.dump({
                    'users': self.users,
                    'receipts': self.receipts,
                    'transactions': self.transactions,
                    'system_config': self.system_config
                }, f, indent=4)
        except Exception as e:
            print(f"Save error: {e}")

store = Store()

# --- Helper Functions ---
def generate_api_key():
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=32))
    return f"phrs-{random_str}"

def get_user_by_key(key):
    if not key.startswith("phrs-") or len(key) != 37:
        return None
    for user in store.users:
        if user.get('activeApiKey') == key:
            return user
    return None

# --- API Routes ---

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    mobile = data.get("mobile")
    password = data.get("password")
    is_admin_request = data.get("isAdminRequest", False)

    is_final_admin = False
    if is_admin_request:
        if email == store.system_config['adminEmail'] and \
           mobile == store.system_config['adminMobile'] and \
           password == store.system_config['adminPassword']:
            is_final_admin = True
        else:
            return jsonify({"success": False, "message": "Invalid Admin Credentials"}), 401
    
    # Find or Create User
    user = next((u for u in store.users if u['email'] == email), None)
    if not user:
        user = {
            "id": f"usr_{int(time.time())}",
            "email": email or "user@airecharge.com",
            "name": data.get("name", "AI Developer"),
            "mobile": mobile or "",
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            "activePlanId": "plan-1m",
            "activePlanName": "1 Month Starter Pack",
            "dataPackMBTotal": 2048,
            "dataPackMBRemaining": 2048,
            "dailyLimitMB": 800,
            "dailyUsedMB": 0,
            "activeApiKey": generate_api_key(),
            "isAdmin": is_final_admin,
            "keysHistory": []
        }
        user['keysHistory'].append({"key": user['activeApiKey'], "status": "active"})
        store.users.append(user)
    else:
        user['isAdmin'] = is_final_admin
        if mobile: user['mobile'] = mobile
    
    store.save()
    return jsonify({"success": True, "user": user})

@app.route('/api/admin/config', methods=['GET', 'POST'])
def admin_config():
    if request.method == 'GET':
        return jsonify({
            "config": store.system_config,
            "plans": [], # Add static plans if needed
            "topups": []
        })
    else:
        data = request.json
        new_config = data.get("config", {})
        store.system_config.update(new_config)
        store.save()
        return jsonify({"success": True, "config": store.system_config})

@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    return jsonify({"users": store.users})

@app.route('/api/admin/receipts', methods=['GET'])
def admin_receipts():
    return jsonify({"receipts": store.receipts})

@app.route('/api/user/me', methods=['GET'])
def get_me():
    if not store.users:
        return jsonify({"error": "No user found"}), 404
    user = store.users[0]
    return jsonify({
        "user": user,
        "receipts": [r for r in store.receipts if r.get('userId') == user['id']][:20],
        "transactions": store.transactions
    })

@app.route('/api/v1/chat/completions', methods=['POST'])
def proxy_chat():
    auth_header = request.headers.get("Authorization", "")
    token_key = auth_header.replace("Bearer ", "").strip()
    
    user = get_user_by_key(token_key)
    if not user:
        return jsonify({
            "error": {
                "message": "Invalid or revoked phrs- API Key. Please provide a valid Bearer token.",
                "type": "authentication_error",
                "code": "invalid_api_key"
            }
        }), 401

    if store.system_config.get('isMaintenanceMode'):
         return jsonify({"error": {"message": "Gateway is under maintenance."}}), 503

    # Quota Checks
    remaining_mb = user.get('dataPackMBRemaining', 0)
    if remaining_mb <= 0:
        return jsonify({
            "error": {
                "message": "AI Data Pack Exhausted (0 MB remaining).",
                "type": "quota_exceeded_error",
                "code": "insufficient_data_pack"
            }
        }), 402

    data = request.json
    model = data.get("model", "deepseek-v3")
    messages = data.get("messages", [])
    
    # Token Estimation
    prompt_text = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])
    prompt_tokens = max(12, int(len(prompt_text) / 3.8))
    
    try:
        # Simulated AI Response for VPS Template parity
        completion_text = f"[Python Proxy] Answer for {model}: Token deduction logic validated."
        completion_tokens = max(15, int(len(completion_text) / 3.8))
        
        # Deduction Formula with Multiplier
        multiplier = store.system_config.get('tokenDeductionMultiplier', 1.15)
        tokens_per_mb = 30000 if "flash" in model else 20000
        data_deducted_mb = round(((prompt_tokens + completion_tokens) / tokens_per_mb) * multiplier, 4)
        
        # Update User
        user['dataPackMBRemaining'] = max(0, round(user['dataPackMBRemaining'] - data_deducted_mb, 4))
        user['dailyUsedMB'] = round(user.get('dailyUsedMB', 0) + data_deducted_mb, 4)
        
        receipt = {
            "receiptId": f"rcpt_py_{random.randint(100000, 999999)}",
            "timestamp": datetime.now().isoformat(),
            "userId": user['id'],
            "modelId": model,
            "modelName": model,
            "promptTokens": prompt_tokens,
            "completionTokens": completion_tokens,
            "totalTokens": prompt_tokens + completion_tokens,
            "dataDeductedMB": data_deducted_mb,
            "dataRemainingMB": user['dataPackMBRemaining'],
            "gatewayStatus": "200 OK - Hybrid Proxy"
        }
        store.receipts.insert(0, receipt)
        store.save()
        
        return jsonify({
            "id": f"chatcmpl-py-{int(time.time())}",
            "object": "chat.completion",
            "model": model,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": completion_text}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens, "total_tokens": prompt_tokens + completion_tokens},
            "magicReceipt": receipt
        })
        
    except Exception as e:
        return jsonify({"error": {"message": str(e), "type": "proxy_error"}}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
