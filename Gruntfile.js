/*
 * nodewebmailer
 * https://github.com/toddself/nodewebmail
 *
 * MIT Licence (see LICENCE for details)
 * Copyright (c) 2013 Todd Kennedy. All rights reserved.
 */
module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'tools/**/*js',
        'lib/**/*js',
        'models/**/*js',
        'routes/**/*js',
        'controllers/**/*js',
        'views/**/*js',
        'test/**/*js',
        'index.js'
      ]
    },
    mocha: {
      index: ['test/index.html'],
      options: {
        log: true,
        run: true
      }
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'tap'
      },
      all: {
        src: 'test/**/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('default', ['install-hook', 'verify-project']);
  grunt.registerTask('verify-project', ['jshint', 'simplemocha', 'mocha']);
  grunt.registerTask('test', ['simplemocha', 'grunt-mocha']);

  grunt.registerTask('install-hook', function () {
    var fs = require('fs');
    grunt.file.copy('hooks/pre-commit', '.git/hooks/pre-commit');
    fs.chmodSync('.git/hooks/pre-commit', '755');
  });

};