'use strict';

var ajaja = require( 'ajaja' );
var async = require( 'async' );
var Emitter = require( 'events' ).EventEmitter;
var extend = require( 'extend' );
var util = require( 'util' );

var Auth = require( './src/auth' );

module.exports = Hone;

var _defaults = {
    domain: 'gohone.com:80',
    localstoragePrefix: '__hone__',
    init: true
};

function Hone( options ) {
    var self = this;
    Emitter.call( self );
    
    self.options = extend( true, {}, _defaults, options );
    
    self.api = null;
    self.auth = null;
    
    if ( self.options.init ) {
        // we wait a tick to give them an opportunity to bind events
        setTimeout( self.init.bind( self ), 0 );
    }

    return self;
}

util.inherits( Hone, Emitter );

Hone.prototype.init = function( callback ) {
    var self = this;
    
    async.series( [
        self._getAPI.bind( self ),
        self._setupAuth.bind( self )
    ], function( error ) {
        if ( error ) {
            self.emit( 'error', error );
        }
        
        if ( callback ) {
            callback( error );
        }
    } );
};

Hone.prototype.url = function( path ) {
    return '//' + this.options.domain + path;
};

Hone.prototype._setupAuth = function( callback ) {
    var self = this;
    
    self.auth = new Auth( self );
    // replicate auth events
    var authEmit = self.auth.emit;
    self.auth.emit = function() {
        authEmit.apply( self.auth, arguments );
        self.emit.apply( self, arguments );
    };

    self.auth.getUser( callback );
};

Hone.prototype._getAPI = function( callback ) {
    var self = this;
    ajaja( {
        method: 'GET',
        url: '//' + self.options.domain + '/api/1.0'
    }, function( error, api ) {
        self.api = error ? null : api;

        if ( self.api ) {
            self.emit( 'api_loaded', self.api );
        }
        
        callback( error );
    } );
};
