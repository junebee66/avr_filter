import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';

import { AnaglyphEffect } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/effects/AnaglyphEffect.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/MTLLoader.js';
import {DragControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/DragControls.js';


//this sketch uses the javascript tag for three.js library
//and needs to activate the canvas DOM inside html named  "myCanvas" 
window.addEventListener('load', init); // Wait for loading
window.addEventListener('resize', onResize); // When window resized
// window.addEventListener('load', playVid);
// window.addEventListener('load', pauseVid);

let renderer, scene, camera, effect;
let webCam;
let video;
let particles;
let tileSize = 80;
let videoTag;


// function playVid(){
//     let videoTag = document.getElementById("myVideo");
//     videoTag.play();
// }

// function pauseVid(){
//     let videoTag = document.getElementById("myVideo");
//     videoTag.pause();
// }


function init() {  
    console.log('test');
    // Get window size
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // let PlayBtn = document.createElement("button");
    // let PauseBtn = document.createElement("button");
    // PlayBtn.onclick = function() { playVideo };
    // console.log("playVideo");
    // PauseBtn.onclick = function() { pauseVideo };
    // videoTag.play();
    // videoTag.pause();

    // Create webgl renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas'),
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setPixelRatio(1);
    // console.log('pixelRatio' + window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);
    // renderer.setSize(windowWidth/2, windowHeight/2);
    // renderer.outputEncoding = THREE.GammaEncoding;


    
    effect = new AnaglyphEffect( renderer );
    effect.setSize( windowWidth, windowHeight );
    // effect.setSize( windowWidth/2, windowHeight/2  );

    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    camera.position.set( 0, 30, 0 );
    controls.update(); // must be called after any manual changes to the camera's transform
    scene.add(camera);

    // Create light
    // const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    // scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    // scene.add(directionalLight);

    // Init webcam & particle
    // getDevices()
    initWebCam();

    // Render loop
    const render = () => {
        drawParticles();
        controls.update();
        renderer.render( scene, camera );
        effect.render( scene, camera );
        requestAnimationFrame(render);
    };

    render();

}

// Get videoinput device info
function getDevices(){
    console.log("getDevices...");
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
        devices.forEach(function(device) {
            if(device.kind == "videoinput"){
                console.log("device:",device);
            }
        });
    })
    .catch(function(err) {
        console.error('ERROR:', err);
    });
}

function initWebCam(){
    // console.log("initWebCam...");
    // webCam = document.createElement('video');
    // webCam.id = 'webcam';
    // webCam.autoplay = true;
    // webCam.width    = 640;
    // webCam.height   = 480;

    // const option = {
    //     video: true,
    //     // video: {
    //     //     deviceId: "hogehoge",
    //     //     width: { ideal: 1280 },
    //     //     height: { ideal: 720 }
    //     // },
    //     audio: false,
    // }

    video = document.getElementById( 'myVideo' );
    // const texture = new THREE.VideoTexture( video );
    // Get image from camera
    // let media = navigator.mediaDevices.getUserMedia(option)
    // .then(function(stream) {
    //     webCam.srcObject = stream;
    //     createParticles();
    // }).catch(function(e) {
    //     alert("ERROR: " + e.message);
    //     // console.error('ERROR:', e.message);
    // });
    createParticles();
}

function getImageData(image){

    const w = image.width;
    const h = image.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    // // Invert image
    // ctx.translate(w, 0);
    // ctx.scale(-1, 1);

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);

    return imageData
}

function createParticles(){
    console.log("createParticles...");
    const imageData = getImageData(video);

    const geometry = new THREE.BufferGeometry();
    const vertices_base = [];
    const colors_base = [];

    const width = imageData.width;
    const height = imageData.height;

    // Set particle info
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const posX = 0.03*(-x + width / 4);
            const posY = 0;
            const posZ = 0.03*(y - height / 4);
            vertices_base.push(posX, posY, posZ);

            const r = 1.0;
            const g = 1.0;
            const b = 1.0;
            colors_base.push(r, g, b);
        }
    }

    const vertices = new Float32Array(vertices_base);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const colors = new Float32Array(colors_base);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Set shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: 'f',
                value: 0.0
            },
            size: {
                type: 'f',
                value: 35.0
            },
            // texture: {
            //     type: 't',
            //     value: hoge
            // }
        },
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        transparent: true,
        depthWrite: false,
        blending: THREE.NoBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    effect.render( scene, camera );

}


