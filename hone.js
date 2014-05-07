/* global PostEmitter, onHoneReady */
'use strict';

function Hone ( options ) {
    this.options = options || {};
    this.current = this.options.hone;
    this.postEmitter = new PostEmitter( this.options );
    this.el = this.postEmitter.el;
}

Hone.prototype.setSrc = function ( opts ) {
    var domain = opts.domain || 'http://gohone.com',
        debug = opts.debug ? '&debug=true' : '',
        type = opts.ad ? 'AdUnit' : 'Contest',
        id = this.el.dataset.hone;
    this.el.src = domain + '/' + type + '/' + id + '?embed=true' + debug;
};

Hone.prototype.onIframeResize = function ( ) {
    var el = this.postEmitter.el;
    return function ( e ) {
        // should only have to control height
        if ( typeof e.clientHeight !== 'number' ) return;
        el.style.height = e.clientHeight + 'px';
    };
};

Hone.prototype.on = function ( ) {
    this.postEmitter.on.apply( this.postEmitter, arguments ); 
};

Hone.prototype.emit = function ( ) {
    // we can hijack the emitter here and post it with the id.
    this.postEmitter.emit.apply( this.postEmitter, arguments ); 
};

Hone.prototype.urlParser =
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

Hone.prototype.init = function ( opts ) {
    opts = opts || {};
    if ( !this.el.src ) this.setSrc( opts );
};

/* initializing script */
var el = document.querySelector('[data-hone]'),
    url = el.src,
    hone = new Hone({
        selector : '[data-hone]',
        hone : Hone.urlParser( url ) || {},
        prefix : 'Hone:'
    });

if ( typeof onHoneReady === 'function' ) return onHoneReady( hone );
window.hone = hone;