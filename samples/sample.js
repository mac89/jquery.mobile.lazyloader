$( function() {
  $( "#myListView" ).lazyloader(
    {
      url: "http://localhost:3000",
      templateId: "user",
      $progress: "#myProgress"
    }
  ).on( "lazyloaderdoneloading", function() {
    console.log( "Loaded more items" );
  } ).on( "lazyloaderalldone", function() {
    console.log( "All items are loaded" );
  } ).on( "lazyloaderbeforerender", function( e, items ) {
    console.log( "Items to be rendered" );
    console.log( items );

    // Manipulate items before they are rendered
    items.forEach( function( item ) {
      item.name += " Mackenzie";
    } );

  } ).on( "lazyloadererror", function( e, error ) {
    console.log( "An error occured" );
    console.log( error );
  } ).on( "filterablefilter", function( e, items ) {
    console.log( "Filtered items" );
    console.log( items );
  } );
} );
