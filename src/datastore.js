'use strict';

var ajaja = require( 'ajaja' );
var Emitter = require( 'events' ).EventEmitter;
var extend = require( 'extend' );
var diff = require( 'deep-diff' ).diff;
var util = require( 'util' );

module.exports = DataStore;

function DataStore( hone ) {
    var self = this;
    Emitter.call( self );

    self.hone = hone;
    self.cache = {};
    self.readCache = {};
}
util.inherits( DataStore, Emitter );

function noop() {}

DataStore.prototype.get = function( type, id, callback, force ) {
    var self = this;

    var key = type + ':' + id;
    if ( !force && self.cache[ key ] ) {
        self.emit( 'get', {
            type: type,
            id: id,
            obj: self.cache[ key ]
        } );

        callback( null, self.cache[ key ] );
        return;
    }
    
    ajaja( {
        method: 'GET',
        url: self.hone.url( '/api/2.0/store/' + type + '/' + id )
    }, function( error, obj ) {
        if ( error ) {
            callback( error );
            return;
        }

        self.readCache[ key ] = extend( true, {}, obj );
    
        self._decorateObject( obj, type, key );
        self.cache[ key ] = obj;

        self.emit( 'get', {
            type: type,
            id: id,
            obj: obj
        } );
        
        callback( null, obj );
    } );
};

DataStore.prototype._decorateObject = function( obj, type, key ) {
    var self = this;
    obj.__type = type;
    obj.__key = key;
    obj.save = self.save.bind( self, obj );
};

DataStore.prototype.save = function( obj, callback ) {
    var self = this;
    
    callback = callback || noop;
    
    var type = obj.__type;
    var id = obj._id;
    var key = obj.__key;

    delete obj.__type;
    delete obj.__key;
    delete obj.save;

    var base = self.readCache[ key ];
    var changes = diff( base, obj );
    
    if ( !changes ) {
        self._decorateObject( obj, type, key );
        callback( null, obj );
        return;
    }
    
    ajaja( {
        method: 'PUT',
        url: self.hone.url( '/api/2.0/store/' + type + '/' + id ),
        data: changes
    }, function( error, _obj ) {
        if ( error ) {
            callback( error );
            return;
        }

        self.readCache[ key ] = extend( true, {}, _obj );

        extend( obj, _obj );
        self._decorateObject( obj, type, key );
        self.cache[ key ] = obj;

        self.emit( 'save', {
            type: type,
            id: id,
            obj: obj,
            changes: changes
        } );
        
        callback( null, obj );
    } );
};