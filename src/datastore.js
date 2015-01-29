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

DataStore.prototype.create = function( opts, callback ) {
    var self = this;

    ajaja( {
        method: 'POST',
        url: self.hone.url( '/api/2.0/store/' + opts.type ),
        data: opts.data
    }, function( error, result ) {
        if ( error ) {
            callback( error );
            return;
        }

        var key = opts.type + ':' + result._id;
        self.readCache[ key ] = extend( true, {}, result );
        self._decorateObject( result, opts.type, key );
        self.cache[ key ] = result;

        self.emit( 'create', {
            type: opts.type,
            id: result._id,
            result: result
        } );

        callback( null, result );
    } );
};

DataStore.prototype.get = function( opts, callback ) {
    var self = this;

    if ( ( opts.id && opts.query ) || !( opts.id || opts.query ) ) {
        callback( {
            error: 'invalid query',
            message: 'You must specify either an id or a query.'
        } );
        return;
    }
    
    var key = null;
    if ( opts.id ) {
        key = opts.type + ':' + opts.id;
        if ( !opts.force && self.cache[ key ] ) {
            self.emit( 'get', {
                type: opts.type,
                id: opts.id,
                result: self.cache[ key ]
            } );

            callback( null, self.cache[ key ] );
            return;
        }
    }

    var fetchOptions = {
        method: 'GET',
        url: self.hone.url( '/api/2.0/store/' + opts.type ) + ( opts.id ? ( '/' + opts.id ) : '' )
    };
    
    if ( opts.query ) {
        var prevToJSON = RegExp.prototype.toJSON;
        RegExp.prototype.toJSON = function() {
            return '!!RE:' + this.toString();
        };
        
        fetchOptions.data = {
            query: JSON.stringify( opts.query )
        };
        
        RegExp.prototype.toJSON = prevToJSON;
    }

    ajaja( fetchOptions, function( error, result ) {
        if ( error ) {
            callback( error );
            return;
        }

        if ( opts.id ) {
            self.readCache[ key ] = extend( true, {}, result );
            self._decorateObject( result, opts.type, key );
            self.cache[ key ] = result;
        }
        else {
            if ( Array.isArray( result ) ) {
                for( var i = 0; i < result.length; ++i ) {
                    var obj = result[ i ];
                    var objKey = opts.type + ':' + obj._id;
                    self.readCache[ objKey ] = extend( true, {}, obj );
                    self._decorateObject( obj, opts.type, objKey );
                    self.cache[ objKey ] = obj;
                }
            }
        }

        self.emit( 'get', {
            type: opts.type,
            id: opts.id,
            query: opts.query,
            result: result
        } );

        callback( null, result );
    } );
};

DataStore.prototype.load = function( type, obj ) {
    this._decorateObject( obj, type, type + ':' + obj._id );
    return obj;
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
            self._decorateObject( obj, type, key );
            callback( error );
            return;
        }

        self.readCache[ key ] = extend( true, {}, _obj );

        extend( obj, _obj );
        self._decorateObject( obj, type, key );
        self.cache[ key ] = obj;

        var changeObj = {
            type: type,
            id: id,
            result: obj,
            changes: changes
        };

        self.emit( 'save', changeObj );
        self.emit( 'change', changeObj );
        self.emit( 'change.' + type, changeObj );
        self.emit( 'change.' + type + '.' + id, changeObj );
        
        callback( null, obj );
    } );
};
