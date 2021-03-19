import * as THREE from './three.module.js';//'./node_modules/three/build/three.module.js';
import { FirstPersonControls } from './FirstPersonControls.js';//'./node_modules/three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from './ImprovedNoise.js';//'./node_modules/three/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader } from './GLTFLoader.js';//'./node_modules/three/examples/jsm/loaders/GLTFLoader.js';

let container;
let camera, controls, scene, renderer, hlight, directionalLight;
let fish = [];
let skymesh, texture;
let timeLeft = 0; //percentage, 100 just started, 0 is entirely degraded and ending
let artefactX = 0;
let artefactZ = 100;
let artefact;
let artefactFound = [0,0,0,0,0,0];
let newcoral = 0;
let data;
let halfOfDistanceWidth;
let halfOfDistanceDepth;
let resetCounter = 0;
let spaceBetweenPoints;
const numIndividualAssets = 600;
let meshes = [];
let matrix = new THREE.Matrix4();

const worldDirectWidth = 56000, worldDirectDepth = 56000;
const worldWidth = 560, worldDepth = 560;
const clock = new THREE.Clock();
const respawnDistance = 300;
let sky;

//object array for loading coral, artefacts loaded as gltf, must go at end with artefact label
let loadingArray = [
    'assets/coral1.gltf',18,"scene",5,
    'assets/coral2.gltf',14,"scene",50,
    'assets/coral3.gltf',10,"scene",270,
    'assets/coral4.gltf',14,"scene",240,
    'assets/coral5.gltf',24,"scene",65,
    'assets/fish1.gltf',8,"fish",10,
    'assets/fish2.gltf',10,"fish",210,
    'assets/seaweed1.gltf',20,"scene",90,
    'assets/kelp1.gltf',34,"scene",120,
    'assets/coral1.gltf',10,"artefact1",10
];

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 8*respawnDistance ); //last value is render distance


    halfOfDistanceWidth = worldDirectWidth/2;
    halfOfDistanceDepth = worldDirectDepth/2;
    spaceBetweenPoints = (worldDirectWidth/worldWidth+worldDirectDepth/worldDepth)/2;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x0099ff );
    scene.fog = new THREE.FogExp2( 0x26a9ff, 0.001 ); //0.001 for fog

    data = generateHeight( worldWidth, worldDepth );

    camera.position.set( 0, 810, 0 );
    camera.lookAt( 0, 800, 10 );
    const geometry = new THREE.PlaneBufferGeometry( worldDirectWidth, worldDirectDepth, worldWidth - 1, worldDepth - 1 );
    geometry.rotateX( - Math.PI / 2 );

    const vertices = geometry.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

        vertices[ j + 1 ] = data[ i ] * 10;

    }
    hlight = new THREE.AmbientLight (0x404040,2);
    scene.add(hlight);
    directionalLight = new THREE.DirectionalLight(0x61d3ff,0.5);
    directionalLight.castShadow = true;
    directionalLight.position.set(0,1000,0);
    scene.add(directionalLight);


    

    //skybox
    const vertexShader = document.getElementById( 'vertexShader' ).textContent;
	const fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	const uniforms = {
		topColor: { value: new THREE.Color( 0xB0EEFF ) },
        bottomColor: { value: new THREE.Color( 0x0099ff ) },
        offset: { value: 100 },
		exponent: { value: 0.9 }
	};
	const skyGeo = new THREE.SphereGeometry( 7*respawnDistance, 32, 15 );
	const skyMat = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: THREE.BackSide,
    });
    sky = new THREE.Mesh( skyGeo, skyMat );
    
	scene.add( sky );


    //end of skybox


    texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    skymesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture } ) );
    scene.add( skymesh );

    renderer = new THREE.WebGLRenderer({antialias: true}); // alpha: true
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new FirstPersonControls( camera, renderer.domElement );
    controls.movementSpeed = 100;
    controls.lookSpeed = 0.07;
    controls.verticalMax = 3*Math.PI/4;
    controls.verticalMin = Math.PI/4;
    controls.constrainVertical = true;

    window.addEventListener( 'resize', onWindowResize, false );

    //coral import
    for (let i = 0; i < loadingArray.length; i+=4) {
        
        loadCoral(i/4,loadingArray[i],loadingArray[i+1],loadingArray[i+2],loadingArray[i+3]);
    }
    beginAV();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}

function generateHeight( width, height ) {

    let seed = Math.PI / 4;
    window.Math.random = function () {

        const x = Math.sin( seed ++ ) * 10000;
        return x - Math.floor( x );

    };

    const size = width * height, data = new Uint8Array( size );
    const perlin = new ImprovedNoise(), z = Math.random() * 100;

    let quality = 1;

    for ( let j = 0; j < 4; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

    }
    return data;

}

