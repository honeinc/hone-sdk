
var test = require( 'tape' ),
    DataStore = require( '../src/datastore' );

// should probably test the contructor function first

test( 'testing DataStore.load', function( t ) {
    var datastore = new DataStore({}),
        model = { _id: 'foo' };
    t.equals( typeof datastore.load, 'function', 'datastore.load is a function' );
    datastore.load( 'bar', model );
    t.equals( typeof model.save, 'function', 'data.load will add a method named save to the object passed to it in the second argument.' );
    t.equals( model.__key, 'bar:foo', 'data.load will add a __key property to the object passed to it in the second argument. This key is made of the type being joined with the _id property and split by a colon' );
    t.equals( model.__type, 'bar', 'data.load will add a __type property to the object passed to it in the first agument with the first argument or type' );
    t.end();
} );
