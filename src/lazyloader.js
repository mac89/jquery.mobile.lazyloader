"use strict";

// Check if the first scroll event should be ignored
if ( ignoreEvent ) {

  // It should be ignored so listen to the first scroll event to toggle the boolean
  $window.one( "scrollstart", function() {
    ignoreEvent = false;
  } );
}

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
     * Additional data to post along with the request.
     * @type {Object}
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
     */
    ajaxType: "POST"
  },

  /**
   * The constructor.
   * @private
   */
  _create: function() {
    var self = this;

    self._done = false;

    // Get any user defined settings and extend / merge / override them with
    // defaultSettings
    this.options = $.extend( this.defaults, this.options );

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

      // Don't try to load anything until the scroll is given some time to get closer
      // to the bottom
      self._loadTimeout = setTimeout( function() {

        // Check if the page scroll location is close to the bottom
        if ( self.element.height() - options.threshold <=
          $window.scrollTop() + $window.height() ) {

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

    jqXHR = $.ajax( options.url, {
      type: options.ajaxType,
      data: $.extend( {}, options.postData, {
        retrieved: options.retrieved,
        retrieve: options.retrieve,
        reset: reset === true,
        searchQuery: options.searchQuery
      } ),
      dataType: "json"
    } );

    self.jqXHR = jqXHR;

    jqXHR.then( self._parseResponse.bind( self ), function( e, textStatus ) {
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
   * @private
   */
  _parseResponse: function( data, textStatus ) {
    if ( textStatus === "abort" ) {
      return;
    }

    var self = this,
      options = self.options,
      items = data.items;

    // Check if the items property is an array
    if ( Array.isArray( items ) ) {
      var $element = self.element,
        count = items.length,
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

      // Get the height of the listview and window
      var elementHeightExceedsWindowHeight = $element.height() > $window.height();

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
   * Handles an event.
   * @private
   */
  _handleEvent: function() {
    var self = this;

    // Check if the listview is visible and an event has not triggered a load already or if it
    // should be ignored
    if ( !self._eventTriggered && !ignoreEvent && self.element.is( ":visible" ) ) {

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
   * Sets an option of the widget.
   * @param {string} key The key of the option.
   * @param {*} value The new value of the option.
   * @private
   */
  _setOption: function( key, value ) {
    this._super( key, value );

    // Trigger a reset if the searchQuery is set
    if ( key === searchQueryOption ) {
      this.reset();
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
