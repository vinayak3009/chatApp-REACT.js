const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const app= express();
const server = http.createServer(app);
const io = socketio(server);
const { addUser , removeUser , getUser , getUserInRoom } = require("./Users");

const PORT = process.env.PORT || 2000;

app.use(router);

io.on("connect",(socket) =>{
    console.log("new user connected!!");

    socket.on("join",({name,room},callback) =>{
       const {error,user} = addUser({id:socket.id,name,room});
          
       if(error) 
      { return callback(error)
       }

       socket.emit("message", {user:"admin" , text:`${user.name} welcome to the room : ${user.room}.`});
       socket.broadcast.to(user.room).emit("message", {user:"admin" , text:`${user.name} has joined the room .`});
       
       socket.join(user.room);
       
       io.to(user.room).emit("roomData" , {room:user.room , users:getUserInRoom(user.room)});

       callback();
    });

    socket.on("sendMessage",(message,callback) =>{
        const user = getUser(socket.id);
        
        io.to(user.room).emit("message",{user:user.name , text: message});
        io.to(user.room).emit("message",{room:user.room , users:getUserInRoom(user.room)});

        callback();
    })

   
    
    socket.on("disconnect",() =>{
        console.log("user disconnected");
         const user =removeUser(socket.id) ;

         if(user){
             io.to(user.room).emit("message",{user:"admin" , text:`${user.name} has left`})
         }
        
    })
    
})
server.listen(PORT,function(){
    console.log(`Server started on port : ${PORT}`);
    
})