function generateTexture( data, width, height ) {

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3( 0, 0, 0 );

    const sun = new THREE.Vector3( 1, 900, 1 );
    sun.normalize();

    const canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun );

        imageData[ i ] = ( 96 + shade * 64 ) * ( 0.5 + data[ j ] * 0.07 );
        imageData[ i + 1 ] = ( 96 + shade * 48 ) * ( 0.5 + data[ j ] * 0.07 );
        imageData[ i + 2 ] = ( 16 +  shade * 48 ) * ( 0.5 + data[ j ] * 0.07 );

    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    const canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width;
    canvasScaled.height = height;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

        const v = ~ ~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;

    }

    context.putImageData( image, 0, 0 );

    return canvasScaled;

}

//

function animate() {
    resetCounter++;
    requestAnimationFrame( animate );
    if (resetCounter >= 200) { //run every 50 frames

        for (let f = 0; f < newcoral; f++) {
            for (let g = 0; g < numIndividualAssets; g++) {
                handleCoral(f,g,20); //20 is a placeholder should have scaler here, but importing is weird
            }
        }
        resetCounter = 0;
        
    }
    sky.position.set(camera.position.x,camera.position.y+100,camera.position.z); //reset skybox to camera
    directionalLight.position.set(camera.position.x,camera.position.y+1000,camera.position.z);
    floorCollision();
    for (let f = 0; f < newcoral; f++) {
        if (loadingArray[(f*4)+2] == 'fish') {
            for (let g = 0; g < numIndividualAssets; g++) {
                handleFish(f, g);
            }
        }   
    }
    render();
    


}

function render() {
    for (let i = 0; i<newcoral;i++){
        if (meshes[i]) {
            meshes[i].instanceMatrix.needsUpdate = true;
        }
    }
    controls.update( clock.getDelta() );
    
    renderer.render( scene, camera );
    
    //timeline
    if (timeLeft < 100) {
        timeLeft = timeLeft + 0.01; //every frame degrades
        var elem = document.getElementById("myBar");
        handleArtefact();
        elem.style.width = (timeLeft) + "%";
        document.getElementById("container").style.filter = "grayscale("+timeLeft/100+")";

        //reduce fish as time progresses
        if (1-(timeLeft/100) < fish.length/numIndividualAssets) {
            for (let i = 0; i < fish.length; i++){
                if (fish.length > 1){
                    //coral[fish[fish.length-1]].scale.set(0.01,0.01,0.01);
                    //fish.pop(); //remove a fish from array if there are multiple fish in the array, and the percentage of remaining fish is larger that than the percentage of remaining time. Could be used as a final score perhaps?
                }
            }
        }
    }
    
}

function loadCoral(whichCoral, assetLocation,scaler,type,colorType) {
    const loader = new GLTFLoader();
    loader.load(assetLocation,function ( gltf ) {
        if (type == "artefact1") {
            artefact = gltf.scene;    
            artefact.scale.set(scaler,scaler,scaler);
            artefact.position.set(artefactX,610,artefactZ);
            scene.add( gltf.scene );
        } 
        else {
            gltf.scene.traverse( function(child) {
                if (child.isMesh) {
                    let color6 = new THREE.Color("hsl("+colorType+", 100%, 50%)");
                    meshes[whichCoral] = (new THREE.InstancedMesh( child.geometry, new THREE.MeshLambertMaterial({color: color6}), numIndividualAssets));
                    meshes[whichCoral].instanceMatrix.setUsage( THREE.DynamicDrawUsage);
                    newcoral++;
                    scene.add( meshes[whichCoral] );
                    for (let g = 0; g < numIndividualAssets; g++) {
                        handleCoral(whichCoral,g);
                    }
                    //console.log(newcoral+type);
                }
            });
        }    
        },
        // called while loading is progressing
        function ( xhr ) {
            if(xhr.loaded / xhr.total == 1){
                
            }
           // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
           // console.log( 'An error happened ' + error );
        }
    );
}

function handleArtefact() {
    if (Math.hypot(artefactX-camera.position.x,artefactZ-camera.position.z) < 30){
        while (Math.hypot(artefactX-camera.position.x,artefactZ-camera.position.z) < 100) {
            artefactX = Math.floor(Math.random() * 200);
            artefactZ = Math.floor(Math.random() * 200);
        }
        artefact.position.set(artefactX,800,artefactZ);
        console.log("WELL DONE");
        artefactFound[0] = 1;
    }
}

