'use strict';

var test = require( 'tape' ),
    DataStore = require( '../src/datastore' );

test( 'testing DataStore constructor', function( t ) {
    var datastore = new DataStore({});
    t.equals( typeof datastore, 'object', 'datastore instatiates' );
    t.end();
} );

test( 'testing DataStore Public API exists', function( t ) {
    var datastore = new DataStore({});
    t.equals( typeof datastore.create, 'function', 'datastore.create is a function' );
    t.equals( typeof datastore.get, 'function', 'datastore.get is a function' );
    t.equals( typeof datastore.load, 'function', 'datastore.load is a function' );
    t.end();
} );

test( 'testing DataStore Private API exists', function( t ) {
    var datastore = new DataStore({});
    t.equals( typeof datastore._save, 'function', 'datastore._save is a function' );
    t.equals( typeof datastore._cacheObject, 'function', 'datastore._cacheObject is a function' );
    t.equals( typeof datastore._decorateObject, 'function', 'datastore._decorateObject is a function' );
    t.end();
} );

test( 'testing DataStore._cacheObject', function( t ) {
    var datastore = new DataStore({}),
        objReadOnly = { _id: 'foo' },
        obj = { _id: 'foo' },
        key = 'bar:foo';
    
    datastore._cacheObject( key, obj, objReadOnly );
    
    t.deepEquals( datastore.readCache[ key ], objReadOnly, 'datastore._cacheObject will add a copy of the read-only object to its read-only cache' );
    t.notEquals( datastore.readCache[ key ], objReadOnly, 'datastore._cacheObject does not store the read-only object directly in its read-only cache' );

    t.deepEquals( datastore.cache[ key ], obj, 'datastore._cacheObject will store the object in its cache' );
    t.equals( datastore.cache[ key ], obj, 'datastore._cacheObject will store the same reference to the object into its cache' );
    
    obj.bar = 'baz';
    
    t.equals( obj.bar, 'baz', 'the object can be changed' );
    t.equals( datastore.cache[ key ].bar, 'baz', 'the cache reflects the change' );
    t.equals( typeof datastore.readCache[ key ].bar, 'undefined', 'the read-only cache is untouched' );

    delete datastore.cache[ key ];
    delete datastore.readCache[ key ];
    delete obj.bar;
    
    t.deepEquals( obj, objReadOnly, 'objects reset properly' );
    
    datastore._cacheObject( key, obj );
    
    t.deepEquals( datastore.readCache[ key ], obj, 'datastore._cacheObject will add a copy of the object to its read-only cache' );
    t.notEquals( datastore.readCache[ key ], obj, 'datastore._cacheObject does not store the object directly in its read-only cache' );

    obj.bar = 'baz';

    t.equals( typeof datastore.readCache[ key ].bar, 'undefined', 'without passing a read-only object, the read-only cache is still untouched' );

    t.end();
} );

test( 'testing DataStore._decorateObject', function( t ) {
    var datastore = new DataStore({}),
        obj = { _id: 'foo' },
        key = 'bar:foo';
    
    datastore._decorateObject( obj, 'bar', key );
    
    t.equals( obj.__type, 'bar', 'datastore._decorateObject will add an appropriate __type property to the object' );
    t.equals( obj.__key, key, 'datastore._decorateObject will add an appropriate __key property to the object' );
    t.equals( typeof obj.save, 'function', 'datastore._decorateObject will add a method named save to the object' );
    t.end();
} );

test( 'testing DataStore.load', function( t ) {
    var datastore = new DataStore({}),
        model = { _id: 'foo' };
    datastore.load( 'bar', model );
    t.equals( typeof model.save, 'function', 'data.load will add a method named save to the object passed to it in the second argument.' );
    t.equals( model.__key, 'bar:foo', 'data.load will add a __key property to the object passed to it in the second argument. This key is made of the type being joined with the _id property and split by a colon' );
    t.equals( model.__type, 'bar', 'data.load will add a __type property to the object passed to it in the first agument with the first argument or type' );
    t.end();
} );

