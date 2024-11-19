import cv2
import mediapipe as mp
import warnings
import numpy as np
import requests

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) 
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) 
    return image, results

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    face = np.array([[res.x, res.y, res.z, res.visibility] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*4)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    
    return np.concatenate([pose, face, lh, rh])

def extractPostitionFromVideo(filepath, number_of_frames=30):
    try:
        cap = cv2.VideoCapture(filepath)
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        num_frames_to_extract = number_of_frames
        
        if num_frames_to_extract > total_frames:
            warnings.warn(f"Requested {num_frames_to_extract} frames, but the video only has {total_frames} frames. Defaulting to max.")
            num_frames_to_extract = total_frames 
        
        frame_interval = total_frames // num_frames_to_extract
        
        with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
            frame_num = 0
            extracted_frame_count = 0
            keypoints_list = []

            while cap.isOpened() and extracted_frame_count < num_frames_to_extract:
                ret, frame = cap.read()
                
                if not ret:
                    break
                
                # Only process frames at the defined interval
                if frame_num % frame_interval == 0:
                    image, results = mediapipe_detection(frame, holistic)
                    keypoints = extract_keypoints(results)
                    keypoints_list.append(keypoints)
                    
                    # Increment extracted frame count
                    extracted_frame_count += 1

                frame_num += 1

        cap.release()

        return keypoints_list

    except Exception as e:
        print(e)
        cap.release()
        

def downloadFile(url, saveLocation):
    response = requests.get(url, stream=True)
    
    if response.status_code == 200:
        with open(saveLocation, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        return 200
    
    else:
        return response.status_code
    
def extractExtension(url):
    ext = ''
    for i in reversed(url):
        ext += i
        if i == '.':
            break
    
    return ext[::-1]