var scene, camera, renderer, model;

            function init(){
                //add detector to see if WebGL is supported
                if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
                //set up a scene
                scene = new THREE.Scene();
                scene.background = new THREE.Color( 0xffffff );
                //add a camera
                camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
                //render the scene - start renderer and set it's size
                renderer = new THREE.WebGLRenderer({antialias:true});
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor( 0xffffff, 0);
                //add to webpage
                document.body.appendChild(renderer.domElement);

                var light = new THREE.DirectionalLight( 0xffffff, 2 );
                light.position.set( 1, 1, 1).normalize();
                scene.add(light);
                
                light = new THREE.DirectionalLight( 0xffffff );
                light.position.set( -1, -1, -1).normalize();
                scene.add(light);

                //create a primitive
                var geometry = new THREE.SphereGeometry( 5, 64, 64 ); //radius, width segments, height segments
                //create a material color
                var material = new THREE.MeshPhongMaterial({color: 0x00ff00});
                // var material = new THREE.MeshBasicMaterial({color: 0x00ff00});

                //create cube out of geometry and color, then add to scene
                model = new THREE.Mesh(geometry, material);
                scene.add(model);

                //position camera
                camera.position.z = 10;
                //render the scene
                render();
            }

            function render() {
                //call to render scene 60fps
                requestAnimationFrame(render);

                //rotate model
                model.rotation.x += 0.01;
                model.rotation.y += 0.01;

                //keep displaying scene
                renderer.render(scene, camera);
            }

            //call the init function to run the code
            init();