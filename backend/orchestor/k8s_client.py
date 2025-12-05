import time 
import json
import os

from kubernetes import config # GONFIG THE COREAPI OF K8S
from kubernetes.client import Configuration
from kubernetes.client.api import core_v1_api
from kubernetes.client.rest import ApiException



def obsidian_trade_pod_forge(api_instance,  bot_pod_spec , bot_user_spec):
    print("Request received in bot creation")
    bot_ref = bot_pod_spec["bot_name"].lower()
    resp = None
    try:
        resp = api_instance.read_namespaced_pod(
            name=bot_ref,
            namespace="default"
        )
        if resp:
            return {
                "ok" : False,
                "message" : "Bot is already present for this payload !!!"
            }
    except ApiException as e:
        if e.status != 404:
            print(f"[UNKNOWN FATAL] :: {e}")
            # exit(1)

    if not resp:
        pod_manifest_template = {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": {
                "name": bot_ref
            },
            "spec": {
                "terminationGracePeriodSeconds" : 5,
                "containers": [
                    {
                        "name": "signal-engine-container",
                        "image": "sengine:latest",
                        "imagePullPolicy": "Never",
                        "lifecycle": {
                            "preStop": {
                                "exec": {
                                    "command": ["python","shutdown.py"]
                                }
                            }
                        },
                        "env": [
                            {
                                "name": "bot_pod_spec",
                                "value": json.dumps(bot_pod_spec)
                            },
                            {
                                "name": "bot_user_spec",
                                "value": json.dumps(bot_user_spec)
                            },
                            {
                                "name": "DB_URL",
                                "value": os.getenv("DB_URL")
                            }
                        ]
                    },
                    {
                        "name": "trading-engine-container",
                        "image": "tengine:latest",
                        "ports": [{"containerPort": 50051}],
                        "imagePullPolicy": "Never",
                        "env": [
                            {
                                "name": "EXCHANGE_API_KEY",
                                "value": bot_user_spec["exchangeApiKey"]
                            },
                            {
                                "name": "EXCHANGE_API_SECRET",
                                "value": bot_user_spec["exchangeApiSecret"]
                            }
                        ]
                    }
                ]
            }
        }

        resp = api_instance.create_namespaced_pod(
            body=pod_manifest_template,
            namespace="default"
        )

        # YOU CAN CHANGE BY YOUR PREFRENCE THIS IS USED FOR MY PREFRENCE
        test = 1
        while True:
            resp = api_instance.read_namespaced_pod(
                name=bot_ref,
                namespace="default"
            )
            print(f"Pod Status: {resp.status.phase} , {test + 1}")
            if resp.status.phase not in ["Pending", "ContainerCreating"]:
                break
            time.sleep(1)

        print("Bot created successfully!")
        return {
            "message" : "Bot created successfully !!!",
            "ok" : True,
            "pod_meta" : resp.to_dict()
        }
    
def obsidian_trade_pod_deforge(k8sApi , payload):
    try:

        #THIS IS API INSTANCE OF K8S AND HELP TO  READ AND WRITE SOME OPERATION
        existingPod = None
        try:
            existingPod = k8sApi.read_namespaced_pod(name = payload["botID"] , namespace = "default")
        except Exception as e:
            return {
                "message" : "[ORCEHTRATOR] : Bot not found !!!"
            }
        deletedPod = k8sApi.delete_namespaced_pod(name = payload["botID"] , namespace = "default");
        return {
            "message" : "[ORCHESTRATOR] : Bot Successfully stopped !!!"
        }
    except Exception as e:
        return {"message" : "[ORCHESTRATOR] : Internal server error" , "e" : e};



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
