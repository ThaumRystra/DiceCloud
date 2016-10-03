var vulcan = Npm.require('vulcanize');
var crypto = Npm.require('crypto');
var url = Npm.require('url');
var fs = Npm.require('fs');

/**
 * Vulcanize now requires a target input file.
 * We need to create a temp file located within the same
 * 'abspath' as the actual imports.  Otherwise, vulcanize
 * gets confused during the process.
 */
var tmpFile = '_imports.html';
var tmpDir = 'public';
var tmpPath = tmpDir + '/' + tmpFile;

/**
 * Log
 */
function log() {
  args = _.values(arguments);
  args.unshift("=> Vulcanize:");
  console.log.apply(this, args);
}

/**
 * Get script tag with specified path.
 */
function scriptTag(path) {
  return '<script src="' + path + '"></script>';
}

/**
 * Get link tag with specified path.
 */
function linkTag(path) {
  return '<link rel="import" href="' + path + '">';
}

/**
 * Add config for dom mode to head.
 */
function addShadowDomConfig(file) {
  file.addHtml({
    section: 'head',
    data: '<script> window.Polymer = {dom: "shadow"}; </script>'
  });
}

/**
 * Add webcomponentsjs script to head.
 * @todo read first line and check for script tag
 */
function addPolyfillTag(file, path) {
  file.addHtml({
    section: 'head',
    data: scriptTag(path)
  });
}

/**
 * Add imports to head.
 */

function addImportTag(file, path) {
  file.addHtml({
    section: 'head',
    data: linkTag(path)
  });
}

/**
 * Vulcanize all files and add output file to head.
 */
function vulcanizeImports(file, imports) {
  var tags = _.map(imports, function(path) {
    return linkTag(path);
  });

  fs.writeFileSync(tmpPath, tags.join("\n"));

  vulcan.setOptions({ abspath: tmpDir });

  vulcan.process(tmpFile, function(err, html) {
    fs.unlinkSync(tmpPath);
    var filenameHash = crypto.createHash('md5').update(html).digest('hex');
    var filePath = '/vulcanized-' + filenameHash + '.html';

    file.addAsset({
      path: filePath,
      data: html
    });

    if (_.isString(process.env.CDN_PREFIX)) {
      filePath = url.resolve(process.env.CDN_PREFIX, filePath);
    }

    addImportTag(file, filePath);
  });
}

/**
 * Add individual import tags
 */
function individualImports(file, imports) {
  _.each(imports, function(path) {
    addImportTag(file, path);
  });
}

function VulcanizeCompiler() {}
VulcanizeCompiler.prototype.processFilesForTarget = function (files) {
  files.forEach(function (file) {
    // Get JSON file.
    var json = JSON.parse(file.getContentsAsString());

    // Add polyfill to html if defined.
    if (_.isString(json.polyfill)) {
      addPolyfillTag(file, json.polyfill);
    }

    // Optionally opt into shadow dom, rather than shady dom.
    if (json.useShadowDom) {
      addShadowDomConfig(file);
    }

    // Add imports if defined.
    // log("Vulcanizing " + json.imports.length + " files");
    // vulcanizeImports(file, json.imports);
    individualImports(file, json.imports);
  });
};

Plugin.registerCompiler({
	extensions: ["vulcanize"],
  filenames: ["config"],
	archMatching: 'web',
}, function(){
	return new VulcanizeCompiler();
});
