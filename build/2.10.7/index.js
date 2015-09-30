'use strict';

var ajaja = require( 'ajaja' );
var antisync = {
    parallel: require( 'antisync/parallel' )
};
var Delver = require( 'delver' );
var EventEmitter = require( 'eventemitter2' ).EventEmitter2;
var EventBus = require( 'browser-event-bus' );
var extend = require( 'extend' );
var XDLS = require( 'xdls' );

var Auth = require( './src/auth' );
var DataStore = require( './src/datastore' );
var Id = require( './src/id' );
var IFrameSizer = require( './src/iframesizer' );
var Mongo = require( './src/mongo' );
var objectFactory = require( './src/objectfactory' );
var Preferences = require( './src/preferences' );
var Registration = require( './src/registration' );
var State = require( './src/state' ).State;
var Teams = require( './src/teams' );

module.exports = Hone;

var _defaults = {
    domain: 'gohone.com:80',
    xdls: {
        origin: 'https://gohone.com',
        path: '/xdls.html'
    },
    init: true
};

function Hone( options ) {
    var self = this;
    EventEmitter.call( self );

    self.options = extend( true, {}, _defaults, options );

    self.api = null;
    self.state = new State( {} );
    self.mongo = Mongo;

    self.eventBus = new EventBus( {
        namespace: 'Hone'
    } );

    self.xdls = new XDLS( self.options.xdls );
    self.xdls.init(); // pre-init the iframe, etc.

    self.id = new Id( self );
    self._multiplexEmit( self.id, 'id' );

    self.registration = new Registration( self );
    self._multiplexEmit( self.registration, 'registration' );
    self._multiplexBind( self.registration, [ 'register', 'unregister', 'getPerson' ] );

    self.auth = new Auth( self );
    self._multiplexEmit( self.auth, 'auth' );
    self._multiplexBind( self.auth, [ 'getUser', 'login', 'logout', 'signup', 'requestLoginCode', 'updateUser' ] );

    self.preferences = new Preferences( self );
    self._multiplexEmit( self.preferences, 'preferences' );

    self.objectFactory = objectFactory;
    
    self.datastore = new DataStore( self );
    self._multiplexEmit( self.datastore, 'datastore' );
    self._multiplexBind( self.datastore, [ 'create', 'get', 'load' ] );

    self.teams = new Teams( self );

    self._iframeSizer = new IFrameSizer( self.eventBus );

    if ( self.options.init ) {
        // we wait a tick to give them an opportunity to bind events
        setTimeout( self.init.bind( self ), 0 );
    }

    return self;
}

Hone.prototype = Object.create( EventEmitter.prototype, {} );

Hone.prototype.init = function( callback ) {
    var self = this;

    // these should tolerate being called in parallel, since the auth module can listen for api_loaded if necessary
    antisync.parallel( [
        self.auth.getUser.bind( self.auth ),
        self._getAPI.bind( self )
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

Hone.prototype._multiplexBind = function( target, methods, namespace ) {
    var self = this;
    var selfTarget = self;

    if ( namespace ) {
        selfTarget = Delver.get( self, namespace );
        if ( !selfTarget ) {
            selfTarget = {};
            Delver.set( self, namespace, selfTarget );
        }
    }

    methods.forEach( function( method ) {
        var targetFunction = target[ method ];
        if ( typeof targetFunction !== 'function' ) {
            throw new Error( 'Invalid method on target (' + ( target.constructor ? target.constructor.name : 'unknown' ) + '): ' + method );
        }

        selfTarget[ method ] = targetFunction.bind( target );
    } );
};

Hone.prototype._multiplexEmit = function( emitter, namespace ) {
    var self = this;

    // we bind a basic error handler to avoid unhandled exceptions
    // window.console.error.bind( window.console ) <-- can't do this in IE :(
    emitter.on( 'error', function( error ) {
        window.console.error( error );
    } );

    // we re-emit events as a convenience
    var originalEmit = emitter.emit;
    emitter.emit = function() {
        originalEmit.apply( emitter, arguments );

        var args = arguments;
        if ( namespace ) {
            args = Array.prototype.slice.call( arguments, 0 );
            var eventName = args.shift();
            eventName = namespace + '.' + eventName;
            args.unshift( eventName );
        }

        self.emit.apply( self, args );
    };
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

if ( !( 'hone' in window ) ) {
    window.hone = new Hone();
}
