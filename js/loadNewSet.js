'use strict';

var categoryList = ["Water", "Electricity", "Sanitation", "Env. Risk", "Gen. Risk"]; // name of categories

// stores factor weights
var factorWeights = [];

// stores calculated scores
var calculatedScores = [];


Physijs.scripts.worker = '../js/physijs_worker.js';
Physijs.scripts.ammo = '../js/ammo.js';

var initScene, render, spawnsphere, loader,
    renderer, render_stats, physics_stats, scene, ground_material, ground, wall_material, wall, light, camera, raycaster;

// array to house intersected objects, dont want raycaster to trigger if it clicks invisible wall or floor
var raySpheres = [];

// counts spheres made in order to delete them when we generate again
var sphereCounter = 0;

// counter for objects made
var countryCounter = 0;

// make this many
var makeThisMany = 0;

// checks if an info window is open or not
var infoWindowOpen = false;

// remembers last clicked country
var lastClicked;


var mouse = new THREE.Vector2(), INTERSECTED;

initScene = function() {

    // physi.js example settings

    // renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMapSoft = true;

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor( 0xffff99 );
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
    camera.lookAt( scene.position ); //sets where camera looks
    scene.add( camera );
    
    // Light
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 40, 80, -35 ).normalize;
    light.target.position.copy( scene.position );
    light.castShadow = true;
    light.shadowCameraLeft = -60; //72-75 makes it so we get shadows over whole plane
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .2;
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
        new THREE.MeshLambertMaterial({ color: 0x333333 }),
        .4, // high friction
        1.2 // low restitution
    );
    
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(100, 1, 100),
        ground_material,
        0 // mass
    );
    // ground.position.y = -50;
    ground.receiveShadow = true;
    ground.rotation.z = 0;
    scene.add( ground );

    // Walls, makes surrounding walls and ceiling

    wall_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide }),
        .8, // high friction
        .3 // low restitution
    );
    
    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(101, 101, 1),
        wall_material,
        0 // mass
    );
    // wall.receiveShadow = true;
    wall.rotation.z = 0;
    wall.position.z = -50;
    wall.position.y = 50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(101, 101, 1),
        wall_material,
        0 // mass
    );
    // wall.receiveShadow = true;
    wall.rotation.z = 0;
    wall.position.z = 50;
    wall.position.y = 50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 101, 101),
        wall_material,
        0 // mass
    );
    // wall.receiveShadow = true;
    wall.rotation.z = 0;
    wall.position.x = 50;
    wall.position.y = 50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1, 101, 101),
        wall_material,
        0 // mass
    );
    // wall.receiveShadow = true;
    wall.rotation.z = 0;
    wall.position.x = -50;
    wall.position.y = 50;
    scene.add( wall );

    wall = new Physijs.BoxMesh(//top
        new THREE.BoxGeometry(101, 1, 101),
        wall_material,
        0 // mass
    );
    // wall.receiveShadow = true;
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

        makeThisMany = document.getElementById('sliderInputS').value;

        var overallValue = 0; // calc total for average

        var factorWeights = []; //clear the array
        // for (var i = 0; i < categoryList.length; i++) {
        //     overallValue + factorWeights[i];
        // }

        for (var i = 0; i < categoryList.length; i++) { // get the factor values from sliders
            
            var tempValue = document.getElementById('sliderInput' + i).value;

            // console.log(tempValue);
            factorWeights.push(parseInt(tempValue));
            overallValue += parseInt(tempValue);
            // overallValue + factorWeights[i];

            // console.log(overallValue);

        }

        // acc2elec = res[1];
        // console.log(acc2elec.length);
        // acc2sani = res[2];
        // console.log(acc2sani.length);
        // ere = res[3];
        // console.log(ere.length);
        // risk = res[4];
        // console.log(risk.length);
        // geonames = res[5];
        // console.log(geonames.length);

        calculatedScores = [];


        for (var i = 0; i < acc2dwat.length; i++) {
            var scoreValue = (acc2dwat[i]['WATSUP.2015'] * factorWeights[0]/100 + 
                             acc2elec[i]['ACCESS.2012'] * factorWeights[1]/100 + 
                             acc2sani[i]['ACSAT.2015'] * factorWeights[2]/100 + 
                             (1-Math.abs(ere[i]['ERE.2013'])) * factorWeights[3] + 
                             (1-Math.abs(risk[i]['HAPR.2013'])) * factorWeights[4]) // take the inverse, higher risk warrants a lower score
                            /overallValue; // returns a value between 0 and 1 with the exception of some values being -9999
                            // console.log(i + "is" + (    (1-Math.abs(ere[i]['ERE.2013'])) * factorWeights[3]   ));
            // console.log(acc2dwat[i]['WATSUP.2015'])

            var countryISO = acc2dwat[i]['iso'];
            var convertedISO = geonames.filter(function(obj){ //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
                if (obj.ISOalpha3 === countryISO){
                    return obj.ISOalpha2;
                }
            });

            var tempCountry = { // creates object for array
                score:  scoreValue,
                country: acc2dwat[i]['country'],
                ISO: convertedISO
            }

            calculatedScores.push(tempCountry);

        }

        calculatedScores.sort(function(a, b) { 
            return b.score - a.score;
        })

        for (var i = 0; i < raySpheres.length; i++) {
            scene.remove(scene.getObjectByName(raySpheres[i].name)); //deletes spheres from array where we house them
        }

        raySpheres = []; // resets 

        var elements = document.getElementsByClassName("leaderboardInfo"); // clear leaderboard
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);//http://stackoverflow.com/questions/4777077/removing-elements-by-class-name
        }

        // var elements = document.getElementById("leaderboard");
        // while(elements.firstChild){
        //     elements.removeChild(leaderboard.firstChild);
        // }

        for (var i = 0; i < makeThisMany; i++) { // write leaderboard values and create balls
            createsphere(i);
            updateLeaderboard(i);
        }

};

