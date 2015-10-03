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
function addShadowDomConfig(compileStep) {
  compileStep.addHtml({
    section: 'head',
    data: '<script> window.Polymer = {dom: "shadow"}; </script>'
  });
}

/**
 * Add webcomponentsjs script to head.
 * @todo read first line and check for script tag
 */
function addPolyfillTag(compileStep, path) {
  compileStep.addHtml({
    section: 'head',
    data: scriptTag(path)
  });
}

/**
 * Add imports to head.
 */

function addImportTag(compileStep, path) {
  compileStep.addHtml({
    section: 'head',
    data: linkTag(path)
  });
}

/**
 * Vulcanize all files and add output file to head.
 */
function vulcanizeImports(compileStep, imports) {
  var tags = _.map(imports, function(path) {
    return linkTag(path);
  });

  fs.writeFileSync(tmpPath, tags.join("\n"));

  vulcan.setOptions({ abspath: tmpDir });

  vulcan.process(tmpFile, function(err, html) {
    fs.unlinkSync(tmpPath);
    var filenameHash = crypto.createHash('md5').update(html).digest('hex');
    var filePath = '/vulcanized-' + filenameHash + '.html';

    compileStep.addAsset({
      path: filePath,
      data: html
    });

    if (_.isString(process.env.CDN_PREFIX)) {
      filePath = url.resolve(process.env.CDN_PREFIX, filePath);
    }

    addImportTag(compileStep, filePath);
  });
}

/**
 * Add individual import tags
 */
function individualImports(compileStep, imports) {
  _.each(imports, function(path) {
    addImportTag(compileStep, path);
  });
}

/**
 * Register appropriate plugin.
 */
Plugin.registerSourceHandler("vulcanize", function(compileStep) {
  if (compileStep.inputPath === "config.vulcanize"
    && compileStep.arch === "web.browser") {
    
    // Get JSON file.
    var json = JSON.parse(compileStep.read().toString('utf8'));
    
    // Add polyfill to html if defined.
    if (_.isString(json.polyfill)) {
      addPolyfillTag(compileStep, json.polyfill);
    }

    // Optionally opt into shadow dom, rather than shady dom.
    if (json.useShadowDom) {
      addShadowDomConfig(compileStep);
    }

    // Add imports if defined.
    if (process.env.VULCANIZE && _.isArray(json.imports)) {
      log("Importing vulcanized file...");
      vulcanizeImports(compileStep, json.imports);
    } else {
      log("Importing individual files...");
      individualImports(compileStep, json.imports);
    }
  } else if (compileStep.arch === "web.browser") {
    log("File "+compileStep.inputPath+" ignored");
  }
});
