import gulp from "gulp";
import imagemin from "gulp-imagemin";
import babel from "gulp-babel";
import uglify from "gulp-uglify";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import browserSync from "browser-sync";
import inject from "gulp-inject";
// Removido htmlmin já que estaremos trabalhando com PHP

const sass = gulpSass(dartSass);
const server = browserSync.create();

const paths = {
  php: "src/**/*.php",
  scss: "src/scss/**/*.scss",
  js: "src/js/**/*.js",
  images: "src/images/**/*",
  dist: "/opt/lampp/htdocs",
  distCSS: "/opt/lampp/htdocs/css",
  distJS: "/opt/lampp/htdocs/js",
};

// Copiar e injetar CSS/JS em arquivos PHP
gulp.task("php", function () {
  const sources = gulp.src(
    [`${paths.distCSS}/**/*.css`, `${paths.distJS}/**/*.js`],
    { read: false }
  );

  return gulp
    .src(paths.php)
    .pipe(
      inject(sources, {
        ignorePath: "/opt/lampp/htdocs",
      })
    )
    .pipe(gulp.dest(paths.dist));
});
// Processamento de SASS
gulp.task("sass", function () {
  return gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.distCSS))
    .pipe(server.stream());
});

// Transpilação e minificação de JS
gulp.task("scripts", function () {
  return gulp
    .src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.distJS))
    .pipe(server.stream());
});

// Minificação de imagens
gulp.task("images", function () {
  return gulp
    .src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist + "/images"))
    .pipe(server.stream());
});

// Servidor e live reloading
gulp.task("serve", function (done) {
  server.init({
    proxy: "localhost", // Ajuste conforme necessário
    notify: false,
  });

  gulp.watch(
    paths.php,
    gulp.series("php", function (done) {
      server.reload();
      done();
    })
  );
  gulp.watch(paths.scss, gulp.series("sass"));
  gulp.watch(paths.js, gulp.series("scripts"));
  gulp.watch(paths.images, gulp.series("images"));

  done();
});

// Tarefa padrão
gulp.task(
  "default",
  gulp.series(gulp.parallel("php", "sass", "scripts", "images"), "serve")
);
