'use strict';

var EventEmitter = require( 'eventemitter2' ).EventEmitter2;

module.exports = IFrameSizer;

function IFrameSizer( hone ) {
    var self = this;
    EventEmitter.call( self );

    self.hone = hone;
    self.hone.eventBus.on( 'rendered', self.onRendered.bind( self ) );
}

IFrameSizer.prototype = Object.create( EventEmitter.prototype, {} );

IFrameSizer.prototype.onRendered = function( event, postMessageEvent ) {
    var iframes = Array.prototype.slice.call( document.querySelectorAll( 'iframe[data-resize]' ), 0 );
    iframes.forEach( function( iframe ) {
        if ( iframe.contentWindow === postMessageEvent.source ) {
            var resizeDimensions = {};
            iframe.dataset.resize.split( ',' ).forEach( function( dimension ) {
                resizeDimensions[ dimension.toLowerCase() ] = true;
            } );
            
            if ( resizeDimensions.true || resizeDimensions.width ) {
                iframe.style.width = event.scrollWidth + 'px';
            }

            if ( resizeDimensions.true || resizeDimensions.height ) {
                iframe.style.height = event.scrollHeight + 'px';
            }
        }
    } );
};