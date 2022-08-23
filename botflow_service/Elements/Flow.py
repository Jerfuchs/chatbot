from Elements.Actions import Action
import json
from Elements.Message import Message
from Elements.IntentQuestion import IntentQuestion
from Elements.Buttons import Button


class Flow:

    ACTION_LIST = [Button, Message, IntentQuestion]


    def __init__(self, id, bot_id, entry_action, actions):
        self.id = id
        self.bot_id = bot_id
        self.actions = []
        if(actions != None):
            self.actions = actions
        self.entry_action = entry_action
        return
    
    def add_action(self, action: Action):
        self.actions.append()
        if(self.entry_action == None):
            self.entry_action = action
        return
    
    def remove_action(self, action: Action):
        self.actions.remove(action)
        return
    
    def search_action(self, action_id):

        for action in self.actions:
            if action.id == action_id:
                return action
        return "Not found"

    def __iter__(self):
        yield from {
            "id": self.id,
            "bot_id": self.bot_id,
            "entry_action": self.entry_action,
        }.items()

    def __str__(self):
        return json.dumps(dict(self), ensure_ascii=False)

    def __repr__(self):
        return self.__str__()

    def to_json(self):
        
        to_return = {"id": self.id, "bot_id": self.bot_id, "entry_action": self.entry_action.__dict__, "actions":[]}
        jactions = []
        for action in self.actions:
                jactions.append(action.__dict__)

        to_return["actions"] = jactions
        return json.dumps(to_return)

    def process_usermessage(self, message):
        
        current_action = self.search_action(message['action_id'])
        #Needs to be changed for real class processing later
        next_action = current_action.postprocess_message(message)

        if not next_action:
            return {"error": "No next action"}
        elif type(next_action) is dict:
            #If Post Processing produces new message, send the message back
            return next_action
        
        
        #Prepare to send next action
        prepared_action = self.search_action(next_action)
        prepared_message = prepared_action.preprocess_message(message, self)

        return prepared_message    
    @staticmethod    
    def from_string(json_str):
        json_dct = json.loads(json_str)
        
        id = json_dct['id']
        bot_id = json_dct['bot_id']

        for type in Flow.ACTION_LIST:
            if(dict(json_dct['entry_action'])['type'] == type.ACTION_TYPE):
                entry_action = type.from_json(dict(json_dct['entry_action']))

        actions_json = json_dct['actions']
        action_holder = []

        for action in actions_json:
            for type in Flow.ACTION_LIST:
                if(action['type'] == type.ACTION_TYPE):
                    new_action = type.from_json(dict(action))
                    action_holder.append(new_action)

        return Flow(id, bot_id, entry_action, action_holder)
    
    @staticmethod
    def from_json(json_dct):
        if 'id' and 'bot_id' and 'flow_id' in json_dct.keys():
            return Action.from_json(json_dct)
        else:
            return json_dct
    
    
