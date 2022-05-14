let camera;
let parentEntityEl;
let sceneEl;

// animation variables
let duration = 5000;
let color = Math.floor(Math.random() * 16777215).toString(16);

let socket = io(); //opens and connects to the socket

socket.on("cameraMove", (yPos) => {
  // console.log(yPos);
  camera.setAttribute("position", {
    x: 0,
    y: yPos,
    z: 0,
  });
});

socket.on("rotationDur", (duration) => {
  console.log(Math.floor(duration));
//   iterate through all spheres and set the new duration
  let allParents = document.querySelectorAll(".parent");
  for (let i = 0; i < allParents.length; i++) {
    // print(allParents[i]);
    allParents[i].setAttribute("animation", {
      from: {
        x: "90",
        y: "0",
        z: "0",
      },
      to: {
        x: "90",
        y: "0",
        z: "360",
      },
      dur: Math.floor(duration),
      // dur: 20000,
    });
  }
});
socket.on("colorChange", (colorVal) => {
  let r= Math.floor(colorVal);
  let b= 255 - Math.floor(colorVal);
  let allSpheres = document.querySelectorAll("a-sphere");
  for (let i = 0; i < allSpheres.length; i++) {
     allSpheres[i].setAttribute("material", {
        // color: "white",
        color: `rgb(${r},0,${b})`,
      });
  }
});
socket.on("spread", (spread) => {
  console.log(Math.floor(spread));

  let allSpheres = document.querySelectorAll("a-sphere");
  for (let i = 0; i < allSpheres.length; i++) {
    // print(allParents[i]);
    
//     as the values in this case were iteratively assigned and I couldn't hard code it, I had to access the values of the spheres out first
//     so that I could keep the from values same in the re-assignemnt of the animation
    let oldValues = allSpheres[i].getAttribute("animation");

    let newY = 1+ ((oldValues.to.y / 20) * Math.floor(spread));

    // console.log(i,oldValues.to.y,newY)
    allSpheres[i].setAttribute("animation", {
      from: {
        x: oldValues.from.x,
        y: oldValues.from.y,
        z: oldValues.from.z,
      },
      to: {
        x: oldValues.to.x,
        y: newY,
        z: oldValues.to.z,
      },
    });
  }
});
function setup() {
 
}
function touchStarted(){
//   bind music to the ground upon clickin on the phone/starts audio
   let environment = document.querySelector("#environment");
  environment.setAttribute("sound", {
    src: "#song",
    autoplay: true,
    loop:true,
    volume:4,
  });
}
function keyPressed() {
  //   bind music to the ground upon clickin on the spacebar on laptop/starts audio
  if (key == " ") {
     let environment = document.querySelector("#environment");
  environment.setAttribute("sound", {
    src: "#song",
    autoplay: true,
    loop:true,
  });
    setUpSerial();
  }
}

function readSerial(data) {
  ////////////////////////////////////
  //READ FROM ARDUINO HERE
  ////////////////////////////////////

  if (data != null) {
    // make sure there is actually a message
    // split the message
    data = data.split("\t");

    socket.emit("xOrient", map(data[0], -1.5, 1.5, 0, 20000));
    socket.emit("yOrient", map(data[1], -1.5, 1.5, 0, 20000));
    socket.emit("zOrient", map(data[2], -1.5, 1.5, 10, 240));
    
    if (data[5] == 1) {
      socket.emit("cameraUp");
    }
    if (data[4] == 1) {
      socket.emit("cameraDown");
    }
    
  }
}
/*

*/ window.addEventListener("load", () => {
  sceneEl = document.querySelector("a-scene");
//   this is the evi
   let environment = document.querySelector("#environment");
  camera = document.querySelector("#rig");
//   I left this in place because earlier the seed was being animated (hence the chaning buildings). In case I wanted that option back
//   I would just have to change the To value in here
  environment.setAttribute("animation", {
    property: "environment.seed",
    from: 1,
    to: 1,
    loop: true,
    easing: "linear",
    dir: "alternate",
    dur: duration * 2,
  });

  const circleNo = 9;

//   I decidded to make createLight my own function since I was doing it so many times
  createLight("1 0 1", "red");
  createLight("-1 0 1", "blue");
  // createLight("0 0 1","white");
  // createLight("0 0 -1","white");

  createSky();
  
  

  for (let i = 0; i < 50; i++) {
//   all 9 balls would lie on one parent entity which rotated
//     there would be 50 of such parent entities
    parentEntityEl = document.createElement("a-entity");
    parentEntityEl.classList.add("parent");
    parentEntityEl.setAttribute("position", {
      x: "0",
      y: i + 150,
      z: "0",
    });
    parentEntityEl.setAttribute("animation", {
      property: "rotation",
      delay: i * 100,
      from: {
        x: "90",
        y: "0",
        z: "0",
      },
      to: {
        x: "90",
        y: "0",
        z: "360",
      },
      loop: true,
      dur: 5000,

      easing: "easeOutCubic",
    });
    
    for (let j = 0; j < circleNo; j++) {
      let entityEl = document.createElement("a-sphere");
     
      let ballColor = "rgb(255,255,255)";

      entityEl.setAttribute("geometry", {
        radius: "0.5",
      });
      entityEl.setAttribute("material", {

        color: ballColor,
      });
     
      entityEl.setAttribute("animation__shrink", {
        property: "geometry.radius",
        delay: i * 100,
        to: "1",
        from: "0.5",
        loop: true,
        dur: 5000,

        easing: "easeOutCubic",

        dir: "alternate",
      });
//       arrange them in a circle
      entityEl.setAttribute("animation", {
        property: "position",
        delay: i * 100,
        from: {
          x: Math.cos(j * ((Math.PI * 2) / circleNo)) * 1,
          y: Math.sin(j * ((Math.PI * 2) / circleNo)) * 1,
          z: 4 * i,
        },
        to: {
          x: Math.cos(j * ((Math.PI * 2) / circleNo)) * 20,
          y: Math.sin(j * ((Math.PI * 2) / circleNo)) * 20,
          z: 4 * i,
        },
        loop: true,
        dur: 5000,

        easing: "easeOutCubic",

        dir: "alternate",
      });

      parentEntityEl.appendChild(entityEl);
    }
    sceneEl.appendChild(parentEntityEl);
  }
});

function createLight(pos, lightColor) {
  let light = document.createElement("a-light");
  light.setAttribute("type", "directional");
  light.setAttribute("light", "castShadow:true");
  light.setAttribute("position", pos);
  light.setAttribute("intensity", "1");
  light.setAttribute("color", lightColor);

  //   // light.setAttribute("shdadow-camera-automatic", "#objects");
  sceneEl.appendChild(light);
}

function createSky() {
  let sky = document.createElement("a-sky");
  sky.setAttribute("animation", {
    property: "material.color",
    from: "#030c2b",
    to: "#260007",
    loop: true,
    dur: 5000,
    dir: "alternate",

    easing: "linear",
  });
  sceneEl.appendChild(sky);
}
