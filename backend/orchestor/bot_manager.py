from k8s_client import obsidian_trade_pod_forge , obsidian_kube_forge , obsidian_trade_pod_deforge 

from fastapi import  HTTPException
k8s_client = obsidian_kube_forge()


def create_bot(
    bot_spec = None,
    user = None
):
    bot_spec = bot_spec or {}
    user = user or {}

    if "bot_name" not in bot_spec:
        raise HTTPException(status_code=400, detail="bot_name is required")

    result = obsidian_trade_pod_forge(
        k8s_client,
        bot_spec,
        user
    )

    if not result["ok"]:
        raise HTTPException(
            status_code=409,
            detail="Bot already exists"
        )

    # ✅ THIS RESPONSE IS GUARANTEED JSON-SAFE
    return {
        "ok": True,
        "bot_name": result["bot_name"],
        "status": result["phase"],
        "namespace": result["namespace"],
        "pod_uid": result["pod_uid"]
    }



def delete_bot( payload):
    resp = obsidian_trade_pod_deforge(k8sApi=k8s_client , payload=payload)
    return resp