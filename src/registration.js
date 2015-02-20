'use strict';

var async = require( 'async' );
var Emitter = require( 'events' ).EventEmitter;
var extend = require( 'extend' );
var util = require( 'util' );

module.exports = Registration;

function Registration( hone ) {
    var self = this;
    Emitter.call( self );

    self.hone = hone;

    // next tick registration
    setTimeout( self.register.bind( self ), 0 );
}
util.inherits( Registration, Emitter );

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

Registration.prototype.register = function( person, callback ) {
    var self = this;

    person = person || {};
    callback = callback || noop;
    
    self.getPerson( function( error, _person ) {
        if ( error ) {
            callback( error );
            return;
        }

        extend( _person, person );
        _person.lastSeen = new Date();
        
        _person.save( function( error ) {
            if ( error ) {
                callback( error );
                return;
            }
            
            self.hone.state.set( 'person', _person );
            self.hone.xdls.setItem( 'person', _person.bare() );
            
            callback();
            
            self.emit( 'registered', {
                person: _person
            } );
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
