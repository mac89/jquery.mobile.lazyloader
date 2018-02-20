(
    function( $, window ) {

        /**
         * The window element.
         * @type {JQuery}
         */
        const $window = $( window ),

            /**
             * The events on which to possibly load more items.
             * @type {string}
             */
            events = "scrollstart scrollstop wheel",

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

        $.widget( "mobile.lazyloader", $.mobile.listview, {
            options: {

                /**
                 * The url to send the request for more items to.
                 */
                url: "",

                /**
                 * The selector or jQuery element of the progress indicator that is shown when
                 * loading more items.
                 */
                $progress: "",

                /**
                 * The id of the ICanHaz template.
                 */
                templateId: ""

            },

            defaults: {

                /**
                 * This is the number of items retrieved so far
                 */
                retrieved: 0,

                /**
                 * This is the number of items to retrieve from server by default
                 */
                retrieve: 10,

                /**
                 * The timeout used before attempting to load more items when it is triggered by
                 * either the scrollstart, scrollstop, or wheel event.
                 */
                eventTimeout: 100,

                /**
                 * Additional data to post along with the request
                 */
                postData: {},

                /**
                 * Threshold for how close to the bottom should we trigger a load of more items -
                 * default to height of viewport
                 */
                threshold: 100,

                /**
                 * The ajax request type.
                 */
                ajaxType: "POST"
            },

            /**
             * The current widget state
             */
            _widgetState: {

                /**
                 * Indicates a request is underway
                 */
                busy: false,

                /**
                 * Indicates all items have been loaded
                 */
                done: false
            },

            /**
             * The constructor.
             * @private
             */
            _create: function() {
                const self = this;

                self._super();

                // Get any user defined settings and extend / merge / override them with
                // defaultSettings
                this.options = $.extend( this.defaults, this.options );

                // Add event listeners
                $window.on( events, self._handleEventProxy = $.proxy( self._handleEvent, self ) );

                // Start loading items
                self.loadMore();
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
                const self = this;

                // Reset the number of retrieved items
                self.options.retrieved = 0;

                // Indicate the widget is no longer done retrieving items
                self._widgetState.done = false;

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
                const self = this,
                    options = self.options,
                    widgetState = self._widgetState;

                // Make sure the plugin is not already lazy loading some items and has not loaded
                // all items already.
                if ( !widgetState.busy && !widgetState.done ) {

                    // Determine the timeout
                    if ( isNaN( timeout ) ) {
                        timeout = 0;
                    }

                    // Indicate the widget is busy
                    widgetState.busy = true;

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

                            // Indicate the widget is no longer busy
                            widgetState.busy = false;
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
                const self = this,
                    options = self.options;

                $.ajax( options.url, {
                     type: "POST",
                     data: $.extend( {}, options.postData, {
                         retrieved: options.retrieved,
                         retrieve: options.retrieve,
                         reset: reset === true
                     } ),
                     dataType: "json"
                 } )
                 .then( self._parseResponse.bind( self ), function( e ) {
                     self._handleError( requestErrorCode, e );
                 } );
            },

            _parseResponse: function( data ) {
                const self = this,
                    options = self.options,
                    widgetState = self._widgetState,
                    items = data.items;

                // Check if the items property is an array
                if ( Array.isArray( items ) ) {
                    const $element = self.element,
                        count = items.length,
                        html = [];

                    // Update the number of retrieved items
                    options.retrieved += count;

                    // Get the ich templates
                    ich.grabTemplates();

                    items.forEach( function( item ) {

                        // Create html for the item using the template
                        html.push( ich[ options.templateId ]( item ) );
                    } );

                    // Add the list items html to the list
                    $element.append( html );

                    // Refresh the listview so it is re-enhanced by JQM
                    self.refresh();

                    // Get the height of the listview and window
                    const elementHeight = $element.height(),
                        windowHeight = $window.height();

                    // Only hide the progress element if no more items are going to be loaded
                    // immediately after this
                    if ( elementHeight > windowHeight ) {

                        // Hide the progress element
                        $( options.$progress ).hide();
                    }

                    // The request is finished
                    widgetState.busy = false;

                    if ( count < options.retrieve ) {

                        // Indicate all items have been loaded
                        widgetState.done = true;

                        // Trigger an event to announce that the lazyloader is done
                        // loading entirely
                        self._trigger( "alldone" );
                    }

                    // Trigger an event to announce that the lazyloader is done loading
                    // that chunk
                    self._trigger( "doneloading" );

                    // No scrolling is possible yet, so load some more right away
                    if ( elementHeight <= windowHeight ) {
                        self.loadMore();
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
                const self = this;

                // Check if the listview is visible
                if ( self.element.is( ":visible" ) ) {

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
                const self = this;

                // Hide the loader
                $( self.options.$progress ).hide();

                // The request is finished
                self._widgetState.busy = false;

                // Trigger an event to announce that an error occurred during parsing
                this._trigger( "error", {}, { errorCode: errorCode, errorData: data } );
            },

            /**
             * Destroys the widget
             */
            destroy: function() {
                const self = this;

                // Remove the event listener
                $window.off( events, self._handleEventProxy );

                // Clear the load timeout
                clearTimeout( self._loadTimeout );

                self._super();
            }
        } );

    }
)( jQuery, window );
