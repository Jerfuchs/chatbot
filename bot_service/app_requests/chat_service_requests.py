from abc import ABCMeta, abstractmethod
import requests
import json



class ChatService:
    __metaclass__ = ABCMeta
 
    @classmethod
    def version(self): 
        return "1.0"

    @classmethod
    def chat_service_post_request(self, url, data): 
        
        try:
            chat_service_request = requests.post(url, data = data)
        except requests.exceptions.RequestException as error:
            #Implement logging
            print(f"RequestException on {url}")
            return json.dumps({'error': 'request failed'})

        return chat_service_request.json()
    
    @classmethod
    def chat_service_get_request(self, url, data): 
        
        try:
            chat_service_request = requests.get(url, data = data)

        except requests.exceptions.RequestException as error:
            #Implement logging
            print(f"RequestException on {url}")
            return json.dumps({'error': 'request failed'})

        return chat_service_request.json()
    
