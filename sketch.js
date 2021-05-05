import * as THREE from './three.module.js';//ThreeJS included in npm install from MrDoob
import { FirstPersonControls } from './FirstPersonControls.js';//ThreeJS module included in npm install
import { ImprovedNoise } from './ImprovedNoise.js';//ThreeJS module included in npm install
import { GLTFLoader } from './GLTFLoader.js';//ThreeJS module included in npm install

let container;
let camera, controls, scene, renderer, hlight, directionalLight, directionalLight1;
let landmesh, texture;
let timeLeft = 0; //percentage, 0 just started, 100 is entirely degraded and ending
let artefactX = 0;
let artefactZ = 300;
let artefact = [];
let currentArtefact = 0; //none currently in environment, 1 = artefact1, -99 means none left to find
let artefactFound = [0,0,0,0,0,0,0]//[0,0,0,0,0,0,0];
let newcoral = 0;
let data;
let sky;
let halfOfDistanceWidth;
let halfOfDistanceDepth;
let resetCounter = 0;
let spaceBetweenPoints;
let meshes = [];
let matrix = new THREE.Matrix4();
let gameState = -2; //-2, loading assets, -1 title screen, 0 playing, 1 ending screen opening, 2 congratulations, 3 opened, 4 return to main menu
let music = new Audio('assets/underwatermusic.mp3');
//let tune = new Audio('assets/artefact.mp3'); //unimplemented sound effect for artefact
let artefactGlow = 0;
let bobMultiplier = 1; // artefact bobbing tracker 1 means bobbing up, -1 bobbing down

//also best left the same
const worldDirectWidth = 56000, worldDirectDepth = 56000;
const worldWidth = 560, worldDepth = 560;
const clock = new THREE.Clock();

//these two values are best kept the same, and the lower the less intensive on the gpu
const respawnDistance = 200;
const numIndividualAssets = 200;


//ui
let shown = -1; //-9: negative values mean it is disabled, 1-9 are values in the array of artefacts corresponding to descriptions etc
let titles = ["Not yet Found","Plastic Usage","Sustainable Fishing","Ocean Products","Reduce Waste","Pollutants","Acidification","Respect Habitats"];
let descriptions = [
"Discover this artefact first to learn more about its impacts and how we can help our oceans! <br> <br> Try clicking the other artefact icons above, the blue ones are ones you have found!",
"The oceans face a huge threat from plastics. It's estimated over 17 billion pounds of plastic leaks into the ocean environment from the land every year, only by reducing our use of plastic based products will companies stop producing the waste. <br><br> Save oceans and demand plastic-free alternatives, such as paper straws and bags instead of plastic, or even better bring your own reusable items along with you so you don’t have to buy disposable items that you will only get rid of later!",
"With global food consumption only growing, some fisheries resort to overfishing and tipping the ecosystem balance. <br><br> Try to buy organic seafood and consider adding small, oily fish such as anchovies and sardines to your diet that are not only packed with protein but are more sustainable and in abundance in the wild, unlike the heavily in demand salmon which must now be farmed. <br><br> If fishing yourself, consider the ‘catch and release’ approach to keep the fish population alive and bustling!",
"Many products are directly linked to unsustainable fishing methods and pollution that all harm endangered species and the ocean as a whole. A few examples of contributors are cosmetic manufacturers that use shark squalene in products, or souvenir manufacturers that use conch, turtle shells and especially coral for jewellery and decoration. <br><br> Try to be vocal in spreading awareness to your community and encourage friends and family to adopt similar changes lifestyle and purchasing habits!",
"Coastlines are becoming an increasingly prime location for tourists to gather and be merry, but as the crowds grow, so does their waste. When out at the beach and just in general, pay careful attention to leave no waste behind that might blow into the oceans or be taken away by the tide, as it will end up directly harming the oceans and poisoning fish, the same fish that we may end up eating. <br><br> It’s important to keep in mind that what effects the ocean will come back around and affect our lifestyle!",
"Pollution already has a huge effect on the environment as a whole, having both direct and indirect effects on Ocean life. Try to use non-toxic detergents around the house or dispose of toxic cleaning products properly and safely so they don’t end up polluting the waters. <br><br> What might seem unsuspecting can be deadly to wildlife, such as plastic microbeads found in toothpaste and facial scrubs which are designed to wash down the drain but have been found ending up inside fish from the Arctic!",
"The oceans acid levels rise with the amount of carbon dioxide in the atmosphere due to a chemical reaction from the air with the seawater. <br><br> Much of the ocean wildlife is unable to survive in conditions too acidic, including making plankton and coral unable grow and even can dissolve shells of existing creatures. Try to reduce your carbon footprint by supporting cleaner energy sources and using less electricity and fuel. <br><br> A few easy tips are to use public transport and check your home is well insulated!",
"While the oceans may seem infinitely huge and resilient, many areas and habitats are formed around a fine balance where the wildlife can only survive in specific conditions and temperatures. <br><br> If exploring around wildlife be careful not to disturb the area, and if boating make sure to anchor in sandy areas far from coral and sea grasses, by adhering to ‘no wake’ zones. <br><br> Consider volunteering in your local area for beach clean-ups if you want to get involved in making a positive impact!"
];

