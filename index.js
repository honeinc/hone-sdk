/* global top, self, Emitter, onPostEmitterReady */
'use strict';

var supported = ( 'postMessage' in window ) && 
        ( 'bind' in function(){} ) &&
        ( 'JSON' in window ),
    isComponent = ( 'module' in window ) && 
        ( 'require' in window ), 
    isIframe = (top !== self),
    _Emitter;

if ( isComponent ) {
    _Emitter = require('emitter');
} else {
    _Emitter = Emitter;
}

/*
 * Constructor sets up some simple listeners and
 * gets the element.
 */

function PostEmitter( options ) {
    if ( !supported ) {
        // for now
        return;
    }

    // setting basic vars
    this.isIframe = isIframe;
    this.options = options || {};
    this._emitter = new _Emitter( );
    this.el = (isIframe) ? null : this.getFrame( this.options.id );
    this.prefix = new RegExp( '^' + this.options.prefix );
    this.setOrigin( this.options.origin );
    this.addListener();
}

/*
 * Selects a iframe based off the id passed to it
 */

PostEmitter.prototype.getFrame = function ( id ) {
    return document.getElementById( id );
};

PostEmitter.prototype.on = function( ) {
    this._emitter.on.apply( this._emitter, arguments );    
};

PostEmitter.prototype.emit = function( ) {

    // splits the arguments into a nice array
    var args = Array.prototype.slice.call(arguments, 0),
        event = this.serialize( args );

    // emit to the correct location
    if ( this.isIframe ) {
        console.log( this._origin );
        return window.parent.postMessage( event, this._origin );
    }
    this.el.contentWindow.postMessage( event, this._origin );
};

PostEmitter.prototype.setOrigin = function ( origin ) {
    if ( !origin ){
        this._origin = '*';
        return;
    }
    this._origin = origin;
};

PostEmitter.prototype.onMessage = function ( e ) {
    var msg;
 
    msg = this.deserialize( e.data );
    if ( !msg ) return;
    if ( typeof msg === 'object', Array.isArray( msg ) ) {
        // assumes that the format is an array
        this._emitter.emit.apply( this._emitter, msg );
    }
};

PostEmitter.prototype.deserialize = function ( msg ) {
    // return if it doesnt have a good prefix
    if ( !this.prefix.test( msg ) ) return;
    var json = msg.replace( this.prefix, '');
    try {
        json = JSON.parse( json );
    } catch ( e ) {
        return this.emit('error', e );
    }
    if ( typeof json === 'object' ) return json;
};

PostEmitter.prototype.serialize = function ( msg ) {
    return this.options.prefix + JSON.stringify(msg);
};

PostEmitter.prototype.addListener = function ( ) {
    window.addEventListener('message', this.onMessage.bind( this ), false );
};

if ( isComponent ) {
    module.exports = PostEmitter;
}

if( typeof onPostEmitterReady === 'function' ) {
    return onPostEmitterReady( PostEmitter );
}