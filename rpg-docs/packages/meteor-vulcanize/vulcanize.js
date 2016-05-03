var vulcan = Npm.require('vulcanize');
var crypto = Npm.require('crypto');
var url = Npm.require('url');

var _ = Npm.require('underscore');

var handler = function(compileStep) {
  var importsHtml = compileStep.read().toString('utf8');

  if (process.env.VULCANIZE) {
    log('Vulcanizing imports...');
    vulcanize(compileStep, importsHtml);
  } else {
    log('Adding all imports...');
    addImports(compileStep, importsHtml);
  }

};

var vulcanize = function(compileStep, importsHtml) {

  var vulcanOutputHandler = function(filename, data) {

    var filenameHash = crypto.createHash('md5').update(data).digest('hex');
    var filePath = '/vulcanized-' + filenameHash + '.html';

    compileStep.addAsset({
      path: filePath,
      data: data
    });

    if (_.isString(process.env.CDN_PREFIX)) {
      filePath = url.resolve(process.env.CDN_PREFIX, filePath);
    }

    compileStep.addHtml({
      section: 'head',
      data: '<link rel="import" href="' + filePath + '">'
    });
  };

  vulcan.setOptions({
    inputSrc: importsHtml,
    outputHandler: vulcanOutputHandler,
    abspath: 'public',
    strip: true
  }, function(error) {
    if (error) {
      log(error);
    } else {
      vulcan.processDocument();
    }
  });

};

var addImports = function(compileStep, importsHtml) {
  compileStep.addHtml({
    section: 'head',
    data: importsHtml
  });
};

var log = function() {
  args = _.values(arguments);
  args.unshift("Vulcanize:");
  console.log.apply(this, args);
};

Plugin.registerSourceHandler("imports.html", handler);
