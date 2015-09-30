'use strict';

var ajaja = require( 'ajaja' );
var antisync = {
    series: require( 'antisync/series' ),
    parallel: require( 'antisync/parallel' )
};
var EventEmitter = require( 'eventemitter2' ).EventEmitter2;
var extend = require( 'extend' );
var diff = require( 'deep-diff' ).diff;

module.exports = Auth;

function Auth( hone ) {
    var self = this;
    EventEmitter.call( self );
    
    self.hone = hone;
}

Auth.prototype = Object.create( EventEmitter.prototype, {} );

function noop() {}

function base64( str ) {
    if ( typeof Buffer !== 'undefined' ) {
        /*jshint ignore:start */
        return new Buffer( str ).toString( 'base64' );   
        /*jshint ignore:end */
    }
    else {
        return btoa( str );
    }
}

Auth.prototype._onUserLogin = function( user, callback ) {
    
    var self = this;    
    var existingUser = self.hone.state.get( 'user' );

    // if there is no logged in user via the api, log out
    if ( !user ) {
        self.hone.state.set( 'user', null );
        self.hone.state.set( 'authtoken', null );

        self.hone.xdls.removeItem( 'user' );
        self.hone.xdls.removeItem( 'authtoken' );

        if ( existingUser ) {
            
            self.emit( 'logout', {
                user: existingUser
            } );            
        }

    }        
    // if the user has updated their settings
    else if ( user && existingUser && existingUser._id === user._id && diff( existingUser, user ) ) {
        self.hone.state.set( 'user', user );
        self.hone.xdls.setItem( 'user', user );
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
        self.hone.xdls.setItem( 'user', user );
        self.emit( 'login', {
            user: user
        } );
    }
    // if there was no existing user and we now have a user
    else if ( user && !existingUser ) {
        self.hone.state.set( 'user', user );
        self.hone.xdls.setItem( 'user', user );
        self.emit( 'login', { 
            user: user
        } );
    }

    // things we don't need to hande:
    //   !user && !existingUser = no one logged in
    //   user && existingUser && existingUser._id === user._id && !diff( existingUser, user ) = user logged in, same
    
    if ( callback ) {
        callback();
    }
};

Auth.prototype.getUser = function( callback, force ) {
    var self = this;

    var existingUser = self.hone.state.get( 'user' );
    if ( !force && existingUser ) {
        callback( null, existingUser );
        return;
    }

    if ( !force ) {
        self.hone.xdls.getItem( 'user', function( error, user ) {
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

        self.hone.xdls.getItem( 'authtoken', function( error, authtoken ) {
            if ( error ) {
                return;
            }

            var existingUser = self.hone.state.get( 'user' );
            if ( existingUser ) {
                return;
            }

            self.hone.state.set( 'authtoken', authtoken );
        } );
    }
    
    function _getUserAuthoritative() {
        ajaja( {
            method: 'GET',
            url: self.hone.url( self.hone.api.users.me )
        }, function( error, user ) {
            if ( error && error.code != 400  && error.code != 401 && error.code != 403 ) {
                callback( error );
                return;
            }

            self._onUserLogin( user );
            callback( null, user );
        } );
    }
    
    if ( self.hone.api ) {
        _getUserAuthoritative();
    }
    else {
        self.hone.once( 'api_loaded', _getUserAuthoritative );
    }
};

Auth.prototype.signup = function( options, callback ) {
    var self = this;

    callback = callback || noop;
    var data = extend( {}, options );
    var person = null;
    var user = null;
    
    antisync.series( [
        function( next ) {

            self.hone.getPerson( function( error, _person ) {
                if ( error ) {
                    next( error );
                    return;
                }
                
                person = _person;
                next();
            } );
        },
        
        // do the login
        function( next ) {
            ajaja( {
                url: self.hone.url( self.hone.api.users.create ),
                method: 'POST',
                headers: {
                    'hone-anonymous-id': person ? person.id : null, // legacy
                    'person-id': person ? person.id : null
                },
                data: data
            }, function( error, _user ) {
                user = !error ? _user : null;
                next( error );
            } );
        },
        
        // handle the logged in user
        function( next ) {
            // can't just bind this because user isn't set at the time of the bind
            self._onUserLogin( user, next );
        }
        
    ], function( error ) {
        if ( error ) {
            callback( error );
            self.emit( 'error', error );
            return;
        }

        self.emit( 'signup', {
            user: user
        } );
        
        callback( null, user );
    } );
};

Auth.prototype.logout = function( callback ) {
    var self = this;

    callback = callback || noop;
    
    var existingUser = self.hone.state.get( 'user' );
    if ( !existingUser ) {
        callback();
        return;
    }

    ajaja( {
        url: self.hone.url( self.hone.api.sessions.session ),
        method: 'DELETE'
    }, function( error ) {
        if ( error ) {
            callback( error );
            self.emit( 'error', error );
            return;
        }
        
        self.hone.state.set( 'user', null );
        self.hone.state.set( 'authtoken', null );
        
        antisync.parallel( [
            self.hone.xdls.removeItem.bind( self.hone.xdls, 'user' ),
            self.hone.xdls.removeItem.bind( self.hone.xdls, 'authtoken' )
        ], function( error ) {
            if ( error ) {
                self.emit( 'error', error );
                callback( error );
                return;
            }

            self.emit( 'logout', {
                user: existingUser
            } );

            callback();
        } );
    } );
};

Auth.prototype.requestLoginCode = function( options, callback ) {
    var self = this;
    
    callback = callback || noop;
    
    ajaja( {
        url: self.hone.url( self.hone.api.sessions.logincode ),
        method: 'POST',
        data: options
    }, callback );
};

Auth.prototype.login = function( options, callback ) {
    var self = this;
    var authorization = null;
    var person = null;
    
    callback = callback || noop;
    
    antisync.series( [
        // setup login auth
        function( next ) {
            if ( options.facebook && options.facebook.token ) {
                authorization = 'Facebook ' + base64( options.facebook.id + ':' + options.facebook.token );
            }
            else if ( options.phone ) {
                authorization = 'Phone ' + base64( options.phone + ':' + options.code );
            }
            else if ( options.email ) {
                authorization = 'Email ' + base64( options.email + ':' + options.code );
            }
            else {
                next( 'No valid login method.' );
                return;
            }

            next();
        },
        
        // get person
        function( next ) {
            self.hone.getPerson( function( error, _person ) {
                if ( error ) {
                    next( error );
                    return;
                }
                
                person = _person;
                next();
            } );
        },

        // try to login
        function( next ) {
            ajaja( {
                url: self.hone.url( self.hone.api.sessions.session ),
                method: 'POST',
                headers: {
                    'Authorization': authorization,
                    'hone-anonymous-id': person ? person._id : null,
                    'person-id': person ? person._id : null
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
                
                self.hone.xdls.setItem( 'user', user );
                self.hone.xdls.setItem( 'authtoken', response.authtoken );

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

    callback = callback || noop;
    
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

