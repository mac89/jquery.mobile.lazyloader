/**
 * Adds the fixture
 */
QUnit.begin( function() {
    $( "body" ).append( "<div id=\"qunit-fixture\"></div>" );
} );

/**
 * Removes the fixture
 */
QUnit.done( function() {
    $( "#qunit-fixture" ).remove();
} );