let imgurls = ["assets/iconNotFound.jpg","assets/artefacts/a1.png","assets/artefacts/a2.png","assets/artefacts/a3.png","assets/artefacts/a4.png","assets/artefacts/a5.png","assets/artefacts/a6.png","assets/artefacts/a7.png"];

//object array for loading coral, artefacts loaded as gltf, must go at end with artefact label //assetlocation,size,type,color (or color means which artefact)
let loadingArray = [
    'assets/coral1.gltf',18,"scene",10,
    'assets/coral2.gltf',14,"scene",50,
    'assets/coral3.gltf',10,"scene",270,
    'assets/coral4.gltf',14,"scene",240,
    'assets/coral5.gltf',24,"scene",65,
    'assets/fish1.gltf',8,"fish",15,
    'assets/fish2.gltf',12,"fish",65,
    'assets/seaweed1.gltf',20,"scene",90,
    'assets/kelp1.gltf',34,"scene",120,
    'assets/artefacts/turtle.gltf',15,"artefact",0,
    'assets/artefacts/sustainfish.gltf',20,"artefact",1,
    'assets/artefacts/conch.gltf',20,"artefact",2,
    'assets/artefacts/trash.gltf',40,"artefact",3,
    'assets/artefacts/pollutant.gltf',20,"artefact",4,
    'assets/artefacts/acidification.gltf',10,"artefact",5,
    'assets/artefacts/anchor.gltf',30,"artefact",6
];

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 9*respawnDistance ); //last value is render distance

    halfOfDistanceWidth = worldDirectWidth/2;
    halfOfDistanceDepth = worldDirectDepth/2;
    spaceBetweenPoints = (worldDirectWidth/worldWidth+worldDirectDepth/worldDepth)/2;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x0099ff );
    scene.fog = new THREE.FogExp2( 0x26a9ff, 0.0012 ); //0.001 for fog density

    data = generateHeight( worldWidth, worldDepth ); //function for generating height data, the code involved with generating and rendering terrain was pulled from the threeJS fog example found here https://threejs.org/examples/?q=terra#webgl_geometry_terrain 

    camera.position.set( 0, 710, 0 ); //initial camera position
    camera.lookAt( 0, 300, 150 );
    const geometry = new THREE.PlaneBufferGeometry( worldDirectWidth, worldDirectDepth, worldWidth - 1, worldDepth - 1 );
    geometry.rotateX( - Math.PI / 2 );
    const vertices = geometry.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

        vertices[ j + 1 ] = data[ i ] * 10; //these are the y values

    }
    //lighting
    hlight = new THREE.AmbientLight (0xf5f5f5,0.6);
    scene.add(hlight);
    directionalLight = new THREE.DirectionalLight(0x61d3ff,0.7);
    directionalLight1 = new THREE.DirectionalLight(0xffffff,0.2); //this directional light provides small amount of light below assets and lights up top of the skydome material
    directionalLight.position.set(0,1000,0);
    directionalLight1.position.set(0,-1000,0);
    scene.add(directionalLight);
    scene.add(directionalLight1);

    //skybox
	const skyGeo = new THREE.SphereGeometry( 7*respawnDistance, 32, 15 ); //skydome is created using phong material that is highly specular to create a gradient
	const skyMat = new THREE.MeshPhongMaterial( {
        color: 0x26a9ff,
        emissive: 0x1e57b3,
        specular: 0xffffff,
        shininess: 15, 
		side: THREE.BackSide,
        fog: false
    });
    sky = new THREE.Mesh( skyGeo, skyMat );
    
	scene.add( sky );

    //end of skybox

    //terrain mesh/texture
    texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    landmesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture } ) );
    scene.add( landmesh );

    //renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    //controls
    controls = new FirstPersonControls( camera, renderer.domElement );
    controls.movementSpeed = respawnDistance/2;
    controls.lookSpeed = 0.07;
    controls.verticalMax = 3*Math.PI/4;
    controls.verticalMin = Math.PI/4;
    controls.constrainVertical = true;
    controls.autoForward = false;
    controls.enabled = false;

    window.addEventListener( 'resize', onWindowResize, false );

    //coral import
    for (let i = 0; i < loadingArray.length; i+=4) {
        loadCoral(i/4,loadingArray[i],loadingArray[i+1],loadingArray[i+2],loadingArray[i+3]);
    }
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

        //colour of terrain texture
        imageData[ i ] = ( 96 + shade * 64 ) * ( 0.5 + data[ j ] * 0.07 );
        imageData[ i + 1 ] = ( 96 + shade * 48 ) * ( 0.5 + data[ j ] * 0.07 );
        imageData[ i + 2 ] = ( 16 +  shade * 48 ) * ( 0.5 + data[ j ] * 0.07 );
    }
    context.putImageData( image, 0, 0 );

    // Scale to size of mesh (4x)
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

