//-------------------------------------------------
// nx-scene: threejs + angular
//-------------------------------------------------

(function (window, angular, THREE, TWEEN, undefined) {

    angular.module('nxScene', [])

    .config(function () {

        console.log('nx-scene v0.1')
    })

    .factory('nxIdentity', [function () {

        return {

            get: function () {

                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {

                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);

                    return v.toString(16);

                })
            }
        }
    }])

    .factory('nxCamera', [function () {

        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)

        camera.position.set(0, 0, 600)

        return camera

    }])

    .factory('nxScene', [function () {

        var scene = new THREE.Scene()

        scene.find = function (name) {

            var find = function (object) {

                if (object.name == name) {

                    return object
                }

                for (var i = 0; i < object.children.length; i++) {

                    var result = find(object.children[i])

                    if (result) {

                        return result;
                    }
                }

                return null
            }

            return find(scene)
        }

        return scene;
    }])

    .factory('nxRenderer', [function () {

        var renderer = new THREE.CSS3DRenderer()

        renderer.setSize(window.innerWidth, window.innerHeight)

        renderer.domElement.style.position = 'absolute'

        renderer.domElement.style.top = 0

        document.body.appendChild(renderer.domElement)

        return renderer

    }])

    .service('nxLoop', [function () {

        this.callbacks = []

        this.register = function (callback) {

            this.callbacks.push(callback)
        }

        var that = this;

        var animate = function () {

            requestAnimationFrame(animate)

            that.callbacks.forEach(function (callback) {

                callback()
            })
        }

        animate()
    }])

    .service('nxRuntime', ['nxLoop', 'nxRenderer', 'nxScene', 'nxCamera', function (nxLoop, nxRenderer, nxScene, nxCamera) {

        window.addEventListener('resize', function () {

            nxCamera.aspect = window.innerWidth / window.innerHeight

            nxCamera.updateProjectionMatrix()

            nxRenderer.setSize(window.innerWidth, window.innerHeight)

        }, false);

        nxLoop.register(function () {

            nxRenderer.render(nxScene, nxCamera)

            TWEEN.update()
        })
    }])

    .directive('nxTransform', ['nxRuntime', 'nxIdentity', 'nxScene', 'nxAnimation', '$timeout',

        function (nxRuntime, nxIdentity, nxScene, nxAnimation, $timeout) {

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
                        // create css3d object
                        //-------------------------------------

                        scope.object          = new THREE.CSS3DObject(angular.element(element)[0])

                        scope.object.name     = nxIdentity.get()

                        scope.object.position = new THREE.Vector3(0, 0, 0)

                        scope.object.rotation = new THREE.Vector3(0, 0, 0)

                        scope.object.scale    = new THREE.Vector3(1, 1, 1)

                        element.attr('nx-object-name', scope.object.name)

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
                        // listen - animation
                        //-------------------------------------

                        attributes.$observe('animation', function (value) {

                            var animation = nxAnimation.get(value)

                            if (animation) {

                                //------------------------
                                // delay to allow initial
                                // properties to be set
                                // on startup.
                                //------------------------

                                $timeout(function () { 
                                    
                                    animation.run(element)
                                })
                            }
                        })

                        //-------------------------------------
                        // listen - position
                        //-------------------------------------

                        attributes.$observe('position', function (value) {

                            var position = scope.$eval(value)

                            if (position) {

                                scope.object.position.set(position.x != null ? position.x : scope.object.position.x,

                                                          position.y != null ? position.y : scope.object.position.y,

                                                          position.z != null ? position.z : scope.object.position.z)
                            }
                        })

                        //-------------------------------------
                        // listen - rotation
                        //-------------------------------------

                        attributes.$observe('rotation', function (value) {

                            var rotation = scope.$eval(value)

                            if (rotation) {

                                scope.object.rotation.set(rotation.x != null ? rotation.x * (Math.PI / 180.0) : scope.object.rotation.x,

                                                          rotation.y != null ? rotation.y * (Math.PI / 180.0) : scope.object.rotation.y,

                                                          rotation.z != null ? rotation.z * (Math.PI / 180.0) : scope.object.rotation.z)
                            }
                        })

                        //-------------------------------------
                        // listen  - scale
                        //-------------------------------------

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
    }])

    .service('nxAnimation', ['nxScene', function (nxScene) {

        //-------------------------------------------
        // animation keyframe sequence
        //-------------------------------------------

        function AnimationSequence() {

            this.keyframes = []

            this.keyframe = function (keyframe) {

                var _keyframe = {}

                _keyframe.duration = keyframe.duration == null ? 100 : keyframe.duration

                if (keyframe.position) {

                    _keyframe.position_x = keyframe.position.x

                    _keyframe.position_y = keyframe.position.y

                    _keyframe.position_z = keyframe.position.z

                }

                if (keyframe.rotation) {

                    _keyframe.rotation_x = keyframe.rotation.x == null ? null : keyframe.rotation.x * (Math.PI / 180)

                    _keyframe.rotation_y = keyframe.rotation.y == null ? null : keyframe.rotation.y * (Math.PI / 180)

                    _keyframe.rotation_z = keyframe.rotation.z == null ? null : keyframe.rotation.z * (Math.PI / 180)
                }

                if (keyframe.scale) {

                    _keyframe.scale_x = keyframe.scale.x

                    _keyframe.scale_y = keyframe.scale.y

                    _keyframe.scale_z = keyframe.scale.z
                }

                this.keyframes.push(_keyframe)

                return this
            }

            this.run = function (element) {

                var _keyframes = this.keyframes.map(function (item) { return item })

                _keyframes = _keyframes.reverse()

                if (_keyframes.length == 0) {

                    done()

                    return
                }

                var object = nxScene.find(element.attr('nx-object-name'))

                if (!object) {

                    done()

                    return
                }

                var next    = null

                var current = null

                var action  = function () {

                    current = next

                    next = _keyframes.pop()

                    new TWEEN.Tween({

                        position_x: current.position_x, position_y: current.position_y, position_z: current.position_z,

                        rotation_x: current.rotation_x, rotation_y: current.rotation_y, rotation_z: current.rotation_z,

                        scale_x: current.scale_x, scale_y: current.scale_y, scale_z: current.scale_z

                    }).to({

                        position_x: next.position_x, position_y: next.position_y, position_z: next.position_z,

                        rotation_x: next.rotation_x, rotation_y: next.rotation_y, rotation_z: next.rotation_z,

                        scale_x: next.scale_x, scale_y: next.scale_y, scale_z: next.scale_z

                    }, next.duration).onUpdate(function () {
                        
                        object.position.x = this.position_x == null ? object.position.x : this.position_x

                        object.position.y = this.position_y == null ? object.position.y : this.position_y

                        object.position.z = this.position_z == null ? object.position.z : this.position_z

                        object.rotation.x = this.rotation_x == null ? object.rotation.x : this.rotation_x

                        object.rotation.y = this.rotation_y == null ? object.rotation.y : this.rotation_y

                        object.rotation.z = this.rotation_z == null ? object.rotation.x : this.rotation_z

                        object.scale.x = this.scale_x == null ? object.scale.x : this.scale_x

                        object.scale.y = this.scale_y == null ? object.scale.y : this.scale_y

                        object.scale.z = this.scale_z == null ? object.scale.z : this.scale_z

                    }).onComplete(function () {

                        if (_keyframes.length == 0) return

                        action()

                    }).start()
                }

                next = {

                    duration: 0,

                    position_x: object.position.x, position_y: object.position.y, position_z: object.position.z,

                    rotation_x: object.rotation.x, rotation_y: object.rotation.y, rotation_z: object.rotation.z,

                    scale_x: object.scale.x, scale_y: object.scale.y, scale_z: object.scale.z
                }

                action()
            }
        }

        this.sequences = {}

        this.sequence = function (name) {

            this.sequences[name] = new AnimationSequence()

            return this.sequences[name]
        }

        this.get = function (name) {

            return this.sequences[name]
        }
    }])


})(window, window.angular, THREE, TWEEN);