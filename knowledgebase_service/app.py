from click import pass_context
from flask import Flask, request, url_for
from flask_mongoengine import MongoEngine
from Knowledgebase import Knowledgebase
import json


app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'db': 'knowledgebase_service_db',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine()
db.init_app(app)

@app.route("/querykb", methods=['POST']) 
def querykb():

    message = request.data.decode('UTF-8')
    message = json.loads(message)

    #Preparing data (Get request Mongodb) for NN query
    raw_intents = Json_kb.get_the_intents(json.dumps(message))
    if raw_intents == json.dumps({'error': 'data not found'}):
        print({'error': 'data not found'})
        return {'error': 'data not found'}
    intents = json.loads(raw_intents)

    raw_words = Words_kb.get_the_words(json.dumps(message))
    if raw_words == json.dumps({'error': 'data not found'}):
        print({'error': 'data not found'})
        return {'error': 'data not found'}
    words = json.loads(raw_words)

    raw_classes = Classes_kb.get_the_classes(json.dumps(message))
    if raw_classes == json.dumps({'error': 'data not found'}):
        print({'error': 'data not found'})
        return {'error': 'data not found'}
    classes = json.loads(raw_classes)


    # message.intents needs to be changed. Only used in prototype
    kb = Knowledgebase(intents['bot_id'], intents['intents'])
    kb.words = words['words']
    kb.classes = classes['classes']
    ints = kb.predict_class(dict(message['content'])['answer'])
    res = kb.get_response(ints)
    answer = {"message": res}

    return json.dumps(answer)

    

@app.route("/trainkb", methods=['POST']) 
def trainkb():
    message = request.data.decode('UTF-8')
    message  = json.loads(message)
    intents = {}
    intents['bot_id'] = message['bot_id']
    intents['intents'] = message['intents']
    kb = Knowledgebase(message['bot_id'], intents)

    intents = json.dumps(intents)
    intents_check = Json_kb.check_for_intents(intents)
 
    if(intents_check == "False"):
        Json_kb.save_the_intents(json.dumps(message))
    else:
        Json_kb.update_the_intents(intents)

    kb.create_knowledgebase_data()
    #Package words and classes in dictonarys to make them ready to be queried in Mongodb
    words = {"bot_id": kb.bot_id, "words": kb.words}
    words = json.dumps(words)

    classes = {"bot_id": kb.bot_id, "classes": kb.classes}
    classes = json.dumps(classes)

    #Check Mongodb for classes and words (needed for training of the NN)
    words_check = Words_kb.check_for_words(words)

    if(words_check == "False"):
        Words_kb.save_the_words(words)
    else:
        Words_kb.update_the_words(words)

    classes_check = Classes_kb.check_for_classes(classes)

    if(classes_check == "False"):
        Classes_kb.save_the_classes(classes)
    else:
        Classes_kb.update_the_classes(classes)


    kb.prepare_knowledgebase_training()
    kb.create_new_nn_model()
    kb.compile_knowledgebase()

    return {"Message": "Successful"}

@app.route("/save_intents", methods=['POST'])
def save_intents():
    intents = request.data.decode('UTF-8')
    return Json_kb.save_the_intents(intents)

@app.route("/check_intents", methods=['GET'])
def check_intents():
    intents = request.data.decode('UTF-8')
    return Json_kb.check_for_intents(intents)

@app.route("/update_intents", methods=['POST'])
def update_intents():
    intents = request.data.decode('UTF-8')
    return Json_kb.update_the_intents(intents)

@app.route("/get_intents", methods=['GET'])
def get_intents():
    intents = request.data.decode('UTF-8')
    return Json_kb.get_the_intents(intents)


#Classes for Mongodb queries

