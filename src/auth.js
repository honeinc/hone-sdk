'use strict';

var ajaja = require( 'ajaja' );
var async = require( 'async' );
var Emitter = require( 'events' ).EventEmitter;
var diff = require( 'deep-diff' ).diff;
var XDLS = require( 'xdls' );
var util = require( 'util' );
var base64 = require( 'js-base64' ).Base64;
var ubid = require( 'ubid' );

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

    self.xdls.getItem( 'user', function( error, user ) {
        if ( error ) {
            return; // we don't care if this errors, it's not authoritative
        }

        var existingUser = self.hone.state.get( 'user' );
        if ( existingUser ) {
            return;
        }
        
        if ( !user ) {
            return;
        }
        
        self.hone.state.set( 'user', user );
        self.emit( 'login', {
            user: user
        } );
    } );
    
    self.xdls.getItem( 'authtoken', function( error, authtoken ) {
        if ( error ) {
            return;
        }
        
        var existingUser = self.hone.state.get( 'user' );
        if ( existingUser ) {
            return;
        }
        
        self.hone.state.set( 'authtoken', authtoken );
    } );
    
    ajaja( {
        method: 'GET',
        url: self.hone.url( self.hone.api.users.me )
    }, function( error, user ) {
        if ( error && error.code != 400 ) {
            callback( error );
            return;
        }

        var existingUser = self.hone.state.get( 'user' );
        
        // if there is no logged in user via the api, log out
        if ( !user && existingUser ) {
            self.hone.state.set( 'user', null );
            self.hone.state.set( 'authtoken', null );

            self.xdls.removeItem( 'user' );
            self.xdls.removeItem( 'authtoken' );

            self.emit( 'logout', {
                user: existingUser
            } );
        }        
        // if the user has updated their settings
        else if ( user && existingUser && existingUser._id === user._id && diff( existingUser, user ) ) {
            self.hone.state.set( 'user', user );
            self.xdls.setItem( 'user', user );
            self.emit( 'user_updated', {
                old: existingUser,
                user: user
            } );
        }
        // if the user is a different one than we knew about
        else if ( user && existingUser && existingUser._id !== user._id ) {
            self.emit( 'logout', {
                user: existingUser
            } );
            self.hone.state.set( 'user', user );
            self.xdls.setItem( 'user', user );
            self.emit( 'login', {
                user: user
            } );
        }
        // if there was no existing user and we now have a user
        else if ( user && !existingUser ) {
            self.hone.state.set( 'user', user );
            self.xdls.setItem( 'user', user );
            self.emit( 'login', { 
                user: user
            } );
        }
        
        // things we don't need to hande:
        //   !user && !existingUser = no one logged in
        //   user && existingUser && existingUser._id === user._id && !diff( existingUser, user ) = user logged in, same
        
        callback( null, user );
    } );
};

Auth.prototype.logout = function( callback ) {
    var self = this;

    var existingUser = self.hone.state.get( 'user' );
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
        
        self.hone.state.set( 'user', null );
        self.hone.state.set( 'authtoken', null );

        self.xdls.removeItem( 'user' );
        self.xdls.removeItem( 'authtoken' );
        
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
                
                var existingUser = self.hone.state.get( 'user' );
                if ( existingUser ) {
                    self.hone.state.set( 'user', null );
                    self.emit( 'logout', {
                        user: existingUser
                    } );                    
                }
                
                var user = response.user;

                self.hone.state.set( 'user', user );
                self.hone.state.set( 'authtoken', response.authtoken );
                
                self.xdls.setItem( 'user', user );
                self.xdls.setItem( 'authtoken', response.authtoken );

                self.emit( 'login', {
                    user: user
                } );

                next();
            } );
        }
    ], callback );
};

Auth.prototype.updateUser = function( data, callback ) {
    var self = this;

    var user = self.hone.state.get( 'user' );
    if ( !user ) {
        callback( 'No user is logged in!', null );
        return;
    }

    ajaja( {
        url: self.hone.url( self.hone.api.users.user.replace( '{{id}}', user._id ) ),
        method: 'PUT',
        headers: {
            'hone-authtoken': self.hone.state.get( 'authtoken' )
        },
        data: data
    }, function( error, updatedUser ) {
        if ( error ) {
            callback( error );
            return;
        }

        var oldUser = user;

        self.hone.state.set( 'user', updatedUser );

        self.emit( 'user_updated', {
            user: updatedUser,
            old: oldUser
        } );
        
        callback( null, {
            user: updatedUser,
            old: user
        } );
    } );
};

