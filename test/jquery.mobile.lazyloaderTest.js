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
    this.clearTimeoutStub = this.sandbox.stub( window, "clearTimeout" );

    this.$scrollContainer =
      $( "<div style='overflow: scroll'></div>" ).appendTo( $qunitFixture );
    this.$list = $( "<ul id=\"myListView\"></ul>" ).appendTo( this.$scrollContainer );
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
      ajaxType = "GET",
      ajaxSettings = {
        global: false,
        type: "POST"
      };

    var options = {
      url: url,
      templateId: templateId,
      $progress: $progress,
      retrieved: retrieved,
      retrieve: retrieve,
      eventTimeout: eventTimeout,
      postData: postData,
      threshold: threshold,
      ajaxType: ajaxType,
      ajaxSettings: ajaxSettings
    };

    var loadStub = this.sandbox.stub( $.mobile.lazyloader.prototype, "_load" );

    this.$list.lazyloader( options );

    var data = this.$list.data()[ "mobile-lazyloader" ];

    assert.equal( data._done, false );
    assert.equal( data._lastRequestTime, 0 );
    assert.equal( data.options.url, url );
    assert.equal( data.options.templateId, templateId );
    assert.equal( data.options.$progress, $progress );
    assert.equal( data.options.retrieved, retrieved );
    assert.equal( data.options.retrieve, retrieve );
    assert.equal( data.options.eventTimeout, eventTimeout );
    assert.deepEqual( data.options.postData, postData );
    assert.equal( data.options.threshold, threshold );
    assert.equal( data.options.ajaxType, ajaxType );
    assert.deepEqual( data.options.ajaxSettings, ajaxSettings );

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
    var eventSpy = sinon.spy();

    var timeout = 100;

    this.$list.append( "<li></li>" );

    this.$list.on( "lazyloaderreset", eventSpy );

    this.$list.lazyloader();

    var data = this.$list.data()[ "mobile-lazyloader" ];
    data._done = true;
    data.options.retrieved = 3;

    this.$list.lazyloader( "reset", timeout );

    assert.ok( eventSpy.calledOnce );

    assert.ok( loadStub.calledTwice );
    assert.ok( loadStub.secondCall.calledWithExactly( timeout, true ) );

    assert.equal( this.$list.children().length, 0 );
    assert.equal( data._done, false );
    assert.equal( data._blockEventRequest, true );
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

    assert.ok( this.clearTimeoutStub.notCalled );
    assert.ok( this.ajaxStub.notCalled );
  } );

  QUnit.test( "_load: Test threshold is not exceeded", function( assert ) {
    var listHeight = 400,
      windowHeight = 300,
      threshold = 49,
      windowScrollTop = 50,
      _loadTimeout = 999;

    var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

    var doneloadingSpy = sinon.spy();

    this.$scrollContainer.hide();
    var originalContainerStyle = this.$scrollContainer.attr( "style" );

    this.$list.height( listHeight );
    this.$list.lazyloader( { threshold: threshold } )
      .on( "lazyloaderdoneloading", doneloadingSpy );

    _loadStub.restore();

    var data = this.$list.data()[ "mobile-lazyloader" ];
    data._blockEventRequest = true;
    data._loadTimeout = _loadTimeout;

    this.sandbox.stub( data, "_getWindowHeight" ).returns( windowHeight );
    this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );
    this.sandbox.stub( $.prototype, "offset" ).returns( { top: 0 } );

    data._load();

    this.clock.tick( 0 );

    assert.ok( this.clearTimeoutStub.calledWithExactly( _loadTimeout ) );
    assert.ok( this.ajaxStub.notCalled );
    assert.ok( doneloadingSpy.calledOnce );
    assert.notOk( data._blockEventRequest );
    assert.equal( this.$scrollContainer.attr( "style" ), originalContainerStyle );
  } );

  QUnit.test( "_load: Test threshold is exceeded and the ajax request fails", function( assert ) {
    var
      listHeight = 400,
      windowHeight = 300,
      threshold = 50,
      windowScrollTop = 50,
      url = "http://localhost:3000",
      retrieved = 30,
      retrieve = 40,
      postData = { additionalData: "hello" },
      ajaxType = "GET",
      ajaxSettings = {
        global: false,
        type: "POST"
      },
      _loadTimeout = 999;

    this.$progress.hide();

    this.$scrollContainer.hide();
    var originalContainerStyle = this.$scrollContainer.attr( "style" );

    this.$list.height( listHeight );
    var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

    var errorSpy = sinon.spy();

    this.$list.lazyloader( {
      url: url,
      $progress: this.$progress,
      retrieved: retrieved,
      retrieve: retrieve,
      postData: postData,
      threshold: threshold,
      ajaxType: ajaxType,
      ajaxSettings: ajaxSettings
    } ).on( "lazyloadererror", errorSpy );

    _loadStub.restore();

    var data = this.$list.data()[ "mobile-lazyloader" ];
    data._blockEventRequest = true;
    data._loadTimeout = _loadTimeout;

    this.sandbox.stub( data, "_getWindowHeight" ).returns( windowHeight );
    this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );

    data._load();

    this.clock.tick( 0 );

    assert.ok( this.$progress.is( ":visible" ) );

    // Get first ajax call
    var call = $.ajax.getCall( 0 ).returnValue;

    var errorData = "My error data";

    // To return failed ajax call (having used .reject() )
    call.reject( errorData );

    assert.ok( this.clearTimeoutStub.calledWithExactly( _loadTimeout ) );
    assert.ok(
      this.ajaxStub.calledWithExactly( url, sinon.match( {
        type: ajaxSettings.type,
        data: {
          retrieved: retrieved,
          retrieve: retrieve,
          reset: false,
          additionalData: postData.additionalData
        },
        dataType: "json",
        global: ajaxSettings.global
      } ) ) );

    assert.ok( errorSpy.calledWithExactly(
      sinon.match.object,
      sinon.match( { errorCode: 1, errorData: errorData } )
    ) );

    assert.notOk( data._blockEventRequest );
    assert.equal( this.$scrollContainer.attr( "style" ), originalContainerStyle );
  } );

  QUnit.test(
    "_load: Test threshold is exceeded and the ajax request succeeds, but the parsing fails",
    function( assert ) {
      var
        listHeight = 400,
        windowHeight = 300,
        threshold = 50,
        windowScrollTop = 50,
        url = "http://localhost:3000",
        retrieved = 30,
        retrieve = 40,
        postData = { additionalData: "hello" },
        ajaxType = "GET",
        ajaxSettings = {
          global: false,
          type: "POST"
        },
        _loadTimeout = 999;

      this.$progress.hide();

      this.$scrollContainer.hide();
      var originalContainerStyle = this.$scrollContainer.attr( "style" );

      var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

      var errorSpy = sinon.spy();

      this.$list.lazyloader( {
        url: url,
        $progress: this.$progress,
        retrieved: retrieved,
        retrieve: retrieve,
        postData: postData,
        threshold: threshold,
        ajaxType: ajaxType,
        ajaxSettings: ajaxSettings
      } ).on( "lazyloadererror", errorSpy );

      _loadStub.restore();

      var data = this.$list.data()[ "mobile-lazyloader" ];
      data._blockEventRequest = true;
      data._loadTimeout = _loadTimeout;

      this.$list.height( listHeight );

      this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );
      this.sandbox.stub( data, "_getWindowHeight" ).returns( windowHeight );

      data._load();

      this.clock.tick( 0 );

      assert.ok( this.$progress.is( ":visible" ) );

      // Get first ajax call
      var call = $.ajax.getCall( 0 ).returnValue;

      var responseData = { items: "Not an array" };

      // To return successful ajax call (having used .resolve() )
      call.resolve( responseData );

      assert.ok( this.clearTimeoutStub.calledWithExactly( _loadTimeout ) );
      assert.ok(
        this.ajaxStub.calledWithExactly( url, sinon.match( {
          type: ajaxSettings.type,
          data: {
            retrieved: retrieved,
            retrieve: retrieve,
            reset: false,
            additionalData: postData.additionalData
          },
          dataType: "json",
          global: ajaxSettings.global
        } ) ) );

      assert.ok( errorSpy.calledWithExactly(
        sinon.match.object,
        sinon.match( { errorCode: 2, errorData: responseData } )
      ) );

      assert.notOk( data._blockEventRequest );
      assert.equal( this.$scrollContainer.attr( "style" ), originalContainerStyle );
    }
  );

  QUnit.test(
    "_load: Test threshold is exceeded and the ajax request succeeds, " +
    "but the request's time is lower than the last request's time",
    function( assert ) {
      var
        listHeight = 400,
        windowHeight = 300,
        threshold = 50,
        windowScrollTop = 50,
        url = "http://localhost:3000",
        retrieved = 30,
        retrieve = 40,
        postData = { additionalData: "hello" },
        ajaxType = "GET",
        ajaxSettings = {
          global: false,
          type: "POST"
        },
        _loadTimeout = 999;

      this.$progress.hide();

      var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

      var eventSpy = sinon.spy();

      this.$list.lazyloader( {
        url: url,
        $progress: this.$progress,
        retrieved: retrieved,
        retrieve: retrieve,
        postData: postData,
        threshold: threshold,
        ajaxType: ajaxType,
        ajaxSettings: ajaxSettings
      } ).on( "lazyloadererror", eventSpy )
        .on( "lazyloaderbeforerender", eventSpy )
        .on( "lazyloaderdoneloading", eventSpy )
        .on( "lazyloaderalldone", eventSpy );

      _loadStub.restore();

      var data = this.$list.data()[ "mobile-lazyloader" ];
      data._blockEventRequest = true;
      data._loadTimeout = _loadTimeout;

      this.$scrollContainer.height( windowHeight ).hide();
      var originalContainerStyle = this.$scrollContainer.attr( "style" );

      this.$list.height( listHeight );

      this.sandbox.stub( $.prototype, "scrollTop" ).returns( windowScrollTop );

      data._load();

      this.clock.tick( 0 );

      assert.ok( this.$progress.is( ":visible" ) );

      data._lastRequestTime = 1;

      // Get first ajax call
      var call = $.ajax.getCall( 0 ).returnValue;

      var responseData = { items: "Not an array" };

      // To return successful ajax call (having used .resolve() )
      call.resolve( responseData );

      assert.ok( this.clearTimeoutStub.calledWithExactly( _loadTimeout ) );
      assert.ok(
        this.ajaxStub.calledWithExactly( url, sinon.match( {
          type: ajaxSettings.type,
          data: {
            retrieved: retrieved,
            retrieve: retrieve,
            reset: false,
            additionalData: postData.additionalData
          },
          dataType: "json",
          global: ajaxSettings.global
        } ) ) );

      assert.ok( eventSpy.notCalled );

      assert.notOk( data._blockEventRequest );
      assert.equal( this.$scrollContainer.attr( "style" ), originalContainerStyle );
    }
  );

  (
    function() {
      var existingItem = { name: "Jill" };
      var items = [ { name: "John" }, { name: "Jane" } ];
      var itemsWithExistingItem = $.merge( [ existingItem ], items );
      var retrieved = 30;
      var windowHeightBeforeLoad = 200,
        windowHeightAfterLoad = 400;

      var provider = {
        // eslint-disable-next-line max-len
        "Retrieved item nr less than requested item nr and list smaller than window. Reset is set to false": {
          retrieve: 3,
          listHeightAfterLoad: 300,
          windowHeights: [ windowHeightBeforeLoad, windowHeightAfterLoad ],
          assertProgressIsVisible: false,
          assertAllDone: true,
          assertLoadIsCalledAgain: false,
          assertDoneLoading: true,
          reset: false,
          expectedListItems: itemsWithExistingItem,
          expectedRetrieved: retrieved
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr less than requested item nr and list higher than window. Reset is set to false": {
          retrieve: 3,
          listHeightAfterLoad: 500,
          windowHeights: [ windowHeightBeforeLoad, windowHeightAfterLoad ],
          assertProgressIsVisible: false,
          assertAllDone: true,
          assertLoadIsCalledAgain: false,
          assertDoneLoading: true,
          reset: false,
          expectedListItems: itemsWithExistingItem,
          expectedRetrieved: retrieved
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr equal to requested item nr and list smaller than window. Reset is set to false": {
          retrieve: 2,
          listHeightAfterLoad: 300,
          windowHeights: [ windowHeightBeforeLoad, windowHeightAfterLoad ],
          assertProgressIsVisible: true,
          assertAllDone: false,
          assertLoadIsCalledAgain: true,
          assertDoneLoading: false,
          reset: false,
          expectedListItems: itemsWithExistingItem,
          expectedRetrieved: retrieved
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr equal to requested item nr and list higher than window. Reset is set to false": {
          retrieve: 2,
          listHeightAfterLoad: 500,
          windowHeights: [ windowHeightBeforeLoad, windowHeightAfterLoad ],
          assertProgressIsVisible: false,
          assertAllDone: false,
          assertLoadIsCalledAgain: false,
          assertDoneLoading: true,
          reset: false,
          expectedListItems: itemsWithExistingItem,
          expectedRetrieved: retrieved
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr less than requested item nr and list smaller than window. Reset is set to true": {
          retrieve: 3,
          listHeightAfterLoad: 300,
          windowHeights: [ windowHeightAfterLoad ],
          assertProgressIsVisible: false,
          assertAllDone: true,
          assertLoadIsCalledAgain: false,
          assertDoneLoading: true,
          reset: true,
          expectedListItems: items,
          expectedRetrieved: 0
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr less than requested item nr and list higher than window. Reset is set to true": {
          retrieve: 3,
          listHeightAfterLoad: 500,
          windowHeights: [ windowHeightAfterLoad ],
          assertProgressIsVisible: false,
          assertAllDone: true,
          assertLoadIsCalledAgain: false,
          assertDoneLoading: true,
          reset: true,
          expectedListItems: items,
          expectedRetrieved: 0
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr equal to requested item nr and list smaller than window. Reset is set to true": {
          retrieve: 2,
          listHeightAfterLoad: 300,
          windowHeights: [ windowHeightAfterLoad ],
          assertProgressIsVisible: true,
          assertAllDone: false,
          assertLoadIsCalledAgain: true,
          assertDoneLoading: false,
          reset: true,
          expectedListItems: items,
          expectedRetrieved: 0
        },
        // eslint-disable-next-line max-len
        "Retrieved item nr equal to requested item nr and list higher than window. Reset is set to true": {
          retrieve: 2,
          listHeightAfterLoad: 500,
          windowHeights: [ windowHeightAfterLoad ],
          assertProgressIsVisible: false,
          assertAllDone: false,
          assertLoadIsCalledAgain: false,
          assertDoneLoading: true,
          reset: true,
          expectedListItems: items,
          expectedRetrieved: 0
        }
      };

      for ( var test in provider ) {
        testLoad( test, provider[ test ] );
      }

      function testLoad( test, testData ) {
        QUnit.test(
          "_load: Test threshold is exceeded and the ajax request succeeds. " + test,
          function( assert ) {
            var listHeightBeforeLoad = 100,
              windowScrollTop = 50,

              url = "http://localhost:3000",
              templateId = "user",
              $progress = this.$progress,
              retrieve = testData.retrieve,
              eventTimeout = 200,
              postData = { additionalData: "hello" },
              threshold = 300,
              ajaxType = "GET",
              ajaxSettings = {
                global: false,
                type: "POST"
              },
              _loadTimeout = 999;

            var _loadStub = sinon.stub( $.mobile.lazyloader.prototype, "_load" );

            this.$list.append( "<li>" + existingItem.name + "</li>" )
              .height( listHeightBeforeLoad );

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
              ajaxType: ajaxType,
              ajaxSettings: ajaxSettings
            };

            this.$progress.hide();

            this.$scrollContainer.hide();
            var originalContainerStyle = this.$scrollContainer.attr( "style" );

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
            data._blockEventRequest = true;
            data._loadTimeout = _loadTimeout;

            var getWindowHeightStub = this.sandbox.stub( data, "_getWindowHeight" );

            for ( var j = 0; j < testData.windowHeights.length; j++ ) {
              getWindowHeightStub.onCall( j ).returns( testData.windowHeights[ j ] );
            }

            data._load( 0, testData.reset );

            this.clock.tick( 0 );

            assert.ok( this.clearTimeoutStub.calledWithExactly( _loadTimeout ) );
            assert.ok( this.$progress.is( ":visible" ) );

            this.$list.height( testData.listHeightAfterLoad );// Get first ajax call
            var call = $.ajax.getCall( 0 ).returnValue;

            var responseData = { items: items };

            // To return successful ajax call (having used .resolve() )
            call.resolve( responseData );

            assert.ok(
              this.ajaxStub.calledWithExactly( url, sinon.match( {
                type: ajaxSettings.type,
                data: {
                  retrieved: retrieved,
                  retrieve: retrieve,
                  reset: testData.reset,
                  additionalData: postData.additionalData
                },
                dataType: "json",
                global: ajaxSettings.global
              } ) ) );

            var $listItems = this.$list.children( "li" );

            assert.equal( $listItems.length, testData.expectedListItems.length );

            for ( var i = 0; i < testData.expectedListItems.length; i++ ) {
              assert.equal( $( $listItems.get( i ) ).html(), testData.expectedListItems[ i ].name );
            }

            assert.equal( data.options.retrieved, testData.expectedRetrieved + items.length );
            assert.equal( doneloadingSpy.calledOnce, testData.assertDoneLoading );
            assert.ok( beforerenderSpy.calledWithExactly( sinon.match.object, items ) );

            assert.equal(
              this.$progress.is( ":visible" ), testData.assertProgressIsVisible );

            assert.equal( data._done, testData.assertAllDone );
            assert.equal( alldoneSpy.calledOnce, testData.assertAllDone );

            assert.equal( _loadSpy.calledTwice, testData.assertLoadIsCalledAgain );
            assert.notOk( data._blockEventRequest );
            assert.equal( this.$scrollContainer.attr( "style" ), originalContainerStyle );
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
          blockEventRequest: false,
          expectedLoadCallCount: 2
        },
        "scrollstop with no previous event ": {
          event: "scrollstop",
          blockEventRequest: false,
          expectedLoadCallCount: 2
        },
        "wheel with no previous event": {
          event: "wheel",
          blockEventRequest: false,
          expectedLoadCallCount: 2
        },
        "scrollstart with a previous event": {
          event: "scrollstart",
          blockEventRequest: true,
          expectedLoadCallCount: 1
        },
        "scrollstop with a previous event": {
          event: "scrollstop",
          blockEventRequest: true,
          expectedLoadCallCount: 1
        },
        "wheel with a previous event": {
          event: "wheel",
          blockEventRequest: true,
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
            data._blockEventRequest = testData.blockEventRequest;

            $( window ).trigger( testData.event );

            assert.ok( data._blockEventRequest );
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

            assert.notOk( data._blockEventRequest );
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

            this.$list.lazyloader();

            var data = this.$list.data()[ "mobile-lazyloader" ];
            data._loadTimeout = _loadTimeout;

            this.$list.lazyloader( "destroy" );

            $( window ).trigger( testData.event );

            assert.ok( loadStub.calledOnce );
            assert.ok( this.clearTimeoutStub.calledWithExactly( _loadTimeout ) );
          }
        );
      }
    }
  )();

} );
