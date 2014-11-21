
# Hone SDK

A Javascript library for interfacing with Hone.

## Installation

Include the SDK from our CDN:

```html
<script src="//honefiles.global.ssl.fastly.net/sdk/hone-1.5.0.min.js"></script>
```

## Documentation

You can read documentation [here](docs/).

## Example

```javascript
// create a new instance, Hone is exported into the global space by default
var hone = new Hone();

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