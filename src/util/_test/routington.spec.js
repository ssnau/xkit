var should = require('should');
var assert = require('assert')
var routington = require('../routington')

describe('Route definitions', function () {
  it('should create the root', function () {
    var router = routington()
    router.should.be.an.instanceof(routington)

    var routes = router.define('')
    routes.should.have.length(1)

    var route = routes[0]
    route.should.be.an.instanceof(routington)
    route.string.should.equal('')
    route.name.should.equal('')
    route.parent.should.equal(router)

    router.child[''].should.equal(route)

    var routes2 = router.define('/')
    routes2.should.have.length(1)
    routes2[0].parent.should.equal(route)
  })

  it('should create a first level child', function () {
    var router = routington()

    var routes = router.define('/asdf')
    routes.should.have.length(1)

    var route = routes[0]
    route.string.should.equal('asdf')
    route.name.should.equal('')
    route.parent.parent.should.equal(router)
    route.parent.child['asdf'].should.equal(route)

    route = route.parent
    route.string.should.equal('')
    route.name.should.equal('')
    route.parent.should.equal(router)
  })

  it('should create a second level child', function () {
    var router = routington()

    var routes = router.define('/asdf/wqer')
    routes.should.have.length(1)

    var route = routes[0]
    route.string.should.equal('wqer')

    var parent = route.parent
    parent.string.should.equal('asdf')
    parent.parent.string.should.equal('')
    parent.parent.parent.should.equal(router)
  })

  it('should define a named route', function () {
    var router = routington()

    var routes = router.define('/:id')
    routes.should.have.length(1)

    var route = routes[0]
    route.name.should.equal('id')

    var parent = route.parent
    parent.string.should.equal('')
  })

  it('should define a regex route', function () {
    var router = routington()

    var routes = router.define('/:id(\\w{3,30})')
    routes.should.have.length(1)

    var route = routes[0]
    route.name.should.equal('id')
    route.regex.toString().should.equal('/^(\\w{3,30})$/i')
    route.regex.test('asd').should.be.ok
    route.regex.test('a').should.not.be.ok
  })

  it('should define multiple regex routes', function () {
    var router = routington()

    var routes = router.define('/:id(\\w{3,30}|[0-9a-f]{24})')
    routes.should.have.length(1)

    var route = routes[0]
    route.name.should.equal('id')
    route.regex.toString().should.equal('/^(\\w{3,30}|[0-9a-f]{24})$/i')
    route.regex.test('asdf').should.be.ok
    route.regex.test('1234123412341234').should.be.ok
    route.regex.test('a').should.not.be.ok
  })

  it('should define multiple unnamed regex routes', function () {
    var router = routington()

    var routes = router.define('/(\\w{3,30}|[0-9a-f]{24})')
    routes.should.have.length(1)

    var route = routes[0]
    route.name.should.equal('')
    route.regex.toString().should.equal('/^(\\w{3,30}|[0-9a-f]{24})$/i')
    route.regex.test('asdf').should.be.ok
    route.regex.test('1234123412341234').should.be.ok
    route.regex.test('a').should.not.be.ok
  })

  it('should define multiple string routes', function () {
    var router = routington()

    var routes = router.define('/asdf|qwer')
    routes.should.have.length(2)

    var route1 = routes[0]
    route1.name.should.equal('')
    route1.string.should.equal('asdf')

    var route2 = routes[1]
    route2.name.should.equal('')
    route2.string.should.equal('qwer')
  })

  it('should define multiple string routes using regex', function () {
    var router = routington()

    var routes = router.define('/:id(asdf|qwer)')
    routes.should.have.length(2)

    var route1 = routes[0]
    route1.name.should.equal('id')
    route1.string.should.equal('asdf')

    var route2 = routes[1]
    route2.name.should.equal('id')
    route2.string.should.equal('qwer')
  })

  it('should not duplicate string routes', function () {
    var router = routington()

    var routes2 = router.define('/asdf')
    routes2.should.have.length(1)
    var route2 = routes2[0]

    var routes1 = router.define('/:id(asdf)')
    routes1.should.have.length(1)
    var route1 = routes1[0]

    route1.should.equal(route2)
    route1.name.should.equal('')
    route2.name.should.equal('')
  })

  it('should multiply every child', function () {
      var router = routington()

      router.define('/a|b/c|d').should.have.length(4)
      router.define('/a|b|c/d|e|f').should.have.length(9)
      router.define('/1|4/2|3/6|2').should.have.length(8)
  })

  it('should care for trailing slashes', function () {
    var router = routington()

    var routes1 = router.define('/asdf/')
    routes1.should.have.length(1)

    var routes2 = router.define('/asdf')
    routes2.should.have.length(1)

    routes1[0].should.not.equal(routes2[0])
  })

  it('should care for null or root paths', function () {
    var router = routington()

    var routes1 = router.define('')
    routes1.should.have.length(1)

    var routes2 = router.define('/')
    routes2.should.have.length(1)

    routes1[0].should.not.equal(routes2[0])
  })

  // To do:
  // Routers like /asdf*asdf
  it('should not support * outside a regex', function () {
    var router = routington()

    assert.throws(function () {
      router.define('/*')
    })
    assert.throws(function () {
      router.define('/asdf/*')
    })
    assert.throws(function () {
      router.define('/*asdf')
    })
    assert.throws(function () {
      router.define('/asdf*')
    })
    assert.throws(function () {
      router.define('/*?')
    })

    assert.doesNotThrow(function () {
      router.define('/:id(.*)')
    })
  })
})

