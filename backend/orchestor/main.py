from fastapi import FastAPI , Request
from bot_manager import create_bot , delete_bot

app = FastAPI();


# bot_pod_spec = {
#     "bot_id": "",                   # Unique identifier for the bot
#     "strategy_name": "",            # Name of the trading strategy (e.g., mean_reversion)
#     "image": "",                    # Docker image used for the bot
#     "replicas": 1,                  # Number of bot instances
#     "namespace": "trading-bots",    # K8s namespace
#     "cpu_limit": "500m",            # CPU limit
#     "memory_limit": "512Mi",        # Memory limit
#     "env_vars": {},                 # Environment variables (API keys, config, etc.)
#     "volume_mounts": [],            # For persistent storage or logs
#     "restart_policy": "Always",     # Pod restart policy
#     "node_selector": {},            # Optional - control which node the pod runs on
#     "labels": {},                   # K8s labels for tracking
#     "annotations": {},              # Metadata annotations
#     "liveness_probe": {},           # Health check for container
#     "readiness_probe": {},          # Ready check before accepting traffic
#     "command": [],                  # Entry point command (optional)
#     "args": [],                     # Command arguments (optional)
#     "service_account": "",          # For permissions (RBAC)
#     "trading_exchange": "",         # e.g., binance, kraken, etc.
#     "log_level": "INFO",            # Log verbosity
#     "auto_scale": False,            # Enable/disable HPA
#     "scale_thresholds": {},         # Metrics for autoscaling if enabled
# }

@app.post('/internal/orchestrator/v1/createbot')
async def init_obsidean_tradeBot(request : Request):
    try:
        data = await request.json()
        obsidian_response = create_bot(data["bot_pod_spec"] , data["bot_user_spec"])

        return {
            "message" : "[BOT MANAGER] :: Bot created successfully !!!",
            "pod_forged_meta" : {**obsidian_response},
            "ok" : True
        }
    except Exception as e:
        print(e)
        return {
            "e" : e,
            "ok" : False
        }

@app.post('/internal/orchestrator/v1/destbot')
async def deforge_obsidian_tradebot(request : Request):
    try:
        data = await request.json()
        resp = delete_bot(data)

        return {
            "message" : resp["message"],
            "ok" : True
        }
    except Exception as e:
        print(e)
        return {
            "e" : e,
            "ok" : False
        }