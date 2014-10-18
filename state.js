'use strict';

var Delver = require( 'delver' );
var util = require( 'util' );

module.exports = State;

function State() {
    var self = this;
    Delver.apply( self, arguments );
}

util.inherits( State, Delver );
State.singleton = new State( {} );
