Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'js/ammo.js';

// Physijs.scripts.worker = 'physijs_worker.js';
// Physijs.scripts.ammo = 'ammo.js';


var scene, camera, renderer, raycaster;

//phys
var ground;

//counter
var countryCounter = 0;

var mouse = new THREE.Vector2(), INTERSECTED;

function init(){
    //add detector to see if WebGL is supported
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
    //set up a scene
    scene = new THREE.Scene();
    //add a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    //render the scene - start renderer and set it's size
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xf0f0f0 );
    //add to webpage
    document.body.appendChild(renderer.domElement);

    var light = new THREE.DirectionalLight( 0xffffff, 2 );
    light.position.set( 1, 1, 1 ).normalize();
    light.target.position.copy( scene.position );
    light.castShadow = true;
    scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( -1, 1, -1 ).normalize();
    light.target.position.copy( scene.position );
    light.castShadow = true;
    scene.add( light );


    // Light
        // light = new THREE.DirectionalLight( 0xFFFFFF );
        // light.position.set( 20, 40, -15 );
        // light.target.position.copy( scene.position );
        // light.castShadow = true;
        // light.shadowCameraLeft = -60;
        // light.shadowCameraTop = -60;
        // light.shadowCameraRight = 60;
        // light.shadowCameraBottom = 60;
        // light.shadowCameraNear = 20;
        // light.shadowCameraFar = 200;
        // light.shadowBias = -.0001
        // light.shadowMapWidth = light.shadowMapHeight = 2048;
        // light.shadowDarkness = .7;
        // scene.add( light );


        ground = new Physijs.BoxMesh(new THREE.BoxGeometry(500, 1, 500), new THREE.MeshLambertMaterial( { color: 0x444444 } ), 0);
        ground.receiveShadow = true;
        scene.add( ground );

    //create a boxes
    var geometry = new THREE.SphereGeometry( 5, 32, 32 );

    for ( var i = 0; i < 20; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 200 - 100;
        object.position.y = Math.random() * 200 + 5;
        object.position.z = Math.random() * 200 - 100;

        // object.rotation.x = Math.random() * 2 * Math.PI;
        // object.rotation.y = Math.random() * 2 * Math.PI;
        // object.rotation.z = Math.random() * 2 * Math.PI;

        // object.scale.x = Math.random() + 0.5;
        // object.scale.y = Math.random() + 0.5;
        // object.scale.z = Math.random() + 0.5;
        object.name="object "+i;

        scene.add( object );

    }

    //position camera
    camera.position.set (0, 200, 300);
    camera.lookAt(ground.position);

    raycaster = new THREE.Raycaster();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    //render the scene
    render();
}
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    if ( intersects.length > 0 ) {
        INTERSECTED = intersects[ 0 ].object;
        console.log(INTERSECTED.name);
        document.getElementById("countryName").innerHTML = INTERSECTED.name;
        // recursive search
        // var object = scene.getObjectByName (INTERSECTED.name, true);
        // object.traverse ( function (child) {
        //     scene.remove(child);
        // });
    }
}

function render() {
    //call to render scene 60fps
    requestAnimationFrame(render);

    //keep displaying scene
    renderer.render(scene, camera);
}

document.onmousedown = function(e) { //make info boxes
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {
        INTERSECTED = intersects[ 0 ].object;
        console.log(INTERSECTED.name);
        document.getElementById("countryName").innerHTML = INTERSECTED.name;
        // recursive search
        var object = scene.getObjectByName (INTERSECTED.name, true);
        // object.traverse ( function (child) {
        //     scene.remove(child);
        // });

        // mouse.x = event.clientX;
        

        // console.log(mouse.x);

        if(object.name.length > 0){
            var existChecker = document.getElementById(INTERSECTED.name); //stops from making info boxes
            if(existChecker == null){
        var countryInfo = document.createElement('div');
        countryInfo.style.position = "fixed";
        countryInfo.style.background = "#56ae66";
        countryInfo.style.left = event.clientX + "px";
        countryInfo.style.top = event.clientY + "px";
        countryInfo.style.width = "300px";
        countryInfo.style.height = "100px";
        countryInfo.style.zIndex = 900;
        countryInfo.id = INTERSECTED.name;
        // countryInfo.style.pointerEvents = "none"; //tried to not make stacking boxes, oh well


        var countryInfoName = document.createElement('a');
        // countryInfoName.id = "country" + countryCounter;
        countryInfoName.innerHTML = INTERSECTED.name;
        countryInfoName.style.cursor = "default";

        var countryClose = document.createElement('button');
        countryClose.position = "relative";
        // countryClose.style.width = "10px";
        // countryClose.style.height = "10px";
        countryClose.style.float = "right";
        // countryClose.style.right = "10px";
        // countryClose.style.top = "10px";
        countryClose.innerHTML="X";
        countryClose.onclick = closeWindow;
        countryClose.style.background = "#222222";
        countryClose.className = "popUp";
        

        countryInfo.appendChild(countryInfoName);
        countryInfo.appendChild(countryClose);
        document.body.appendChild(countryInfo);
            } else {
                closeWindow2();
            }

        }

    }
}

function closeWindow(){ //for button
    var deleteThis = this.parentNode.id;
    // var toBeDeleted = 
    document.getElementById(deleteThis).remove();
    // console.log(toBeDeleted);
    // delete toBeDeleted;
    // toBeDeleted = null;

}

function closeWindow2(){ //for reClick
    document.getElementById("countryName").innerHTML = INTERSECTED.name;
    // var toBeDeleted = 
    document.getElementById(INTERSECTED.name).remove();
    // console.log(toBeDeleted);
    // delete toBeDeleted;
    // toBeDeleted = null;
}

// document.onmouse

init();