from Elements.Actions import Action
from Elements.Message import Message
from datetime import datetime
import requests
import json



class IntentQuestion(Action):

    ACTION_TYPE = "IntentQuestion"

    def __init__(self, id, flow_id, bot_id, message, next_action = ''):
        Action.__init__(self, id, flow_id, bot_id)
        self.next_action = next_action
        self.message = message
        self.asked = "false"
        self.type = "IntentQuestion"
        return

    def preprocess_message(self, message, flow):

        
        if 'value' in dict(message["content"]).keys() and message["action_id"] == self.id:
            if message["value"] != self.id:
                action = flow.search_action(self.process_button(message))
                usermessage = action.preprocess_message(message, flow)
                return usermessage

        # Takes message in dict form and prepares
        intentquestion = {"answer": self.message, "asked": "false"}
        new_message = {

            "action_id": self.id,

            "action_type": self.type,

            "timestamp": str(self.get_timestamp()),

            "content": intentquestion,

            "chat_id": message['chat_id'],

            "bot_id": self.bot_id
        }

        return new_message
    
    def postprocess_message(self, message):
        #Needs adjustments later to reask for more questions 
        if message["action_type"] == "Button":
            return self.id
        
        answer = requests.post("http://127.0.0.1:4998/querykb", data= json.dumps(message))
        answer = answer.json()

        if 'error' in answer.keys():
            return self.handle_error_request(answer, message)

        intentquestion = {"answer": answer['message'], "asked": "true"}
        answer = {      "action_id": self.id,


                        "action_type": self.type,


                        "timestamp": str(self.get_timestamp()),


                        "content": dict(intentquestion),


                        "chat_id": message['chat_id'],


                        "bot_id": self.bot_id}

        to_return = {"messages":[]}
        messages = []
        messages.append(answer)
        messages.append(self.get_button(message))

        to_return["messages"] = messages
        
        return to_return

    def handle_error_request(self, answer, message):

        answer = {  "action_id": self.id,


                    "action_type": self.type,


                    "timestamp": str(self.get_timestamp()),


                    "content": str({"answer": "Ups something went wrong", "asked": "true"}),


                    "chat_id": message['chat_id'],


                    "bot_id": self.bot_id}
        
        return answer

    def get_button(self, message):

        # Takes message in dict form and prepares
        new_message = {
    
                        "action_id": self.id,


                        "action_type": "Button",


                        "timestamp": str(self.get_timestamp()),


                        "content": [{"message": "Do you want to ask another question"}, {"name": "Default", "value": self.next_action}, {"name": "Yes", "value": self.id}, {"name": "No", "value": self.next_action}],


                        "chat_id": message['chat_id'],


                        "bot_id": self.bot_id
                      }
        
        return new_message

    def process_button(self, message):
        return dict(message['content'])['value']


    @staticmethod
    def from_json(json_dct):
        #May need adjustment
        if 'previous_action' not in json_dct.keys():
            json_dct['previous_action'] = 'None'

        if 'next_action' not in json_dct.keys():
            json_dct['next_action'] = 'None'
        
        # json_dct['previous_action'] needs to be added to class

        return IntentQuestion(json_dct['id'], json_dct['flow_id'], json_dct['bot_id'], json_dct['message'], json_dct['next_action'])