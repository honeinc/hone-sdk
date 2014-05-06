/* global PostEmitter, onHoneReady */
'use strict';

function Hone ( options ) {
    options = options || {};
    this.current = options.hone;
    this.postEmitter = new PostEmitter( options );    
}

Hone.prototype.onWindowResize = function ( delay ) {
    var delayTimer,
        emit = this.postEmitter.emit,
        el = this.postEmitter.el;
    return function ( ) { 

        // setting up fake event object
        var parentNode = el.parentNode,
            event = {
                clientWidth : parentNode.clientWidth,
                clientHeight : parentNode.clientHeight,
                innerWidth : window.innerWidth,
                innerHeight : window.innerHeight
            };

        clearTimeout( delayTimer );
        delayTimer = setTimeout(function(){
            emit( 'resize', event );
        }, delay);
    };
};

Hone.prototype.onWindowResize = function ( ) {
    var el = this.postEmitter.el;
    return function ( e ) {
        // should only have to control height
        if ( typeof e.innerHeight !== 'number' ) return;
        el.style.height = e.innerHeight + 'px';
    };
};

Hone.prototype.addListener = function ( ) {
    window.addEventListener('resize', this.onResize( 1000 ), false );
    this.postEmitter.on('resize', this.onIframeResize(), false );
};

Hone.urlParser = function ( url ) {
    var resource, id;
    // we should just be looking at contest urls.
    if ( typeof url !== 'string' ) return;
    url = url.split(/\//);
    resource = url[ url.length - 2 ];
    id = url[ url.length - 1 ];
    if ( !resource ) return;
    if ( resource.toLowerCase() !== 'contest' ) return;
    id = id.split(/\?/).shift();
    return {
        contestId : id,
        isContest : true 
    };
};


var el = document.getElementById('hone-embed'),
    url = el.src,
    hone = new Hone({
        id : 'hone-embed',
        hone : Hone.urlParser( url ) || {},
        prefix : 'Hone:'
    });
if ( typeof onHoneReady === 'function' ) return onHoneReady( hone );
window.hone = hone;