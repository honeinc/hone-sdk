# DataStore

## <a name="methods-overview"></a> Methods Overview

| method                                        | signature                   | short description                                                   |
| :-------------------------------------------- | :-------------------------- | :------------------------------------------------------------------ |
| [create](#methods.create)                     | create( options, callback ) | Creates a new object based on specified options.                    |
| [get](#methods.get)                           | get( options, callback )    | Gets object(s) based on specified options.                          |
| [load](#methods.load)                         | load( type, object )        | Given an object, loads it into the SDK, caching/decorating it.      |
| [*object*.save](#methods.save)                | *object*.save( [callback] ) | Saves the given object to the server.                               |

## <a name="events-overview"></a> Events Overview

| event                                | short description                                      |
| :----------------------------------- | :----------------------------------------------------- |
| [create](#events.create)             | Emitted when an object is created.                     |
| [get](#events.get)                   | Emitted when an object is fetched from the server.     |
| [save](#events.save)                 | Emitted when an object is saved to the server.         |

## <a name="methods"></a> Methods

### <a name="methods.create"></a> create( options, callback )

```javascript
hone.create( options, callback )
```

Creates an object based on the options specified.

| option          | description                                                                  | default value |
| :-------------- | :--------------------------------------------------------------------------- | :------------ |
| type (string)   | Specifies the type of object to retrieve.                                    |               |
| data (object)   | Specifies any initial data to send along with the create request.            |               |
| save (boolean)  | Specifies if the object should be saved to the server.                       | false         |
| cache (boolean) | Specifies if the object should be put into the local cache.                  | true          |
| decorate (boolean) | Specified is the object should be decorated, including the save() method. | true          |

Example:

```javascript
hone.create( {
    type: 'Quiz',
    data: {
        title: 'foo'
    },
    save: true // save it to the server right away
}, function( error, quiz ) {
    if ( error ) {
        console.error( error );
        return;
    }

    console.log( quiz._id ); // prints the id of the newly-created quiz
} );
```

### <a name="methods.get"></a> get( options, callback )

```javascript
hone.get( options, callback )
```

Gets object(s) based on the options specified.

| option          | description                                                           |
| :-------------- | :-------------------------------------------------------------------- |
| type (string)   | Specifies the type of object to retrieve.                             |
| id (string)     | Specifies a single id to retrieve.                                    |
| query (object)  | Specified a query to search against, will return an array of results. |
| force (boolean) | Ignores the cache.                                                    |

Example, fetching a single object:

```javascript
hone.get( {
    type: 'Quiz',
    id: '543d7522b9a138627fcc12c9'
}, function( error, quiz ) {
    if ( error ) {
        console.error( error );
        return;
    }
    
    console.log( quiz.title );
} );
```

Or, you can search for items using a query, eg:

```javascript
hone.get( {
    type: 'Quiz',
    query: {
        title: 'foo'
    }
}, function( error, quizzes ) {
    if ( error ) {
        console.error( error );
        return;
    }

    console.log( 'Found ' + quizzes.length + ' quizzes with a title of "foo".' );
} );
```

.get supports MongoDB-style queries, eg:

```javascript
hone.get( {
    type: 'Quiz',
    query: { 
        title: /foo.*/ig,
        updatedAt: {
            $gte: "2014-11-20T11:22:01.142Z"
        }
    }
}, function( error, quizzes ) {
    if ( error ) {
        console.error( error );
        return;
    }

    console.log( 'Found ' + quizzes.length + ' quizzes with a title of "foo.*" and updated since "2014-11-20T11:22:01.142Z".' );
} );
```

Individual elements of a fetched results array can also use the save() method as described below, eg:

```javascript
hone.get( {
    type: 'Quiz',
    query: { 
        title: /foo.*/ig,
        updatedAt: {
            $gte: "2014-11-20T11:22:01.142Z"
        }
    }
}, function( error, quizzes ) {
    if ( error ) {
        console.error( error );
        return;
    }

    quizzes.forEach( function( quiz ) {
        quiz.tags.push( 'foo' );
        quiz.save();
    } );
} );
```

### <a name="methods.load"></a> load( type, object )

```javascript
var foo = {
    _id: '[...]',
    bar: 'baz'
};
hone.load( 'ExampleType', foo );
```

Calling load() with a type on an object will:

1) Load the object into the SDK's internal cache.
2) Decorate the object with the SDK's [save method](#methods.save).

> Note: This is an advanced method, and should only be used in certain specific cases.
> For example, if you were to send a JSON-encoded object down with the HTML response
> to an initial page load request, this method can be used to load the resulting object
> into the SDK's cache and give the object the necessary save() method.

| option          | description                                                           |
| :-------------- | :-------------------------------------------------------------------- |
| type (string)   | Specifies the type of object that is being loaded into the cache.     |
| object (object) | The object to be loaded into the cache/decorated.                     |

### <a name="methods.save"></a> *object*.save( [callback] )

```javascript
*object*.save( [callback] )
```

When an object is fetched from the server, we add the method 'save' to it. You can make changes to the object and when you're ready, call this method on the object to persist those changes to the server.

Example:

```javascript
hone.get( {
    type: 'Quiz',
    id: '543d7522b9a138627fcc12c9'
}, function( error, quiz ) {
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

### <a name="events.create"></a> datastore.create

Emitted when an object is created.

```javascript
hone.on( 'datastore.create', function( event ) {
    console.log( 'Created object of type "' + event.type + '" with id "' + event.result._id + '": ' + event.result );
} );
```

### <a name="events.get"></a> datastore.get

Emitted when an object is fetched from the server.

```javascript
hone.on( 'datastore.get', function( event ) {
    console.log( 'Fetched object of type "' + event.type + '" with id "' + event.id + '": ' + event.result );
} );
```

### <a name="events.save"></a> datastore.save

Emitted when an object is persisted to the server.

```javascript
hone.on( 'datastore.save', function( event ) {
    console.log( 'Saved object of type "' + event.type + '" with id "' + event.id + '": ' + event.result );
    console.log( 'Applied changes: ' + event.changes );
} );
// or
hone.on( 'datastore.change', function( event ) { /*..*/ } );
hone.on( 'datastore.change.{type}', function( event ) { /*..*/ } ); // all type changes
hone.on( 'datastore.change.{type}.{id}', function( event ) { /*..*/ } ); // single resource changes
```