describe('Route matching', function () {
  it('should match the root path', function () {
    var router = routington()
    var routes = router.define('')

    var match = router.match('')
    match.param.should.eql({})
    match.node.should.equal(routes[0])
  })

  it('should match a top level path', function () {
    var router = routington()
    var routes = router.define('/favicon')

    var match = router.match('/favicon')
    match.param.should.eql({})
    match.node.should.equal(routes[0])
  })

  it('should match a named parameter', function () {
    var router = routington()
    var routes = router.define('/:id')

    var match = router.match('/asdf')
    match.param.should.eql({
      id: 'asdf'
    })
    match.node.should.equal(routes[0])
  })

  it('should match a regex', function () {
    var router = routington()
    var route = router.define('/:id(\\w{3,30})').shift()

    var match = router.match('/asdf')
    match.param.should.eql({
      id: 'asdf'
    })
    match.node.should.equal(route)

    should.not.exist(router.match('/a'))
  })

  it('should match the first declared regex', function () {
    var router = routington()
    router.define('/:id(\\w{3,30})')
    router.define('/:id([0-9a-f]{24})')

    var match = router.match('/asdfasdfasdfasdfasdfasdf')
    match.param.should.eql({
      id: 'asdfasdfasdfasdfasdfasdf'
    })
    match.node.regex.toString().should.equal('/^(\\w{3,30})$/i')
  })

  it('should match strings over regex', function () {
    var router = routington()
    router.define('/asdf')
    router.define('/:id(\\w{3,30})')

    var match = router.match('/asdf')
    match.param.should.eql({})
    match.node.string.should.equal('asdf')
  })

  it('should not overwrite generically named routes', function () {
    var router = routington()
    router.define('/:id')
    router.define('/:id(.*)')

    var match = router.match('/a')
    match.param.should.eql({
      id: 'a'
    })
    should.not.exist(match.node.parent.regex)
  })

  it('should be case sensitive with strings, but not regexs', function () {
    var router = routington()
    router.define('/asdf')
    router.define('/:id([0-9A-F]+)')

    should.not.exist(router.match('/ASDF'))
    router.match('/asdf').should.be.ok
    router.match('/a0b').should.be.ok
    router.match('/A0B').should.be.ok
  })

  it('should not match Object.prototype properties', function () {
    var router = routington()
    router.define('/')

    should.not.exist(router.match('/__proto__'))
    should.not.exist(router.match('/hasOwnProperty'))
  })

  it('/:path should not match /', function () {
    var router = routington()

    should.not.exist(router.match('/:path'))
  })

  it('should match encoded paths', function () {
    var router = routington()

    router.define('/page/:name(@\\w+)')

    router.match('/page/@jongleberry').should.be.ok
    router.match('/page/%40jongleberry').should.be.ok
  })

  it('should throw on malformed paths', function () {
    var router = routington()

    router.define('/page/:name(@\\w+)')

    assert.throws(function () {
      router.match('/page/%%%')
    })
  })
})

