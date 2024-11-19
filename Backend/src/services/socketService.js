import { chatServicesController } from '../controllers/fileServicesController.js';
import { sendMessages } from '../helpers/socketChatHandler.js';
import ioClient from 'socket.io-client';

const flaskSocket = ioClient('http://localhost:5000');

export default (io) => {
    const users = new Map(); // To store user IDs and corresponding socket IDs

    io.on('connection', (socket) => {
        console.log('User connected', socket.id);

        // Handle user joining a room with their unique recipient ID
        socket.on('joinRoom', ({ sender, recipient }) => {
            users.set(sender, socket.id); // Store the user's unique ID with their socket ID
            console.log(`User ${sender} joined with socket ID: ${socket.id}`);
        });

        // Handle sending a new message
        socket.on('sendMessage', sendMessages(io, users)); // Pass io and users map
        socket.on('useService', chatServicesController(io, users));
        
        // Clean up when a user disconnects
        socket.on('disconnect', () => {
            users.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    users.delete(userId); // Remove user from the map when they disconnect
                    console.log(`User ${userId} disconnected`);
                }
            });
        });
        
        //Video calling P2P
        // A call intializes
        socket.on("call", (data) => {
            let calleeId = data.calleeId;
            console.log("calleeId", calleeId);
            let rtcMessage = data.rtcMessage;
           
            socket.to(users.get(calleeId)).emit("newCall", {
              callerId: socket.id,
              rtcMessage: rtcMessage,
            });
        });
      
        socket.on("answerCall", (data) => {
            let callerId = data.callerId;
            console.log("callerId", callerId);
            let rtcMessage = data.rtcMessage;
            console.log("rtcMessage", rtcMessage);
            
      
            socket.to(callerId).emit("callAnswered", {
              callee: socket.id,
              rtcMessage: rtcMessage,
            });
        });
      
          socket.on("sendICEcandidate", (data) => {
            console.log("ICEcandidate data", data);
            console.log("ice self id : ", socket.id);
            let calleeId = data.calleeId;
            let rtcMessage = data.rtcMessage;
      
            socket.to(calleeId).emit("ICEcandidate", {
              sender: socket.id,
              rtcMessage: rtcMessage,
            });
          });

          socket.on("endCall", (data) => {
            let calleeId = data.calleeId;
            socket.to(users.get(calleeId)).emit("callEnded", {
              sender: socket.id,
            });
          });
        
          socket.on("realTimeVideoFromFrontend", (data) => {
              
            flaskSocket.on("connect", () => {
              console.log("Connected to Flask server");
            });

            flaskSocket.emit("realTimeVideo", data);

            flaskSocket.on("frameReceived", (data) => {
              console.log("Data from Flask server: ", data);
              socket.emit("realTimeVideoFromBackend", data);
            });

          });
    });
};
