from flask import Flask, request
from flask_mongoengine import MongoEngine
import json





app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'chat_service_db',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine()
db.init_app(app)


@app.route("/getchat", methods=['POST']) 
def getchat():
    chat = request.get_json()
    return Chat.get_the_chat(chat)

@app.route("/savechat", methods=['POST']) 
def savechat():
    chat = request.get_json()
    bot_flow_check = Chat.check_for_chat(chat)

    if(bot_flow_check == "False"):
        return Chat.save_the_chat(chat)
    
    return Chat.update_the_chat(chat)

@app.route("/deletechat", methods=['POST']) 
def deletechat():
    chat = request.get_json()
    return Chat.delete_the_chat(chat)


class Chat(db.Document):
    id = db.StringField(primary_key=True)
    bot_id = db.StringField()
    chat_history = db.ListField()

    def to_json(self):
        return {"id": self.id,
                "bot_id": self.bot_id,
                "chat_history": self.chat_history}


    @staticmethod
    def check_for_chat(chat):
        chat = json.loads(chat)
        chat = Chat.objects(id=chat['id']).first()
        if not chat:
            return "False"
        else:
            return "True"

    @staticmethod
    def update_the_chat(chat):
        chat = json.loads(chat)
        chat_update = Chat.objects(id=chat['id']).first()
        if not chat_update:
            return json.dumps({'error': 'data not found'})
        else:
            chat_update.update(chat_history=chat['chat_history'])
        return json.dumps({'status': 'successful'})

    @staticmethod
    def get_the_chat(chat):
        chat = json.loads(chat)

        get_chat = Chat.objects(bot_id=chat['id']).first()
        if not get_chat:
            return json.dumps({'error': 'data not found'})
        else:
            return json.dumps(get_chat.to_json())

    @staticmethod
    def save_the_chat(chat):
        chat = json.loads(chat)
        chat = Chat(id=chat['id'],
                      bot_id=chat['bot_id'],
                      chat_history=chat['chat_history'])
        chat.save()
        return json.dumps({'status': 'successful'})

    @staticmethod
    def delete_the_chat(chat):
        #Don't know if it works
        chat = json.loads(chat)
        
        if(Chat.check_for_flow(chat) == "False"):
            return "No Object found to delete"
        
        query = { "id": chat['id'] }
        db.delete_one(query)
        return json.dumps({'status': 'successful'})


if __name__ == "__main__":
    # Use debug=True only in dev enviroment 
    app.run(host='0.0.0.0',port=4999, debug=True)