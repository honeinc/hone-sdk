# DataStore

## <a name="methods-overview"></a> Methods Overview

| method                                        | signature                          | short description                                                   |
| :-------------------------------------------- | :--------------------------------- | :------------------------------------------------------------------ |
| [get](#methods.get)                           | get( type, id, callback[, force] ) | Gets the object of the given type and id.                           |
| [*object*.save](#methods.save)                | *object*.save( [callback] )        | Saves the given object to the server.                               |

## <a name="events-overview"></a> Events Overview

| event                                | short description                                      |
| :----------------------------------- | :----------------------------------------------------- |
| [get](#events.get)                   | Emitted when an object is fetched from the server.     |
| [save](#events.save)                 | Emitted when an object is saved to the server.         |

## <a name="methods"></a> Methods

### <a name="methods.get"></a> get( type, id, callback[, force] )

```javascript
hone.get( type, id, callback[, force] )
```

Gets the object specified by type and id from the server. If the optional 'force' parameter is set to true, this will force a get from the server, bypassing the cache.

Example:

```javascript
hone.get( 'Quiz', '543d7522b9a138627fcc12c9', function( error, quiz ) {
    if ( error ) {
        console.error( error );
        return;
    }
    
    console.log( quiz.title );
} );
```

### <a name="methods.save"></a> *object*.save( [callback] )

```javascript
*object*.save( [callback] )
```

When an object is fetched from the server, we add the method 'save' to it. You can make changes to the object and when you're ready, call this method on the object to persist those changes to the server.

Example:

```javascript
hone.get( 'Quiz', '543d7522b9a138627fcc12c9', function( error, quiz ) {
    if ( error ) {
        console.error( error );
        return;
    }

    console.log( quiz.title ); // emits: blah

    quiz.title = 'foo';

    console.log( quiz.title ); // emits: foo

    quiz.save( function( error ) {
        if ( error ) {
            console.error( error );
            return;
        }

        console.log( quiz.title ); // emits: foo, but now it's saved to the server as well
    } );
} );
```

## <a name="events"></a> Events

### <a name="events.get"></a> datastore.get

Emitted when an object is fetched from the server.

```javascript
hone.on( 'datastore.get', function( event ) {
    console.log( 'Fetched object of type "' + event.type + '" with id "' + event.id + '": ' + event.obj );
} );
```

### <a name="events.save"></a> datastore.save

Emitted when an object is persisted to the server.

```javascript
hone.on( 'datastore.save', function( event ) {
    console.log( 'Saved object of type "' + event.type + '" with id "' + event.id + '": ' + event.obj );
    console.log( 'Applied changes: ' + event.changes );
} );
```
