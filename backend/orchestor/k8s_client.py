import time 
import json
import os

from kubernetes import config # GONFIG THE COREAPI OF K8S
from kubernetes.client import Configuration
from kubernetes.client.api import core_v1_api
from kubernetes.client.rest import ApiException



def obsidian_trade_pod_forge(
    api_instance,
    bot_pod_spec,
    bot_user_spec
):

    bot_ref = bot_pod_spec["bot_name"].lower()
    resp = None

    # 1. Check if pod already exists
    try:
        resp = api_instance.read_namespaced_pod(
            name=bot_ref,
            namespace="default"
        )
        if resp:
            return {
                "ok": False,
                "reason": "ALREADY_EXISTS",
                "bot_name": bot_ref
            }
    except ApiException as e:
        if e.status != 404:
            raise RuntimeError(f"K8s error: {e}")

    # 2. Create pod
    pod_manifest = {
        "apiVersion": "v1",
        "kind": "Pod",
        "metadata": {"name": bot_ref},
        "spec": {
            "terminationGracePeriodSeconds": 5,
            "containers": [
                {
                    "name": "signal-engine-container",
                    "image": "sengine:latest",
                    "imagePullPolicy": "Never",
                    "lifecycle": {
                        "preStop": {
                            "exec": {
                                "command": ["python", "shutdown.py"]
                            }
                        }
                    },
                    "env": [
                        {"name": "bot_pod_spec", "value": json.dumps(bot_pod_spec)},
                        {"name": "bot_user_spec", "value": json.dumps(bot_user_spec)},
                        {"name": "DB_URL", "value": os.getenv("DB_URL", "")},
                    ],
                },
                {
                    "name": "trading-engine-container",
                    "image": "tengine:latest",
                    "ports": [{"containerPort": 50051}],
                    "imagePullPolicy": "Never",
                    "env": [
                        {"name": "EXCHANGE_API_KEY", "value": bot_user_spec["exchangeApiKey"]},
                        {"name": "EXCHANGE_API_SECRET", "value": bot_user_spec["exchangeApiSecret"]},
                    ],
                },
            ],
        },
    }

    api_instance.create_namespaced_pod(
        body=pod_manifest,
        namespace="default"
    )

    # 3. Wait for pod phase
    phase = "Pending"
    for _ in range(30):
        resp = api_instance.read_namespaced_pod(
            name=bot_ref,
            namespace="default"
        )
        phase = resp.status.phase
        if phase not in ("Pending", "ContainerCreating"):
            break
        time.sleep(1)

    # 4. Return ONLY SAFE DATA
    return {
        "ok": True,
        "bot_name": bot_ref,
        "phase": phase,
        "namespace": "default",
        "pod_uid": resp.metadata.uid
    }

def obsidian_trade_pod_deforge(k8sApi , payload):
    try:

        #THIS IS API INSTANCE OF K8S AND HELP TO  READ AND WRITE SOME OPERATION
        existingPod = None
        try:
            existingPod = k8sApi.read_namespaced_pod(name = payload["botID"] , namespace = "default")
        except Exception as e:
            return {
                "message" : "[ORCEHTRATOR] : Bot not found !!!",
                "ok" : False
            }
        deletedPod = k8sApi.delete_namespaced_pod(name = payload["botID"] , namespace = "default");
        return {
            "message" : "[ORCHESTRATOR] : Bot Successfully stopped !!!",
                "ok" : True
        }
    except Exception as e:
        return {"message" : "[ORCHESTRATOR] : Internal server error"  , "ok" : False, "e" : e};



def obsidian_kube_forge():
    config.load_kube_config()
    try: 
        c = Configuration().get_default_copy()
    except:
        c = Configuration()
        c.assert_hostname = False # IN PRODUCTION MAKE IT TRUE FOR ENSURING THE SSL VERIFICATION 
    
    Configuration.set_default(c)
    core_v1 = core_v1_api.CoreV1Api()
    return core_v1
