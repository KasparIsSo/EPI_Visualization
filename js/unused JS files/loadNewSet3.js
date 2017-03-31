'use strict';
    
Physijs.scripts.worker = '../js/physijs_worker.js';
Physijs.scripts.ammo = '../js/ammo.js';

var initScene, render, spawnsphere, loader,
    renderer, render_stats, physics_stats, scene, ground_material, ground, wall_material, wall, light, camera, raycaster;

// array to house intersected objects, dont want raycaster to trigger if it clicks invisible wall or floor
var raySpheres = [];

var tempHover;

// counts spheres made in order to delete them when we generate again
var sphereCounter = 0;

// counter for objects made
var countryCounter = 0;

var mouse = new THREE.Vector2(), INTERSECTED;

initScene = function() {

    // physi.js example settings

    // renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMapSoft = true;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xffff99 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById( 'viewport' ).appendChild( renderer.domElement );
    
    // performance stats, irrelevant for now

    // render_stats = new Stats();
    // render_stats.domElement.style.position = 'absolute';
    // render_stats.domElement.style.top = '0px';
    // render_stats.domElement.style.zIndex = 100;
    // document.getElementById( 'viewport' ).appendChild( render_stats.domElement );
    
    // physics_stats = new Stats();
    // physics_stats.domElement.style.position = 'absolute';
    // physics_stats.domElement.style.top = '50px';
    // physics_stats.domElement.style.zIndex = 100;
    // document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

    scene = new Physijs.Scene; // the way Physi.js creates a scene
    scene.setGravity(new THREE.Vector3( 0, -30, 0 )); // sets down force
    scene.addEventListener(
        'update',
        function() {
            scene.simulate( undefined, 1 );
            // physics_stats.update();
        }
    );
    
    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1   
    );
    camera.position.set( 120, 100, 120 ); //sets camera positions
    // camera.position.set( 400, 400, 400 ); //sets camera positions
    camera.lookAt( scene.position ); //sets where camera looks
    scene.add( camera );
    
    // Light
    var light = new THREE.DirectionalLight( 0xffffff, 2 );
    light.position.set( 40, 130, -35 ).normalize;
    // light.target.position.copy( scene.position );
    light.target.position.set( 0, 0, 0 );
    light.castShadow = true;
    light.shadow.camera.left = -60; //72-75 makes it so we get shadows over whole plane
    light.shadow.camera.top = -60;
    light.shadow.camera.right = 60;
    light.shadow.camera.bottom = 60;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
    // light.shadow.mapSize.width = light.shadow.mapSize.height = 6000;
    // light.shadowDarkness = .7;

    // var helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );
    scene.add( light );

    var light = new THREE.AmbientLight( 0xffffff, .2 );
    scene.add( light );

    // var light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( -1, 1, -1 ).normalize();
    // light.target.position.copy( scene.position );
    // light.castShadow = true;
    // scene.add( light );

    
    // Ground, makes ground
    ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        .4, // high friction
        1.2 // low restitution
    );
    
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 1, 100),
        ground_material,
        0 // mass
    );
    ground.receiveShadow = true;
    ground.rotation.z = 0;
    scene.add( ground );


    // Walls, makes surrounding walls and ceiling

    wall_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0x999999, transparent: true, opacity: 0, side: THREE.DoubleSide }),
        .8, // high friction
        .3 // low restitution
    );
    
    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 100, 1),
        wall_material,
        0 // mass
    );
    wall.receiveShadow = false;
    wall.rotation.z = 0;
    wall.position.z = -50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 100, 1),
        wall_material,
        0 // mass
    );
    wall.receiveShadow = false;
    wall.rotation.z = 0;
    wall.position.z = 50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 100, 100),
        wall_material,
        0 // mass
    );
    wall.receiveShadow = false;
    wall.rotation.z = 0;
    wall.position.x = 50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 100, 100),
        wall_material,
        0 // mass
    );
    wall.receiveShadow = false;
    wall.rotation.z = 0;
    wall.position.x = -50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(//top
        new THREE.BoxGeometry(100, 1, 100),
        wall_material,
        0 // mass
    );
    wall.receiveShadow = false;
    wall.rotation.z = Math.PI; //flips upside down to keep them in
    wall.position.y = 100;
    scene.add( wall );

    // raycaster
    raycaster = new THREE.Raycaster();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    
    
    requestAnimationFrame( render );
    scene.simulate();
};


function spawnsphere() { //deletes old spheres and makes new ones
        for (var i = 0; i < raySpheres.length; i++) {
            scene.remove(scene.getObjectByName(raySpheres[i].name)); //delets speres from array where we house them
        }

        raySpheres = []; // resets 

        for (var i = 0; i < 5; i++) {
            createsphere();
        }

};

