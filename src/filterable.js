"use strict";

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
