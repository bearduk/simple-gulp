// to do
// picturefill
// jshint/ lint
// sprite building


var gulp = require('gulp');

// Use gulp-stats 
require('gulp-stats')(gulp); // pass in gulp itself so gulp-stats can do its thang

var del = require('del'); // for clearing before building

var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber'); // this is a task that stops gulp watch crashing when something goes wrong. It usaully crashes out watch if you e.g. code css wrong. Gulp plumber is set below and takes an anonymous function that you simply pass the error into. The emit is just plumber telling itself it's finished using node emit
var sourcemaps = require('gulp-sourcemaps'); // this lets you know which *include* or importing CSS file something is kept in when looking at it in the browser Dev Tools. It writes the sourcemap in the main style.css file itself i.e. not a separate file.
var sass = require('gulp-sass');
var babel = require('gulp-babel');

// Image compression based plugins
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');


// file paths
var dist_path = 'public/dist';

var scripts_path = 'public/scripts/**/*.js';
var css_path = 'public/css/**/*.css';
var scss_path = 'public/scss/**/*.scss';
var images_path = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';



// Styles for SASS
gulp.task('styles', function() {
    console.log('starting styles task');
    return gulp.src('public/scss/styles.scss')
    // return gulp.src(['public/css/reset.css', css_path]) // this allows you to specify order, the second one includes reset but it ignores it as it's already been included
    .pipe(plumber(function(err){
        console.log('Styles task error');
        console.log(err);
        this.emit('end');
    }))
    .pipe(sourcemaps.init()) // sourcemaps runs *BEFORE
    .pipe(autoprefixer()) // note you could add in an object to specify stuff i.e. {browsers: ['last 2 versions', 'ie 8']}
    // .pipe(concat('styles.css'))    Only for CSS, as it is BUILT INTO SASS
    // .pipe(minifyCss()) Only for CSS, as it is BUILT INTO SASS PLUGIN
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(sourcemaps.write()) // sourcemaps writes *AFTER
    .pipe(gulp.dest(dist_path))
    .pipe(livereload());
});


// Scripts
gulp.task('scripts', function() {
    console.log('starting scripts task');

    return gulp.src(scripts_path)
    .pipe(plumber(function(err){
        console.log('Scripts task error');
        console.log(err);
        this.emit('end');
    })) // plumber here is just the same as is used in styles task. Nothing special, just runs in a task
    .pipe(sourcemaps.init()) // sourcemaps runs *BEFORE
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write()) // sourcemaps writes *AFTER. You should now be able to see which file code belongs to in Dev Tools. Note that sourcemaps works just the same for scripts or styles
    .pipe(gulp.dest(dist_path))
    .pipe(livereload());
});


// Images
gulp.task('images', function() {
    console.log('starting images task');

    return gulp.src(images_path)
    .pipe(imagemin(
        [
            // as we're specifying our own in this array, let's include the defaults that we'd lose otherwise
            imagemin.gifsicle(),
            imagemin.jpegtran(),
            imagemin.optipng(),
            imagemin.svgo(),
            // ends the list of default tasks that run even if this array wasn't made.
            // now we can tack on our new plugins we installed and 'required'
            imageminPngquant(),
            imageminJpegRecompress()
        ]
    ))
    .pipe(gulp.dest(dist_path + '/images'));

    console.log('finished images task');

});


gulp.task('clean', function(){
    console.log('started clean');
    
    return del.sync([
        dist_path // yeah, trash the lot and start again
    ])
    console.log('finished clean');
})

gulp.task('default', ['clean', 'styles', 'scripts'], function(){
    console.log('CB Initial default has completed...') // note that this function is optional, you don't need it at all if you don't want it, just list the array of tasks
});

// may be better to leave the image task our of default if it takes too long. Perhaps have a new task called 'golive' or 'publish' or such like that includes the image task.

gulp.task('watch', ['default'], function () { // note that default is called here so that the default tasks run at least once before watch, well... watches
	console.log('Starting watch task');
	require('./server.js');
	livereload.listen();
	gulp.watch(scripts_path, ['scripts']);
    gulp.watch(scss_path, ['styles']);
});

// build contains the 'images' compression (time hog)
gulp.task('build', ['default', 'images']);