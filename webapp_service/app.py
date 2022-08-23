# app.py
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# CORS = cross origin ressource sharing


@app.route("/")
def index_get():
    # return render_template("base.html")
    return render_template("index.html")


if __name__ == "__main__":
    # Use debug=True only in dev enviroment
    app.run( host='0.0.0.0', port=1234, debug=True )