function animate() {
    startAnim();
    requestAnimationFrame( animate );
    for (let f = 0; f < newcoral; f++) {
        if (meshes[f]){
            bleaching(f);
            handleCoral(f,resetCounter,20);
            if (loadingArray[(f*4)+2] == 'fish') {
                for (let g = 0; g < numIndividualAssets; g++) {
                    handleFish(f, g);
                }
            }
            meshes[f].instanceMatrix.needsUpdate = true;
        }   
    }
    //counter that updates coral assets, cycles through an asset in the array every frame to avoid updating all at once
    resetCounter++;
    if (resetCounter >= numIndividualAssets) {
        resetCounter = 0;    
    }   
    sky.position.set(camera.position.x,camera.position.y+100,camera.position.z); //reset skybox to camera to ensure user doesnt go out of skybox bounds
    floorCollision();
    render();
}

function render() {
    //freeze camera if menu is open, otherwise continue
    if (shown > 0){
        controls.movementSpeed = 0;
        controls.lookSpeed = 0;
    }
    else if (controls.movementSpeed > respawnDistance/2) { //if movement speed is bigger than normal, then slow user down till normal
        camera.fov = ((controls.movementSpeed-(respawnDistance/2))/16)+(respawnDistance/4);
        camera.updateProjectionMatrix(); //update camera
        controls.movementSpeed--;
        controls.lookSpeed = 0.07;
    }
    else {
        controls.autoForward = false;
        controls.movementSpeed = respawnDistance/2;
        controls.lookSpeed = 0.07;
    }
    
    controls.update( clock.getDelta() );
    music.playbackRate = 1+(0.4-(timeLeft/100));
    renderer.render( scene, camera );
    
    if (currentArtefact == -99 && gameState < 2) {
        ending();
    }
    //timeline hint prompts
    if (timeLeft > 1 && timeLeft < 1.2) {
        document.getElementById("info").style = "display: block";
        document.getElementById("info").innerHTML = "Look around using the mouse, if you click and hold down the mouse button you can move forward in the direction you are looking!"
    }
    if (timeLeft > 4 && timeLeft < 4.2) {
        document.getElementById("info").style = "display: none";
    }
    if (timeLeft > 5 && timeLeft < 5.2) {
        document.getElementById("info").style = "display: block";
        document.getElementById("info").innerHTML = "Use the compass in the bottom left to hunt down the nearest artefact! <br> They might be far away but you should be able to see the artefact gently flashing!"
    }

    if (timeLeft > 9 && timeLeft < 9.2) {
        document.getElementById("info").style = "display: none";
    }

    if (timeLeft > 46 && timeLeft < 46.2) {
        document.getElementById("info").style = "display: block";
        document.getElementById("info").innerHTML = "Look at the timeline at the bottom! <br> The ocean is already half degraded!"
    }

    if (timeLeft > 50 && timeLeft < 50.2) {
        document.getElementById("info").style = "display: none";
    }
    if (timeLeft > 80 && timeLeft < 80.2) {
        document.getElementById("info").style = "display: block";
        document.getElementById("myBar").style.backgroundColor = "rgba(255, 5, 5)"
        document.getElementById("info").innerHTML = "The ocean is nearly degraded! Quick hurry and collect all the artefacts before it's too late!"
    }
    if (timeLeft > 85 && timeLeft < 85.2) {
        document.getElementById("info").style = "display: none";
    }

    if (timeLeft < 100 && gameState == 0 && shown < 0) {
        compassPointer(); //update compass during experience
        for (let i = 0; i < artefactFound.length; i++) {
            if (artefactFound[i] == 1) {
                timeLeft = timeLeft + 0.0015; //every frame degrades, degrades more for each artefact found.
            }
        }
        timeLeft = timeLeft + 0.001; //every frame degrades
        var elem = document.getElementById("myBar");
        handleArtefact(); //artefact position handler
        elem.style.width = (timeLeft) + "%";
        //document.getElementById("container").style.filter = "grayscale("+timeLeft/100+")";
    } else if (timeLeft >= 100 && gameState < 2) {
        ending();
    }
}

