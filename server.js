let express = require("express");
let http = require("http");
let io = require("socket.io");
let port = process.env.PORT || 3000;



let app = express();


let server = http.createServer(app); // wrap the express app with http
io = new io.Server(server); // use socket.io on the http app



let oldXOrient=10000;
let newXOrient;

let oldYOrient=10000;
let newYOrient;

let oldZOrient=1;
let newZOrient;

// default y-pos
let yPos = 150;

app.use("/", express.static("public"));

//when a socket connects, take the socket object in callback, and display the id in the server
io.sockets.on("connect", (socket) => {
  console.log("we have a new client: ", socket.id);
//   reset y pos when new client joins (would be a huge issue if we had more clients than our pc and phone but since we don't it 
  //  was helpful to reset every time we joined from phone)
  yPos=150;

  //drop a message on the server when the socket disconnects
  socket.on("disconnect", () => {
    console.log("socket has been disconnected: ", socket.id);
  });
 socket.on("xOrient",(xOrient)=>{
   
   if(Math.abs(oldXOrient - xOrient) >= 5000){

     oldXOrient = xOrient
     io.sockets.emit("rotationDur",xOrient)
   }
 })
  socket.on("yOrient",(yOrient)=>{
   
   if(Math.abs(oldYOrient - yOrient) >= 5000){

     oldYOrient = yOrient
     io.sockets.emit("spread",yOrient/500)
   }
 })
   socket.on("zOrient",(zOrient)=>{
   
   if(Math.abs(oldZOrient - zOrient) >= 50){

     oldZOrient = zOrient
     io.sockets.emit("colorChange",zOrient)
   }
 })
  socket.on("cameraUp",()=>{
    yPos += 0.5
    io.sockets.emit("cameraMove",yPos)
  })
  socket.on("cameraDown",()=>{
    yPos -= 0.5
    io.sockets.emit("cameraMove",yPos)
  })
  });
// server listening on port
server.listen(port, () => {
  console.log("server is up and running");
});
