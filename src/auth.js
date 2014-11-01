'use strict';

var ajaja = require( 'ajaja' );
var async = require( 'async' );
var Emitter = require( 'events' ).EventEmitter;
var diff = require( 'deep-diff' ).diff;
var XDLS = require( 'xdls' );
var util = require( 'util' );
var base64 = require( 'js-base64' ).Base64;
var ubid = require( 'ubid' );

var state = require( './state' );

module.exports = Auth;

function Auth( hone ) {
    var self = this;
    Emitter.call( self );
    
    self.hone = hone;
    self.xdls = new XDLS( hone.options.xdls );
}

util.inherits( Auth, Emitter );

Auth.prototype.getUser = function( callback ) {
    var self = this;

    var loginEmitted = false;
    
    self.xdls.getItem( 'user', function( error, user ) {
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
        url: self.hone.url( self.hone.api.users.me )
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

        if ( user ) {
            state.set( 'user', user );
            self.xdls.setItem( 'user', user );
        }
        
        callback( null, user );
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
        self.xdls.removeItem( 'user' );
        
        self.emit( 'logout', {
            user: existingUser
        } );

        if ( callback ) {
            callback();
        }
    } );
};

Auth.prototype.requestLoginCode = function( options, callback ) {
    var self = this;
    
    ajaja( {
        url: self.hone.url( self.hone.api.sessions.logincode ),
        method: 'POST',
        data: options
    }, callback );
};

Auth.prototype.login = function( options, meta, callback ) {
    var self = this;
    var authorization = null;
    var anonymousId = null;

    async.series( [
        // setup login auth
        function( next ) {
            if ( options.facebook && options.facebook.token ) {
                authorization = 'Facebook ' + base64.encode( options.facebook.id + ':' + options.facebook.token );
            }
            else if ( options.phone ) {
                authorization = 'Phone ' + base64.encode( options.phone + ':' + options.code );
            }
            else if ( options.email ) {
                authorization = 'Email ' + base64.encode( options.email + ':' + options.code );
            }
            else {
                next( 'No valid login method.' );
                return;
            }

            next();
        },
        
        // get unique id
        function( next ) {
            if ( anonymousId ) {
                next();
                return;
            }
            
            ubid.get( function( error, data ) {
                if ( error ) {
                    next( error );
                    return;
                }
                
                if ( data.storageSupported ) {
                    anonymousId = data.random ? data.random.signature : ( data.canvas ? data.canvas.signature : ( data.browser ? data.browser.signature : null ) );
                }
                else {
                    anonymousId = data.canvas ? data.canvas.signature : ( data.browser ? data.browser.signature : null );
                }
                
                next();
            }, self.xdls );
        },
        
        // try to login
        function( next ) {
            ajaja( {
                url: self.hone.url( self.hone.api.sessions.session ),
                method: 'POST',
                headers: {
                    'Authorization': authorization,
                    'hone-anonymous-id': anonymousId
                },
                data: {}
            }, function( error, response ) {
                if ( error ) {
                    next( error );
                    return;
                }
                
                var existingUser = state.get( 'user' );
                if ( existingUser ) {
                    state.set( 'user', null );
                    self.emit( 'logout', {
                        user: existingUser
                    } );                    
                }
                
                var user = response.user;

                state.set( 'user', user );
                self.xdls.setItem( 'user', user );
                
                self.emit( 'login', {
                    user: user
                } );

                next();
            } );
        }
    ], callback );
};