function createsphere(counter) {


            var sphere_geometry = new THREE.SphereGeometry( 5 * calculatedScores[counter].score, 32, 32 );
                //for the width

            var sphere, material;
            
            material = Physijs.createMaterial(

                new THREE.MeshLambertMaterial({ color: new THREE.Color("hsl("+360*Math.random()+", 50%, 50%)")}),
                // new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }),
                .2, // medium friction
                1.0 // low restitution
            );
            sphere = new Physijs.SphereMesh( //the way Physijs makes sphere
                sphere_geometry,
                material,
                1
                //we can add mass here
            );

            // sphere.name = "object "+sphereCounter; // change this to country names
            sphere.name = calculatedScores[counter].country;
            sphere.className = "spheres"; // used to find HSL value for reset

            sphere.position.set(
                Math.random() * 30 - 15,
                50,
                Math.random() * 30 - 15
            );
            
            sphere.castShadow = true;
            // sphere.addEventListener( 'collision', handleCollision );

            raySpheres.push(sphere); //adds it to array for raycaster intersect
            scene.add( sphere );

            if (sphereCounter<makeThisMany){ //counter to only make 5
                sphereCounter++;
            }else{
                sphereCounter = 0;
 
            }
        };


function updateLeaderboard(counter){

        var leaderboardUpdate = document.getElementById('leaderboard');

        var countryNameScore = document.createElement('a');
        countryNameScore.innerHTML = calculatedScores[counter].country; 
        countryNameScore.style.color = "#444444";
        countryNameScore.style.clear = "both";
        countryNameScore.style.float = "left";
        countryNameScore.className = "leaderboardInfo ";
        countryNameScore.className += calculatedScores[counter].country;


        var countryScore = document.createElement('a');
        countryScore.style.color = "#444444";
        countryScore.innerHTML = Math.round(10000*calculatedScores[counter].score)/100;
        // countryNameScore.style.clear = "both";
        countryScore.style.float = "right";
        countryScore.className = "leaderboardInfo ";
        countryNameScore.className += calculatedScores[counter].country;

        // var leaderboard = document.createElement('div'); //leaderboard to house "best" countries

        leaderboardUpdate.appendChild(countryNameScore);
        leaderboardUpdate.appendChild(countryScore);

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


    var cordx = 0; //http://thecodepress.blogspot.ca/2013/05/moving-div-according-to-mouse.htmlx
    var cordy = 0;
    if (!e) {
    var e = window.event;
    }
    if (e.pageX || e.pageY){
    cordx = e.pageX;
    cordy = e.pageY;
    }
    else if (e.clientX || e.clientY){
    cordx = e.clientX;
    cordy = e.clientY;
    }

    var name = document.getElementById("countryName");

    if ( intersects.length > 0 ) {
        INTERSECTED = intersects[ 0 ].object;
        // console.log(INTERSECTED.name);
        name.innerHTML = INTERSECTED.name; // displays name in top left (hovering the object)
        // name.style.top = mouse.y;
        // name.style.left = mouse.x;

        name.style.top = cordy - 50 + "px"; //sets position for hover name
        name.style.left = cordx - 75 + "px";
        name.style.opacity = 1;
    } else {
        name.style.opacity = 0;

    }
}

