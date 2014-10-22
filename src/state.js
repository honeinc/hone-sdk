'use strict';

var Delver = require( 'delver' );
var util = require( 'util' );

function State() {
    var self = this;
    
    if ( arguments.length !== 1 ) {
        throw new Error( 'State requires a state container object as its one and only arugment.' );
    }
    
    Delver.apply( self, arguments );
}

util.inherits( State, Delver );

State.singleton = State.singleton || new State( {} );
State.singleton.State = State;

module.exports = State.singleton;
