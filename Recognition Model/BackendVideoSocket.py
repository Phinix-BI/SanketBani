from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = '5u5eDaYLgYm3xjl2aHTvrF3bsMDVVPE6iDKToPM5iGjcwFgAT6GZeKIsIYKRVgxh9kb'
socketio = SocketIO(app, cors_allowed_origins="*")
num_frames = 0

@socketio.on('realTimeVideo')
def handleVideo(data):
    # global num_frames
    
    try:
        # num_frames += 1
        # with open(f'Saved Frames/frame-{num_frames}.jpeg', 'wb') as fr:
        #     fr.write(data)

        print('Frame received successfully' , data)
            
        emit('frameReceived', {'message': 'Frame received successfully', 'frame_number': 10})

    except Exception as e:
        print('Erroe Saving Frame', e)
        emit('frameRecieved', {'message': f"Error saving frame: {str(e)}"})

if __name__ == '__main__':
    socketio.run(app, port=5000)