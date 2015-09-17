'use strict';

module.exports = Teams;

function Teams( hone ) {
    var self = this;

    self.hone = hone;
}

Teams.prototype.getByUser = function( user, callback ) {
    var self = this;
    var userTeamsKey = 'user.teams.' + user._id;
    var teams = self.hone.state.get( userTeamsKey );

    if ( typeof teams !== 'undefined' ) {
        callback( null, teams );
        return;
    }

    self.hone.get( {
        type: 'Team',
        query: 'user == "' + user._id + '" or "' + user._id + '" in members'
    }, function( error, _teams ) {
        if ( error ) {
            callback( error );
            return;
        }
        self.hone.state.set( userTeamsKey, _teams );
        callback( null, _teams );
    } );
};