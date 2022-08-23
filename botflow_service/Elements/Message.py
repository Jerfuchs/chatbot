from Elements.Actions import Action

class Message(Action):

    ACTION_TYPE = "Message"

    def __init__(self, id, flow_id, bot_id, message, next_action = ''):
        Action.__init__(self, id, flow_id, bot_id)
        self.next_action = next_action
        self.message = message
        self.type = "Message"
        return
    
    def preprocess_message(self, message, flow):
        # Takes message in dict form and prepares
        new_message = {
    
                        "action_id": self.id,


                        "action_type": self.type,


                        "timestamp": str(self.get_timestamp()),


                        "content": self.message,


                        "chat_id": message['chat_id'],


                        "bot_id": self.bot_id
                      }
        to_return = {"messages":[]}
        messages = []
        messages.append(new_message)
        to_return["messages"] = messages

        return to_return

    def postprocess_message(self, message):
        return self.next_action
    
    @staticmethod
    def from_json(json_dct):
        #May need adjustment

        if 'next_action' not in json_dct.keys():
            json_dct['next_action'] = 'None'
        
        # json_dct['previous_action'] needs to be added to class

        return Message(json_dct['id'], json_dct['flow_id'], json_dct['bot_id'], json_dct['message'], json_dct['next_action'])