var parse = routington.parse

describe('Parse', function () {
  it('should parse a null string', function () {
    parse('').should.eql({
      name: '',
      string: {
        '': true
      },
      regex: ''
    })
  })

  it('should parse a word string', function () {
    parse('asdf').should.eql({
      name: '',
      string: {
        'asdf': true
      },
      regex: ''
    })
  })

  it('should allow - and _ in strings', function () {
    parse('a-b_-a').should.eql({
      name: '',
      string: {
        'a-b_-a': true
      },
      regex: ''
    })
  })

  it('should parse a named parameter', function () {
    parse(':id').should.eql({
      name: 'id',
      string: {},
      regex: ''
    })
  })

  it('should parse a named parameter with strings', function () {
    parse(':id(one|two)').should.eql({
      name: 'id',
      string: {
        'one': true,
        'two': true
      },
      regex: ''
    })
  })

  it('should parse a named parameter with regexs', function () {
    parse(':id(\\w{3,30}|[0-9a-f]{24})').should.eql({
      name: 'id',
      string: {},
      regex: '\\w{3,30}|[0-9a-f]{24}'
    })
  })

  it('should parse a named parameter with regexs and strings as a regex', function () {
    parse(':id(\\w{3,30}|asdf)').should.eql({
      name: 'id',
      string: {},
      regex: '\\w{3,30}|asdf'
    })
  })

  it('should parse pipe separated strings', function () {
    parse('asdf|qwer').should.eql({
      name: '',
      string: {
        'asdf': true,
        'qwer': true
      },
      regex: ''
    })
  })

  it('should throw on invalid pipe separated strings', function () {
    assert.throws(function () {
      parse('asdf|$$$')
    })
  })

  it('should parse unnamed regexs', function () {
    parse('(\\w+|\\d+)').should.eql({
      name: '',
      string: {},
      regex: '\\w+|\\d+'
    })
  })

  /*
  it('should parse trailing ?', function () {
    parse(':id?').should.eql({
      name: 'id',
      string: {
        '': true
      },
      regex: ''
    })
  })
  */

  it('should throw on invalid parameters', function () {
    ;[
      '*',
      ':id*',
      '*a',
      'a*',
      ':',
      ':()'
    ].forEach(function (x) {
      assert.throws(function () {
        parse(x)
      }, x)
    })
  })

  it('should not throw on oddly piped parameters', function () {
    ;[
      'a|b',
      'a||b',
      ':a(|b|c)',
      ':b(|c||d)'
    ].forEach(function (x) {
      assert.doesNotThrow(function () {
        parse(x)
      }, x)
    })
  })

  it('should support regular expressions with pipes', function () {
    parse(':id([0-9a-f]{24}\\.[olmsta]\\.(jpg|png))').should.eql({
      name: 'id',
      string: {},
      regex: '[0-9a-f]{24}\\.[olmsta]\\.(jpg|png)'
    })
  })

  it('should parse strings with a `.` as a string', function () {
    parse('blog.rss').should.eql({
      name: '',
      string: {
        'blog.rss': true
      },
      regex: ''
    })

    parse(':nav(blog.rss)').should.eql({
      name: 'nav',
      string: {
        'blog.rss': true
      },
      regex: ''
    })
  })

  it('should parse strings with a `-` as a string', function () {
    parse('privacy-policy').should.eql({
      name: '',
      string: {
        'privacy-policy': true
      },
      regex: ''
    })

    parse(':nav(privacy-policy|terms-of-service)').should.eql({
      name: 'nav',
      string: {
        'privacy-policy': true,
        'terms-of-service': true
      },
      regex: ''
    })
  })
})

