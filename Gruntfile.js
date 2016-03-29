/**
 * Created by askuznetsov on 11/26/2015.
 */
'use strict';


module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-exec');
    grunt.initConfig({
        exec: {
            run: 'cordova run android',
            //run: {
            //    droid : 'cordova run android',
            //    ios : 'cordova run ios --device'
            //},
            //runa: 'cordova run android',
            //build : 'cordova build --release'
        },
        cr: {
            app: 'www',
            temp: 'temp',
            dist: 'www'
        },
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['injector']
            },

            styles: {
                files: ['<%= cr.app %>/css/**/*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },

            less: {
                files: '<%= cr.app %>/less/*.less',
                tasks: ['less']
            },

            gruntfile: {
                files: ['Gruntfile.js']
            },

            //livereload: {
            //    options: {
            //        livereload: '<%= connect.options.livereload %>'
            //    },
            //    files: [
            //        '<%= cr.app %>/*.html',
            //        '.tmp/styles/{,*/}*.css',
            //        '<%= cr.app %>/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
            //    ]
            //}
        },

        connect: {
            options: {
                port: 9000,
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= cr.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= cr.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: ['<%= cr.dist %>']
                }
            },
            docs: {
                options: {
                    base: ['docs/']
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js'
            ],
            unitTest: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['<%= cr.app %>/modules/*/tests/unit/*.js']
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= cr.dist %>/*',
                        '!<%= cr.dist %>/.git*'
                    ]
                }]
            },
            docs: {
                files: [{
                    dot: true,
                    src: [
                        'docs/'
                    ]
                }]
            },
            server: '.tmp'
        },

        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        /**
         * Generate AngularJs Documentation
         */
        ngdocs : {
            options: {
                dest: 'docs',
                scripts: [
                    'app/lib/jquery/dist/jquery.js',
                    'app/lib/bootstrap/dist/js/bootstrap.js',
                    'app/lib/angular/angular.js',
                    'app/lib/angular-resource/angular-resource.js',
                    'app/lib/angular-mocks/angular-mocks.js',
                    'app/lib/angular-cookies/angular-cookies.js',
                    'app/lib/angular-sanitize/angular-sanitize.js',
                    'app/lib/angular-animate/angular-animate.js',
                    'app/lib/angular-touch/angular-touch.js',
                    'app/lib/angular-bootstrap/ui-bootstrap.js',
                    'app/lib/angular-ui-utils/ui-utils.js',
                    'app/lib/angular-ui-router/release/angular-ui-router.js'
                ],
                html5Mode: false,
                startPage: '/api',
                title: 'App Documentation',
                titleLink: '/api',
                bestMatch: true
            },
            api: {
                src: ['app/js/*.js', 'app/modules/**/*.js'],
                title: 'App Documentation'
            }
        },

        /**
         * Strip comments from the distribution code
         */
        comments: {
            dist: {
                options: {
                    singleline: true,
                    multiline: true
                },
                src: [ 'www/scripts/custom.js']
            },
        },

        //Injects all the scripts into the index html file
        injector: {
            options: {
                addRootSlash: false,
                ignorePath: 'app/',
                bowerPrefix: 'bower',
            },
            localDependencies: {
                files: {
                    'app/index.html': [
                        'app/js/config.js',
                        'app/js/application.js',
                        'app/js/local/*.js',
                        'app/modules/*/*.js',
                        'app/modules/*/config/*.js',
                        'app/modules/*/services/*.js',
                        'app/modules/*/directives/*.js',
                        'app/modules/*/filters/*.js',
                        'app/modules/*/controllers/*.js',
                        'app/css/**/*.css'
                    ]
                }
            },
            bowerDependencies: {
                files: {
                    'app/index.html': ['bower.json'],
                }
            },
            karmaDependencies: {
                options: {
                    ignorePath: '',
                    transform: function(filepath) {
                        return '\'' + filepath + '\',';
                    }
                },
                files: {
                    'karma.conf.js': ['bower.json'],
                }
            }
        },
        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= cr.dist %>/app/js/*.js',
                        '<%= cr.dist %>/app/modules/*/*.js',
                        '<%= cr.dist %>/app/modules/*/config/*.js',
                        '<%= cr.dist %>/app/modules/*/services/*.js',
                        '<%= cr.dist %>/app/modules/*/directives/*.js',
                        '<%= cr.dist %>/app/modules/*/filters/*.js',
                        '<%= cr.dist %>/app/modules/*/controllers/*.js',
                        '<%= cr.dist %>/app/css/**/*.css',
                        '<%= cr.dist %>/app/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= cr.dist %>/css/fonts/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= cr.app %>/index.html',
            options: {
                dest: '<%= cr.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= cr.dist %>/**/*.html'],
            css: ['<%= cr.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= cr.dist %>']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        cssmin: {
            options: {
                //root: '<%= cr.app %>/css/**/*.css'
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= cr.app %>/img',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= cr.dist %>/img'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= cr.app %>/img',
                    src: '{,*/}*.svg',
                    dest: '<%= cr.dist %>/img'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= cr.dist %>',
                    src: ['*.html', '<%= cr.app %>/modules/*/views/*.html'],
                    dest: '<%= cr.dist %>'
                }]
            }
        },

        // ngmin tries to make the code safe for minification automatically by
        // using the Angular long form for dependency injection. It doesn't work on
        // things like resolve or inject so those have to be done manually.
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= cr.dist %>/app/index.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= cr.app %>',
                    dest: '<%= cr.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'index.html',
                        'modules/*/views/*.html',
                        'img/{,*/}*.{webp}',
                        'fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= cr.dist %>/img',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= cr.app %>/css',
                dest: '.tmp/css/',
                src: '**/*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        less : {
            development: {
                options: {
//                    paths: ['<%= cr.app %>']
                },
                files: {
                    '<%= cr.app %>/css/app.css': '<%= cr.app %>/less/app.less'
                }
            }
        }
    });

    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            console.log('dist serve');
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            //'injector',
            //'concurrent:server',
            //'autoprefixer',
            'connect:livereload',
            //'less',
            'watch'
        ]);
    });
};