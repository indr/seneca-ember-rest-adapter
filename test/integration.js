const assert = require('chai').assert;
const Seneca = require('seneca');

describe('Integration', function () {
  var seneca,
    id1, id2;

  before(function (done) {
    seneca = Seneca()
      .use('entity')
      .use('jsonrest-api', {
        pin: {
          name: 'foo'
        },
        prefix: '/a/b'
      })
      .use('../ember-rest-adapter', {
        alias: {
          'foo': 'foos'
        }
      })
      .error(assert)
      .ready(function (err) {
        assert(!err);

        // I don't know why I have to call this manually...
        seneca.act('init:ember-rest-adapter', function (err, result) {
          seneca.make$('foo', {a:'foo1'}).save$(function (err, entity) {
            id1 = entity.id;
          });
          seneca.make$('foo', {a:'foo2'}).save$(function (err, entity) {
            id2 = entity.id;
          });
          done();
        });
      });
  });

  after(function (done) {
    seneca.close(done);
  });

  it('GET /foo | returns root object \'foo\' as array', function (done) {
    seneca.act('role:jsonrest-api,method:get,prefix:/a/b,kind:foo,zone:-,base:-,name:foo', function (err, result) {
      assert(!err);
      assert.equal(Object.keys(result).length, 1);
      const data = result['foo'];
      assert.equal(data.length, 2);
      assert.equal(data[0].a, 'foo1');
      assert.equal(data[1].a, 'foo2');
      done();
    });
  });

  it('GET /foos | translates from foos to foo and returns root object \'foos\' as array', function (done) {
    seneca.act('role:jsonrest-api,method:get,prefix:/a/b,kind:foos,zone:-,base:-,name:foos', function (err, result) {
      assert(!err);
      assert.equal(Object.keys(result).length, 1);
      const data = result['foos'];
      assert.equal(data.length, 2);
      assert.equal(data[0].a, 'foo1');
      assert.equal(data[1].a, 'foo2');
      done();
    });
  });

  it('GET /foo/:id | translates from foos to foo and returns root object \'foos\' as object', function (done) {
    seneca.act('role:jsonrest-api,method:get,prefix:/a/b,kind:foo,zone:-,base:-,name:foo,id:'+id1, function (err, result) {
      assert(!err);
      assert.equal(Object.keys(result).length, 1);
      const data = result['foo'];
      assert.equal(data.id, id1);
      assert.equal(data.a, 'foo1');
      done();
    });
  });

  it('GET /foos/:id | translates from foos to foo and returns root object \'foos\' as object', function (done) {
    seneca.act('role:jsonrest-api,method:get,prefix:/a/b,kind:foos,zone:-,base:-,name:foos,id:'+id1, function (err, result) {
      assert(!err);
      assert.equal(Object.keys(result).length, 1);
      const data = result['foos'];
      assert.equal(data.id, id1);
      assert.equal(data.a, 'foo1');
      done();
    });
  });
});