var scene, camera, renderer, raycaster;
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
                scene.add( light );

                var light = new THREE.DirectionalLight( 0xffffff );
                light.position.set( -1, -1, -1 ).normalize();
                scene.add( light );
                //create a boxes
                var geometry = new THREE.BoxGeometry( 20, 20, 20 );

                for ( var i = 0; i < 200; i ++ ) {

                    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

                    object.position.x = Math.random() * 400 - 200;
                    object.position.y = Math.random() * 400 - 200;
                    object.position.z = Math.random() * 400 - 200;

                    object.rotation.x = Math.random() * 2 * Math.PI;
                    object.rotation.y = Math.random() * 2 * Math.PI;
                    object.rotation.z = Math.random() * 2 * Math.PI;

                    object.scale.x = Math.random() + 0.5;
                    object.scale.y = Math.random() + 0.5;
                    object.scale.z = Math.random() + 0.5;
                    object.name="object "+i;

                    scene.add( object );

                }

                //position camera
                camera.position.set (0, 0, 200);

                raycaster = new THREE.Raycaster();
                document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                //render the scene
                render();
            }
            function onDocumentMouseMove( event ) {
                event.preventDefault();
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            }

            function render() {
                //call to render scene 60fps
                requestAnimationFrame(render);

                //keep displaying scene
                renderer.render(scene, camera);
            }

            document.onmousedown = function(e) {
                raycaster.setFromCamera( mouse, camera );
                var intersects = raycaster.intersectObjects( scene.children );

                if ( intersects.length > 0 ) {
                    INTERSECTED = intersects[ 0 ].object;
                    console.log(INTERSECTED.name);
                    document.getElementById("hover").innerHTML = INTERSECTED.name;
                    // recursive search
                    var object = scene.getObjectByName (INTERSECTED.name, true);
                    object.traverse ( function (child) {
                        scene.remove(child);
                    });
                }
            }