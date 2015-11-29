module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        codacy: {
            your_target: {
                files: {
                    'dest/default_options': ['tests/main.js'],
                }
            },
        },
        mochaTest: {
            test: {
                src: ['tests/main.js'],
            }
        }
    })

    grunt.loadNpmTasks('grunt-codacy')
    grunt.loadNpmTasks('grunt-mocha-test')

    grunt.registerTask('default', ['mochaTest'])
}