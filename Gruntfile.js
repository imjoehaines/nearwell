module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      all: {
        src: [
          'dist/js/nearwell.js'
        ],
        options: {
          'specs': 'spec/built/specs.js'
        }
      },

      istanbul: {
        src: '<%= jasmine.all.src %>',
        options: {
          specs: '<%= jasmine.all.options.specs %>',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'coverage/json/coverage.json',
            report: [
              {type: 'html', options: {dir: 'coverage/html'}},
              {type: 'lcov', options: {dir: 'coverage/lcov'}},
              {type: 'text-summary'}
            ]
          }
        }
      }
    },

    browserify: {
      develop: {
        src: ['js/**/*.js'],
        dest: 'dist/js/nearwell.js',
        options: {
          browserifyOptions: {
            debug: true
          }
        }
      },
      specs: {
        src: ['spec/**/*Spec.js'],
        dest: 'spec/built/specs.js',
        options: {
          browserifyOptions: {
            debug: true
          }
        }
      }
    },

    watch: {
      js: {
        files: [
          'src/js/**/*.js',
          'spec/**/*.js'
        ],
        tasks: ['browserify:specs', 'jasmine:all']
      }
    }
  })

  grunt.registerTask('test', ['jasmine:all'])
  grunt.registerTask('coverage', ['jasmine:istanbul'])
  grunt.registerTask('default', ['watch'])

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-notify')
}
