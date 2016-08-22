(function () {
  'use strict';

  angular.module('request.success', [])
    .run(function ($http) {
      makeRequest($http, {method: 'GET', url: '/successful/api?with=param'});
    });

  angular.module('request.failure', [])
    .run(function ($http) {
      makeRequest($http, {method: 'POST', url: '/faulty/api', data: {some: 'data'}});
    });

  function makeRequest($http, options) {
    var debuggerEl = document.getElementById('request-debugging');
    debuggerEl.innerHTML = 'RUNNING';
    $http(options)
      .then(function () {
        debuggerEl.innerHTML = 'SUCCESS';
      })
      .catch(function () {
        debuggerEl.innerHTML = 'FAILURE';
      });
  }

})();
