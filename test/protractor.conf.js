exports.config = {
  baseUrl: 'http://localhost:8080/',
  capabilities: {
    browserName: 'phantomjs',
    'phantomjs.binary.path': require('phantomjs').path
  },
  onPrepare: function() {
    // protractor-http-mock config
    require('protractor-http-mock').config = {
      rootDirectory: __dirname,
      protractorConfig: 'protractor.conf.js'
    }
  },
  mocks: {
    dir: '.'
  },
  plugins: [{
    // loads the HTTP snitch
    path: '..'
  }]
};
