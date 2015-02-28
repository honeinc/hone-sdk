'use strict';

var ObjectID = require( 'bson-objectid' );

module.exports = Mongo;

function Mongo( hone ) {
    var self = this;

    self.hone = hone;
}

Mongo.prototype.id = ObjectID;