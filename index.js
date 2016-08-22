const _ = require('lodash');

class RequestLogger {
  static buildConfig() {
    return _.defaultsDeep(exports.config, {
      // log4js channel
      logger: '[http-snitch]',
      // error levels for logging (if absent, will ignore the request)
      level: {
        // success: isn't defined by default
        failure: 'error'
      },
      // error formats
      format: {
        failure: [
          '%m %u (%sc) %st',
          'Request data: %d',
          'Response: %r'
        ],
        success: [
          '%m %u (%sc) %st',
          'Request data: %d'
        ]
      }
    });
  }

  constructor() {
    this.config = RequestLogger.buildConfig();

    this.logger = require('log4js').getLogger(this.config.logger);
    this.templates = {
      failure: _.map(this.config.format.failure, this.compile),
      success: _.map(this.config.format.success, this.compile)
    };
  }

  compile(template) {
    return _.template(template, {
      interpolate: /%(\w+)/g
    });
  }

  format(template, log) {
    return template({
      d: JSON.stringify(_.get(log, 'config.data', '')),
      m: _.get(log, 'config.method'),
      r: JSON.stringify(_.get(log, 'data', '')),
      sc: _.get(log, 'status'),
      st: _.get(log, 'statusText'),
      u: _.get(log, 'config.url')
    });
  }

  log(level, messages, log) {
    _.each(messages, (message) => {
      this.logger[level](this.format(message, log));
    });
  }

  logFailure(log) {
    if (this.config.level.failure) {
      this.log(this.config.level.failure, this.templates.failure, log);
    }
  }

  logSuccess(log) {
    if (this.config.level.success) {
      this.log(this.config.level.success, this.templates.success, log);
    }
  }
}

exports.setup = function () {
};

exports.onPageLoad = function () {
  browser.addMockModule('protractor.http.snitch', function () {
    angular.module('protractor.http.snitch', [])
      .config(['$provide', '$httpProvider', function ($provide, $httpProvider) {
        var snitch = window['protractor.http.snitch'] = {
          success: [],
          failure: []
        };

        $httpProvider.interceptors.push(['$q', function ($q) {
          return {
            response: function (response) {
              snitch.success.push(response);
              return response;
            },
            responseError: function (error) {
              snitch.failure.push(error);
              return $q.reject(error);
            }
          };
        }]);
      }]);
  });
};

exports.postTest = function () {
  var logger = new RequestLogger();
  return browser.executeAsyncScript(function (callback) {
    callback(window['protractor.http.snitch']);
  }).then((logs) => {
    _.each(logs.success, _.bind(logger.logSuccess, logger));
    _.each(logs.failure, _.bind(logger.logFailure, logger));
  });
};

exports.name = 'protractor-http-snitch';
