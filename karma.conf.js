"use strict";

// Karma configuration
// Generated on Tue Apr 12 2016 14:40:18 GMT+0200 (W. Europe Daylight Time)

// eslint-disable-next-line no-undef
module.exports = function( config ) {
    config.set( {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ "sinon", "qunit" ],

        // list of files / patterns to load in the browser
        files: [
            "node_modules/bluebird/js/browser/bluebird.js",
            "node_modules/jquery/dist/jquery.js",
            "node_modules/jquery-mobile/dist/jquery.mobile.js",
            "node_modules/icanhaz/ICanHaz.js",
            "src/*.js",
            "qunit-setup.js",
            "test/*.js"
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "**/src/*.js": "coverage"
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ "dots", "coverage", "junit" ],

        coverageReporter: {
            type: "lcov",
            dir: "coverage/"
        },

        junitReporter: {
            outputFile: "karma-results.xml",
            suite: "web-rtc",                 // this will be mapped to the package
            classnameSuffix: "browser-test"
        },

        plugins: [
            "karma-phantomjs-launcher",
            "karma-junit-reporter",
            "karma-coverage",
            "karma-sinon",
            "karma-qunit"
        ],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN ||
        // config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ "PhantomJS" ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    } );
};
