'use strict';

var PostEmitter = require( './postemitter' );

/* HoneEmbed - Constructor
 *
 * a options { Object } is passed to the function
 * this in turn is passed to the postEmitter Constructor
 *
 * - options.selector** - required { String }
 * - options.prefix** - required  { String }
 * - options.hone - optional { Object }
 *   - object containing contestId ( ref on current embed implementation )
 * ** are required by postEmitter
 */

function HoneEmbed( options ) {
    this.options = options || {};
    this.postEmitter = new PostEmitter( this.options );
    this.el = this.postEmitter.el;
    if ( this.el.getAttribute( 'data-resize' ) ) {
        this._resize = true;
        this.on( 'resize', this.onIframeResize() );
    }
}

/* HoneEmbed::setSrc
 *
 * a opts or options { Object } is passed to the function
 *
 * - opts.domain { String }
 *   - the domain to point the iframe at eg. 'http://localhost:8000'
 * - opts.debug { Boolean }
 *   - set to a truthy value to append debug=true onto the iframe url
 * - opts.ad { Boolean }
 *   - set a truthy value to use 'AdUnit' url rather then 'Contest'
 */

HoneEmbed.prototype.setSrc = function( opts ) {
    var domain = opts.domain || 'https://gohone.com',
        debug = opts.debug ? '&debug=true' : '',
        type = opts.ad ? 'AdUnit' : 'Quiz',
        id = this.el.getAttribute( 'data-hone' );

    this.el.src = domain + '/' + type + '/' + id + '?embed=true' + debug;
};

/* HoneEmbed::onIframeResize ~ not yet implemented
 *
 * a defered excution function or thunk handling resize event
 * comming from the iframe to adjust height.
 */

HoneEmbed.prototype.onIframeResize = function() {
    var el = this.postEmitter.el;
    return function( e ) {
        // should only have to control height
        if ( typeof e.clientHeight !== 'number' ) return;
        el.style.height = e.clientHeight + 'px';
    };
};

/* HoneEmbed::on
 *
 * a proxy for Component/Emitter::on method. Pass in a string with a event name
 * and a handler for more visit - https://github.com/component/emitter
 *
 * - eventName { String }
 *   - eventName to consume with handler. Eg. 'vote'
 * - handler { Function }
 *   - a function to handle event when event is emitted
 */

HoneEmbed.prototype.on = function() {
    this.postEmitter.on.apply( this.postEmitter, arguments );
};

/* HoneEmbed::emit
 *
 * a proxy for Component/Emitter::emit method. Pass in a string with a event name
 * and a payload of data - https://github.com/component/emitter
 *
 * - eventName { String }
 *   - eventName to consume with handler. Eg. 'vote'
 * - ... { Mixed }
 *   - the data you would like to send with event consumed in the iframe
 *     can be just about anything except functions ( due to serialization )
 */

HoneEmbed.prototype.emit = function() {
    // we can hijack the emitter here and post it with the id.
    this.postEmitter.emit.apply( this.postEmitter, arguments );
};

/* HoneEmbed::urlParser || HoneEmbed.urlParser
 *
 * a way to parse ContestId out of url for exsisting iframes
 *
 * - url { String }
 *   - a Hone contest url eg. 'http://gohone.com/Contest/5319243f5067cac36f9cc617?embed=true'
 * - returns { Undefined || Object }
 *   - object will container contestId
 *   - if a bad url is passed in it will result in a undefined value being returned
 */

HoneEmbed.prototype.urlParser =
    HoneEmbed.urlParser = function( url ) {
    var resource, id;
    // we should just be looking at contest urls.
    if ( typeof url !== 'string' ) return;
    url = url.split( /\// );
    resource = url[ url.length - 2 ];
    id = url[ url.length - 1 ];
    if ( !resource ) return;
    if ( resource.toLowerCase() !== 'contest' ) return;
    id = id.split( /\?/ ).shift();
    return {
        contestId: id,
        isContest: true
    };
};

/* HoneEmbed::init
 *
 * a init function to build url when called, pass in a opts { Object }
 * to configure iframe
 *
 * - opts { Object }
 *   - opts.resize { Boolean }
 *     - this will allow the iframe to resize its height to the content of
 *       the iframe
 *   - please reference HoneEmbed::setSrc
 */

HoneEmbed.prototype.init = function( opts ) {
    opts = opts || {};
    if ( !this.el.src ) this.setSrc( opts );
    if ( opts.resize && !this._resize ) { // check _resize to not bind event twice
        this.on( 'resize', this.onIframeResize() );
    }
};

/* initializing Hone
 * this block of code initializes a Hone Contructor with some basic options
 */

var el = ( 'querySelector' in document ) ? document.querySelector( '[data-hone]' ) : null,
    url,
    honeEmbed;

// Check if embedded hone is present.
if ( el ) {
    url = el.src;
    honeEmbed = new HoneEmbed( {
        selector: '[data-hone]',
        hone: HoneEmbed.urlParser( url ) || {},
        prefix: 'Hone:'
    } );
}

/* exporting hone instance
 * this is how we export hone, there is the global option or readyHandler option
 * - the global option simply exports hone to window.hone
 *   - in this option script need to be loaded before usage so hone var is available
 * - the readyHandler option allow you to get a referance to hone once it has loaded
 *   - in this option the script should be loaded after one method is to defer you
 *     script loading eg. '<script src="path-to/embed.js" defer></script>'
 */

if ( typeof window.onHoneEmbedReady === 'function' ) return window.onHoneEmbedReady( honeEmbed );
window.honeEmbed = honeEmbed;