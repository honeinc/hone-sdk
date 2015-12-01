
# Hone SDK

A Javascript library for interfacing with Hone.

## Installation

To resize Hone iframes and listen for events, you can include this small helper:

```html
<script src="//honefiles.global.ssl.fastly.net/sdk/2.10.8/iframe.min.js"></script>
```

Or, if you'd like our entire the SDK from our CDN:

```html
<script src="//honefiles.global.ssl.fastly.net/sdk/2.10.8/hone.min.js"></script>
```

## Documentation

You can read documentation [here](docs/).

## Examples

### Controlling the SDK

By default, hone creates an instance in the global window:

```javascript
window.hone.on( 'auth.login', function() {
    console.log( 'logged in!' );
} );
```
If you would like to disable that, just make sure to set window.hone to something
before loading the SDK, eg:

```html
<script type="text/javascript">
    window.hone = undefined;
</script>

<script type="text/javascript" src="//honefiles.global.ssl.fastly.net/sdk/x.x.x/hone.min.js"></script>
```

You can create a new instance if you want to control settings:

```javascript
var hone = new Hone( {
    init: false // wait for us to init, maybe we want to do some work first
} );

// do some work, then init by hand:

hone.init();
```

### Using the iframe helper to handle iframe resizing

First, include the iframe helper, replace the x.x.x with the appropriate version:

```html
<script type="text/javascript" src="//honefiles.global.ssl.fastly.net/sdk/x.x.x/iframe.min.js"></script>
```

Next, control the iframe sizing using data- attributes. For example, you can tell the iframe
to auto-resize its height to contain the content without a scrollbar:

```html
<iframe class="hone-embed" src="http://gohone.com/Quiz/QUIZID?embed=true" width="600" style="border: none; float: none; clear: both;" data-resize="height"></iframe>
```

The available options for the data-resize attribute are:

* true - resizes both width and height to contain content
* width - resizes only width to contain content
* height - resizes only height to contain content

### Listening for user actions

In the SDK:

```javascript
hone.eventBus.on( 'voted', function( vote ) {
    console.log( 'Voted!' );
} );
```

Or you can listen with the iframe helper:

```javascript
honeIFrameHelper.eventBus.on( 'voted', function( vote ) {
    console.log( 'Voted!' );
} );
```

### Listening for SDK events

The SDK emits various events, check the [docs](docs/) for details:

```javascript
// bind some events
hone.on( 'auth.login', function( e ) {
    $( '.authenticated' ).show();
    $( '.unauthenticated' ).hide();
    $( '.my-username' ).html( e.user.nickname );
} );

hone.on( 'auth.logout', function( e ) {
    $( '.unauthenticated' ).show();
    $( '.authenticated' ).hide();
    $( '.my-username' ).html( '' );
} );

// let people get a Hone login code
$( '.get-login-code-button' ).on( 'click', function( e ) {
    var email = $( '.email' ).val();
    var phone = $( '.phone' ).val();

    if ( email && phone ) {
        alert( 'Enter either an email address or a phone number, not both.' );
        return;
    }

    // get a login code via email or phone
    hone.requestLoginCode( {
        email: email,
        phone: phone
    }, function( error ) {
        if ( error ) {
            alert( error );
            return;
        }

        //show our login code field
        $( '.email' ).hide();
        $( '.phone' ).hide();
        $( '.code' ).show();
    } );    
} );

// once people have a code, let them log in
$( '.submit-login-code-button' ).on( 'click', function( e ) {
    var email = $( '.email' ).val();
    var phone = $( '.phone' ).val();

    if ( email && phone ) {
        alert( 'Enter either an email address or a phone number, not both.' );
        return;
    }

    var code = $( '.code' ).val();
    if ( !code ) {
        alert( 'You must enter a login code.' );
        return;
    }

    hone.login( {
        email: email,
        phone: phone,
        code: code
    }, function( error ) {
        if ( error ) {
            alert( error );
            return;
        }

        window.location = '/home';
    } );
} );
```

## Methods

### init

By default, Hone will initialize itself. However, if you have some more complex event handling/binding to do, you can take control of the init process by passing a boolean to the constructor:

```javascript
var hone = new Hone( {
    init: false
} );
```

Once you are ready, you can then initialize Hone:

```javascript
hone.init( function() {
    // this is an option callback once init has completed
} );
```

## License

The MIT License (MIT)

Copyright (c) 2014 Hone, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
