'use strict';

var async = require( 'async' );
var EventEmitter  = require( 'eventemitter2' ).EventEmitter2;
var extend = require( 'extend' );

module.exports = Registration;

function Registration( hone ) {
    var self = this;
    EventEmitter.call( self );

    self.hone = hone;
    self._registering = false;
    
    // next tick registration
    setTimeout( self.register.bind( self ), 0 );
}

Registration.prototype = Object.create( EventEmitter.prototype, {} );

function noop() {}

Registration.prototype.getPerson = function( callback ) {
    var self = this;
    
    var existingPerson = self.hone.state.get( 'person' );
    if ( existingPerson ) {
        callback( null, existingPerson );
        return;
    }

    function _getPerson() {
        self.hone.xdls.getItem( 'person', function( error, person ) {
            if ( error ) {
                callback( error );
                return;
            }

            async.series( [
                function( next ) {
                    if ( person ) {
                        self.hone.load( 'person', person );
                        next();
                        return;
                    }
                    
                    self.hone.create( {
                        type: 'person'
                    }, function( error, _person ) {
                        if ( error ) {
                            next( error );
                            return;
                        }

                        person = _person;
                        person.id = self.hone.state.get( 'uniqueId' );
                        next();
                    } );
                }
            ], function( error ) {
                if ( error ) {
                    callback( error );
                    return;
                }
                
                callback( null, person );
            } );
        } );
    }

    if ( self.hone.state.get( 'uniqueId' ) ) {
        _getPerson();
    }
    else {
        self.hone.once( 'id.identified', _getPerson );
    }
};

Registration.prototype._savePerson = function( person, callback ) {
    person.save( function( error ) {
        callback( error, person );
    } );
};

Registration.prototype.register = function( person, callback ) {
    var self = this;

    if ( self._registering ) {
        self.once( 'registered', function() {
            self.register( person, callback );
        } );
        return;
    }
    
    self._registering = true;
    
    person = person || {};
    callback = callback || noop;
    
    async.waterfall( [
        self.getPerson.bind( self ),

        function( _person, next ) {
            extend( _person, person );
            _person.lastSeen = new Date();
            next( null, _person );
        },
        
        self._savePerson.bind( self )
        
    ], function( error, _person ) {
        if ( error ) {
            self._registering = false;
            callback( error );
            return;
        }

        self.hone.state.set( 'person', _person );
        self.hone.xdls.setItem( 'person', _person.bare() );

        self._registering = false;
        
        callback();

        self.emit( 'registered', {
            person: _person
        } );
    } );
};

Registration.prototype.unregister = function( callback ) {
    var self = this;  
    
    callback = callback || noop;
    
    self.hone.state.set( 'person', null );
    self.hone.xdls.setItem( 'person', null );
    callback();
    
    self.emit( 'unregistered' );
};
