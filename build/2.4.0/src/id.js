'use strict';

var EventEmitter = require( 'eventemitter2' ).EventEmitter2;
var ubid = require( 'ubid' );

module.exports = Id;

function Id( hone ) {
    var self = this;
    EventEmitter.call( self );

    self.hone = hone;

    // pre-seed the unique id
    self._getUniqueId( function( error, uniqueId ) {
        if ( error ) {
            self.emit( 'error', error );
            return;
        }

        if ( !uniqueId ) {
            self.emit( 'warning', 'Could not determine unique id at startup.' );
            return;
        }

        self.hone.state.set( 'uniqueId', uniqueId );

        self.emit( 'identified', {
            id: uniqueId
        } );
    } );
}

Id.prototype = Object.create( EventEmitter.prototype, {} );

Id.prototype._getUniqueId = function( callback ) {
    var self = this;

    var output = self.hone.state.get( 'uniqueId' );
    if ( output ) {
        callback();
        return;
    }

    ubid.get( function( error, data ) {
        if ( error ) {
            callback( error );
            return;
        }

        if ( data.storageSupported ) {
            output = data.random ? data.random.signature : ( data.canvas ? data.canvas.signature : ( data.browser ? data.browser.signature : null ) );
        }
        else {
            output = data.canvas ? data.canvas.signature : ( data.browser ? data.browser.signature : null );
        }

        self.hone.state.set( 'uniqueId', output );

        callback( null, output );
    }, self.hone.xdls );
};
