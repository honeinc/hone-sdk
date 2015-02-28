/* jshint node: true */
'use strict';

var gulp = require( 'gulp' );
var minimist = require( 'minimist' );
var rsync = require( 'rsyncwrapper' ).rsync;

var defaults = {
    sshkey: null,
    user: 'root',
    host: 'files-02.gohone.com',
    target: '/home/node/files/sdk/'
};

var options = minimist( process.argv.slice( 2 ), {
    default: defaults
} );

gulp.task( 'publish', function( next ) {
    if ( !options.sshkey ) {
        throw new Error( 'You must specify an ssh key for publishing.' );
    }
    
    rsync( {
        src: 'build/',
        dest: options.user + '@' + options.host + ':' + options.target,
        ssh: true,
        recursive: true,
        privateKey: options.sshkey,
        onStdout: process.stdout.write.bind( process.stdout ),
        onStderr: process.stderr.write.bind( process.stderr ),
        args: [ '--progress' ]
    }, function( error ) {
        var log = error ? process.stdout.write.bind( process.stdout ) : process.stderr.write.bind( process.stderr );
        log( 'Done\n' );
        
        next( error );
    } );
} );