function drawParticles(t){
    // Update particle info
    if (particles) {
        const imageData = getImageData(video);
        const length = particles.geometry.attributes.position.count;
        for (let i = 0; i < length; i+=1) {
            const index = i * 4;
            const r = imageData.data[index]/255;
            const g = imageData.data[index+1]/255;
            const b = imageData.data[index+2]/255;
            const gray = (r+g+b) / 3;

            particles.geometry.attributes.position.setY( i , gray*10);
            
            particles.geometry.attributes.color.setX( i , r);
            particles.geometry.attributes.color.setY( i , g);
            particles.geometry.attributes.color.setZ( i , b);


            // particles.geometry.attributes.position.setY( i , gray*10);
            // if (i % 2 == 0){
            //     particles.geometry.attributes.color.setX( i , 255);
            //     particles.geometry.attributes.color.setY( i , 255);
            //     particles.geometry.attributes.color.setZ( i , 255);

            //     // particles.geometry.attributes.color.setX( i , r);
            //     // particles.geometry.attributes.color.setY( i , g);
            //     // particles.geometry.attributes.color.setZ( i , b);
            //     // particles.geometry.attributes.position.setY( i , gray*80);
            //     particles.geometry.attributes.position.setY( i , gray*0);
            // }else{
            //     particles.geometry.attributes.color.setX( i , r);
            //     particles.geometry.attributes.color.setY( i , g);
            //     particles.geometry.attributes.color.setZ( i , b);
            //     // particles.geometry.attributes.color.setX( i , 0);
            //     // particles.geometry.attributes.color.setY( i , 0);
            //     // particles.geometry.attributes.color.setZ( i , 0);
            //     particles.geometry.attributes.position.setY( i , 0);
            //     particles.geometry.attributes.position.setY( i , gray*10);
            // }

            // const path = "https://threejs.org/examples/textures/cube/pisa/";
            // const format = '.png';
            // const urls = [
            //     path + 'px' + format, path + 'nx' + format,
            //     path + 'py' + format, path + 'ny' + format,
            //     path + 'pz' + format, path + 'nz' + format
            // ];
        
            // const textureCube = new THREE.CubeTextureLoader().load( urls );
            // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
            // const boxgeometry = new THREE.BoxGeometry(1,1,1);
            //     const boxcube = new THREE.Mesh(boxgeometry, material);
            //     // boxcube.position.x = Math.random() * 10 - 5;
            //     boxcube.position.setY( i , gray*10);
            //     // boxcube.position.z = Math.random() * 10 - 5;
        
            //     boxcube.scale.x = boxcube.scale.y = boxcube.scale.z = 30;
        
                // scene.add(boxcube); // remeber to put in the scene

        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
    }
    
    // const path = "https://threejs.org/examples/textures/cube/pisa/";
    // const format = '.png';
    // const urls = [
    // 	path + 'px' + format, path + 'nx' + format,
    // 	path + 'py' + format, path + 'ny' + format,
    // 	path + 'pz' + format, path + 'nz' + format
    // ];

    // const textureCube = new THREE.CubeTextureLoader().load( urls );
    // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
    // const boxgeometry = new THREE.BoxGeometry(1,1,1);
    //     const boxcube = new THREE.Mesh(boxgeometry, material);
    //     boxcube.position.x = Math.random() * 10 - 5;
    //     boxcube.position.y = Math.random() * 10 - 5;
    //     boxcube.position.z = Math.random() * 10 - 5;

    //     boxcube.scale.x = boxcube.scale.y = boxcube.scale.z = Math.random();

    //     scene.add(boxcube); // remeber to put in the scene

        
}

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    effect.setSize( window.innerWidth, window.innerHeight );
    effect.render( scene, camera );
}

//===================================================
// Shader Souce
//===================================================

const vertexSource = `
attribute vec3 color;
uniform float time;
uniform float size;
varying vec3 vColor;
varying float vGray;
void main() {
    // To fragmentShader
    vColor = color;
    vGray = (vColor.x + vColor.y + vColor.z) / 23.0;
    //original is divided by 3

    // Set vertex size
    gl_PointSize = size * vGray * 1.0;
    //original point size is 3
    // gl_PointSize = size;

    // Set vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

const fragmentSource = `
varying vec3 vColor;
varying float vGray;
void main() {
    float gray = vGray;

    // Decide whether to draw particle
    if(gray > 0.9){
        gray = 0.0;
    }else{
        gray = 5.0;
    }

    // Set vertex color
    gl_FragColor = vec4(vColor, gray);
}
`;