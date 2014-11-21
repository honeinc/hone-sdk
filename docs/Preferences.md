# Preferences

## <a name="methods-overview"></a> Methods Overview

| method                    | signature                | short description                                      |
| :------------------------ | :----------------------- | :----------------------------------------------------- |
| [get](#methods.get)       | get( key[, default] )    | Gets the given key from the user's preferences.        |
| [set](#methods.set)       | set( key, value )        | Sets the given key to value in the user's preferences. |
| [update](#methods.update) | update( data, callback ) | Updates the user's preferences given an object.        |

## <a name="events-overview"></a> Events Overview

| event                      | short description                                      |
| :------------------------- | :----------------------------------------------------- |
| [loaded](#events.loaded)   | Emitted when the user's preferences have been loaded.  |
| [updated](#events.updated) | Emitted when the user's preferences have been updated. |

## <a name="methods"></a> Methods

### <a name="methods.get"></a> get( key[, default] )

```javascript
hone.preferences.get( key[, default] )
```

Returns the given key from the user's preferences. You can optionally specify a default value to be returned if the key is not found.

### <a name="methods.set"></a> set( key, value )

```javascript
hone.preferences.set( key, value )
```

Sets the given key in the user's preferences. This method will also immediately attempt to persist the setting to the server.

### <a name="methods.update"></a> update( data, callback )

```javascript
hone.preferences.update( data, callback )
```

Makes the changes specified in *data* to the user's preferences. Eg:

```javascript
hone.preferences.update( {
    foo: 'bar',
    blah: {
        baz: 'yak'
    }
}, function( error ) {
    if ( error ) {
        console.error( error );
    }
} );
```

## <a name="events"></a> Events

### <a name="events.loaded"></a> preferences.loaded

Emitted when the user's preferences have been loaded from the server. Eg:

```javascript
hone.on( 'preferences.loaded', function() {} );
```

or

```javascript
hone.preferences.on( 'loaded', function() {} );
```

### <a name="events.updated"></a> preferences.updated

Emitted when the user's preferences have been updated. Eg:

```javascript
hone.on( 'preferences.update', function() {} );
```

or

```javascript
hone.preferences.on( 'updated', function() {} );
```