from kubernetes import client
from kubernetes import config
from kubernetes.client import Configuration
from kubernetes.client.api import core_v1_api
from kubernetes.client.rest import ApiException

def shutdown_bot(meta):
    config.load_kube_config()
    try:
        #THIS METHOD IS USED FOR THE BASIC CONFIGURATION COPY
        c = Configuration().get_default_copy();
    except: 
        #WE DID IF OUR CONFIGURATION IS NOT AVAILABLE SO WE CREATE THE NEW ONE
        c = Configuration()
        #ASSERT_HOSTNAME INSURE THAT THE SSL VERFICATION MAKE TO ON OR NOT SO WHILE IN PRODUCTION MAKE SURE TO MAKE THE TRUE VALUE
        c.assert_hostname = False

    #IT SETS THE DEFAULT COPY OF AN CONFIGURATION 
    Configuration.set_default(c)
    core_v1 = core_v1_api.CoreV1Api()

    try:
        resp = core_v1.delete_namespaced_pod(name=meta["pod_name"] , namespace="default")
        if not resp:
            return { "message" : "[ERROR] : Deforging Bot"}
        
        return {
            "message" : "Bot deleted !!",
            "ok" : True
        }
    except ApiException as e:
        return {
            "message" : "[ERROR_BOT]Bot completion !!!!"
        }



