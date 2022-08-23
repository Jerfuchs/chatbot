from Elements.Message import Message
from flask import Flask, request, jsonify, send_file
from Elements.Flow import Flow
from Elements.Actions import Action
from flask_mongoengine import MongoEngine
import json
from datetime import datetime

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'botflow_service_db',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine()
db.init_app(app)



@app.route("/seralisation_test")
def seralisation_test():
    action1 = Message("111", "222", "333", "Hey")
    action2 = Action("444", "555", "666")
    action3 = Action("666", "777", "888")
    
    action_list = [action1, action2, action3]
    mein_flow = Flow("69", "420", action1, action_list)
    flow_json = mein_flow.to_json()
    #print(flow_json)
    print(flow_json)
    test = Flow.from_string(flow_json)
    print(test.actions)
    

    # Reminder: The following line Code deserialize json directly to objects ->
    # flow = json.loads(json_str2, object_hook=Flow.from_json)
    return test.to_json()


@app.route("/data_test")
def data_test():
    action1 = Message("111", "696", "4200", "Hey")
    action2 = Message("444", "696", "4200", "Ho")
    action3 = Message("666", "696", "4200", "Low")

    action1.next_action = action2.id
    action2.next_action = action3.id
    
    action_list = [action1, action2, action3]
    mein_flow = Flow("696", "4200", action1, action_list) 
    flow = mein_flow.to_json()

    return flow


@app.route("/register_bot")
def register_bot():
    message = request.get_json()

    json_flow = Botflow.get_the_flow(message)

    flow = Flow.from_string(json_flow)
    message = json.loads(message)
    timestamp = datetime.now()
    new_message = {

        "action_id": flow.entry_action.id,

        "action_type": flow.entry_action.type,

        "timestamp": str(timestamp),

        "content": flow.entry_action.message,

        "chat_id": message['chat_id'],

        "bot_id": message['bot_id']
    }
    return json.dumps(new_message)


@app.route("/context_module", methods=['POST'])
def context_module_test():
    #Initiate Data
    message = request.get_json()

    json_flow = Botflow.get_the_flow(message)

    flow = Flow.from_string(json_flow)
    message = json.loads(message)
 
    #Let Frontend fetch next action
    return json.dumps(flow.process_usermessage(message))
    

@app.route("/save_flow")
def save_flow():
    
    flow_dict = request.data.decode('UTF-8')
    bot_flow_check = Botflow.check_for_flow(flow_dict)

    if(bot_flow_check == "False"):
        Botflow.save_the_flow(flow_dict)
    else:
        Botflow.update_the_flow(flow_dict)

    return "True"

@app.route("/get_flow")
def get_flow():
    flow_dict = request.data.decode('UTF-8')
    return Botflow.get_the_flow(flow_dict)


#Class for Mongodb queries
#Change Bot DIs to Flow ids
class Botflow(db.Document):
    id = db.StringField(primary_key=True)
    bot_id = db.StringField()
    entry_action = db.DictField()
    actions = db.ListField()

    def to_json(self):
        return {"id": self.id,
                "bot_id": self.bot_id,
                "entry_action": self.entry_action,
                "actions": self.actions}


    @staticmethod
    def check_for_flow(bot_flow):
        bot_flow = json.loads(bot_flow)
        bot_flow = Botflow.objects(id=bot_flow['id']).first()
        if not bot_flow:
            return "False"
        else:
            return "True"

    @staticmethod
    def update_the_flow(bot_flow):
        bot_flow = json.loads(bot_flow)
        bot_flow_update = Botflow.objects(id=bot_flow['id']).first()
        if not bot_flow_update:
            return json.dumps({'error': 'data not found'})
        else:
            bot_flow_update.update(entry_action=bot_flow['entry_action'], actions=bot_flow['actions'])

    @staticmethod
    def get_the_flow(bot_flow):
        bot_flow = json.loads(bot_flow)

        get_bot_flow = Botflow.objects(bot_id=bot_flow['bot_id']).first()
        if not get_bot_flow:
            return json.dumps({'error': 'data not found'})
        else:
            return json.dumps(get_bot_flow.to_json())

    @staticmethod
    def save_the_flow(bot_flow):
        bot_flow = json.loads(bot_flow)
        bot_flow = Botflow(id=bot_flow['id'],
                      bot_id=bot_flow['bot_id'],
                      entry_action=bot_flow['entry_action'],
                      actions=bot_flow['actions'])
        bot_flow.save()

    @staticmethod
    def delete_the_flow(bot_flow):
        #Don't know if it works
        bot_flow = json.loads(bot_flow)
        
        if(Botflow.check_for_flow(bot_flow) == "False"):
            return "No Object found to delete"
        
        query = { "id": bot_flow['id'] }
        db.delete_one(query)

        






if __name__ == "__main__":
    # Use debug=True only in dev enviroment 
    app.run(host='0.0.0.0',port=4996, debug=True)