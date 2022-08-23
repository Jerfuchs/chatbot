import json
from datetime import datetime
class Action:

    ACTION_TYPE = "Action"

    def __init__(self, id, flow_id, bot_id):
        self.id = id
        self.flow_id = flow_id
        self.bot_id = bot_id
        self.type = "None"
        return
    
    def __iter__(self):
        yield from {
            "id": self.id,
            "flow_id": self.flow_id,
            "bot_id": self.bot_id,
        }.items()

    def get_timestamp(self):
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    def preprocess_message(self):
        pass

    def postprocess_message(self):
        pass

    def __str__(self):
        return json.dumps(dict(self), ensure_ascii=False)

    def __repr__(self):
        return self.__str__()

    def to_json(self):
        return json.dumps(self.__dict__)
    
    @staticmethod
    def from_json(json_dct):
        return Action(json_dct['id'], json_dct['flow_id'], json_dct['bot_id'])