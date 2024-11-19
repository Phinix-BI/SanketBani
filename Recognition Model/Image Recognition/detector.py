from flask import Flask, request, jsonify
from dependencies import *
from classify import Classifier
import os

app = Flask(__name__)
model = keras.models.load_model('gesturesv13.keras')
class_names = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q','r','s']


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force = True)
    url = data['url']
    image_array = processImage(url)

    prediction = model.predict(image_array)

    return jsonify(class_names[np.argmax(prediction)].lower())


@app.route('/predictfromurl', methods=['GET','POST'])
def predictfromurl():
    data = request.get_json(force = True)
    url = data['url']
    
    download_image(url)
    image_array = processImage('image.jpeg')
    prediction = model.predict(image_array)
    
    os.remove('image.jpeg')
    return jsonify(class_names[np.argmax(prediction)].lower())


@app.route('/classifytext', methods=['GET','POST'])
def classifyText():
    classifier = Classifier()
    data = request.get_json(force=True)
    sentence = data['sentence']
    
    return jsonify(classifier.classify(sentence))
    


if __name__ == '__main__':
    app.run(port=5000)
