from Elements.Actions import Action

class Button(Action):

    ACTION_TYPE = "Button"

    def __init__(self, id, flow_id, bot_id, buttons):
        
        Action.__init__(self, id, flow_id, bot_id)
        #Default Button needs to be the first button in dict array
        self.buttons = buttons
        self.type = "Button"
        return
    
    def preprocess_message(self, message, flow):

        # Takes message in dict form and prepares
        new_message = {
    
                        "action_id": self.id,


                        "action_type": self.type,


                        "timestamp": str(self.get_timestamp()),


                        "content": str(self.buttons),


                        "chat_id": message['chat_id'],


                        "bot_id": self.bot_id
                      }
        to_return = {"messages":[]}
        messages = []
        messages.append(new_message)
        to_return["messages"] = messages
        
        return to_return

    def postprocess_message(self, message):
        return dict(message['content'])['value']
    
    @staticmethod
    def from_json(json_dct):
        #May need adjustment
        if 'content' not in json_dct.keys():
            json_dct['content'] = {"Name": "Default", "Value": ""}
    
        
        return Button(json_dct['id'], json_dct['flow_id'], json_dct['bot_id'], json_dct['content'])