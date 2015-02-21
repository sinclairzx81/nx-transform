angular.module('nxTransform', [])

.factory('nxCamera', function () {

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)

    camera.position.set(0, 0, 600)

    return camera

}).factory('nxScene', function () {

    return new THREE.Scene()

}).factory('nxRenderer', function () {

    var renderer                      = new THREE.CSS3DRenderer()

    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.domElement.style.position = 'absolute'

    renderer.domElement.style.top      = 0

    document.body.appendChild(renderer.domElement)

    return renderer

}).factory('nxRuntime', function (nxRenderer, nxScene, nxCamera) {

    window.addEventListener('resize', function () {

        nxCamera.aspect = window.innerWidth / window.innerHeight

        nxCamera.updateProjectionMatrix()

        nxRenderer.setSize(window.innerWidth, window.innerHeight)

    }, false);

    var animate = function () {

        requestAnimationFrame(animate)

        nxRenderer.render(nxScene, nxCamera)
    }

    animate()

    return {}

}).directive('nxTransform', function (nxRuntime, nxScene) {

    return {

        restrict: 'E',

        scope: true,

        compile: function (element, attributes) {

            return {

                pre: function (scope, element, attributes) {

                    //-------------------------------------
                    // attach parent scope object
                    //-------------------------------------

                    scope.parentObject = scope.object || nxScene

                    //-------------------------------------
                    // shadow object in child scope
                    //-------------------------------------

                    scope.element         = angular.element(element)

                    scope.object          = new THREE.CSS3DObject(scope.element[0])

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

                    attributes.$observe('class', function (value) {

                        scope.element[0].className = value
                    })

                    attributes.$observe('position', function (value) {

                        var position = scope.$eval(value)

                        if (position) {

                            scope.object.position.set(position.x != null ? position.x : scope.object.position.x,

                                                      position.y != null ? position.y : scope.object.position.y,

                                                      position.z != null ? position.z : scope.object.position.z)
                        }
                    })

                    attributes.$observe('rotation', function (value) {

                        var rotation = scope.$eval(value)

                        if (rotation) {

                            scope.object.rotation.set(rotation.x != null ? rotation.x * (Math.PI / 180.0) : scope.object.rotation.x,

                                                      rotation.y != null ? rotation.y * (Math.PI / 180.0) : scope.object.rotation.y,

                                                      rotation.z != null ? rotation.z * (Math.PI / 180.0) : scope.object.rotation.z)
                        }
                    })

                    attributes.$observe('scale', function (value) {

                        var scale = scope.$eval(value)

                        if (scale) {

                            scope.object.scale.set(scale.x != null ? scale.x : scope.object.scale.x,

                                                   scale.y != null ? scale.y : scope.object.scale.y,

                                                   scale.z != null ? scale.z : scope.object.scale.z)
                        }
                    })
                },
                post: function (scope, element, attributes) {

                }
            }
        }
    }
})