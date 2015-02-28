'use strict';

var ajaja = require( 'ajaja' );
var async = require( 'async' );
var Emitter = require( 'events' ).EventEmitter;
var extend = require( 'extend' );
var diff = require( 'deep-diff' ).diff;
var util = require( 'util' );

var objectFactory = require( './objectfactory' );

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

DataStore.prototype._cacheObject = function( key, obj, readonlyObj ) {
    var self = this;
    self.readCache[ key ] = extend( true, {}, ( typeof( readonlyObj ) !== 'undefined' ? readonlyObj : obj ) );
    self.cache[ key ] = obj;
};

DataStore.prototype._decorateObject = function( obj, type, key ) {
    var self = this;
    obj.__type = type;
    obj.__key = key;
    obj.save = self._save.bind( self, obj );
    obj.delete = self._delete.bind( self, obj );
    obj.bare = self._bare.bind( self, obj );
};

DataStore.prototype.create = function( opts, callback ) {
    var self = this;

    var obj = objectFactory.create( opts.type.toLowerCase() );
    extend( obj, opts.data );
    
    var key = opts.type + ':' + obj._id;
    self._cacheObject( key, obj, {} ); // pass an empty read-only object, since we started from nothing here
    self._decorateObject( obj, opts.type, key );

    async.series( [
        function( next ) {
            if ( !opts.save ) {
                next();
                return;
            }

            ajaja( {
                method: 'POST',
                url: self.hone.url( '/api/2.0/store/' + opts.type ),
                data: opts.data
            }, function( error, _obj ) {
                if ( error ) {
                    next( error );
                    return;
                }

                var key = opts.type + ':' + _obj._id;
                self._cacheObject( key, _obj );
                self._decorateObject( _obj, opts.type, key );
                obj = _obj;
                next();
            } );            
        }
    ], function( error ) {
        if ( error ) {
            callback( error, obj );
            return;
        }

        callback( null, obj );

        self.emit( 'create', {
            type: opts.type,
            id: obj._id,
            obj: obj
        } );
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
            self._cacheObject( key, result );
            self._decorateObject( result, opts.type, key );
        }
        else {
            if ( Array.isArray( result ) ) {
                for( var i = 0; i < result.length; ++i ) {
                    var obj = result[ i ];
                    var objKey = opts.type + ':' + obj._id;
                    self._cacheObject( objKey, obj );
                    self._decorateObject( obj, opts.type, objKey );
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
    var self = this;

    var key = type + ':' + obj._id;

    self._cacheObject( key, obj );
    self._decorateObject( obj, type, key );
    return obj;
};

DataStore.prototype._save = function( obj, callback ) {
    var self = this;
    
    callback = callback || noop;
    
    var key = obj.__type + ':' + obj._id;
    var base = self.readCache[ key ];
    var bare = obj.bare();
    var changes = diff( base, bare );
    
    if ( !changes ) {
        callback( null, obj );
        return;
    }
    
    ajaja( {
        method: 'PUT',
        url: self.hone.url( '/api/2.0/store/' + obj.__type + '/' + obj._id ),
        data: changes
    }, function( error, _obj ) {
        if ( error ) {
            callback( error );
            return;
        }

        self._cacheObject( key, obj, _obj );
        extend( obj, _obj );

        var changeObj = {
            type: obj.__type,
            id: obj._id,
            result: obj,
            changes: changes
        };

        self.emit( 'save', changeObj );
        self.emit( 'change', changeObj );
        self.emit( 'change.' + obj.__type, changeObj );
        self.emit( 'change.' + obj.__type + '.' + obj._id, changeObj );
        
        callback( null, obj );
    } );
};

DataStore.prototype._delete = function( obj, callback ) {
    var self = this;

    callback = callback || noop;

    var type = obj.__type;
    var id = obj._id;
    var key = obj.__key;

    ajaja( {
        method: 'DELETE',
        url: self.hone.url( '/api/2.0/store/' + type + '/' + id )
    }, function( error ) {
        if ( error ) {
            self._decorateObject( obj, type, key );
            callback( error );
            return;
        }

        delete self.readCache[ key ];
        delete self.cache[ key ];
        
        var event = {
            type: type,
            id: id            
        };

        self.emit( 'delete', event );

        callback();
    } );
};

DataStore.prototype._bare = function( obj ) {
    var bare = extend( true, {}, obj );
    delete bare.__type;
    delete bare.__key;
    delete bare.save;
    delete bare.delete;
    delete bare.bare;

    return bare;    
};