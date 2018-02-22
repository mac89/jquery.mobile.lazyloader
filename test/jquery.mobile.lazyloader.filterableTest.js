QUnit.module( "jquery.mobile.lazyloader Test", {
    beforeEach: function() {
        var $qunitFixture = $( "#qunit-fixture" );

        this.$list =
            $( "<ul id=\"myListView\"></ul>" ).appendTo( $qunitFixture ).filterable();

        this.sandbox = sinon.createSandbox();
    },
    afterEach: function() {
        this.sandbox.restore();
    }
}, function() {
    (
        function() {

            var provider = {
                "lazyloaderdoneloading": { event: "lazyloaderdoneloading" },
                "lazyloadererror": { event: "lazyloadererror" }
            };

            for ( var test in provider ) {
                testFilterItems( test, provider[ test ] );
            }

            function testFilterItems( test, testData ) {
                QUnit.test(
                    "_filterItems: Test lazyloader widget, value different from searchQuery and " +
                    test,
                    function( assert ) {
                        var value = "My value";
                        var searchQuery = "My search query";
                        var items = "My items";

                        var filterSpy = sinon.spy();
                        var optionStub = sinon.stub().returns( searchQuery );
                        var widget = {
                            option: optionStub
                        };

                        this.$list.data( "mobile-lazyloader", widget );

                        var data = this.$list.data()[ "mobile-filterable" ];
                        sinon.stub( data, "_getFilterableItems" ).returns( items );

                        this.$list.on( "filterablefilter", filterSpy );

                        data._filterItems( value );

                        this.$list.trigger( testData.event );
                        this.$list.trigger( "lazyloaderdoneloading" );
                        this.$list.trigger( "lazyloadingerror" );

                        assert.ok( filterSpy.calledOnce );
                        assert.ok(
                            filterSpy.calledWithExactly(
                                sinon.match.object, sinon.match.has( "items", items ) ) );
                        assert.ok( optionStub.calledTwice );
                        assert.ok( optionStub.firstCall.calledWithExactly( "searchQuery" ) );
                        assert.ok(
                            optionStub.secondCall.calledWithExactly( "searchQuery", value ) );
                    }
                );
            }
        }
    )();

    QUnit.test(
        "_filterItems: Test lazyloader widget, value different as searchQuery", function( assert ) {
            var value = "My value";
            var searchQuery = value;

            var filterSpy = sinon.spy();
            var optionStub = sinon.stub().returns( searchQuery );
            var widget = {
                option: optionStub
            };

            this.$list.data( "mobile-lazyloader", widget );

            var data = this.$list.data()[ "mobile-filterable" ];

            this.$list.on( "filterablefilter", filterSpy );

            data._filterItems( value );

            this.$list.trigger( "lazyloaderdoneloading" );
            this.$list.trigger( "lazyloadingerror" );

            assert.ok( filterSpy.notCalled );
            assert.ok( optionStub.calledOnce );
            assert.ok( optionStub.firstCall.calledWithExactly( "searchQuery" ) );
        } );

    QUnit.test(
        "_filterItems: Test different widget", function( assert ) {
            var value = "My value";
            var searchQuery = "My search query";

            var optionStub = sinon.stub().returns( searchQuery );
            var widget = {
                option: optionStub
            };

            this.$list.data( "mobile-different", widget );

            var data = this.$list.data()[ "mobile-filterable" ];

            data._filterItems( value );

            this.$list.trigger( "lazyloaderdoneloading" );
            this.$list.trigger( "lazyloadingerror" );

            assert.ok( optionStub.notCalled );
        } );
} );
