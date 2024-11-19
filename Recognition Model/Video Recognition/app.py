from flask import Flask, request, jsonify
import numpy as np
from dependencies import *
import keras
import os
import requests

app = Flask(__name__)
model = keras.models.load_model('Models/AbhayaV2.04_Corrected_Randomized.keras')
classes = ['Are you free today', 'Can you repeat that please',
       'Congratulations', 'help me please', 'how are you', 'I am fine',
       'I love you', 'no', 'Please come,Welcome', 'Talk slower please',
       'Thank You', 'What are you doing', 'What do you do',
       'What Happened', 'yes']

def preProcessVideo(url):
    vid = extractPostitionFromVideo(url)
    vid = np.array([vid])
    return vid
    

@app.route('/predictfromvideo', methods=['POST', 'GET'])
def predict():
     data = request.get_json(force=True)
     url = data['url']
     video = preProcessVideo(url)
     
     result = model.predict(video)
     results = classes[np.argmax(result)]
     print(result)
     print("Confidence: ", np.max(result)*100)
     
     return jsonify(results)
 
@app.route('/predictVideoFromLink', methods=['POST', 'GET'])
def predictFromLink():
    data = request.get_json(force=True)
    url = data['url']
    
    extension = extractExtension(url)
    filepath = f'Saved Video/Video{extension}'
    
    downloadFile(url, filepath)
    
    video = preProcessVideo(filepath)
    
    result = model.predict(video)
    results = classes[np.argmax(result)]
    
    os.remove(filepath)
    print(result)
    print("Confidence: ", np.max(result)*100)

    return jsonify(results)
    
    
    

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 
