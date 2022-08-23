import json
from asyncio import exceptions
from base64 import encode

from flask import Flask, request, jsonify
from flask_cors import CORS

import config
from validation.email_validation import EmailValidatior
from app_requests.chat_service_requests import ChatService
from app_requests.knowledgebase_service_requests import KnowledgebaseService
from app_requests.botflow_service_requests import Botflowservice

from chat import get_response

app = Flask(__name__)
CORS(app)


@app.route("/initialise_chat", methods=['POST'])
def initialise_chat():
    message = request.data.decode('UTF-8')
    print(message)
    message = Botflowservice.botflow_service_get_request(f"{config.botflow_service_url}register_bot", message)
    if(message == "Request failed"):
        return "Failed"
    return message

@app.route("/usermessage", methods=['POST'])
def usermessage():
    message = request.data.decode('UTF-8')

    message = Botflowservice.botflow_service_post_request(f"{config.botflow_service_url}context_module", message)
    if(message == "Request failed"):
        return "Failed"
    return message


@app.route("/savechat", methods=['POST'])
def savechat():

    chat = request.data.decode('UTF-8')    
    return ChatService.chat_service_post_request(f"{config.chat_service_url}savechat", chat)


@app.route("/deletchat", methods=['POST'])
def deletchat():

    chat = request.data.decode('UTF-8')
    return ChatService.chat_service_post_request(f"{config.chat_service_url}deletechat", chat)

@app.route("/getchat", methods=['POST'])
def getchat():

    chat = request.data.decode('UTF-8')    
    return ChatService.chat_service_post_request(f"{config.chat_service_url}getchat", chat)









if __name__ == "__main__":
    # Use debug=True only in dev enviroment 
    app.run(host='0.0.0.0', port=5000, debug=True)