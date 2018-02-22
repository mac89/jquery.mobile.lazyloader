QUnit.module( "jquery.mobile.lazyloader Test", {
    beforeEach: function() {
        var $qunitFixture = $( "#qunit-fixture" );

        this.sandbox = sinon.createSandbox();
        this.clock = this.sandbox.useFakeTimers();
        this.ajaxStub = this.sandbox.stub( $, "ajax" ).callsFake( function( event ) {
            var result = $.Deferred();
            result.args = event;
            return result;
        } );

        this.$list = $( "<ul id=\"myListView\"></ul>" ).appendTo( $qunitFixture );
        this.$progress = $( "<div id=\"myProgress\"></div>" ).appendTo( $qunitFixture );
        $( "<script id=\"user\" type=\"text/html\"><li>{{ name }}</li></script >" )
            .appendTo( $qunitFixture );

        this.windowId = "myWindow";

        $( window ).attr( "id", this.windowId );
    },
    afterEach: function() {
        ich.clearAll();
        this.sandbox.restore();
    }
}, function() {
    QUnit.test( "_create", function( assert ) {
        var url = "http://localhost:3000",
            templateId = "user",
            $progress = this.$progress,
            retrieved = 30,
            retrieve = 40,
            eventTimeout = 200,
            postData = { additionalData: "hello" },
            threshold = 300,
            ajaxType = "GET";

        var options = {
            url: url,
            templateId: templateId,
            $progress: $progress,
            retrieved: retrieved,
            retrieve: retrieve,
            eventTimeout: eventTimeout,
            postData: postData,
            threshold: threshold,
            ajaxType: ajaxType
        };

        var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );

        this.$list.lazyloader( options );

        var data = this.$list.data()[ "mobile-lazyloader" ];

        assert.equal( data.options.url, url );
        assert.equal( data.options.templateId, templateId );
        assert.equal( data.options.$progress, $progress );
        assert.equal( data.options.retrieved, retrieved );
        assert.equal( data.options.retrieve, retrieve );
        assert.equal( data.options.eventTimeout, eventTimeout );
        assert.deepEqual( data.options.postData, postData );
        assert.equal( data.options.threshold, threshold );
        assert.equal( data.options.ajaxType, ajaxType );

        assert.ok( loadStub.calledOnce );
    } );

    QUnit.test( "loadMore", function( assert ) {
        var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );

        var timeout = 100;

        this.$list.lazyloader().lazyloader( "loadMore", timeout );

        assert.ok( loadStub.calledTwice );
        assert.ok( loadStub.secondCall.calledWithExactly( timeout ) );
    } );

    QUnit.test( "_setOption: searchQuery", function( assert ) {
        var resetStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "reset" );

        this.$list.lazyloader().lazyloader( "option", "searchQuery", "Test" );

        assert.ok( resetStub.calledOnce );
    } );

    QUnit.test( "_setOption: retrieve", function( assert ) {
        var resetStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "reset" );

        this.$list.lazyloader().lazyloader( "option", "retrieve", 50 );

        assert.ok( resetStub.notCalled );
    } );

    QUnit.test( "reset", function( assert ) {
        var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );

        var timeout = 100;

        this.$list.append( "<li></li>" );

        this.$list.lazyloader();

        var data = this.$list.data()[ "mobile-lazyloader" ];
        data._done = true;
        data.options.retrieved = 3;

        this.$list.lazyloader( "reset", timeout );

        assert.ok( loadStub.calledTwice );
        assert.ok( loadStub.secondCall.calledWithExactly( timeout, true ) );

        assert.equal( this.$list.children().length, 0 );
        assert.equal( data._done, false );
        assert.equal( data.options.retrieved, 0 );
    } );

    QUnit.test( "_load: Test widget is done", function( assert ) {
        var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

        this.$list.lazyloader();

        _loadStub.restore();

        var data = this.$list.data()[ "mobile-lazyloader" ];
        data._done = true;

        data._load();

        this.clock.tick( 0 );

        assert.ok( this.ajaxStub.notCalled );
    } );

    QUnit.test( "_load: Test threshold is not exceeded", function( assert ) {
        var self = this,
            listHeight = 400,
            windowHeight = 300,
            threshold = 49,
            windowScrollTop = 50;

        var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

        var doneloadingSpy = sinon.spy();

        this.$list.lazyloader( { threshold: threshold } )
            .on( "lazyloaderdoneloading", doneloadingSpy );

        _loadStub.restore();

        var data = this.$list.data()[ "mobile-lazyloader" ];
        data._eventTriggered = true;

        this.sandbox.stub( $.prototype, "height" ).callsFake( function() {
            if ( $( this ).attr( "id" ) === self.windowId ) {
                return windowHeight;
            } else {
                return listHeight;
            }
        } );

        this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );

        data._load();

        this.clock.tick( 0 );

        assert.ok( this.ajaxStub.notCalled );
        assert.ok( doneloadingSpy.calledOnce );
        assert.notOk( data._eventTriggered );
    } );

    QUnit.test( "_load: Test threshold is exceeded and the ajax request fails", function( assert ) {
        var self = this,
            listHeight = 400,
            windowHeight = 300,
            threshold = 50,
            windowScrollTop = 50,
            url = "http://localhost:3000",
            retrieved = 30,
            retrieve = 40,
            postData = { additionalData: "hello" },
            ajaxType = "GET";

        this.$progress.hide();

        var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

        var errorSpy = sinon.spy();

        this.$list.lazyloader( {
            url: url,
            $progress: this.$progress,
            retrieved: retrieved,
            retrieve: retrieve,
            postData: postData,
            threshold: threshold,
            ajaxType: ajaxType
        } ).on( "lazyloadererror", errorSpy );

        _loadStub.restore();

        var data = this.$list.data()[ "mobile-lazyloader" ];
        data._eventTriggered = true;

        this.sandbox.stub( $.prototype, "height" ).callsFake( function() {
            if ( $( this ).attr( "id" ) === self.windowId ) {
                return windowHeight;
            } else {
                return listHeight;
            }
        } );

        this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );

        data._load();

        this.clock.tick( 0 );

        assert.ok( this.$progress.is( ":visible" ) );

        // Get first ajax call
        var call = $.ajax.getCall( 0 ).returnValue;

        var errorData = "My error data";

        // To return failed ajax call (having used .reject() )
        call.reject( errorData );

        assert.ok(
            this.ajaxStub.calledWithExactly( url, sinon.match( {
                type: ajaxType,
                data: {
                    retrieved: retrieved,
                    retrieve: retrieve,
                    reset: false,
                    additionalData: postData.additionalData
                },
                dataType: "json"
            } ) ) );

        assert.ok( errorSpy.calledWithExactly(
            sinon.match.object,
            sinon.match( { errorCode: 1, errorData: errorData } )
        ) );

        assert.notOk( data._eventTriggered );
    } );

    QUnit.test(
        "_load: Test threshold is exceeded and the ajax request succeeds, but the parsing fails",
        function( assert ) {
            var self = this,
                listHeight = 400,
                windowHeight = 300,
                threshold = 50,
                windowScrollTop = 50,
                url = "http://localhost:3000",
                retrieved = 30,
                retrieve = 40,
                postData = { additionalData: "hello" },
                ajaxType = "GET";

            this.$progress.hide();

            var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

            var errorSpy = sinon.spy();

            this.$list.lazyloader( {
                url: url,
                $progress: this.$progress,
                retrieved: retrieved,
                retrieve: retrieve,
                postData: postData,
                threshold: threshold,
                ajaxType: ajaxType
            } ).on( "lazyloadererror", errorSpy );

            _loadStub.restore();

            var data = this.$list.data()[ "mobile-lazyloader" ];
            data._eventTriggered = true;

            this.sandbox.stub( $.prototype, "height" ).callsFake( function() {
                if ( $( this ).attr( "id" ) === self.windowId ) {
                    return windowHeight;
                } else {
                    return listHeight;
                }
            } );

            this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );

            data._load();

            this.clock.tick( 0 );

            assert.ok( this.$progress.is( ":visible" ) );

            // Get first ajax call
            var call = $.ajax.getCall( 0 ).returnValue;

            var responseData = { items: "Not an array" };

            // To return successful ajax call (having used .resolve() )
            call.resolve( responseData );

            assert.ok(
                this.ajaxStub.calledWithExactly( url, sinon.match( {
                    type: ajaxType,
                    data: {
                        retrieved: retrieved,
                        retrieve: retrieve,
                        reset: false,
                        additionalData: postData.additionalData
                    },
                    dataType: "json"
                } ) ) );

            assert.ok( errorSpy.calledWithExactly(
                sinon.match.object,
                sinon.match( { errorCode: 2, errorData: responseData } )
            ) );

            assert.notOk( data._eventTriggered );
        }
    );

    (
        function() {
            var provider = {
                "Retrieved item nr less than requested item nr and list smaller than window": {
                    retrieve: 3,
                    listHeightAfterLoad: 300,
                    assertProgressIsVisible: false,
                    assertAllDone: true,
                    assertLoadIsCalledAgain: false,
                    assertDoneLoading: true
                },
                "Retrieved item nr less than requested item nr and list higher than window": {
                    retrieve: 3,
                    listHeightAfterLoad: 500,
                    assertProgressIsVisible: false,
                    assertAllDone: true,
                    assertLoadIsCalledAgain: false,
                    assertDoneLoading: true
                },
                "Retrieved item nr equal to requested item nr and list smaller than window": {
                    retrieve: 2,
                    listHeightAfterLoad: 300,
                    assertProgressIsVisible: true,
                    assertAllDone: false,
                    assertLoadIsCalledAgain: true,
                    assertDoneLoading: false
                },
                "Retrieved item nr equal to requested item nr and list higher than window": {
                    retrieve: 2,
                    listHeightAfterLoad: 500,
                    assertProgressIsVisible: false,
                    assertAllDone: false,
                    assertLoadIsCalledAgain: false,
                    assertDoneLoading: true
                }
            };

            for ( var test in provider ) {
                testLoad( test, provider[ test ] );
            }

            function testLoad( test, testData ) {
                QUnit.test(
                    "_load: Test threshold is exceeded and the ajax request succeeds. " + test,
                    function( assert ) {
                        var self = this,
                            listHeightBeforeLoad = 100,
                            windowHeightBeforeLoad = 200,
                            windowHeightAfterLoad = 400,
                            windowScrollTop = 50,

                            windowHeightCallNr = 1,
                            listHeightCallNr = 1,

                            url = "http://localhost:3000",
                            templateId = "user",
                            $progress = this.$progress,
                            retrieved = 30,
                            retrieve = testData.retrieve,
                            eventTimeout = 200,
                            postData = { additionalData: "hello" },
                            threshold = 300,
                            ajaxType = "GET";

                        var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

                        this.sandbox.stub( $.prototype, "height" ).callsFake( function() {
                            if ( $( this ).attr( "id" ) === self.windowId ) {
                                windowHeightCallNr += 1;

                                if ( windowHeightCallNr === 1 ) {
                                    return windowHeightBeforeLoad;
                                } else {
                                    return windowHeightAfterLoad;
                                }
                            } else {
                                listHeightCallNr += 1;

                                if ( listHeightCallNr === 1 ) {
                                    return listHeightBeforeLoad;
                                } else {
                                    return testData.listHeightAfterLoad;
                                }
                            }
                        } );

                        this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );

                        var options = {
                            url: url,
                            templateId: templateId,
                            $progress: $progress,
                            retrieved: retrieved,
                            retrieve: retrieve,
                            eventTimeout: eventTimeout,
                            postData: postData,
                            threshold: threshold,
                            ajaxType: ajaxType
                        };

                        this.$progress.hide();

                        var beforerenderSpy = sinon.spy();
                        var doneloadingSpy = sinon.spy();
                        var alldoneSpy = sinon.spy();

                        this.$list.lazyloader( options )
                            .on( "lazyloaderbeforerender", beforerenderSpy )
                            .on( "lazyloaderdoneloading", doneloadingSpy )
                            .on( "lazyloaderalldone", alldoneSpy );

                        _loadStub.restore();

                        var _loadSpy = this.sandbox.spy( $.mobile.lazyloader.prototype, "_load" );

                        var data = this.$list.data()[ "mobile-lazyloader" ];
                        data._eventTriggered = true;

                        data._load();

                        this.clock.tick( 0 );

                        assert.ok( this.$progress.is( ":visible" ) );

                        // Get first ajax call
                        var call = $.ajax.getCall( 0 ).returnValue;

                        var items = [ { name: "John" }, { name: "Jane" } ];
                        var responseData = { items: items };

                        // To return successful ajax call (having used .resolve() )
                        call.resolve( responseData );

                        assert.ok(
                            this.ajaxStub.calledWithExactly( url, sinon.match( {
                                type: ajaxType,
                                data: {
                                    retrieved: retrieved,
                                    retrieve: retrieve,
                                    reset: false,
                                    additionalData: postData.additionalData
                                },
                                dataType: "json"
                            } ) ) );

                        var $listItems = this.$list.children( "li" );

                        assert.equal( $listItems.length, items.length );

                        for ( var i = 0; i < items.length; i++ ) {
                            assert.equal( $( $listItems.get( i ) ).html(), items[ i ].name );
                        }

                        assert.equal( data.options.retrieved, retrieved + items.length );
                        assert.equal( doneloadingSpy.calledOnce, testData.assertDoneLoading );
                        assert.ok( beforerenderSpy.calledWithExactly( sinon.match.object, items ) );

                        assert.equal(
                            this.$progress.is( ":visible" ), testData.assertProgressIsVisible );

                        assert.equal( data._done, testData.assertAllDone );
                        assert.equal( alldoneSpy.calledOnce, testData.assertAllDone );

                        assert.equal( _loadSpy.calledTwice, testData.assertLoadIsCalledAgain );
                        assert.notOk( data._eventTriggered );
                    }
                );
            }
        }
    )();

    (
        function() {
            var provider = {
                "scrollstart with no previous event": {
                    event: "scrollstart",
                    eventTriggered: false,
                    expectedLoadCallCount: 2
                },
                "scrollstop with no previous event ": {
                    event: "scrollstop",
                    eventTriggered: false,
                    expectedLoadCallCount: 2
                },
                "wheel with no previous event": {
                    event: "wheel",
                    eventTriggered: false,
                    expectedLoadCallCount: 2
                },
                "scrollstart with a previous event": {
                    event: "scrollstart",
                    eventTriggered: true,
                    expectedLoadCallCount: 1
                },
                "scrollstop with a previous event": {
                    event: "scrollstop",
                    eventTriggered: true,
                    expectedLoadCallCount: 1
                },
                "wheel with a previous event": {
                    event: "wheel",
                    eventTriggered: true,
                    expectedLoadCallCount: 1
                }
            };

            for ( var test in provider ) {
                testConstructor( test, provider[ test ] );
            }

            function testConstructor( test, testData ) {
                QUnit.test(
                    "constructor: Test event '" + test + "' fired and list is visible",
                    function( assert ) {
                        var eventTimeout = 200;

                        var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );

                        this.$list.lazyloader( { eventTimeout: eventTimeout } );

                        var data = this.$list.data()[ "mobile-lazyloader" ];
                        data._eventTriggered = testData.eventTriggered;

                        $( window ).trigger( testData.event );

                        assert.ok( data._eventTriggered );
                        assert.equal( loadStub.callCount, testData.expectedLoadCallCount );

                        if ( loadStub.secondCall ) {
                            assert.ok( loadStub.secondCall.calledWithExactly( eventTimeout ) );
                        }
                    }
                );
            }
        }
    )();

    (
        function() {
            var provider = {
                "scrollstart": { event: "scrollstart" },
                "scrollstop": { event: "scrollstop" },
                "wheel": { event: "wheel" }
            };

            for ( var test in provider ) {
                testConstructor( test, provider[ test ] );
            }

            function testConstructor( test, testData ) {
                QUnit.test(
                    "constructor: Test event '" + test + "' fired and list is not visible",
                    function( assert ) {
                        this.$list.hide();

                        var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );

                        this.$list.lazyloader();

                        $( window ).trigger( testData.event );

                        var data = this.$list.data()[ "mobile-lazyloader" ];

                        assert.notOk( data._eventTriggered );
                        assert.ok( loadStub.calledOnce );
                    }
                );
            }
        }
    )();

    (
        function() {
            var provider = {
                "scrollstart": { event: "scrollstart" },
                "scrollstop": { event: "scrollstop" },
                "wheel": { event: "wheel" }
            };

            for ( var test in provider ) {
                testConstructor( test, provider[ test ] );
            }

            function testConstructor( test, testData ) {
                QUnit.test(
                    "constructor: Test event '" + test + "' fired and widget is destroyed",
                    function( assert ) {
                        var _loadTimeout = 999;

                        var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );
                        var clearTimeoutSpy = this.sandbox.spy( window, "clearTimeout" );

                        this.$list.lazyloader();

                        var data = this.$list.data()[ "mobile-lazyloader" ];
                        data._loadTimeout = _loadTimeout;

                        this.$list.lazyloader( "destroy" );

                        $( window ).trigger( testData.event );

                        assert.ok( loadStub.calledOnce );
                        assert.ok( clearTimeoutSpy.calledWithExactly( _loadTimeout ) );
                    }
                );
            }
        }
    )();

} );
