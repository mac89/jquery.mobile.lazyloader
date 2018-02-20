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
    } ).on( "lazyloadererror", function( e, error ) {
        console.log( "An error occured" );
        console.log( error );
    } );
} );
