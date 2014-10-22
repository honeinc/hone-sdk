'use strict';

var ajaja = require( 'ajaja' );
var Emitter = require( 'events' ).EventEmitter;
var diff = require( 'deep-diff' ).diff;
var localforage = require( 'localforage' );
var util = require( 'util' );

var state = require( './state' );

module.exports = Auth;

function Auth( hone ) {
    var self = this;
    Emitter.call( self );
    
    self.hone = hone;
}

util.inherits( Auth, Emitter );

Auth.prototype.getUser = function( callback ) {
    var self = this;

    var loginEmitted = false;
    
    localforage.getItem( self.hone.options.localstoragePrefix + '.user', function( error, user ) {
        if ( error ) {
            return; // we don't care if this errors, it's not authoritative
        }

        if ( user && !loginEmitted ) {
            state.set( 'user', user );
            self.emit( 'login', {
                user: user
            } );
            loginEmitted = true;
        }
    } );

    ajaja( {
        method: 'GET',
        url: self.hone.url( self.hone.api.users.me ),
        headers: {
            'hone-authtoken': state.get( 'authtoken' )
        }
    }, function( error, user ) {
        if ( error && error.code != 400 ) {
            callback( error );
            return;
        }

        var existingUser = state.get( 'user' );
        if ( !existingUser || ( existingUser && !user ) || diff( existingUser, user ) ) {
            if ( existingUser ) {
                self.emit( 'logout', {
                    user: existingUser
                } );
            }

            if ( user ) {
                self.emit( 'login', {
                    user: user
                } );
                loginEmitted = true;
            }
        }

        state.set( 'user', user );
        localforage.setItem( self.hone.options.localstoragePrefix + '.user', user );
    } );
};

Auth.prototype.logout = function( callback ) {
    var self = this;

    var existingUser = state.get( 'user' );
    if ( !existingUser ) {
        return;
    }

    ajaja( {
        url: self.hone.url( self.hone.api.sessions.session ),
        method: 'DELETE'
    }, function( error ) {
        if ( error ) {
            callback( error );
            return;
        }
        
        state.set( 'user', null );
        localforage.setItem( self.hone.options.localstoragePrefix + '.user', null );
        
        state.set( 'authtoken', null );

        self.emit( 'logout', {
            user: existingUser
        } );

        if ( callback ) {
            callback();
        }
    } );
};
