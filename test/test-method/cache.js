/**
 * Magix Cache相关方法测试用例
 */
(function (win, S, Test, EMPTY) {
  let $;
  const expect = chai.expect;
  let Cache;
  let priFun;
  let priVar;

  function CacheTest() {
    describe('Cache', () => {
      it('constructor', () => {
        Cache = Magix.Cache;
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];

        let cache = new Cache();

        expect(cache.c).to.deep.equal([]);
        expect(cache.b).to.equal(5);
        expect(cache.x).to.equal(25);
        expect(cache.r).not.to.be.ok;

        cache = new Cache(30, 6, true);
        
        expect(cache.b).to.equal(6);
        expect(cache.x).to.equal(36);
        expect(cache.r).to.be.ok;
      });

      it('del', () => {
        let hasInvokeRemove = false;
        const G_SPLITER = priVar['get-G_SPLITER']();
        const G_EMPTY = priVar['get-G_EMPTY']();

        const cache = new Cache(30, 6, () => {
          hasInvokeRemove = true;
        });

        const resouce = {
          o: 'test',
          v: 'test-result',
          f: 1,
          t: 1
        };

        cache.c[G_SPLITER + 'test'] = resouce;

        cache.del('test');

        expect(resouce.f).to.equal(-1);
        expect(resouce.v).to.equal(G_EMPTY);
        expect(cache.c[G_SPLITER + 'test']).not.to.be.ok;
        expect(hasInvokeRemove).to.be.ok;
      });

      it('set get', () => {
        const cache = new Cache(1, 1);
        const cacheValueA = { a: 1 };
        const G_SPLITER = priVar['get-G_SPLITER']();
        const G_EMPTY = priVar['get-G_EMPTY']();
        let G_COUNTER = priVar['get-G_COUNTER']();

        cache.set('testKey', cacheValueA);

        const c = cache.c;
        let cacheObj = c[G_SPLITER + 'testKey'];

        expect(c[0]).to.equal(cacheObj);
        expect(cacheObj.v).to.equal(cacheValueA);
        expect(cacheObj.t).to.equal(G_COUNTER);
        expect(cacheObj.f).to.equal(1);
        expect(cacheObj.o).to.equal('testKey');

        const cacheValueB = { b: 1 };

        G_COUNTER = priVar['get-G_COUNTER']();

        cache.set('testKey', cacheValueB);

        expect(cacheObj.v).to.equal(cacheValueB);
        expect(cacheObj.t).to.equal(G_COUNTER);

        cache.set('testKey1', 5);
        cache.set('testKey2', 6);

        expect(c[G_SPLITER + 'testKey']).not.to.be.ok;
        expect(cacheObj.f).to.equal(-1);
        expect(cacheObj.v).to.equal(G_EMPTY);

        G_COUNTER = priVar['get-G_COUNTER']();

        expect(cache.get('testKey1')).to.equal(5);

        cacheObj = c[G_SPLITER + 'testKey1'];

        expect(cacheObj.f).to.equal(2);
        expect(cacheObj.t).to.equal(G_COUNTER);
      });

      it('each, has', () => {
        const cache = new Cache();
        const resultSet = new Set();
        const testObj = { a: 1 };

        cache.set('key1', 5);
        cache.set('key2', 2);
        cache.set('key3', 'a');
        cache.set('key4', 'b');
        cache.set('key5', testObj);

        cache.each(item => {
          const itemType = typeof item;

          switch(itemType) {
            case 'number': 
              resultSet.add(item + 5); break;
            case 'string': 
              resultSet.add(item + '-test'); break;
            case 'object':
              item.test = true; resultSet.add(item); break;
            default: 
              break;
          }
        });
        
        expect(resultSet.has(10)).to.be.ok;
        expect(resultSet.has(7)).to.be.ok;
        expect(resultSet.has('a-test')).to.be.ok;
        expect(resultSet.has('b-test')).to.be.ok;
        expect(resultSet.has(testObj)).to.be.ok;
        expect(cache.has('key1')).to.be.ok;
        expect(cache.has('key2')).to.be.ok;
        expect(cache.has('key3')).to.be.ok;
        expect(cache.has('key4')).to.be.ok;
        expect(cache.has('key5')).to.be.ok;
        expect(testObj.test).to.be.ok;
      });
    });
  }
  Test.Cache = CacheTest;
})(window, window.KISSY, window.Test || (window.Test = {}), '');