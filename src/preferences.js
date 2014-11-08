'use strict';

var ajaja = require( 'ajaja' );
var Emitter = require( 'events' ).EventEmitter;
var util = require( 'util' );

module.exports = Preferences;

function Preferences( hone ) {
    var self = this;
    Emitter.call( self );

    self.hone = hone;
    
    self.hone.on( 'auth.login', self.onLogin.bind( self ) );
    self.hone.on( 'auth.logout', self.onLogout.bind( self ) );
}
util.inherits( Preferences, Emitter );

Preferences.prototype.onLogin = function( event ) {
    var self = this;
    
    ajaja( {
        url: self.hone.url( self.hone.api.preferences.prefs.replace( '{{userid}}', event.user._id ) ),
        method: 'GET'
    }, function( error, preferences ) {
        if ( error ) {
            self.emit( 'error', error );
            return;
        }
        
        self.preferences = preferences;
        if ( !self.preferences.data ) {
            self.preferences.data = {};
        }
        
        self.emit( 'loaded', {
            preferences: preferences
        } );
    } );
};

Preferences.prototype.onLogout = function() {
    var self = this;
    
    self.preferences = null;
    
    self.emit( 'unloaded', {} );    
};