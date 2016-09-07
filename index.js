const _ = require('lodash');
var logger;

class RequestLogger {
  static buildConfig() {
    return _.defaults(exports.config, {
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
    this.regex = /%(\w+)/g;

    this.config = RequestLogger.buildConfig();

    this.logger = require('log4js').getLogger(this.config.logger);
    this.templates = {
      failure: _.map(this.config.format.failure, (format) => this.compile(format)),
      success: _.map(this.config.format.success, (format) => this.compile(format))
    };
  }

  compile(template) {
    return _.template(template, {
      interpolate: this.regex
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

  isLogged(type) {
    return !!this.config.level[type];
  }

  log(level, messages, log) {
    _.each(messages, (message) => {
      this.logger[level](this.format(message, log));
    });
  }

  logFailure(log) {
    if (this.isLogged('failure')) {
      this.log(this.config.level.failure, this.templates.failure, log);
    }
  }

  logSuccess(log) {
    if (this.isLogged('success')) {
      this.log(this.config.level.success, this.templates.success, log);
    }
  }

  options() {
    return {
      trackSuccessfulRequests: this.isLogged('success'),
      trackFailingRequests: this.isLogged('failure')
    };
  }
}

exports.setup = function () {
  logger = new RequestLogger();
};

exports.onPageLoad = function () {
  browser.addMockModule('protractor.http.snitch', function (options) {
    angular.module('protractor.http.snitch', [])
      .config(['$httpProvider', function ($httpProvider) {
        var snitch = window['protractor.http.snitch'] = {
          success: [],
          failure: []
        };
        $httpProvider.interceptors.push(['$q', function ($q) {
          var interceptor = {};

          /**
           * The main purpose of this function is to limit the size of communications between Selenium and Node.
           * It will only
           */
          function safeStringify(object) {
            var output = {};

            function safeValue(value) {
              switch (typeof value) {
                case 'object':
                  return '[...]';
                case 'string':
                  if (value.length > 195) {
                    return value.substr(0, 195) + '[...]'
                  } else {
                    return value;
                  }
                default:
                  return value;
              }
            }

            for (var key in object) {
              output[key] = safeValue(object[key]);
            }
            return output;
          }

          function simplifiedResponse(response) {
            return {
              data: safeStringify(response.data),
              config: {
                data: safeStringify(response.config.data),
                method: response.config.method,
                url: response.config.url
              },
              status: response.status,
              statusText: response.statusText
            };
          }

          if (options.trackSuccessfulRequests) {
            interceptor.response = function (response) {
              snitch.success.push(simplifiedResponse(response));
              return response;
            };
          }

          if (options.trackFailingRequests) {
            interceptor.responseError = function (error) {
              snitch.failure.push(simplifiedResponse(error));
              return $q.reject(error);
            };
          }
          return interceptor;
        }]);
      }]);
  }, logger.options());
};

exports.postTest = function () {
  return browser.executeAsyncScript(function (callback) {
    callback(window['protractor.http.snitch'].splice(0));
  }).then((logs) => {
    _.each(logs.success, (log) => logger.logSuccess(log));
    _.each(logs.failure, (log) => logger.logFailure(log));
  });
};

exports.name = 'protractor-http-snitch';
