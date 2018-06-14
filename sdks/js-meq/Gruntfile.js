module.exports = function(grunt){
	
	// Project configuration. 
	grunt.initConfig({
        browserify: {
            js: {
                src: 'src/*',
                dest: 'dist/meq.js',
            }
        },

        concat: {
            dist: {
                src: ['dist/meq.js', 'src/browser.js'],
                dest: 'dist/meq.js',
            },
        },

    	uglify: {
			options: {
                mangle: true,
                    compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                }

            },
			js: {
				files: { 'dist/meq.min.js': ['dist/meq.js'] }
			}
		},
		
		watch: {
			scripts: {
				files: ['src/*.js'],
				tasks: ['default'],
				options: { spawn: false },
			},
		},
        
        compress: {
            main: {
                options: {
                mode: 'gzip'
                },
                files: [

                    {expand: true, src: ['dist/*.min.js'], dest: '', ext: '.gz.js'}
                ]
            }
        }

	});

    grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');


	grunt.registerTask('default', ['browserify',  'uglify', 'compress','concat']);
};