function loadCoral(whichCoral, assetLocation,scaler,typeAsset,colorType) {
    const loader = new GLTFLoader(); //load gltf 3d model
    loader.load(assetLocation,function ( gltf ) {
        if (typeAsset == "artefact") {
            //if artefact load directly as gltf model
            artefact[colorType] = gltf.scene;
            artefact[colorType].scale.set(scaler,scaler,scaler);
            artefact[colorType].position.set(0,-1000,0);
            scene.add( gltf.scene );
        }
        else {
            //otherwise assume instanced mesh
            gltf.scene.traverse( function(child) {
                //detect if the mesh from the gltf file
                if (child.isMesh) {
                    //apply the colour specified in the load, with maximum saturation so the gradual change to a bleached state is more clear.
                    let color6 = new THREE.Color("hsl("+colorType+", 100%, 50%)");
                    //create the instanced mesh
                    meshes[whichCoral] = (new THREE.InstancedMesh( child.geometry, new THREE.MeshPhongMaterial({color: color6, flatShading: true}), numIndividualAssets));
                    meshes[whichCoral].instanceMatrix.setUsage( THREE.DynamicDrawUsage);
                    newcoral++; //count number of meshes loaded
                    scene.add( meshes[whichCoral] );
                    for (let g = 0; g < numIndividualAssets; g++) {
                        //handle coral placement immediately after adding to scene.
                        handleCoral(whichCoral,g);
                    }
                }
            });
        }    
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
    //start
    
    //choose artefact to place and focus on if none is chosen
    let find = Math.round(Math.random()*artefactFound.length); //random 0 to NUMBER OF ARTEFACTS
    while (currentArtefact == 0) {
        if (artefactFound[find % artefactFound.length] == 0) {
            currentArtefact = ((find) % artefactFound.length)+1;
            
            //placement
            artefactPlacer();

        }
        else {
            find++;
            if ( find > artefactFound.length*2 ) {
                currentArtefact = -99;
                gameState = 1;
                controls.movementSpeed = 0;
                controls.lookSpeed = 0;
            }
        }
    }
    if (currentArtefact > -50) {
    //bobbing of the turtle trapped in plastic artefact and the wasted small group of fish.
        if (currentArtefact == 1 || currentArtefact == 2) {
            if (resetCounter == 0) {
                bobMultiplier = bobMultiplier * -1;
            }
            artefact[currentArtefact-1].position.y = artefact[currentArtefact-1].position.y + bobMultiplier/10;
        }

        //control glowing of artefacts, loop from -15 to 15, by using magnitude of this value it rises and falls naturally.
        artefactGlow++;
        if (artefactGlow > 15) {
            artefactGlow=-15;
        }
        
        
        //collision and placement, if the artefact is the huge pile of ocean waste, then allow for a much wider collision detection so user doesnt clip through it.
        let multiplier = 1;
        if (currentArtefact == 4) {
            multiplier = 3;
        }
        if ( Math.hypot(artefactX-camera.position.x,artefactZ-camera.position.z) < 70*multiplier ){
            artefact[currentArtefact-1].position.y = -1000; //hide artefact that was found
            artefactFound[currentArtefact-1] = 1; //update array
            artefactNotification(currentArtefact); //display notification animation
            currentArtefact = 0;
            music.pause;

            //boosting mechanic that would allow for short bursts of speed when entering a current, removed during testing as not finalised
            //controls.autoForward = true;
            //controls.movementSpeed = respawnDistance*2;
        } else {
            //if not colliding, update current artefact colour to glow using material emission value.
            artefact[currentArtefact-1].traverse((o) => {
                if (o.isMesh) {
                    Math.abs(artefactGlow);
                    o.material.emissive = new THREE.Color("hsl(0, 0%, "+Math.abs(artefactGlow)+"%)");
                }
            });
        }
    }
}

function artefactPlacer() {
    //while artefact is being placed, ensure the random x and y values are not too far away. (20*respawn distance ensures the distance they are placed away stays relative to the movement speed and render distance)
    while (Math.hypot(artefactX-camera.position.x,artefactZ-camera.position.z) < 20*respawnDistance) {
        artefactZ = Math.round((camera.position.z+(Math.random()-0.5)*(20*respawnDistance)*2)/spaceBetweenPoints)*spaceBetweenPoints;
        artefactX = Math.round((camera.position.x+(Math.random()-0.5)*(20*respawnDistance)*2)/spaceBetweenPoints)*spaceBetweenPoints;
    }
    //update position when set, find y position by using heightmap against the values chosen to be x and y. halfOfDistance is used to accomodate the fact the position origin is in the middle, while the heightmap origin is in a corner.
    artefact[currentArtefact-1].position.x = artefactX;
    artefact[currentArtefact-1].position.z = artefactZ;
    artefact[currentArtefact-1].position.y = 20+(10*data[(artefactZ+halfOfDistanceDepth)/(spaceBetweenPoints)*worldWidth+(artefactX+halfOfDistanceWidth)/(spaceBetweenPoints)]); //20 above floor
    if (currentArtefact == 1 || currentArtefact == 2) {
        artefact[currentArtefact-1].position.y = artefact[currentArtefact-1].position.y+30; //if artefact is one of the bobbing artefacts that float, place it higher above the terrain
    }
}


function handleCoral(coralNum,i) {
    let coralPosX = camera.position.x;
    let coralPosZ = camera.position.z;
    let dummy = new THREE.Object3D();
    //retrieve individual mesh from instanced mesh matrix, new matrix/objects made to apply temporary transformations to, to be copied to the mesh matrix when ready
    meshes[coralNum].getMatrixAt(i,matrix);
    let positionHolder = new THREE.Vector3();
    positionHolder.setFromMatrixPosition(matrix );
    matrix.setPosition(positionHolder);
    //if coral is in origin (often at start of experience), move to random new location
    if (positionHolder.x == 0 && positionHolder.z == 0) {
        coralPosX = camera.position.x+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance;
        coralPosZ = camera.position.z+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance;
        coralPlacer(coralNum,i,coralPosX,coralPosZ,dummy);
    } 
    else if (Math.hypot(positionHolder.x-camera.position.x,positionHolder.z-camera.position.z) > 9*respawnDistance){ //200 distance away from camera to despawn
        while (Math.hypot(coralPosX-camera.position.x,coralPosZ-camera.position.z) < 8*respawnDistance) { //80 distance away from camera to spawn
            coralPosX = camera.position.x+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance;
            coralPosZ = camera.position.z+Math.floor(Math.random() * 20*respawnDistance)-10*respawnDistance;
        }
        coralPlacer(coralNum,i,coralPosX,coralPosZ,dummy); 
    }
}

function coralPlacer(coralNum,i,coralPosX,coralPosZ,dummy) {
    //convert to vertices on landscape by rounding
    coralPosX = Math.round((halfOfDistanceWidth+coralPosX)/spaceBetweenPoints)*spaceBetweenPoints;
    coralPosZ = Math.round((halfOfDistanceDepth+coralPosZ)/spaceBetweenPoints)*spaceBetweenPoints;
    let coralPosY = 10*data[(coralPosZ)/(spaceBetweenPoints)*worldWidth+coralPosX/(spaceBetweenPoints)];

    coralPosX += (Math.random()-Math.random())*spaceBetweenPoints/5; //small bit of randomisation to stop overlapping when coral are both placed on identical vertices
    coralPosZ += (Math.random()-Math.random())*spaceBetweenPoints/5;
    //set dummy transformations before applying to instanced mesh
    dummy.position.set(coralPosX-halfOfDistanceWidth,coralPosY,coralPosZ-halfOfDistanceDepth);
    let scaler = loadingArray[coralNum*4+1];
    dummy.scale.set(scaler+(Math.random()*4-2),scaler+(Math.random()*4-2),scaler+(Math.random()*4-2));
    dummy.rotation.y = Math.random()*7;
    dummy.updateMatrix();
    meshes[coralNum].setMatrixAt( i, dummy.matrix );
}

function handleFish(coralNum, i) {
    let dummy = new THREE.Object3D();
    meshes[coralNum].getMatrixAt(i,matrix);
    matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    let scaler = loadingArray[coralNum*4+1];
    //for the percentage of time left, the same percentage of fish remain, they are removed by setting their scale to 0, otherwise update positions with same method as coral placement.
    if (timeLeft/100 > i/numIndividualAssets) {
        scaler = 0;
    } else{
        let fishPosX = Math.round((halfOfDistanceWidth+dummy.position.x)/spaceBetweenPoints)*spaceBetweenPoints;
        let fishPosZ = Math.round((halfOfDistanceDepth+dummy.position.z)/spaceBetweenPoints)*spaceBetweenPoints;
        let fishPosY = 10*data[(fishPosZ)/(spaceBetweenPoints)*worldWidth+fishPosX/(spaceBetweenPoints)];
        fishPosY = dummy.position.y-(fishPosY+70); //retrieve difference from terrain and fish, allowing for 70 between
        dummy.position.set(dummy.position.x,dummy.position.y,dummy.position.z);
        if (fishPosY < 0) { //if the fish is closer to terrain than 70 then raise up by a portion of that difference, so the further below, the faster it accelerates up
            dummy.position.y += - fishPosY*0.04;   
        } else {
            dummy.position.y -= (Math.random()*0.4); //if not just above terrain, then gradually drift downwards
        }
        dummy.rotation.y += ((Math.random()*0.07)-(Math.random()*0.07)); //apply small random rotation to simulate swimming
    }
    //apply transformations
    dummy.scale.set(scaler,scaler,scaler);
    dummy.translateZ(2);
    dummy.updateMatrix();
    meshes[coralNum].setMatrixAt( i, dummy.matrix);
}

function floorCollision() {
    //retrieve camera positions relative to terrain, then apply same technique used with fish-terrain collision
    let cameraX = Math.round((halfOfDistanceWidth+camera.position.x)/spaceBetweenPoints)*spaceBetweenPoints;
    let cameraZ = Math.round((halfOfDistanceDepth+camera.position.z)/spaceBetweenPoints)*spaceBetweenPoints;
    let floorY = 10*data[(cameraZ)/(spaceBetweenPoints)*worldWidth+cameraX/(spaceBetweenPoints)];
    floorY = camera.position.y-(floorY+70);
    if (floorY < 0 && gameState == 0) {
        camera.position.y += - floorY*0.04;   
    }
    if (floorY > 500 && gameState == 0) { //if difference between floor and cam is greater than 500 then alter by a portion of the difference
        camera.position.y += - (floorY-500)*0.04;   
    }
}

function beginAV() {
    //reset values and swap UI elements to ones used for experience
    timeLeft = 0;
    music.loop = true;
    music.play();
    camera.position.x = 0;
    camera.position.z = 0;
    camera.position.y = 10+10*data[(halfOfDistanceDepth)/(spaceBetweenPoints)*worldWidth+halfOfDistanceDepth/(spaceBetweenPoints)];;
    controls.enabled = true;
    gameState = 0;
    resetCounter = 0;
    document.getElementById("enterButton").style = "display: none;";
    document.getElementById("info").style = "display: none;";
    document.getElementById("myBar").style = "display: block;";
    document.getElementById("menuOpener").style = "display: block;";
    document.getElementById("container").style = "opacity: 1";
    document.getElementById('compass').style = "display: block";
}

function startAnim() {
    //short CSS animation fade in to transition between loading screen and starting menu
    if (gameState == -2 && (artefact.length+meshes.length)*4 == loadingArray.length){
        gameState = -1;
        document.getElementById("enterButton").classList.remove("introd");
        void document.getElementById("enterButton").offsetWidth; 
        document.getElementById("enterButton").classList.add("introd");
        document.getElementById("container").classList.remove("introd");
        void document.getElementById("container").offsetWidth; 
        document.getElementById("container").classList.add("introd");
    }
}

function compassPointer() {
    //trigonometry functions to find angle between camera position and artefact position, then add on rotation of the camera to make it responsive to look direction
    let vector = camera.getWorldDirection(new THREE.Vector3());
    let theta = THREE.Math.radToDeg(Math.atan2(vector.x,vector.z));
    let theta2 = THREE.Math.radToDeg(Math.atan2(camera.position.x-artefactX,camera.position.z-artefactZ));
    document.getElementById('pointer').style = "transform: rotate("+(-theta2+theta)+"deg)";
}

function ending() {
    //lock timeline and controls
    gameState = 2;
    controls.movementSpeed = 0;
    controls.lookSpeed = 0;
    //get total by adding up artefacts found
    let total = 0;
    for (let i = 0; i < artefactFound.length; i++) {
        if (artefactFound[i] == 1) {
            total++
        }
    }
    document.getElementById("myBar").style = "display: none;";
    document.getElementById("compass").style = "display: none;";
    document.getElementById("menuOpener").style.bottom = "50%";
    document.getElementById("menuOpener").style.right = "45%";
    document.getElementById("menuOpener").innerHTML = "THE END? CLICK TO REVIEW YOUR ARTEFACTS";
}

function artefactNotification(source) {
    //update with relevant artefact icons and play CSS animation
    updatePage(source);
    document.getElementById("colImg").src = "assets/artefacts/a"+source+".png";
    document.getElementById("collection").classList.remove("notif");
    void document.getElementById("collection").offsetWidth; 
    document.getElementById("collection").classList.add("notif");
    openMenu();
}

function bleaching(coralN) {
    //update coral colour as timeline progresses, using saturation for HSL colours to ensure colour change is gradual while retaining hue.
    meshes[coralN].traverse((o) => {
        if (o.isMesh) {
            let col = Math.round(timeLeft/2);
            o.material.color = new THREE.Color("hsl("+loadingArray[(4*coralN)+3]+", "+(100-(col*2))+"%, "+(50+col)+"%)");
        }
    });
}

function endingScreen() {
    gameState = 3;
    document.getElementById("info").style = "display: block;";
    //if there was time left display victory message, otherwise communicate that the reef has fully died.
    if (timeLeft < 100) {
        document.getElementById("info").innerHTML = "Well done! You managed to collect all the artefacts before the ocean degraded! With the information revealed from the artefacts we're able to save the ocean!";
        document.getElementById("menuOpener").innerHTML = "RETURN";
    }
    else {
        document.getElementById("info").innerHTML = "You ran out of time. The reef is beyond repair, but you did managed to collect "+total+" out of "+artefactFound.length+" of the artefacts!";
        document.getElementById("menuOpener").innerHTML = "RETRY";
    }
    document.getElementById("menu").style = "display: block;";
    shown = 1;
}

function openMenu() {
    //toggleable menu that is reused with different actions dependending on the stage of the experience.
    if (shown < 0) {
        document.getElementById("menu").style = "display: block;";
        shown = shown*-1;
        updatePage(1); //update artefact UI
    }
    else if (shown >= 0) {
        document.getElementById("menu").style = "display: none;";
        shown = shown*-1;
    }
    if (gameState == 3) {
        location.reload();
    }
    if (gameState == 2) {
        document.getElementById("menu").style = "display: block;";
        document.getElementById("menuOpener").style.bottom = "";
        document.getElementById("menuOpener").style.right = "";
        endingScreen();
    }
}

function updatePage(pageIncrement) {
    //change pictures to found or not found by going through each value in array. if not found apply a sepia filter.
    for (let i = 1; i <= artefactFound.length; i++) {
        document.getElementById("art"+i).style.width = "";
        document.getElementById("art"+i).style.height = "";
        document.getElementById("art"+i).style.filter = "sepia(100%)";
        if (artefactFound[i-1] == 1) {
            document.getElementById("art"+i).src = imgurls[i];
            document.getElementById("art"+i).style.filter = "sepia(0%)";
        }
    }
    document.getElementById("art"+pageIncrement).style.width = "16vw";
    document.getElementById("art"+pageIncrement).style.height = "16vw";
    if (artefactFound[pageIncrement-1] == 0) {//update lifestyle tips for artefacts as they are collected
        document.getElementById("title").innerHTML = titles[0];
        document.getElementById("description").innerHTML = descriptions[0];
    } else {
        document.getElementById("title").innerHTML = titles[pageIncrement];
        document.getElementById("description").innerHTML = descriptions[pageIncrement];
    }
}

document.getElementById('menuOpener').addEventListener("click", function() {openMenu()}, false);
document.getElementById('art1').addEventListener("click", function() {updatePage(1)}, false);
document.getElementById('art2').addEventListener("click", function() {updatePage(2)}, false);
document.getElementById('art3').addEventListener("click", function() {updatePage(3)}, false);
document.getElementById('art4').addEventListener("click", function() {updatePage(4)}, false);
document.getElementById('art5').addEventListener("click", function() {updatePage(5)}, false);
document.getElementById('art6').addEventListener("click", function() {updatePage(6)}, false);
document.getElementById('art7').addEventListener("click", function() {updatePage(7)}, false);
document.getElementById('enterButton').addEventListener("click", function() {beginAV()}, false);