document.onmousedown = function(e) { // when mouse is pressed
    raycaster.setFromCamera( mouse, camera );
    // var intersects = raycaster.intersectObjects( scene.children );
    var intersects = raycaster.intersectObjects( raySpheres ); //only if object in array is clicked, avoids walls and ground

    if ( intersects.length > 0 ) {
        INTERSECTED = intersects[ 0 ].object;
        // console.log(INTERSECTED.name);
        document.getElementById("countryName").innerHTML = INTERSECTED.name;
        var object = scene.getObjectByName (INTERSECTED.name, true);
        

        if(object.name.length > 0){

            var existChecker = document.getElementById(INTERSECTED.name); //stops from making info box if one exists for that object
            if(existChecker == null && !infoWindowOpen){
                makeInfoWindow();
                var selected = scene.getObjectByName(INTERSECTED.name);
                // var somethign = selected.material.color.getHSL();
                // console.log(somethign);
                selected.material.color.offsetHSL(0, .3, .3);


            } else if (existChecker == null && infoWindowOpen) {
                closeWindow2(); //closes existing window
                makeInfoWindow();
                var selected = scene.getObjectByName(INTERSECTED.name);
                selected.material.color.offsetHSL(0, .3, .3);

               

            } else {
                closeWindow2();

                var object2 = scene.getObjectByName (lastClicked);
                var objColor = object2.material.color.getHSL();
                // console.log(objColor);
                

            }

            lastClicked = object.name; //remembers last clicked object
        }

    }
}

