from k8s_client import obsidian_trade_pod_forge , obsidian_kube_forge , obsidian_trade_pod_deforge 

k8s_client = obsidian_kube_forge()


def create_bot(bot_spec = {}, user ={}):
    pod_created_status = obsidian_trade_pod_forge(k8s_client , bot_spec , user)
    if not pod_created_status["ok"]:
        return pod_created_status
    return {
        **pod_created_status["pod_meta"],
        "ok" : True
    }


def delete_bot( payload):
    resp = obsidian_trade_pod_deforge(k8sApi=k8s_client , payload=payload)
    return resp