const gulp = require("gulp");
const rename = require("gulp-rename");
const sfdxMetadata = require("../index");
const sfdxProject = require("./sfdx-project");

const output = sfdxProject.packageDirectories[0].path;
const src = "src/";

const defaults = {
  apiVersion: "39.0"
};

function addDefaultMetadata(options) {
  return function() {
    return gulp
      .src(`${src}${options.folder}/*.${options.extension}`)
      .pipe(
        sfdxMetadata({
          object: options.object,
          metadata: options.metadata
        })
      )
      .pipe(
        rename({
          suffix: "-meta",
          extname: ".xml"
        })
      )
      .pipe(gulp.dest(`${output}/${options.folder}`));
  };
}

gulp.task("copy", function() {
  return gulp.src("src/**/*").pipe(gulp.dest(output));
});

gulp.task(
  "class",
  addDefaultMetadata({
    folder: "classes",
    extension: "cls",
    object: "ApexClass",
    metadata: {
      apiVersion: defaults.apiVersion,
      status: "Active"
    }
  })
);

gulp.task(
  "trigger",
  addDefaultMetadata({
    folder: "triggers",
    extension: "trigger",
    object: "ApexTrigger",
    metadata: {
      apiVersion: defaults.apiVersion,
      status: "Active"
    }
  })
);

gulp.task(
  "page",
  addDefaultMetadata({
    folder: "pages",
    extension: "page",
    object: "ApexPage",
    metadata: {
      apiVersion: defaults.apiVersion,
      availableInTouch: false,
      confirmationTokenRequired: false,
      label: "${name}"
    }
  })
);

gulp.task("build", ["copy", "class", "trigger", "page"]);
