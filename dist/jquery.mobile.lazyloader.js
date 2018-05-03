( function( $, window ) {

"use strict";

// Source: src/_vars.js
/* eslint-disable no-unused-vars */
/**
 * The window element.
 * @type {JQuery}
 */
var $window = $( window ),

  /**
   * The name of the widget.
   * @type {string}
   */
  widgetName = "lazyloader",

  /**
   * The search query option whose value is posted in the request.
   * @type {string}
   */
  searchQueryOption = "searchQuery",

  /**
   * The event that is triggered if an error occurs when loading items.
   * @type {string}
   */
  errorEvent = "error",

  /**
   * The event that is triggered if all possible items have been loaded. No more items can be
   * loaded until a reset is performed.
   * @type {string}
   */
  allDoneEvent = "alldone",

  /**
   * The event that is triggered after finishing of a load action.
   * @type {string}
   */
  doneLoadingEvent = "doneloading",

  /**
   * The events on which to possibly load more items.
   * @type {string}
   */
  loadTriggerEvents = "scrollstart scrollstop wheel",

  /**
   * The error code that is provided in the event when the request fails for whatever
   * reason.
   * @type {number}
   */
  requestErrorCode = 1,

  /**
   * The error code that is provided in the event when parsing of a response fails
   * @type {number}
   */
  parseResultErrorCode = 2;

// Source: src/filterable.js
var filterableWidget = $.mobile.filterable,
  lazyLoaderEvents = widgetName + doneLoadingEvent + " " + widgetName + errorEvent;

if ( filterableWidget ) {
  $.widget( "mobile.filterable", filterableWidget, {
    _filterItems: function( val ) {
      var self = this,
        $element = self.element,
        widget = $element.data( "mobile-" + widgetName );

      // Check if the widget is a lazyloader one
      if ( widget ) {

        // Only bother filtering if the value is different
        if ( widget.option( searchQueryOption ) !== val ) {
          var triggerFilter = function() {

            // Remove the event listener
            $element.off( lazyLoaderEvents, triggerFilter );

            // Trigger the filter event
            self._trigger( "filter", null, {
              items: self._getFilterableItems()
            } );
          };

          // Wait until one of the lazyloader events is triggered
          $element.one( lazyLoaderEvents, triggerFilter );

          // Set the searchQuery option to the new value
          widget.option( searchQueryOption, val );
        }
      } else {

        // Use the standard functionality
        self._super( val );
      }
    }
  } );
}

// Source: src/lazyloader.js
$.widget( "mobile." + widgetName, $.mobile.listview, {
  options: {

    /**
     * The url to send the request for more items to.
     * @type {string}
     */
    url: "",

    /**
     * The selector or jQuery element of the progress indicator that is shown when
     * loading more items.
     * @type {string|jQuery}
     */
    $progress: "",

    /**
     * The id of the ICanHaz template.
     * @type {string}
     */
    templateId: ""

  },

  defaults: {

    /**
     * The search query that is posted in the request.
     * @type {string|null}
     */
    searchQuery: null,

    /**
     * This is the number of items retrieved so far.
     * @type {number}
     */
    retrieved: 0,

    /**
     * This is the number of items to retrieve from server by default.
     * @type {number}
     */
    retrieve: 20,

    /**
     * The timeout used before attempting to load more items when it is triggered by
     * either the scrollstart, scrollstop, or wheel event.
     * @type {number}
     */
    eventTimeout: 100,

    /**
     * The timeout used before a request is sent after setting the searchQuery option.
     * @type {number}
     */
    searchTimeout: 300,

    /**
     * Additional data to post along with the request.
     * @type {Object}
     * @deprecated Use the ajaxSettings instead.
     */
    postData: {},

    /**
     * Threshold for how close to the bottom should we trigger a load of more items -
     * default to height of viewport
     * @type {number}
     */
    threshold: 100,

    /**
     * The ajax request type.
     * @type {string}
     * @deprecated Use the ajaxSettings instead.
     */
    ajaxType: "POST",

    /**
     * The custom ajax settings to use in a request. The dataType setting cannot be overwritten, it
     * will always be "json".
     * @type {JQueryAjaxSettings}
     */
    ajaxSettings: {
      type: "POST"
    }
  },

  /**
   * The constructor.
   * @private
   */
  _create: function() {
    var self = this;

    self._done = false;

    /**
     * The time the last request was made
     * @type {number}
     */
    self._lastRequestTime = 0;

    // Get any user defined settings and extend / merge / override them with
    // defaultSettings
    this.options = $.extend( {}, this.defaults, this.options );

    // Add event listeners
    $window.on(
      loadTriggerEvents, self._handleEventProxy = $.proxy( self._handleEvent, self ) );

    self._super();

    if ( !this.options.filter ) {

      // Start loading items
      self._load();
    }
  },

  /**
   * Loads more items.
   * @param {number} [timeout=0] The timeout before a request is sent.
   */
  loadMore: function( timeout ) {

    // Load the items
    this._load( timeout );
  },

  /**
   * Resets the list view by clearing the list and setting the "retrieved" option back to
   * 0.
   * @param {number} [timeout=0] The timeout before a request is sent.
   */
  reset: function( timeout ) {
    var self = this;

    // Reset the number of retrieved items
    self.options.retrieved = 0;

    // Indicate the widget is no longer done retrieving items
    self._done = false;

    // Clear the list
    self.element.empty();

    // Load the items
    self._load( timeout, true );
  },

  /**
   * Checks if more items should be loaded and loads them if so.
   * @param {number} [timeout=0] The timeout before a request is sent.
   * @param {boolean} [reset=false] Indicates the request is a reset request.
   * @private
   */
  _load: function( timeout, reset ) {
    var self = this,
      options = self.options;

    // Make sure the plugin is not already lazy loading some items and has not loaded
    // all items already.
    if ( !self._done ) {

      // Determine the timeout
      if ( isNaN( timeout ) ) {
        timeout = 0;
      }

      clearTimeout( self._loadTimeout );

      // Don't try to load anything until the scroll is given some time to get closer
      // to the bottom
      self._loadTimeout = setTimeout( function() {
        var $element = self.element;

        // Check if the page scroll location is close to the bottom or if a reset is done
        if ( $element.height() + $element.offset().top - options.threshold <
          self._getScrollParent().scrollTop() + self._getWindowHeight() || reset ) {

          // Get the progress element
          $( options.$progress ).show();

          // Load more items
          self._sendRequest( reset );
        } else {

          // Indicate a request can be made by an event handler again
          self._eventTriggered = false;

          // Trigger an event to announce that the lazyloader is done loading
          self._trigger( doneLoadingEvent );
        }

      }, timeout );
    }
  },

  /**
   * Creates and sends the request.
   * @param {boolean} [reset=false] Indicates the request is a reset request.
   * @private
   */
  _sendRequest: function( reset ) {
    var self = this,
      options = self.options,
      jqXHR = self.jqXHR;

    if ( jqXHR ) {
      jqXHR.abort();
    }

    // Get the current time
    var requestTime = Date.now();

    // Store it as the time of the last request
    self._lastRequestTime = requestTime;

    jqXHR = $.ajax(
      options.url,
      $.extend(
        true,
        {},
        { type: options.ajaxType, data: options.postData },
        options.ajaxSettings,
        {
          data: {
            retrieved: options.retrieved,
            retrieve: options.retrieve,
            reset: reset === true,
            searchQuery: options.searchQuery
          },
          dataType: "json"
        }
      )
    );

    self.jqXHR = jqXHR;

    jqXHR.then( function( data, textStatus ) {
      self._parseResponse( data, textStatus, requestTime, reset );
    }, function( e, textStatus ) {
      if ( textStatus !== "abort" ) {
        self._handleError( requestErrorCode, e );
      }
    } ).always( function() {

      // Indicate a request can be made by an event handler again
      self._eventTriggered = false;
    } );
  },

  /**
   * Parses the response data.
   * @param {{items: Object[]}} data The response data.
   * @param {string} textStatus String categorizing the status of the request.
   * @param {number} requestTime The time the request was made.
   * @param {boolean} reset Indicates the request is a reset request.
   * @private
   */
  _parseResponse: function( data, textStatus, requestTime, reset ) {

    // Don't bother parsing the response if a new request was made in the meantime
    if ( requestTime < this._lastRequestTime ) {
      return;
    }

    var self = this,
      options = self.options,
      items = data.items,
      $element = self.element;

    // It's possible a request added list items while this request was underway
    if ( reset ) {
      $element.empty();
    }

    // Check if the items property is an array
    if ( Array.isArray( items ) ) {
      var count = items.length,
        html = [],

        // Check if we're done loading
        done = count < options.retrieve;

      // Update the number of retrieved items
      options.retrieved += count;

      // Get the ich templates
      ich.grabTemplates();

      // Trigger event to allow for manipulation of the loaded items before rendering
      // takes place
      this._trigger( "beforerender", {}, [ items ] );

      // Render items
      items.forEach( function( item ) {

        // Create html for the item using the template
        html.push( ich[ options.templateId ]( item ) );
      } );

      // Add the list items html to the list
      $element.append( html );

      // Refresh the listview so it is re-enhanced by JQM
      self.refresh();

      // Get the scroll parent
      var $scrollParent = self._getScrollParent();

      // If the scroll parent is the document its height will always be higher than that of the
      // list. Therefor we're going to use the window's height.
      var scrollParentHeight = $scrollParent.is( document ) ?
        self._getWindowHeight() : $scrollParent.height();

      // Get the height of the listview and window
      var elementHeightExceedsWindowHeight = $element.height() > scrollParentHeight;

      // Only hide the progress element if no more items are going to be loaded
      // immediately after this
      if ( elementHeightExceedsWindowHeight || done ) {

        // Hide the progress element
        $( options.$progress ).hide();
      }

      // Indicate whether or not all items have been loaded
      self._done = done;

      if ( done ) {

        // Trigger an event to announce that the lazyloader is done loading
        self._trigger( doneLoadingEvent );

        // Trigger an event to announce that the lazyloader is done loading entirely
        self._trigger( allDoneEvent );
      } else if ( !elementHeightExceedsWindowHeight ) {

        // No scrolling is possible yet, so load some more right away
        self._load();
      } else {

        // Trigger an event to announce that the lazyloader is done loading
        self._trigger( doneLoadingEvent );
      }
    } else {

      // Trigger an event to announce that an error occurred during parsing
      self._handleError( parseResultErrorCode, data );
    }
  },

  /**
   * Returns the scroll parent of the list.
   * @return {JQuery} The scroll parent.
   * @private
   */
  _getScrollParent: function() {

    // Get the list's first scroll parent
    var $scrollParent = this.element.scrollParent();

    // Move on to the scroll parent of the current scroll parent if there is no vertical scrollbar
    // present
    while ( $scrollParent[ 0 ].scrollHeight <= $scrollParent[ 0 ].clientHeight ) {
      $scrollParent = $scrollParent.scrollParent();
    }
    return $scrollParent;
  },

  /**
   * Handles an event.
   * @private
   */
  _handleEvent: function() {
    var self = this;

    // Check if the listview is visible and an event has not triggered a load already
    if ( !self._eventTriggered && self.element.is( ":visible" ) ) {

      // Block other events from triggering a load
      self._eventTriggered = true;

      // Load items
      self._load( self.options.eventTimeout );
    }
  },

  /**
   * Triggers an error event with specified error code and data.
   * @param {number} errorCode The error code.
   * @param {*} data The error data.
   * @private
   */
  _handleError: function( errorCode, data ) {
    var self = this;

    // Hide the loader
    $( self.options.$progress ).hide();

    // Trigger an event to announce that an error occurred during parsing
    this._trigger( errorEvent, {}, { errorCode: errorCode, errorData: data } );
  },

  /**
   * Returns the window height
   * @return {number} The window height.
   * @private
   */
  _getWindowHeight: function() {
    return $window.height();
  },

  /**
   * Sets an option of the widget.
   * @param {string} key The key of the option.
   * @param {*} value The new value of the option.
   * @private
   */
  _setOption: function( key, value ) {
    this._super( key, value );

    // Trigger a reset if the searchQuery is set
    if ( key === searchQueryOption ) {
      this.reset( this.options.searchTimeout );
    }
  },

  /**
   * Destroys the widget
   */
  destroy: function() {
    var self = this;

    // Remove the event listener
    $window.off( loadTriggerEvents, self._handleEventProxy );

    // Clear the load timeout
    clearTimeout( self._loadTimeout );

    self._super();
  }
} );


} )( jQuery, window );
