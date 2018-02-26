"use strict";
/* global module, require */

module.exports = function( grunt ) {

  require( "load-grunt-tasks" )( grunt );

  grunt.initConfig( {
    pkg: grunt.file.readJSON( "package.json" ),
    concat: {
      dist: {
        src: [ "src/*.js" ],
        dest: "dist/<%= pkg.name %>.js",
        nonull: true,
        options: {

          // Replace all 'use strict' statements in the code with a single one at the top
          banner: "\"use strict\";\n\n",
          process: function( src, filepath ) {
            return "// Source: " + filepath + "\n" +
                   src.replace( /(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1" );
          }
        }
      }
    },
    wrap: {
      dist: {
        src: [ "dist/<%= pkg.name %>.js" ],
        dest: "dist/<%= pkg.name %>.js",
        options: {
          wrapper: [ "( function( $, window ) {\n", "\n} )( jQuery, window );\n" ]
        }
      }
    },
    eslint: {
      options: {
        configFile: ".eslintrc"
      },
      target: [ "src/*", "test/*" ]
    },
    uglify: {
      uglified: {
        mangle: {
          reserved: [ "jQuery" ]
        },
        files: [
          {
            expand: true,
            src: [ "dist/<%= pkg.name %>.min.js" ],
            dest: ""
          }
        ]
      }
    },
    karma: {
      unit: {
        configFile: "karma.conf.js"
      }
    },
    watcher: {
      test: {
        files: [ "src/*.js", "test/*.js" ],
        tasks: [ "karma" ],
        options: {
          spawn: true
        }
      }
    },
    coveralls: {
      options: {
        coverageDir: "coverage",
        recursive: true
      }
    }
  } );

  grunt.loadNpmTasks( "grunt-karma-coveralls" );
  grunt.loadNpmTasks( "grunt-wrap" );
  grunt.loadNpmTasks( "grunt-karma" );
  grunt.loadNpmTasks( "grunt-watcher" );
  grunt.loadNpmTasks( "grunt-contrib-uglify-es" );
  grunt.loadNpmTasks( "grunt-contrib-concat" );
  grunt.registerTask( "dev", [ "eslint", "karma", "coveralls" ] );
  grunt.registerTask( "dist", [ "concat:dist", "wrap:dist", "uglify" ] );
};
