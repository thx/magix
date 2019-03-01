/**
 * Magix Bag相关方法测试用例
 */
(function (win, S, Test, EMPTY) {
    let $;
    const expect = chai.expect;
    let Service;
    let priFun;
    let priVar;
  
    function ServiceTest() {
      describe('Service', () => {
        function testServiceConstructor(TestClass) {
            const G_COUNTER = priVar['get-G_COUNTER']();
            const service = new TestClass()

            expect(service.id).to.equal(`s${G_COUNTER}`);
            expect(service['$g']).to.deep.equal([]);
        }

        it('constructor', () => {
          priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
          priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
          Service = Magix.Service;

          testServiceConstructor(Service);
        });

        it('extend', () => {
            const Service_Manager = priVar['get-Service_Manager']();
            const G_NULL = priVar['get-G_NULL']();
            let hasInvokeG_Extend = false;
            let cacheMax = 2374;
            let cacheBuffer = 6434;
            const syncObj = {};
            
            const oriG_Extend = priVar['get-G_Extend']();
            
            priVar['set-G_Extend']((a, b, c, d) => {
                const NService = a;
                
                testServiceConstructor(NService);

                expect(NService['$s']).to.equal(syncObj);
                expect(NService['$c']).to.be.an.instanceof(Magix.Cache);
                expect(NService['$c'].b).to.equal(cacheBuffer);
                expect(NService['$c'].x).to.equal(cacheBuffer + cacheMax);
                expect(NService['$f']).to.deep.equal({});
                expect(NService['$b']).to.deep.equal({});
                expect(b).to.equal(Service);
                expect(c).to.equal(G_NULL);
                expect(d).to.equal(Service_Manager);

                hasInvokeG_Extend = true;

                return 'G_Extend result';
            });

            expect(Service.extend(syncObj, cacheMax, cacheBuffer)).to.equal('G_Extend result');
            expect(hasInvokeG_Extend).to.be.ok;

            priVar['set-G_Extend'](oriG_Extend);
        });

        it('all, save, one', () => {
            let sendTarget;
            let sendAttrs = {};
            let doneFn = function() {};
            let sendFlag = priVar['get-Service_FetchFlags_ALL']();
            let isSave;
            let hasINvokeService_Send = false;

            const oriService_Send = priFun['set-Service_Send']((a, b, c, d, e) => {
                expect(a).to.equal(sendTarget);
                expect(b).to.equal(sendAttrs);
                expect(c).to.equal(doneFn);
                expect(d).to.equal(sendFlag);
                expect(e).to.equal(isSave);

                hasINvokeService_Send = true;

                return 'Service_Send result';
            });

            const service = new Service();

            sendTarget = service;

            expect(service.all(sendAttrs, doneFn)).to.equal('Service_Send result');
            expect(hasINvokeService_Send).to.be.ok;

            hasINvokeService_Send = false;
            isSave = 1; 

            expect(service.save(sendAttrs, doneFn)).to.equal('Service_Send result');
            expect(hasINvokeService_Send).to.be.ok;

            hasINvokeService_Send = false;
            isSave = undefined; 
            sendFlag = priVar['get-Service_FetchFlags_ONE']();

            expect(service.one(sendAttrs, doneFn)).to.equal('Service_Send result');
            expect(hasINvokeService_Send).to.be.ok;

            priFun['set-Service_Send'](oriService_Send);
        });

        it('enqueue', () => {
            let hasInvokeDequeue = false;
            const enqueueFn = () => {};
            const service = new Service();

            service.dequeue = args => {
                expect(args).to.equal(service['$h']);
                hasInvokeDequeue = true;
            };

            expect(service.enqueue(enqueueFn)).to.equal(service);
            expect(service['$g'].pop()).to.equal(enqueueFn);
            expect(hasInvokeDequeue).to.be.ok;

            hasInvokeDequeue = false;
            service['$d'] = 1;

            expect(service.enqueue(enqueueFn)).to.equal(service);
            expect(service['$g'].pop()).not.to.equal(enqueueFn);
            expect(hasInvokeDequeue).not.to.be.ok;
        });

        it('dequeue', () => {
            let hasInvokeTimeout = false;
            let hasInvokeG_ToTry = false;
            let hasService = true;
            const testFn = () => {};
            const args = [ 1, 2, 3 ];
            const service = new Service();
            const oriTimeout = priVar['get-Timeout']();

            const oriG_ToTry = priFun['set-G_ToTry']((a, b) => {
                expect(a).to.equal(testFn);
                expect(b).to.deep.equal(args);
                expect(service['$h']).to.deep.equal(args);
                hasInvokeG_ToTry = true;
            });
            
            priVar['set-Timeout']((fn, time) => {
                hasInvokeG_ToTry = false;

                expect(service['$e']).to.equal(1);
                expect(time).to.equal(0);
                // service已销毁
                service['$d'] = 1;

                fn();

                expect(service['$e']).to.equal(0);

                if (hasService) {
                    expect(service['$g']).to.include(testFn);
                }
                
                expect(hasInvokeG_ToTry).not.to.be.ok;

                // service未销毁
                service['$d'] = 0;
                service['$e'] = 1;

                fn();

                expect(service['$g']).not.to.include(testFn);

                // hasService 配合外部使用
                if (hasService) {
                    expect(hasInvokeG_ToTry).to.be.ok;
                    expect(service['$h']).to.deep.equal(args);
                }

                expect(service['$e']).to.equal(0);

                hasInvokeTimeout = true;
            });

            // service busy
            service['$e'] = 1;

            service.dequeue(...args);

            expect(hasInvokeTimeout).not.to.be.ok;

            // service destroy
            service['$e'] = 0;
            service['$d'] = 1;

            service.dequeue(...args);

            expect(hasInvokeTimeout).not.to.be.ok;

            //正常情况
            service['$d'] = 0;
            service['$g'].push(testFn);
            
            service.dequeue(...args);

            expect(hasInvokeTimeout).to.be.ok;

            // service list 里无 fn
            hasInvokeTimeout = false;
            service['$g'] = [];
            hasService = false;

            service.dequeue(...args);

            expect(hasInvokeTimeout).to.be.ok;

            priVar['set-Timeout'](oriTimeout);
            priFun['set-G_ToTry'](oriG_ToTry);
        });

        it('destroy', () => {
            const service = new Service();

            service.destroy();

            expect(service['$d']).to.equal(1);
            expect(service['$g']).to.equal(0);
        });

        it('add', () => {
            const NService = Service.extend();
            const metas = NService['$b'];
            const [ bag0, bag1, bag2 ] = [
                { name: 'attr1', cache: 3.2, url: '/wrwer' },
                { name: 'attr2', cache: 5, url: '/w234r' },
                { name: 'attr3', cache: 4.34, url: '23443242' }
            ];

            NService.add(bag0);
      
            expect(metas['attr1']).to.deep.equal({ ...bag0, cache: 3 });

            NService.add([
                bag1,
                bag2
            ]);

            expect(metas['attr2']).to.deep.equal({ ...bag1, cache: 5 });
            expect(metas['attr3']).to.deep.equal({ ...bag2, cache: 4 });
        });

        it('meta', () => {
            const NService = Service.extend();
            const metas = NService['$b'];
            const bag = { name: 'testAttr', url: '23424' };
            const errorAttr = { name: 'testAttr3' };

            metas['testAttr'] = bag;

            expect(NService.meta('testAttr')).to.equal(bag);
            expect(NService.meta({ name: 'testAttr' })).to.equal(bag);
            expect(NService.meta('testAttr2')).to.equal('testAttr2');
            expect(NService.meta(errorAttr)).to.equal(errorAttr);
        });

        it('create', () => {
            const NService = Service.extend();
            const Bag = priFun['get-Bag']();
            let attrsArg = 'attr name';
            const storedMeta = { 
                cache: 234,
                name: 'store meta name',
                after: () => {},
                cleans: () => {}
            };

            let hasInvokeG_ToTry = false;
            let hasInvokeFire = false;
            let secondArgOfG_ToTry;
            let thirdArgOfG_ToTry;
            let bagEntity;
            let result;

            const oriManager_DefaultCacheKey = priFun['set-Manager_DefaultCacheKey']((a, b) => {
                expect(a).to.equal(storedMeta);
                expect(b).to.equal(attrsArg);

                return 'default cache key';
            });

            const oriG_ToTry = priFun['set-G_ToTry']((a, b, c) => {
                expect(a).to.equal(storedMeta.before);
                
                secondArgOfG_ToTry = b;
                thirdArgOfG_ToTry = c;
                hasInvokeG_ToTry = true;
            });

            NService.meta = a => {
                expect(a).to.equal(attrsArg);

                return storedMeta;
            }

            NService.fire = (a, b) => {
                expect(a).to.equal('begin');
                expect(b.bag).to.be.ok;

                bagEntity = b.bag;
                hasInvokeFire = true;
            }

            // 入参为字符串
            result = NService.create(attrsArg);

            expect(hasInvokeFire).to.be.ok;
            expect(result).to.be.instanceof(Bag);
            expect(hasInvokeG_ToTry).not.to.be.ok;
            expect(result['$b']).to.deep.equal({
                n: storedMeta.name,
                a: storedMeta.after,
                x: storedMeta.cleans,
                k: 'default cache key'
            });

            expect(result.$).to.deep.equal(storedMeta);
            expect(bagEntity).to.equal(result);

            // 入参为对象，cache 不为空 storeMeta.cache = 0, storeMeta has before
            attrsArg = {
                cache: 3.3,
                url: 'fsfsaf'
            };

            storedMeta.cache = 0;
            storedMeta.before = () => {};
            hasInvokeFire = false;

            result = NService.create(attrsArg);

            expect(hasInvokeFire).to.be.ok;
            expect(result).to.be.instanceof(Bag);
            expect(hasInvokeG_ToTry).to.be.ok;
            expect(result['$b']).to.deep.equal({
                n: storedMeta.name,
                a: storedMeta.after,
                x: storedMeta.cleans,
                k: 'default cache key'
            });

            expect(result.$).to.deep.equal({
                ...storedMeta,
                ...attrsArg
            });

            expect(secondArgOfG_ToTry).to.equal(result);
            expect(thirdArgOfG_ToTry).to.equal(result);
            expect(bagEntity).to.equal(result);

            // 入参为对象，cache=0 storeMeta.cache = 0, storeMeta has before
            attrsArg.cache = 0;
            hasInvokeFire = false;
            hasInvokeG_ToTry = false;

            result = NService.create(attrsArg);

            expect(hasInvokeFire).to.be.ok;
            expect(result).to.be.instanceof(Bag);
            expect(hasInvokeG_ToTry).to.be.ok;
            expect(result['$b']).to.deep.equal({
                n: storedMeta.name,
                a: storedMeta.after,
                x: storedMeta.cleans,
                k: 0
            });

            expect(result.$).to.deep.equal({
                ...storedMeta,
                ...attrsArg
            });

            expect(secondArgOfG_ToTry).to.equal(result);
            expect(thirdArgOfG_ToTry).to.equal(result);
            expect(bagEntity).to.equal(result);

            priFun['set-Manager_DefaultCacheKey'](oriManager_DefaultCacheKey);
            priFun['set-G_ToTry'](oriG_ToTry);
        });

        it('cached', () => {
            const NService = Service.extend();
            const metaObj = {};
            const attrsArg = {};
            let manageCacheResult;
            let hasInvokeManager_DefaultCacheKey = false;
            const requestCacheEntity = {};
            const bagCacheEntity = {
                '$b': {}
            };
            const nowTime = 1500;

            const oriManager_DefaultCacheKey = priFun['set-Manager_DefaultCacheKey']((a, b) => {
                expect(a).to.equal(metaObj);
                expect(b).to.equal(attrsArg);
                hasInvokeManager_DefaultCacheKey = true;

                return manageCacheResult;
            });

            const oriG_Now = priVar['get-G_Now']();

            priVar['set-G_Now'](() => nowTime);

            NService.meta = a => {
                return metaObj;
            }

            // 无cache
            expect(NService.cached(attrsArg)).not.to.be.ok;

            // attrs cache 不为0 , cacheKey 不存在
            attrsArg.cache = 13;

            expect(NService.cached(attrsArg)).not.to.be.ok;
            expect(hasInvokeManager_DefaultCacheKey).to.be.ok;

            // attrs cache 为0, meta.cache 不为0， cacheKey不存在
            attrsArg.cache = 0;
            metaObj.cache = 1000;
            hasInvokeManager_DefaultCacheKey = false;

            expect(NService.cached(attrsArg)).not.to.be.ok;
            expect(hasInvokeManager_DefaultCacheKey).to.be.ok;

            // 存在cache，且cacheKey存在，不存在对应entity
            manageCacheResult = 'manage cache result';
            hasInvokeManager_DefaultCacheKey = false;

            expect(NService.cached(attrsArg)).not.to.be.ok;
            expect(hasInvokeManager_DefaultCacheKey).to.be.ok;

            // 存在cache，且cacheKey存在，requestCache存在对应entity
            hasInvokeManager_DefaultCacheKey = false;
            NService['$f'] = {
                'manage cache result': {
                    e: requestCacheEntity
                }
            }

            expect(NService.cached(attrsArg)).to.equal(requestCacheEntity);
            expect(hasInvokeManager_DefaultCacheKey).to.be.ok;

            // 存在cache，且cacheKey存在，bagCache存在对应entity，缓存未过期
            delete NService['$f']['manage cache result'];
            bagCacheEntity['$b'].t = 800;
            NService['$c'].set('manage cache result', bagCacheEntity);
            hasInvokeManager_DefaultCacheKey = false;

            expect(NService.cached(attrsArg)).to.equal(bagCacheEntity);
            expect(hasInvokeManager_DefaultCacheKey).to.be.ok;

            // 存在cache，且cacheKey存在，bagCache存在对应entity，缓存已过期
            bagCacheEntity['$b'].t = 10;
            hasInvokeManager_DefaultCacheKey = false;

            expect(NService.cached(attrsArg)).not.to.be.ok;
            expect(hasInvokeManager_DefaultCacheKey).to.be.ok;
            expect(NService['$c'].get('manage cache result')).not.to.be.ok;

            priVar['set-G_Now'](oriG_Now);
            priFun['set-Manager_DefaultCacheKey'](oriManager_DefaultCacheKey);
        });

        it('get', () => {
            const NService = Service.extend();
            const attrsObj = {};
            let cacheObj = { content: 'cacheObj' };
            let createObj = { content: 'createObj' };
            let hasInvokeCached = false;
            let hasInvokeCreate = false;

            NService.cached = a => {
                expect(a).to.equal(attrsObj);
                hasInvokeCached = true;

                return cacheObj;
            };

            NService.create = a => {
                expect(a).to.equal(attrsObj);
                hasInvokeCreate = true;

                return createObj;
            };

            // !createNew 有 cache
            expect(NService.get(attrsObj)).to.deep.equal({
                e: cacheObj,
                u: undefined
            });

            expect(hasInvokeCached).to.be.ok;

            // !createNew 无 cache
            cacheObj = false;
            hasInvokeCached = false;

            expect(NService.get(attrsObj)).to.deep.equal({
                e: createObj,
                u: 1
            });

            expect(hasInvokeCached).to.be.ok;
            expect(hasInvokeCreate).to.be.ok;

            // createNew
            hasInvokeCached = false;
            hasInvokeCreate = false;

            expect(NService.get(attrsObj, true)).to.deep.equal({
                e: createObj,
                u: 1
            });

            expect(hasInvokeCached).not.to.be.ok;
            expect(hasInvokeCreate).to.be.ok;
        });

        it('clear', () => {
            const NService = Service.extend();
            let hasInvokeG_ToMap = false;
            let hasInvokeEach = false;
            const Manager_ClearCache = priFun['get-Manager_ClearCache']();
            const oriG_ToMap = priFun['set-G_ToMap'](a => {
                expect(a).to.deep.equal([
                    'cache1',
                    'abc2',
                    'def3',
                    'ghi4'
                ]);
                hasInvokeG_ToMap = true;

                return 'G_ToMap result';
            });

            NService['$c'].each = (a, b) => {
                expect(a).to.equal(Manager_ClearCache);
                expect(b).to.equal('G_ToMap result');
                hasInvokeEach = true;
            }

            NService.clear('cache1,abc2,def3,ghi4');
            expect(hasInvokeEach).to.be.ok;
            expect(hasInvokeG_ToMap).to.be.ok;

            priFun['set-G_ToMap'](oriG_ToMap);
        })

        it('on, fire, off', () => {
            const Event = Magix.Event;
            const SubService = Service.extend({});

            expect(SubService.on).to.equal(Event.on);
            expect(SubService.fire).to.equal(Event.fire);
            expect(SubService.off).to.equal(Event.off);
        });
      });
    }
    Test.Service = ServiceTest;
  })(window, window.KISSY, window.Test || (window.Test = {}), '');