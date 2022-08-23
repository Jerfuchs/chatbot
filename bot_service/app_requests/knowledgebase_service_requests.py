from abc import ABCMeta, abstractmethod
import requests



class KnowledgebaseService:
    __metaclass__ = ABCMeta
 
    @classmethod
    def version(self): 
        return "1.0"

    @classmethod
    def knowledgebase_service_post_request(self, url, data): 
        
        try:
            Knowledgebase_service_request = requests.post(url, data = data)
        except requests.exceptions.RequestException as error:
            #Implement logging
            print(f"RequestException on {url}")
            return "Request failed"

        return Knowledgebase_service_request.json()
    
    @classmethod
    def knowledgebase_service_get_request(self, url, data): 
        
        try:
            Knowledgebase_service_request = requests.get(url, data = data)

        except requests.exceptions.RequestException as error:
            #Implement logging
            print(f"RequestException on {url}")
            return "Request failed"

        return Knowledgebase_service_request.json()