from abc import ABCMeta, abstractmethod
import requests
import json


class Botflowservice:
    __metaclass__ = ABCMeta
 
    @classmethod
    def version(self): 
        return "1.0"

    @classmethod
    def botflow_service_post_request(self, url, data): 
        
        try:
            botflow_service_request = requests.post(url, json = data)
        except requests.exceptions.RequestException as error:
            #Implement logging
            print(f"RequestException on {url}")
            return "Request failed"
        print(botflow_service_request.json())
        return botflow_service_request.json()
    
    @classmethod
    def botflow_service_get_request(self, url, data): 
        
        try:
            botflow_service_request = requests.get(url, json = data)

        except requests.exceptions.RequestException as error:
            #Implement logging
            print(f"RequestException on {url}")
            return "Request failed"
            
        return botflow_service_request.json()