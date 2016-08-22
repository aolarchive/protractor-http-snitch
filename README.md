# protractor-http-snitch

[![npm](https://img.shields.io/npm/v/protractor-http-snitch.svg?maxAge=2592000)](https://www.npmjs.com/package/protractor-http-snitch)
[![Build status](https://img.shields.io/travis/aol/protractor-http-snitch/master.svg?maxAge=2592000)](https://travis-ci.org/aol/protractor-http-snitch)

This Protractor plugin will print (using log4js) every failing HTTP request, and (optionally) successful HTTP requests.

Example:

```
[2016-08-22 14:59:16.277] [ERROR] [http-snitch] - POST /faulty/api (500)
[2016-08-22 14:59:16.278] [ERROR] [http-snitch] - Request data: {"some":"data"}
[2016-08-22 14:59:16.278] [ERROR] [http-snitch] - Response: {"some":"error"}
```

## Installation

```
npm install protractor-http-snitch
```

Protractor config file:

```javascript
config.plugins = [{
  package: 'protractor-http-snitch',

  // Optional options
  level: {
    failure: 'debug'
  }
}];
```

And voilà!

## Configuration

See [the default configuration](index.js) for a fully documented list of available options.
