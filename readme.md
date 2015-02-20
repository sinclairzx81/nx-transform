### nx-transform

A binding between angularjs + threejs. Enabling a declarative 3D transformations in the browser.

```html

    <div ng-controller="applicationCtrl">

        <nx-transform position="{y:-100}" rotation="{z:45}">
			
            <h1>nx-transform</h1>

            <nx-transform position="{x:50, y:80}" rotation="{y:90}">

                <img src="http://vojtajina.github.io/html5la/2012-05-11-brighton/images/AngularShieldLogo.png" />

            </nx-transform>

        </nx-transform>

    </div>

```