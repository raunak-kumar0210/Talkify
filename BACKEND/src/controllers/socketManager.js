// import {Server} from "socket.io";
// import { connectToSocket } from "./controllers/socketManager.js";


// let connections = {}
// let messages = {}
// let timeOnline = {}


// export const connectToSocket = (server) => {
//     const io = new Server(server, {
//         //for testing purposes only
//         cors: {
//             origin: "http://localhost:3000",
//             methods: ["GET", "POST"],
//             credentials: true
//         },
        
//     });
    

//     io.on("connection", (socket) => {

//         socket.on("join-call", (path)=> {

//             if(connections[path] === undefined) {
//                 connections[path] = []

//             }
//             connections[path].push(socket.id)

//             timeOnline[socket.id] = new Date();

//             // connection[path].forEach(elem => {
//             //      io.to(elem)
//             // })

//             for (let a = 0; a < connections[path].length; a++) {
//                 io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])

//             }
//             if (messages[path] !== undefined) {
//                 for (let a = 0; a< messages[path].length; ++a) {
//                     io.to(socket.id).emit(
//                         "chat-message", 
//                         messages[path][a]['data'],
//                         messages[path][a]['sender'],
//                         messages[path][a]['socket-id-sender']
//                     );
//                 }      
//             }
//         })
    

//     socket.on("signal", (toId, message) => {
//         io.to(toId).emit("signal", socket.id, message);
//     })
    
//     socket.on("chat-message", (data, sender) => {

//         const [matchingRoom, found] = Object.entries(connections).reduce(   
//             ([matchingRoom, isFound], [roomKey, roomValue]) => {

//                 if (!isFound && roomValue.includes(socket.id)) {
//                     return [roomKey, true];
//                 }

//                 return [roomKey, isFound];

//             }, ['', false]
//         );
        

//         if (found === true) {

//             if(messages[matchingRoom] === undefined) {
//                 messages[matchingRoom] = []
//             }

//             messages[matchingRoom].push({ 
//                 "sender": sender, 
//                 "data": data, 
//                 "socket-id-sender": socket.id,
//             })

//             console.log("message received from",sender, ":",  data);

//             connections[matchingRoom].forEach((elem) => {
//                     io.to(elem).emit("chat-message", data, sender, socket.id)
                
//             })
//         }
//     })

//     socket.on("disconnect", ()=> {
//         // var diffTime = Math.abs(timeOnline[socket.id] - new Date())

//         var key

//         for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

//             for(let a = 0; a < v.length; ++a) {
//                 if (v[a] === socket.id) {

//                     key = k;

//                     for (let a= 0; a< connections[key].length; ++a) {
//                         io.to(connections[key][a]).emit('user-left', socket.id)
//                     }

                    

//                     connections[key].splice(index, 1)


//                     if(connections[key].length === 0) {
//                         delete connections[key]
//                     }

//                 }
//             }
//         }

//     })
// })
 
// }


import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        // For testing purposes only
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        socket.on("join-call", (path) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            // Notify all users in the room that a new user has joined
            connections[path].forEach((elem) => {
                io.to(elem).emit("user-joined", socket.id, connections[path]);
            });

            // Send chat history to the newly joined user if it exists
            if (messages[path] !== undefined) {
                messages[path].forEach((message) => {
                    io.to(socket.id).emit("chat-message", message.data, message.sender, message.socketIdSender);
                });
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections).reduce(
                ([matchingRoom, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [matchingRoom, isFound];
                },
                ['', false]
            );

            if (found) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    sender: sender,
                    data: data,
                    socketIdSender: socket.id,
                });

                console.log("Message received from", sender, ":", data);

                // Send the chat message to all users in the room
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            let key;

            // Find the room where the user is connected and notify others
            for (const [k, v] of Object.entries(connections)) {
                const index = v.indexOf(socket.id);
                if (index !== -1) {
                    key = k;

                    // Notify users that someone has left
                    connections[key].forEach((elem) => {
                        io.to(elem).emit('user-left', socket.id);
                    });

                    // Remove the user from the room
                    connections[key].splice(index, 1);

                    // Clean up the room if it's empty
                    if (connections[key].length === 0) {
                        delete connections[key];
                    }
                    break; // Exit the loop after finding the user
                }
            }
        });
    });
};

