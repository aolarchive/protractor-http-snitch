module.exports = [{
  request: {
    path: '/successful/api',
    method: 'GET',
    queryString: {
      with: 'param'
    }
  },
  response: {
    status: 200,
    data: {some: 'data'}
  }
}, {
  request: {
    path: '/faulty/api',
    method: 'POST',
    data: {some: 'data'}
  },
  response: {
    status: 500,
    data: {some: 'error', deeper: {some: 'data'}}
  }
}];
