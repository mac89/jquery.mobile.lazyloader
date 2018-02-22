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
