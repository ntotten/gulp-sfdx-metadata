// through2 is a thin wrapper around node transform streams
const through = require("through2");
const PluginError = require("plugin-error");
const js2xmlparser = require("js2xmlparser");
const template = require("lodash.template");
const path = require("path");

// Consts
const PLUGIN_NAME = "gulp-sfdx-metadata";

var xmlOptions = {
  declaration: {
    include: true,
    encoding: "UTF-16",
    version: "1.0"
  }
};

function parsePath(path) {
  var extname = Path.extname(path);
  return {
    dirname: Path.dirname(path),
    basename: path.basename(path, path.extname(path)),
    extname: extname
  };
}

function getXml(options) {
  let obj = options.metadata;
  obj["@"] = {
    xmlns: "http://soap.sforce.com/2006/04/metadata"
  };
  return js2xmlparser.parse(options.object, obj, xmlOptions);
}

function createStream(content) {
  var stream = through();
  stream.write(content);
  return stream;
}

function sfdxMetadataConfig(options) {
  if (!options) {
    throw new PluginError(PLUGIN_NAME, "Missing options!");
  }

  let xml = getXml(options);
  let compiled = template(xml);

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    let data = {
      name: path.basename(file.relative, path.extname(file.relative))
    };

    let text = compiled(data);

    let content = new Buffer(text);

    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      file.contents = content;
    }
    if (file.isStream()) {
      file.contents = createStream(content);
    }

    cb(null, file);
  });
}

module.exports = sfdxMetadataConfig;