class Json_kb(db.Document):
    bot_id = db.StringField()
    #bot_id = db.StringField(primary_key=True)
    intents = db.ListField()

    def to_json(self):
        return {"bot_id": self.bot_id,
                "intents": self.intents}

    @staticmethod
    def check_for_intents(intents):
        intents = json.loads(intents)
        intents = Json_kb.objects(bot_id=intents['bot_id']).first()
        if not intents:
            return "False"
        else:
            return "True"

    @staticmethod
    def update_the_intents(intents):
        intents = json.loads(intents)
        intents_check = Json_kb.objects(bot_id=intents['bot_id']).first()
        if not intents_check:
            return json.dumps({'error': 'data not found'})
        else:
            intents_check.update(intents=intents['intents'])

        return json.dumps(intents_check.to_json())

    @staticmethod
    def get_the_intents(intents):
        intents = json.loads(intents)
        print(intents['bot_id'])
        get_intents = Json_kb.objects(bot_id=intents['bot_id']).first()
        if not get_intents:
            return json.dumps({'error': 'data not found'})
        else:
            return json.dumps(get_intents.to_json())
    @staticmethod
    def save_the_intents(intents):
        intents = json.loads(intents)
        intents = Json_kb(bot_id=intents['bot_id'],
                      intents=intents['intents'])
        intents.save()
        return json.dumps(intents.to_json())






class Words_kb(db.Document):
    bot_id = db.StringField()
    #bot_id = db.StringField(primary_key=True)
    words = db.ListField()
    def to_json(self):
        return {"bot_id": self.bot_id,
                "words": self.words}

    @staticmethod
    def check_for_words(words):
        words = json.loads(words)
        words = Words_kb.objects(bot_id=words['bot_id']).first()
        if not words:
            return "False"
        else:
            return "True"

    @staticmethod
    def update_the_words(words):
        words = json.loads(words)
        words_check = Words_kb.objects(bot_id=words['bot_id']).first()
        if not words_check:
            return json.dumps({'error': 'data not found'})
        else:
            words_check.update(words=words['words'])

        return json.dumps(words_check.to_json())

    @staticmethod
    def get_the_words(words):
        words = json.loads(words)
    
        get_words = Words_kb.objects(bot_id=words['bot_id']).first()
        if not get_words:
            return json.dumps({'error': 'data not found'})
        else:
            return json.dumps(get_words.to_json())

    @staticmethod
    def save_the_words(words):
        words = json.loads(words)
        words = Words_kb(bot_id=words['bot_id'],
                      words=words['words'])
        words.save()
        return json.dumps(words.to_json())





class Classes_kb(db.Document):
    bot_id = db.StringField()
    #bot_id = db.StringField(primary_key=True)
    classes = db.ListField()
    def to_json(self):
        return {"bot_id": self.bot_id,
                "classes": self.classes}

    @staticmethod
    def check_for_classes(classes):
        classes = json.loads(classes)
        classes = Classes_kb.objects(bot_id=classes['bot_id']).first()
        if not classes:
            return "False"
        else:
            return "True"

    @staticmethod            
    def update_the_classes(classes):
        classes = json.loads(classes)
        classes_check = Classes_kb.objects(bot_id=classes['bot_id']).first()
        if not classes_check:
            return json.dumps({'error': 'data not found'})
        else:
            classes_check.update(classes=classes['classes'])

        return json.dumps(classes_check.to_json())

    @staticmethod
    def get_the_classes(classes):
        classes = json.loads(classes)
    
        get_classes = Classes_kb.objects(bot_id=classes['bot_id']).first()
        if not get_classes:
            return json.dumps({'error': 'data not found'})
        else:
            return json.dumps(get_classes.to_json())

    @staticmethod
    def save_the_classes(classes):
        classes = json.loads(classes)
        classes = Classes_kb(bot_id=classes['bot_id'],
                      classes=classes['classes'])
        classes.save()
        return json.dumps(classes.to_json())



if __name__ == "__main__":
    # Use debug=True only in dev enviroment 
    app.run(host='0.0.0.0',port=4998, debug=True)