function makeInfoWindow(){ // pop up window
    var countryInfo = document.createElement('div');
        countryInfo.className = "countryInfo";
        countryInfo.id = INTERSECTED.name;

        var countryInfoName = document.createElement('a'); // show country name
        countryInfoName.style.color = "#d58b15";
        countryInfoName.style.fontSize = "32px";
        countryInfoName.innerHTML = INTERSECTED.name;
        countryInfoName.style.cursor = "default";
        countryInfoName.style.marginBottom = "20px";

        var countryClose = document.createElement('button'); // makes close button
        countryClose.position = "relative";
        countryClose.style.float = "right";
        countryClose.innerHTML="X";
        countryClose.onclick = closeWindow; //deletes window
        countryClose.style.background = "#222222";
        countryClose.className = "popUp";



        var countryFlag = document.createElement('img'); // pull the flag image from geonames
        countryFlag.className = "countryInfoFlag";
        countryFlag.position = "relative";
        countryFlag.style.clear = "both";
        countryFlag.style.float = "left";

        var countryClicked = calculatedScores.filter(function(obj){ //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
                if (obj.country === INTERSECTED.name){
                    return obj;
                }
            });

        // console.log(countryClicked[0].ISO[0].ISOalpha2);

        countryFlag.src = "http://www.geonames.org/flags/x/" + countryClicked[0].ISO[0].ISOalpha2.toLowerCase() + ".gif";



        var countryInfoRank = document.createElement('a'); // show rank of the country
        countryInfoRank.style.color = "#444444";
        countryInfoRank.style.fontSize = "16px";
        var tempRank = parseInt(calculatedScores.indexOf(countryClicked[0])) + 1;
        countryInfoRank.innerHTML = "Rank: " + tempRank;
        console.log(calculatedScores.indexOf(countryClicked[0]));
        countryInfoRank.style.clear = "both";
        countryInfoRank.style.float = "left";
        countryInfoRank.style.marginTop = "10px";
        countryInfoRank.style.marginBottom = "5px";



         var countryInfoArea = document.createElement('a'); // reference size of the country
        countryInfoArea.style.color = "#444444";
        countryInfoArea.style.fontSize = "16px";
        countryInfoArea.innerHTML = "Area: " + countryClicked[0].ISO[0].Area + "km<sup>2</sup>";
        countryInfoArea.style.clear = "both";
        countryInfoArea.style.float = "left";
        countryInfoArea.style.marginBottom = "5px";


         var countryInfoCapital = document.createElement('a'); // reference that country's capital
        countryInfoCapital.style.color = "#444444";
        countryInfoCapital.style.fontSize = "16px";
        countryInfoCapital.innerHTML = "Capital: " + countryClicked[0].ISO[0].Capital;
        countryInfoCapital.style.clear = "both";
        countryInfoCapital.style.float = "left";
        countryInfoCapital.style.marginBottom = "5px";

         var countryInfoPop = document.createElement('a'); // reference population of that country
        countryInfoPop.style.color = "#444444";
        countryInfoPop.style.fontSize = "16px";
        countryInfoPop.innerHTML = "Population: " + countryClicked[0].ISO[0].Population;
        countryInfoPop.style.clear = "both";
        countryInfoPop.style.float = "left";
        countryInfoPop.style.marginBottom = "5px";

        var countryInfoEPI = document.createElement('a'); // link to EPI
        countryInfoEPI.style.color = "#76c7db";
        countryInfoEPI.href = "http://epi.yale.edu/";
        countryInfoEPI.style.fontSize = "16px";
        countryInfoEPI.innerHTML = "Data from EPI";
        countryInfoEPI.style.clear = "both";
        countryInfoEPI.style.float = "left";
        countryInfoEPI.style.marginBottom = "5px";

        var countryInfoGEO = document.createElement('a'); // link to Geonames
        countryInfoGEO.style.color = "#76c7db";
        countryInfoGEO.href = "www.geonames.org";
        countryInfoGEO.style.fontSize = "16px";
        countryInfoGEO.innerHTML = "Flags from Geonames";
        countryInfoGEO.style.clear = "both";
        countryInfoGEO.style.float = "left";
        countryInfoGEO.style.marginBottom = "10px";

        //now we add it all in
        countryInfo.appendChild(countryInfoName);
        countryInfo.appendChild(countryClose);
        countryInfo.appendChild(countryFlag);
        countryInfo.appendChild(countryInfoRank);
        countryInfo.appendChild(countryInfoArea);
        countryInfo.appendChild(countryInfoCapital);
        countryInfo.appendChild(countryInfoPop);
        countryInfo.appendChild(countryInfoEPI);
        countryInfo.appendChild(countryInfoGEO);
        document.body.appendChild(countryInfo);

    infoWindowOpen = true;
}

function closeWindow(){ //deletes window (for button in popup)
    var deleteThis = this.parentNode.id;

    document.getElementById(deleteThis).remove();

    var elements = document.getElementsByClassName("countryInfo");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);//http://stackoverflow.com/questions/4777077/removing-elements-by-class-name
    }
    infoWindowOpen = false;

    var object2 = scene.getObjectByName (lastClicked);
    var objColor = object2.material.color.getHSL();
    if (Math.round(objColor.s * 10) != 5){ // setting hsl doesnt set perfectly ie. 50% returns .49999
    object2.material.color.offsetHSL(0, -.3, -.3);
    }


}

function closeWindow2(){ //for reClick/if window exists and clicked on the object again
   
    var elements = document.getElementsByClassName("countryInfo");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);//http://stackoverflow.com/questions/4777077/removing-elements-by-class-name
    }
    infoWindowOpen = false;

    var object2 = scene.getObjectByName (lastClicked);
    var objColor = object2.material.color.getHSL();
    // var objColor = object2.material.color.getHSL();
    if (Math.round(objColor.s * 10) != 5){ // setting hsl doesnt set perfectly ie. 50% returns .49999
    object2.material.color.offsetHSL(0, -.3, -.3);
    }
   
}

window.onload = initScene;


window.addEventListener('resize', onWindowResize, false); //when the user resizes browser, run function "onWindowResize" - currently set to false until otherwise

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight; //calculates the windows resize
        camera.updateProjectionMatrix(); //updates the camera render

        renderer.setSize(window.innerWidth, window.innerHeight); // the resize

    }
