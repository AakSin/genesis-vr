let express = require("express");
let http = require("http");
let io = require("socket.io");
let port = process.env.PORT || 3000;

// const cors = require("cors") // importing the `cors` package
// tells Express to use `cors`, and solves the issue

let app = express();
// app.use(cors()); 

let server = http.createServer(app); // wrap the express app with http
io = new io.Server(server); // use socket.io on the http app

let duration = 10000;
let oldXOrient=10000;
let newXOrient;

let oldYOrient=10000;
let newYOrient;

let oldZOrient=1;
let newZOrient;

let smoothZOrient=0;
let yPos = 150;
app.use("/", express.static("public"));

//when a socket connects, take the socket object in callback, and display the id in the server
io.sockets.on("connect", (socket) => {
  console.log("we have a new client: ", socket.id);
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
//listen for a message from this client
// socket.on("orientation", (data) => {
//   // y=data
//   switch (data) {
//     case "Portrait Up":
//       duration = duration - 100;
//       io.sockets.emit("rotationDur", duration);

//       break;
//     case "Portrait Down":
//       duration = duration + 100;
//       io.sockets.emit("rotationDur", duration);
//       break;
//     case "Landscape Up":
//       // y=y-0.5
//       break;
//     case "Landscape Down":
//       // y=y+0.5
//       break;
//   }
// });
  });
// server listening on port
server.listen(port, () => {
  console.log("server is up and running");
});
