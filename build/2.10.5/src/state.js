'use strict';

var Delver = require( 'delver' );

function State() {
    var self = this;
    
    if ( arguments.length !== 1 ) {
        throw new Error( 'State requires a state container object as its one and only arugment.' );
    }
    
    Delver.apply( self, arguments );
}

State.prototype = Object.create( Delver.prototype, {} );

State.singleton = State.singleton || new State( {} );
State.singleton.State = State;

module.exports = State.singleton;
