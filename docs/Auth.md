# Auth

## <a name="methods-overview"></a> Methods Overview

| method                                        | signature                            | short description                                                   |
| :-------------------------------------------- | :----------------------------------- | :------------------------------------------------------------------ |
| [requestLoginCode](#methods.requestLoginCode) | requestLoginCode( data[, callback] ) | Requests a login code for the user specified via email or phone.    |
| [login](#methods.login)                       | login( data[, callback] )            | Attempts to log the user in using an email/phone and a login code.  |
| [logout](#methods.logout)                     | logout( [callback] )                 | Logs the current user out.                                          |
| [getUser](#methods.getUser)                   | getUser( callback[, force] )         | Gets the current user. If 'force' is true, will force a lookup.     |
| [updateUser](#methods.updateUser)             | updateUser( data[, callback] )       | Updates the current user with the given data.                       |

## <a name="events-overview"></a> Events Overview

| event                                | short description                                      |
| :----------------------------------- | :----------------------------------------------------- |
| [signup](#events.signup)             | Emitted when a user signs up.                          |
| [login](#events.login)               | Emitted when the user logs in.                         |
| [logout](#events.logout)             | Emitted when the user logs out.                        |
| [user_updated](#events.user_updated) | Emitted when a user's profile data has changed.        |
| [identified](#events.identified)     | Emitted when a user has had a unique id determined.    |

## <a name="methods"></a> Methods

### <a name="methods.requestLoginCode"></a> requestLoginCode( data[, callback] )

```javascript
hone.requestLoginCode( data[, callback] )
```

Requests a login code via email:

```javascript
hone.requestLoginCode( {
    email: email
} );
```

or via phone number:

```javascript
hone.requestLoginCode( {
    phone: phone
} );
```

A 6-digit login code will be sent to their email address or by text message to their phone.

You can provide a callback for error handling or to be notified once the code has successfully sent.

### <a name="methods.login"></a> login( data[, callback] )

```javascript
hone.login( data[, callback] )
```

Logs into Hone using:

email:

```javascript
hone.login( {
    email: email
    code: code // entered by the user after requestLoginCode has sent them a code
} );
```

phone:

```javascript
hone.login( {
    phone: phone,
    code: code // entered by the user after requestLoginCode has sent them a code
} );
```

### <a name="methods.logout"></a> logout( [callback] )

```javascript
hone.logout( [callback] )
```

Logs the current user out of Hone.

### <a name="methods.getUser"></a> getUser( callback[, force] )

```javascript
hone.getUser( callback[, force] )
```

Gets the currently logged in user. If 'force' is true, will force a server round-trip to refresh the current user. Eg:

```javascript
hone.getUser( function( error, user ) {
    if ( error ) {
        console.error( error );
        return;
    }
    
    if ( !user ) {
        console.log( 'No user is currently logged in.' );
        return;
    }
    
    console.log( 'Forced a round-trip to get the authoritative user: ' + user );
}, true );
```

### <a name="methods.updateUser"></a> updateUser( data[, callback] )

```javascript
hone.updateUser( data[, callback] )
```

Updates the current user with the given data. Eg:

```javascript
hone.updateUser( {
    nickname: 'foo',
    phone: '123-456-7890'
}, function( error ) {
    if ( error ) {
        console.log( 'Error updating user: ' + error );
        return;
    }
} );
```

## <a name="events"></a> Events

### <a name="events.signup"></a> auth.signup

Emitted when a user signs up.

```javascript
hone.on( 'auth.signup', function( event ) {
    console.log( 'User signed up: ' + event.user );
} );
```

### <a name="events.login"></a> auth.login

Emitted when a user logs in.

```javascript
hone.on( 'auth.login', function( event ) {
    console.log( 'User logged in: ' + event.user );
} );
```

### <a name="events.logout"></a> auth.logout

Emitted when a user logs out.

```javascript
hone.on( 'auth.logout', function() {
    console.log( 'User logged out.' );
} );
```

### <a name="events.user_updated"></a> auth.user_updated

Emitted when a user's profile data is updated.

```javascript
hone.on( 'auth.user_updated', function( event ) {
    // event.old is the previous settings for this user
    console.log( 'User updated: ' + event.user );
} );
```

### <a name="events.identified"></a> auth.identified

Emitted when a user has a unique id determined.

```javascript
hone.on( 'auth.identified', function( event ) {
    console.log( 'Unique id: ' + event.id );
} );
```
