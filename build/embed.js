(function( window, document ){

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

/* global top, self, Emitter, onPostEmitterReady */
'use strict';

var supported = ( 'postMessage' in window ) && 
        ( Function.prototype.hasOwnProperty( 'bind' ) ) &&
        ( 'JSON' in window ),
    isComponent = ( typeof module === 'object' ) && 
        ( 'require' in window ), 
    isIframe = (top !== self),
    _Emitter;

if ( isComponent ) {
    _Emitter = require('emitter');
} else {
    _Emitter = Emitter;
}

/*
 * Constructor sets up some simple listeners and
 * gets the element.
 */

function PostEmitter( options ) {
    if ( !supported ) {
        // for now
        return;
    }

    // setting basic vars
    this.isIframe = isIframe;
    this.options = options || {};
    this._emitter = new _Emitter( );
    this.el = (isIframe) ? null : this.getFrame( this.options.selector );
    this.prefix = new RegExp( '^' + this.options.prefix );
    this.prefixLength = this.options.prefix.length;
    this.setOrigin( this.options.origin );
    this.addListener();
}

/*
 * Selects a iframe based off the id passed to it
 */

PostEmitter.prototype.getFrame = function ( selector ) {
    return document.querySelector( selector );
};

PostEmitter.prototype.on = function( ) {
    this._emitter.on.apply( this._emitter, arguments );    
};

PostEmitter.prototype.emit = function( ) {

    // splits the arguments into a nice array
    var args = Array.prototype.slice.call(arguments, 0),
        event = this.serialize( args );

    var target = this.isIframe ? window.parent : this.el.contentWindow;
    // emit to the correct location
    target.postMessage( event, this._origin );
};

PostEmitter.prototype.setOrigin = function ( origin ) {
    this._origin = origin || '*';
};

PostEmitter.prototype.onMessage = function ( e ) {

    // return if it doesnt have a good prefix
    if ( !this.prefix.test( e.data ) )
    {
        return;
    }

    var msg = this.deserialize( e.data );
    if ( !msg )
    {
        this._emitter.emit( 'error', new Error( 'PostEmitter could not parse event: ' + e.data ) );
        return;
    }
    
    if ( !Array.isArray( msg ) )
    {
        this._emitter.emit( 'error', new Error( 'PostEmitter expects arrays from events. Did not get an array from event: ' + e.data ) );
        return;
    }

    this._emitter.emit.apply( this._emitter, msg );
};

PostEmitter.prototype.deserialize = function ( msg ) {
    
    var json = msg.slice( this.prefixLength );
    var obj = null;
    try
    {
        obj = JSON.parse( json );
    }
    catch ( e )
    {
        obj = null;
        this.emit( 'error', e );
    }
    
    return obj;
};

PostEmitter.prototype.serialize = function ( msg ) {
    return this.options.prefix + JSON.stringify(msg);
};

PostEmitter.prototype.addListener = function ( ) {
    window.addEventListener('message', this.onMessage.bind( this ), false );
};

PostEmitter.inIframe = isIframe;

if ( isComponent ) {
    module.exports = PostEmitter;
}

if( typeof onPostEmitterReady === 'function' ) {
    onPostEmitterReady( PostEmitter );
}


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

}( window, document ));