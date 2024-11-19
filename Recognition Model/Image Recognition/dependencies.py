from tensorflow import keras
import numpy as np
from tensorflow.keras.preprocessing import image
import requests

def processImage(path):
    img = image.load_img(path, target_size=(128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def download_image(url):
    response = requests.get(url, headers={"User-Agent": "XY"})
    
    # Check if the request was successful
    if response.status_code == 200:
        with open('image.jpeg', 'wb') as handler:
            handler.write(response.content)
        print("Image downloaded successfully.")
    else:
        print(f"Failed to download image. Status code: {response.status_code}")
        
if __name__ =='__main__':
    download_image('https://trivandrumlife.com/wp-content/uploads/2020/05/Sign-Language-840x450.jpg')