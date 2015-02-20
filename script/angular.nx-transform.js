var app = angular.module('app', [])

app.factory('camera', function () {

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)

    camera.position.set(0, 0, 600)

    return camera
})

app.factory('scene', function () {

    return new THREE.Scene()
})

app.factory('renderer', function () {

    var renderer = new THREE.CSS3DRenderer()

    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.domElement.style.position = 'absolute'

    renderer.domElement.style.top = 0

    document.body.appendChild(renderer.domElement)

    return renderer
})

app.factory('viewer', function (renderer, scene, camera) {

    var animate = function () {

        requestAnimationFrame(animate)

        renderer.render(scene, camera)
    }

    animate()

    return {

        camera : camera,

        scene  : scene
    }
})

app.directive('nxTransform', function (scene, viewer) {

    return {

        restrict   : 'E',

        scope      : true,

        compile    : function (element, attributes) {

            return {

                pre: function (scope, element, attributes) {

                    //-------------------------------------
                    // attach parent scope object
                    //-------------------------------------

                    scope.parentObject  = scope.object || scene

                    //-------------------------------------
                    // shadow object in child scope
                    //-------------------------------------

                    scope.object          = new THREE.CSS3DObject(angular.element(element)[0])

                    scope.object.position = new THREE.Vector3(0, 0, 0)

                    scope.object.rotation = new THREE.Vector3(0, 0, 0)

                    scope.object.scale    = new THREE.Vector3(1, 1, 1)

                    //-------------------------------------
                    // register destroy
                    //-------------------------------------
                    
                    scope.$on('$destroy', function () {

                        scope.parentObject.remove(scope.object)
                    })

                    //-------------------------------------
                    // add parent 
                    //-------------------------------------

                    scope.parentObject.add(scope.object)

                    //-------------------------------------
                    // observe state changes
                    //-------------------------------------

                    attributes.$observe('position', function (value) {

                        var position = scope.$eval(value)

                        if (position) {

                            scope.object.position.set(position.x ? position.x : scope.object.position.x,

                                                      position.y ? position.y : scope.object.position.y,

                                                      position.z ? position.z : scope.object.position.z)
                        }
                    })

                    attributes.$observe('rotation', function (value) {

                        var rotation = scope.$eval(value)

                        if (rotation) {

                            scope.object.rotation.set(rotation.x ? rotation.x * (Math.PI / 180.0) : scope.object.rotation.x,

                                                      rotation.y ? rotation.y * (Math.PI / 180.0) : scope.object.rotation.y,

                                                      rotation.z ? rotation.z * (Math.PI / 180.0) : scope.object.rotation.z)
                        }
                    })

                    attributes.$observe('scale', function (value) {

                        var scale = scope.$eval(value)

                        if (scale) {

                            scope.object.scale.set(scale.x ? scale.x : scope.object.scale.x,

                                                   scale.y ? scale.y : scope.object.scale.y,

                                                   scale.z ? scale.z : scope.object.scale.z)
                        }
                    })
                },
                post: function (scope, element, attributes) {

                }
            }
        }
    }
})