function createsphere() {
            var sphere_geometry = new THREE.SphereGeometry( Math.random()*5 + 1, 32, 32 );
            var sphere, material;
            
            material = Physijs.createMaterial(
                new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }),
                .2, // medium friction
                1.0 // low restitution
            );
            sphere = new Physijs.SphereMesh( //the way Physijs makes sphere
                sphere_geometry,
                material
            );

            sphere.name = "object "+sphereCounter;
            
            sphere.position.set(
                Math.random() * 30 - 15,
                50,
                Math.random() * 30 - 15
            );
            
            sphere.castShadow = true;
            // sphere.addEventListener( 'collision', handleCollision );

            raySpheres.push(sphere); //adds it to array for raycaster intersect
            scene.add( sphere );

            if (sphereCounter<5){ //counter to only make 5
                sphereCounter++;
            }else{
                sphereCounter = 0;
 
            }
        };

render = function() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
    // render_stats.update();
};

function onDocumentMouseMove( event ) { // for mouse move
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( raySpheres );
    if ( intersects.length > 0 ) {
        INTERSECTED = intersects[ 0 ].object;
        // console.log(INTERSECTED.name);
        document.getElementById("countryName").innerHTML = INTERSECTED.name; // displays name in top left (hovering the object)

    }
}

document.onmousedown = function(e) { // when mouse is pressed
    raycaster.setFromCamera( mouse, camera );
    // var intersects = raycaster.intersectObjects( scene.children );
    var intersects = raycaster.intersectObjects( raySpheres ); //only if object in array is clicked, avoids walls and ground

    if ( intersects.length > 0 ) {
        // if( INTERSECTED == intersects[ 0 ].object && INTERSECTED != tempHover) {
        //     // if (INTERSECTED)
        // // console.log(INTERSECTED.name);
        // // document.getElementById("countryName").innerHTML = INTERSECTED.name;
        // // var object = scene.getObjectByName (INTERSECTED.name, true);

        // // INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex);
        // // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        // INTERSECTED.material.emissive.setHex(0xffffff);

        // tempHover = INTERSECTED;
        // } else if(INTERSECTED == intersects[ 0 ].object && INTERSECTED == tempHover){
        //     INTERSECTED.material.emissive.setHex(0x000000);

        // }






        // if(object.name.length > 0){
        //     var existChecker = document.getElementById(INTERSECTED.name); //stops from making info box if one exists for that object
        //     if(existChecker == null){
        // var countryInfo = document.createElement('div'); //pop up window
        // countryInfo.id = INTERSECTED.name;
        // countryInfo.id = "info";
        // // countryInfo.style.pointerEvents = "none"; //tried to not make stacking boxes, oh well


        // var countryInfoName = document.createElement('a'); // name of object inside
        // // countryInfoName.id = "country" + countryCounter;
        // countryInfoName.innerHTML = INTERSECTED.name;
        // countryInfoName.style.cursor = "default";

        // var countryClose = document.createElement('button'); // makes close button
        // countryClose.position = "relative";
        // countryClose.style.float = "right";
        // countryClose.innerHTML="X";
        // countryClose.onclick = closeWindow; //deletes window
        // countryClose.style.background = "#222222";
        // countryClose.className = "popUp";
        

        // countryInfo.appendChild(countryInfoName);
        // countryInfo.appendChild(countryClose);
        // document.body.appendChild(countryInfo);
        //     } else {
        //         closeWindow2(); //closes existing window
        //     }

        // }







        if(object.name.length > 0){
            var existChecker = document.getElementById(INTERSECTED.name); //stops from making info box if one exists for that object
            if(existChecker == null){
        var countryInfo = document.createElement('div'); //pop up window
        countryInfo.style.position = "fixed";
        countryInfo.style.background = "#56ae66";
        countryInfo.style.left = event.clientX + "px";
        countryInfo.style.top = event.clientY + "px";
        countryInfo.style.width = "300px";
        countryInfo.style.height = "100px";
        countryInfo.style.zIndex = 900;
        countryInfo.id = INTERSECTED.name;
        // countryInfo.style.pointerEvents = "none"; //tried to not make stacking boxes, oh well


        var countryInfoName = document.createElement('a'); // name of object inside
        // countryInfoName.id = "country" + countryCounter;
        countryInfoName.innerHTML = INTERSECTED.name;
        countryInfoName.style.cursor = "default";

        var countryClose = document.createElement('button'); // makes close button
        countryClose.position = "relative";
        countryClose.style.float = "right";
        countryClose.innerHTML="X";
        countryClose.onclick = closeWindow; //deletes window
        countryClose.style.background = "#222222";
        countryClose.className = "popUp";
        

        countryInfo.appendChild(countryInfoName);
        countryInfo.appendChild(countryClose);
        document.body.appendChild(countryInfo);
            } else {
                closeWindow2(); //closes existing window
            }

        }

    }
}

function closeWindow(){ //deletes window (for button in popup)
    var deleteThis = this.parentNode.id;

    document.getElementById(deleteThis).remove();


}

function closeWindow2(){ //for reClick/if window exists and clicked on the object again
    document.getElementById("countryName").innerHTML = INTERSECTED.name;
    // var toBeDeleted = 
    document.getElementById(INTERSECTED.name).remove();
   
}

window.onload = initScene;
    
