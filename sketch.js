import * as THREE from './node_modules/three/build/three.module.js';
import { FirstPersonControls } from './node_modules/three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from './node_modules/three/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from './node_modules/three/examples/jsm/shaders/GodRaysShader.js';


let container;
let camera, controls, scene, renderer, hlight, directionalLight;
let coral = [];
let mesh, texture;
let timeLeft = 0; //percentage, 100 just started, 0 is entirely degraded and ending
let artefactX = 100;
let artefactZ = 100;
let artefact;
let artefactFound = [0,0,0,0,0,0];
let newcoral;

let resetCounter = 0;

const worldWidth = 560, worldDepth = 560;
const clock = new THREE.Clock();

const postprocessing = {enabled: true};
const godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;


init();
animate();

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 ); //last value is render distance

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x29a4d2 );
    scene.fog = new THREE.FogExp2( 0x3689a8, 0.001 ); //0.001 for fog

    const data = generateHeight( worldWidth, worldDepth );

    camera.position.set( 100, 810, - 800 );
    camera.lookAt( - 100, 10, - 800 );

    const geometry = new THREE.PlaneBufferGeometry( 50000, 50000, worldWidth - 1, worldDepth - 1 );
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


    //coral import
    loadCoral('assets/coral1Coloured.gltf',3, 100, 810, - 800,"scene");
    loadCoral('assets/coral2Coloured.gltf',3, 100, 810, - 820,"scene");
    loadCoral('assets/coral1Coloured.gltf',3, 100, 810, - 840,"scene");
    loadCoral('assets/coral2Coloured.gltf',3, 100, 810, - 860,"scene");
    loadCoral('assets/coral1Coloured.gltf',3, 100, 810, - 880,"scene");
    loadCoral('assets/coral2Coloured.gltf',3,artefactX,100,artefactZ,"artefact1");

    //skybox
    const vertexShader = document.getElementById( 'vertexShader' ).textContent;
	const fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	const uniforms = {
		topColor: { value: new THREE.Color( 0x29a4d2 ) },
        bottomColor: { value: new THREE.Color( 0x0c4b63 ) },
        offset: { value: 900 },
		exponent: { value: 0.6 }
	};
	uniforms.topColor.value.copy( directionalLight.color );
	const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
	const skyMat = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: THREE.BackSide
    } );
    const sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );


    //end of skybox


    texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer({antialias: true}); // alpha: true
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new FirstPersonControls( camera, renderer.domElement );
    controls.movementSpeed = 100;
    controls.lookSpeed = 0.05;
    controls.verticalMax = 3*Math.PI/4;
    controls.verticalMin = Math.PI/4;
    controls.constrainVertical = true;

    window.addEventListener( 'resize', onWindowResize, false );

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

        imageData[ i ] = ( 96 + shade * 32 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 160 + shade * 24 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( 128 +  shade * 24 ) * ( 0.5 + data[ j ] * 0.007 );

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
    if (resetCounter >= 500) { //run every 50 frames
        for (let f = 0; f < coral.length; f++) {
            handleCoral(f);
        }
        resetCounter = 0;
    }
    render();


}

function render() {

    controls.update( clock.getDelta() );
    
    renderer.render( scene, camera );
    
    //timeline
    if (timeLeft < 100) {
        timeLeft = timeLeft + 0.01; //every frame degrades
        var elem = document.getElementById("myBar");
        handleArtefact();
        elem.style.width = (timeLeft) + "%";
        document.getElementById("container").style.filter = "grayscale("+timeLeft/100+")";
    }
    
}

function loadCoral(assetLocation,scaler, x, y, z, type) {
    const loader = new GLTFLoader();
    loader.load(assetLocation,function ( gltf ) {
        if (type == "artefact1") {
            artefact = gltf.scene;    
            artefact.scale.set(scaler,scaler,scaler);
            artefact.position.set(x,y,z);
        } else {
            coral.push(0);
            coral[newcoral] = gltf.scene;    
            coral[newcoral].scale.set(scaler,scaler,scaler);
            coral[newcoral].position.set(x,y,z);
            newcoral++;
        }    
        scene.add( gltf.scene );      
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened ' + error );
        }
    );
}

function handleArtefact() {
    if (Math.hypot(artefactX-camera.position.x,artefactZ-camera.position.z) < 30){
        while (Math.hypot(artefactX-camera.position.x,artefactZ-camera.position.z) < 100) {
            artefactX = Math.floor(Math.random() * 200);
            artefactZ = Math.floor(Math.random() * 200);
        }
        artefact.position.set(artefactX,100,artefactZ);
        console.log("WELL DONE");
        artefactFound[0] = 1;
    }
}

function handleCoral(coralNum) {
    let coralPosX;
    let coralPosZ;
    console.log(coralNum);
    console.log(coral[coralNum]);
    console.log(coral[coralNum].position.x);
    if (Math.hypot(coral[coralNum].position.x-camera.position.x,coral[coralNum].position.z-camera.position.z) > 1000){
        while (Math.hypot(coral[coralNum].position.x-camera.position.x,coral[coralNum].position.z-camera.position.z) < 800) {
            coralPosX = Math.floor(Math.random() * 1000);
            coralPosZ = Math.floor(Math.random() * 1000);
        }
        coral(coralNum).position.set(coralPosX,100,coralPosZ);
        console.log("reposition");
    }
}

export default {artefactFound};