const mock = require('protractor-http-mock');

describe('protractor-http-snitch', function () {
  beforeEach(function () {
    mock(['mocks']);
  });

  afterEach(function () {
    mock.teardown();
  });

  it('should log successful HTTP requests', function () {
    browser.get('test/success.html');
    expect(element(by.id('request-debugging')).getText()).toEqual('SUCCESS');
  });

  it('should log failing HTTP requests', function () {
    browser.get('test/failure.html');
    expect(element(by.id('request-debugging')).getText()).toEqual('FAILURE');
  });
});
