import * as THREE from './node_modules/three/build/three.module.js';
import { FirstPersonControls } from './node_modules/three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from './node_modules/three/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

let container;
let camera, controls, scene, renderer, coral, hlight, directionalLight;
let mesh, texture;
let timeLeft = 100; //percentage, 100 just started, 0 is entirely degraded and ending

const worldWidth = 56, worldDepth = 56;
const clock = new THREE.Clock();

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 ); //last value is render distance

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x29a4d2 );
    scene.fog = new THREE.FogExp2( 0x29a4d2, 0.001 ); //0.001 for fog

    const data = generateHeight( worldWidth, worldDepth );

    camera.position.set( 100, 800, - 800 );
    camera.lookAt( - 100, 810, - 800 );

    const geometry = new THREE.PlaneBufferGeometry( 10000, 10000, worldWidth - 1, worldDepth - 1 );
    geometry.rotateX( - Math.PI / 2 );

    const vertices = geometry.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

        vertices[ j + 1 ] = data[ i ] * 10;

    }

    hlight = new THREE.AmbientLight (0x404040,2);
    scene.add(hlight);
    directionalLight = new THREE.DirectionalLight(0xffffff,1);
    directionalLight.castShadow = true;
    directionalLight.position.set(0,1000,0);
    scene.add(directionalLight);


    //coral import
    loadCoral('assets/coral1Coloured.gltf',2);
    loadCoral('assets/coral2Coloured.gltf',1);
    loadCoral('assets/kelp1Coloured.gltf',4);
    loadCoral('assets/seaweed1Coloured.gltf',3);


    //skybox
    let materialArray = [];
    let texture_nz = new THREE.TextureLoader().load('assets/nz.png');
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_nz}));
    let texture_nx = new THREE.TextureLoader().load('assets/nx.png');
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_nx}));
    let texture_py = new THREE.TextureLoader().load('assets/py.png');
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_py}));
    let texture_ny = new THREE.TextureLoader().load('assets/ny.png');
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_ny}));
    let texture_px = new THREE.TextureLoader().load('assets/px.png');
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_px}));
    let texture_pz = new THREE.TextureLoader().load('assets/pz.png');
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_pz}));

    for(let i=0;i<6;i++){
        materialArray[i].side = THREE.BackSide;
        materialArray[i].fog = false;
    }

    let skyboxGeo = new THREE.BoxGeometry(7500,7500,7500);
    let skyboxV = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skyboxV)


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

    const sun = new THREE.Vector3( 1, 1, 1 );
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

        imageData[ i ] = ( 32 + shade * 32 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 96 + shade * 24 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( 64 +  shade * 24 ) * ( 0.5 + data[ j ] * 0.007 );

    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    const canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

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

    requestAnimationFrame( animate );

    render();


}

function render() {

    controls.update( clock.getDelta() );
    
    renderer.render( scene, camera );
    
    //timeline
    if (timeLeft > 0) {
        timeLeft = timeLeft - 0.01;
        var elem = document.getElementById("myBar");
        elem.style.width = (100-timeLeft) + "%";
    }
    
}

function loadCoral(assetLocation,scaler) {
    const loader = new GLTFLoader();
    loader.load(assetLocation,function ( gltf ) {
        coral = gltf.scene;    
        coral.scale.set(scaler,scaler,scaler);
        groundDetect();
        coral.position.set(80,800,-800);
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

function groundDetect() {

}