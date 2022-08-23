import random
import json
import numpy as np

import nltk
from nltk.stem import WordNetLemmatizer

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Activation, Dropout
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.models import load_model


class Knowledgebase:

    #Object who reduces words to its stem. Example: work, working, worked are turned into => work
    lemmatizer = WordNetLemmatizer()

    ERROR_THRESHOLD = 0.25

    # Letters to ignore in User input
    ignore_letters = ["?", "!", ".", ","]
    
    def __init__(self, bot_id, intents = None):
        self.intents = intents
        self.bot_id = bot_id
        # Userinput to wordslist
        self.words = []

        # Classes => Intents tags
        self.classes = []

        # List of intents with the words associated
        self.documents = []

        # training array
        self.training = []

        # Create new Neural Network model
        self.model = Sequential()

        # Add optimizer lr=learning rate
        self.sgd = SGD(learning_rate=0.01, decay=1e-6, momentum=0.9, nesterov=True) 
    
    def create_knowledgebase_data(self):

        # Iterate over intents. Create Wordlist, List of intents with the words associated
        self.intents = json.dumps(self.intents)
        self.intents = json.loads(self.intents)
        

        for intent in self.intents['intents']:
            for pattern in intent['patterns']:
                #Split Sentence up into words
                word_list = nltk.word_tokenize(pattern)
                self.words.extend(word_list)
                self.documents.append((word_list, intent['tag']))

                if intent['tag'] not in self.classes:
                    self.classes.append(intent['tag'])

        #Lemmmatize words list
        self.words =[self.lemmatizer.lemmatize(word.lower()) for word in self.words if word not in self.ignore_letters]

        #Eliminate duplicates in words
        self.words = sorted(set(self.words))

        #Eliminate duplicates in the classes
        self.classes = sorted(set(self.classes))
        #Save words and classes in file and reading them as binarys
        #pickle.dump(self.words, open(f'{self.bot_id}_words.pkl', 'wb'))
        #pickle.dump(self.classes, open(f'{self.bot_id}_classes.pkl', 'wb'))
        

    def prepare_knowledgebase_training(self):
        #Array with the length of classes
        output_empty = [0] * len(self.classes)

        for document in self.documents:
            # Bag is the array for hits between user input and words from intents
            bag = []
            # Take the words from document. (Format (['Hi', 'im', 'Javis'], 'greeting'))
            word_patterns = document[0]
            # Lemmatize word_patterns and make all words lower case
            word_patterns = [self.lemmatizer.lemmatize(word.lower()) for word in word_patterns]
            for word in self.words:
                #Matching the intents with user input
                bag.append(1) if word in word_patterns else bag.append(0)
    
            output_row = list(output_empty)
            # Set the matching class to 1
            output_row[self.classes.index(document[1])] = 1

            # Add everything to training
            self.training.append([bag, output_row]) 

        # Randomize training data
        random.shuffle(self.training)

        # Turn training unto numpy array
        self.training = np.array(self.training) 

        # Split training (matching) values into x and y values
        self.train_x = list(self.training[:, 0])
        self.train_y = list(self.training[:, 1])


    def create_new_nn_model(self):
        
        # Add neural network layer
        self.model.add(Dense(128, input_shape=(len(self.train_x[0]),), activation='relu'))
        self.model.add(Dropout(0.5))
        self.model.add(Dense(64, activation='relu'))
        self.model.add(Dropout(0.5))
        # Softmax function makes all results add to the digit one so we can choose the highest probability
        self.model.add(Dense(len(self.train_y[0]), activation='softmax'))
   
    def compile_knowledgebase(self):
        # Compile model
        self.model.compile(loss='categorical_crossentropy', optimizer=self.sgd, metrics=['accuracy'])

        hist = self.model.fit(np.array(self.train_x), np.array(self.train_y), epochs=200, batch_size=5, verbose=1)

        # Save model (change to usable directory)
    

        self.model.save(f'models/{self.bot_id}_model.h5', hist)

    def clean_up_sentence(self, sentence):
        sentence_words = nltk.word_tokenize(sentence)
        sentence_words = [nltk.stem.WordNetLemmatizer().lemmatize(word) for word in sentence_words]
        return sentence_words

        #Function returns Bag of words with hits for the words from user input
    def bag_of_words(self, sentence):
        sentence_words = self.clean_up_sentence(sentence)
        bag = [0] * len(self.words)
        for w in sentence_words:
            for i, word in enumerate(self.words):
                if word == w:
                    bag[i] = 1

        return np.array(bag)

    def predict_class(self, sentence):
        
        try:
            self.model = load_model(f'models/{self.bot_id}_model.h5')
        except:
            print("Couldn't find NN Model in files")
            return


        bow = self.bag_of_words(sentence)
        res = self.model.predict(np.array([bow]))[0]
        results = [[i,r] for i,r in enumerate(res) if r > self.ERROR_THRESHOLD]

        results.sort(key=lambda x: x[1], reverse=True)
        return_list = []

        for r in results:
            return_list.append({'intent': self.classes[r[0]], 'probability': str(r[1])})
    
        return return_list

    def get_response(self, intents_list):
        tag = intents_list[0]['intent']
        list_of_intents = self.intents
        for i in list_of_intents:
            if i['tag'] == tag:
                result = random.choice(i['responses'])
                break
    
        return result