function handleCoral(coralNum,i) {
    let coralPosX = camera.position.x;
    let coralPosZ = camera.position.z;
    let dummy = new THREE.Object3D();
    meshes[coralNum].getMatrixAt(i,matrix);
    let positionHolder = new THREE.Vector3();
    let scaler = loadingArray[coralNum*4+1];
    positionHolder.setFromMatrixPosition(matrix );
    
    matrix.setPosition(positionHolder);
    if (positionHolder.x == 0 && positionHolder.z == 0) {
        coralPosX = Math.round((halfOfDistanceDepth+camera.position.x+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance)/spaceBetweenPoints)*spaceBetweenPoints;
        coralPosZ = Math.round((halfOfDistanceDepth+camera.position.z+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance)/spaceBetweenPoints)*spaceBetweenPoints;
        
        let coralPosY = 10*data[(coralPosZ)/(spaceBetweenPoints)*worldWidth+coralPosX/(spaceBetweenPoints)];
        
        coralPosX += (Math.random()-Math.random())*spaceBetweenPoints/3; //small bit of randomisation to stop overlapping
        coralPosZ += (Math.random()-Math.random())*spaceBetweenPoints/3;

        dummy.position.set(coralPosX-halfOfDistanceWidth,coralPosY,coralPosZ-halfOfDistanceDepth);
        dummy.scale.set(scaler+(Math.random()*4-2),scaler+(Math.random()*4-2),scaler+(Math.random()*4-2));
        dummy.rotation.y = Math.random()*7;
        dummy.updateMatrix();
        meshes[coralNum].setMatrixAt( i, dummy.matrix );
    } 
    else if (Math.hypot(positionHolder.x-camera.position.x,positionHolder.z-camera.position.z) > 11*respawnDistance){ //200 distance away from camera to despawn
        while (Math.hypot(coralPosX-camera.position.x,coralPosZ-camera.position.z) < 8*respawnDistance) { //80 distance away from camera to spawn
            coralPosX = camera.position.x+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance; //random from -100 to 100
            coralPosZ = camera.position.z+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance;
        }

        //convert to points on landscape by rounding
        coralPosX = Math.round((halfOfDistanceWidth+coralPosX)/spaceBetweenPoints)*spaceBetweenPoints;
        coralPosZ = Math.round((halfOfDistanceDepth+coralPosZ)/spaceBetweenPoints)*spaceBetweenPoints;
        
        let coralPosY = 10*data[(coralPosZ)/(spaceBetweenPoints)*worldWidth+coralPosX/(spaceBetweenPoints)];

        coralPosX += (Math.random()-Math.random())*spaceBetweenPoints/3; //small bit of randomisation to stop overlapping
        coralPosZ += (Math.random()-Math.random())*spaceBetweenPoints/3;

        coralPosX += (Math.random()-Math.random())*spaceBetweenPoints;
        coralPosZ += (Math.random()-Math.random())*spaceBetweenPoints;

        dummy.position.set(coralPosX-halfOfDistanceWidth,coralPosY,coralPosZ-halfOfDistanceDepth);
        dummy.scale.set(scaler,scaler,scaler);
        dummy.rotation.y = Math.random()*7;
        dummy.updateMatrix();
        meshes[coralNum].setMatrixAt( i, dummy.matrix );
        
    }
}

function handleFish(coralNum, i) {
    let dummy = new THREE.Object3D();
    meshes[coralNum].getMatrixAt(i,matrix);
    matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    let scaler = loadingArray[coralNum*4+1];

    let fishPosX = Math.round((halfOfDistanceWidth+dummy.position.x)/spaceBetweenPoints)*spaceBetweenPoints;
    let fishPosZ = Math.round((halfOfDistanceDepth+dummy.position.z)/spaceBetweenPoints)*spaceBetweenPoints;
    
    let fishPosY = 10*data[(fishPosZ)/(spaceBetweenPoints)*worldWidth+fishPosX/(spaceBetweenPoints)];
    fishPosY = dummy.position.y-(fishPosY+70);
    dummy.position.set(dummy.position.x,dummy.position.y,dummy.position.z);
    if (fishPosY < 0) {
        dummy.position.y += - fishPosY*0.04;   
    } else {
        dummy.position.y -= (Math.random()*0.4);
    }
    dummy.rotation.y += ((Math.random()*0.1)-(Math.random()*0.1));
    dummy.scale.set(scaler,scaler,scaler);
    dummy.translateZ(2);
    dummy.updateMatrix();
    meshes[coralNum].setMatrixAt( i, dummy.matrix);
}

function floorCollision() {
    let cameraX = Math.round((halfOfDistanceWidth+camera.position.x)/spaceBetweenPoints)*spaceBetweenPoints;
    let cameraZ = Math.round((halfOfDistanceDepth+camera.position.z)/spaceBetweenPoints)*spaceBetweenPoints;
    let floorY = 10*data[(cameraZ)/(spaceBetweenPoints)*worldWidth+cameraX/(spaceBetweenPoints)]
    floorY = camera.position.y-(floorY+70);
    if (floorY < 0) {
        camera.position.y += - floorY*0.04;
        
    }
}

function beginAV() {
    timeLeft = 0;
    camera.position.x = 0;
    camera.position.z = 0;
    camera.position.y = data[(halfOfDistanceDepth)/(spaceBetweenPoints)*worldWidth+halfOfDistanceWidth/(spaceBetweenPoints)]
}

export default {artefactFound};