from k8s_client import obsidian_trade_pod_forge , obsidian_kube_forge 

k8s_client = obsidian_kube_forge()


def create_bot(bot_spec = {}, user ={}):
    pod_created_status = obsidian_trade_pod_forge(k8s_client , bot_spec , user)
    if not pod_created_status["ok"]:
        return pod_created_status
    return {
        "message" : "[BOT MANAGER] :: Bot created successfully !!!",
        "forged_pod_meta" : pod_created_status["pod_meta"],
        "ok" : True
    }



