// Importações
import gulp from "gulp";
import imagemin from "gulp-imagemin";
import babel from "gulp-babel";
import uglify from "gulp-uglify";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import browserSyncFactory from "browser-sync";
import inject from "gulp-inject";
import htmlmin from "gulp-htmlmin";

// Inicializações
const sass = gulpSass(dartSass);
const browserSync = browserSyncFactory.create();

// Definição de caminhos
const paths = {
  src: "src/**/*",
  srcHTML: "src/**/*.html",
  srcCSS: "src/scss/**/*.scss",
  srcJS: "src/js/**/*.js",
  dist: "dist",
  distIndex: "dist/index.html",
  distCSS: "dist/css",
  distJS: "dist/js",
};

// Tarefas
// HTML
gulp.task("html", function () {
  const sources = gulp.src(
    [`${paths.distCSS}/**/*.css`, `${paths.distJS}/**/*.js`],
    { read: false }
  );

  return gulp
    .src(paths.srcHTML)
    .pipe(inject(sources, { ignorePath: "dist", addRootSlash: false })) // Injeta CSS e JS
    .pipe(htmlmin({ collapseWhitespace: true })) // Minifica o HTML
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());
});

// SASS
gulp.task("sass", () => {
  return gulp
    .src("src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

// JavaScript
gulp.task("scripts", () => {
  return gulp
    .src("src/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

// Imagens
gulp.task("images", () => {
  return gulp
    .src("src/images/**/*")
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images"))
    .pipe(browserSync.stream());
});

// Servidor + Live Reloading
gulp.task("serve", () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  gulp.watch("src/**/*.html", gulp.series("html"));
  gulp.watch("src/scss/**/*.scss", gulp.series("sass"));
  gulp.watch("src/js/**/*.js", gulp.series("scripts"));
  gulp.watch("src/images/**/*", gulp.series("images"));
});

// Tarefa padrão
gulp.task(
  "default",
  gulp.series(gulp.parallel("html", "sass", "scripts", "images"), "serve")
);
