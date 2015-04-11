'use strict';

var EventBus = require( 'browser-event-bus' );

var IFrameSizer = require( './src/iframesizer' );

module.exports = HoneIFrameHelper;

function HoneIFrameHelper() {
    var self = this;

    self.eventBus = new EventBus( {
        namespace: 'Hone'
    } );

    self._iframeSizer = new IFrameSizer( self.eventBus );

    return self;
}

if ( !( 'honeIFrameHelper' in window ) ) {
    window.honeIFrameHelper = new HoneIFrameHelper();
}