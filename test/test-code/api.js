/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, Test, EMPTY) {
  function Api() {
    const expect = chai.expect;
    let TestView;

    describe('Api', () => {
      before(done => {
        KISSY.use('app/view/content2', (S, DView) => {
          TestView = DView;
          done();
        });
      });
      // 兼容层API测试
      it('isArray, isFunction, isObject, isRegExp, isString, isNumber', () => {
        if (isMagix1 || isMagix3Shim) {
          S.each('isArray, isFunction, isObject, isRegExp, isString, isNumber'.split(','), fnName => {
            fnName = S.trim(fnName);
            expect(Magix[fnName]).to.be.equal(S[fnName]);
          });
        } 
        if (isMagix3) {
          S.each('isArray, isFunction, isObject, isRegExp, isString, isNumber'.split(','), fnName => {
            fnName = S.trim(fnName);
            expect(Magix[fnName]).not.ok;
          });
        }
      });

      it('isNumeric', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.isNumeric).to.be.ok;
          expect(Magix.isNumeric('1')).to.be.ok;
          expect(Magix.isNumeric('1e6')).to.be.ok;
          expect(Magix.isNumeric('abcdefg')).not.ok;
        } else {
          expect(Magix.isNumeric).not.ok;
        }
      });

      it('pathToObject', () => {
        const fn = Magix.pathToObject || Magix.parseUrl;
        const uris = [
          ['/xxx/a.b.c.html?a=b&c=d', {
            path: '/xxx/a.b.c.html',
            params: {
              a: 'b',
              c: 'd'
            }
          }],
          ['/xxx/?a=b&c=d', {
            path: '/xxx/',
            params: {
              a: 'b',
              c: 'd'
            }
          }],
          ['/xxx/#?a=b', {
            path: '/xxx/',
            params: {
              a: 'b'
            }
          }],
          ['/xxx/index.html#', {
            path: '/xxx/index.html',
            params: {}
          }],
          ['/xxx/index.html', {
            path: '/xxx/index.html',
            params: {}
          }],
          ['/xxx/#', {
            path: '/xxx/',
            params: {}
          }],
          ['a=b&c=d', {
            path: '',
            params: {
              a: 'b',
              c: 'd'
            }
          }], 
          ['/s?src=b#', {
            path: '/s',
            params: {
              src: 'b'
            }
          }],
          ['ab?a&b', {
            path: 'ab',
            params: {
              a: '',
              b: ''
            }
          }],
          ['a=b&c', {
            path: '',
            params: {
              a: 'b',
              c: ''
            }
          }],
          ['ab=', {
            path: '',
            params: {
              ab: ''
            }
          }]
        ];

        const conflicts = [
          // Magix 1, 3解析不一致
          ['a=YT3O0sPH1No=', {
            path: '',
            params: {
              a: 'YT3O0sPH1No='
            }
          }, {
            pathname: '',
            params: {
              a: 'YT3O0sPH1No'
            }
          }],
          // Magix 1, 3解析不一致
          ['a=YT3O0sPH1No===&b=c', {
            path: '',
            params: {
              a: 'YT3O0sPH1No===',
              b: 'c'
            }
          }, {
            pathname: '',
            params: {
              a: 'YT3O0sPH1No',
              b: 'c'
            }
          }],
          // Magix 1, 3 解析不一致
          ['=abc', {
            path: '=abc',
            params: {}
          }, {
            pathname: '',
            params: {
              abc: ''
            }
          }],
          ['a&b', {
            path: '',
            params: {
              a: '',
              b: ''
            }
          }, {
            pathname: 'a&b',
            params: {}
          }]
        ];

        uris.forEach(([path, ret]) => {
          if (isMagix1) {
            ret = {
              ...ret,
              pathname: ret.path
            };
            delete ret.path;
          } else if (isMagix3Shim) {
            ret.pathname = ret.path;
          }

          expect(fn(path)).to.be.deep.equal(ret);
        });

        if (isMagix3 || isMagix1) {
          conflicts.forEach(([path, mx3, mx1]) => {
            expect(fn(path)).to.be.deep.equal(isMagix3 ? mx3 : mx1);
          });
        }
      });

      it('noop', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.noop).to.be.ok;
          const noop = function () {};
          expect(Magix.noop()).to.be.deep.equal(noop());
        } else {
          expect(Magix.noop).not.ok;
        }
      });
  
      it('local', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.local).to.be.ok;
  
          Magix.local({
            userId: '59067'
          });
  
          Magix.local('userName', 'jintai.yzq');
          expect(Magix.local('userId')).to.be.equal('59067');
          expect(Magix.local()).to.be.deep.equal({ userId: '59067', userName: 'jintai.yzq' });
        } else {
          expect(Magix.local).not.ok;
        }
      });
  
      it('cache', () => {
        let cache;
  
        if (isMagix1 || isMagix3Shim) {
          cache = Magix.cache();
        } else {
          cache = new Magix.Cache();
        }
  
        expect(cache).to.be.ok;
        expect(cache.get).to.be.ok;
        expect(cache.set).to.be.ok;
        expect(cache.del).to.be.ok;
        expect(cache.has).to.be.ok;
      });
  
      it('safeExec', () => {
        if (isMagix1 || isMagix3Shim) {
          expect(Magix.safeExec).to.be.ok;
        } else {
          expect(Magix.safeExec).not.ok;
        }
      });
  
      it('listToMap', () => {
        const fn = Magix.listToMap || Magix.toMap;
        const cases = [
          [[[1,2,3,4,5,6]], {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1}],
          [[[{id:20},{id:30},{id:40}],'id'], {20:{id:20},30:{id:30},40:{id:40}} ]
        ];
        
        const conflicts = [
          [['submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change'], {submit:1,focusin:1,focusout:1,mouseenter:1,mouseleave:1,mousewheel:1,change:1}]
        ];
  
        cases.forEach(( [args, ret] ) => {
          expect(fn.apply(Magix, args)).to.be.deep.equal(ret);
        });
  
        if (isMagix1 || isMagix3Shim) {
          conflicts.forEach(( [args, ret] ) => {
            expect(fn.apply(Magix, args)).to.be.deep.equal(ret);
          });
        }
      });

      // magix3 API测试
      if (isMagix3) {
        it('boot', done => {
      
          //先验证magix config的逻辑
          const config = Magix.config();
      
          expect(config).to.include({
            rootId: 'J_app_main',
            defaultView: 'app/view/default',//默认加载的view
            defaultPath: '/home',
            unmatchView: 'app/view/error'
          });
      
          expect(config.exts).to.have.members(['app/extview']);
          expect(config.error('404')).to.equal('error msg: 404');

          Magix.config({
            error(e) {
              throw e;
            },
          });

          expect(config.routes).to.include({ "/home": "app/view/default" });
      
          //Vframe加载完成
          const vf = addFrameData.vframe;
      
          //app/views/default加载完成，Router绑定changed事件成功，验证 extview 里的逻辑，ini 加载成功
          expect(Magix.View.prototype.setViewPagelet).to.be.a('function');
    
          //验证 rootId配置
          expect(vf.id).to.equal('J_app_main');
  
          //验证dom
          expect(document.querySelector('#loc-param')).to.have.text('loc');
          expect(document.querySelector('#state-param')).to.have.text('state');
  
          //验证 State 监听 changed 事件， Vframe_NotifyChange 方法的执行
          window.location.hash += '&locparam=1';

          vf.on('canTest', () => {
            //验证 View_IsObserveChanged
            expect(document.querySelector('#loc-param')).to.have.text('1');
            
            Magix.State.digest({
              'stateparam': '2'
            });
    
            //验证 State_IsObserveChanged
            expect(document.querySelector('#state-param')).to.have.text('2');
    
            done();
          })
        });

        it('config', done => {
          expect(Magix.config).to.be.a('function');
      
          let error;
      
          Magix.config({
            rootId: 'J_app_main',
            defaultView: 'app/view/default',//默认加载的view
            defaultPath: '/home',
            unmatchView: 'app/view/error',
            exts: ['app/extview'],
            error(e) {
              error = 'error msg: ' + e;
            },
            routes: {
              "/home": "app/view/default"
            }
          });
      
          const config = Magix.config();
      
          config.error('404');
      
          expect(config).to.include({
            rootId: 'J_app_main',
            defaultView: 'app/view/default',//默认加载的view
            defaultPath: '/home',
            unmatchView: 'app/view/error'
          });
      
          expect(config.exts).to.have.members(['app/extview']);
          expect(error).to.equal('error msg: 404');
          expect(config.routes).to.include({ "/home": "app/view/default" });
      
          done();
        });

        it('toMap', () => {
          const simpleMap = Magix.toMap([1, 2, 3]);
          const mapWithKey = Magix.toMap([
            { id: 20 },
            { id: 30 },
            { id: 40 }
          ], 'id');

          expect(simpleMap).to.deep.equal({
            1: 1,
            2: 1, 
            3: 1
          });

          expect(mapWithKey).to.deep.equal({
            20: { id: 20 },
            30: { id: 30 },
            40: { id: 40 }
          });
        });

        it('toTry', () => {
          let error;
          let result1;
          let result2;

          Magix.config({
            error(e) {
              error = e.message;
            }
          });

          Magix.toTry(num => {
            result1 = num;
          }, 1);

          expect(result1).to.equal(1);

          Magix.toTry([
            (a, b) => {
              result1 = a + b;
            },
            (a, b) => {
              result2 = a * b;
            }
          ], [1, 2]);

          expect(result1).to.equal(3);
          expect(result2).to.equal(2);

          Magix.toTry(() => {
            throw new Error('test error');
          });

          expect(error).to.equal('test error');
        });

        it('mix', () => {
          const aim = { a: 10 };

          Magix.mix(aim, { b: 20, c: 30 });
          expect(aim).to.deep.equal({ a: 10, b: 20, c: 30 });
        });

        it('toUrl', () => {
          let str = Magix.toUrl('/xxx/',{ a: 'b', c: 'd' });

          expect(str).to.equal('/xxx/?a=b&c=d');
          str = Magix.toUrl('/xxx/',{ a: '', c: 2 });
          expect(str).to.equal('/xxx/?a=&c=2');
          str = Magix.toUrl('/xxx/',{ a: '', c: 2 }, { c: 1 });
          expect(str).to.equal('/xxx/?c=2');
          str = Magix.toUrl('/xxx/',{ a: '', c: 2 }, { a: 1, c: 1 });
          expect(str).to.equal('/xxx/?a=&c=2');
        });

        it('has', () => {
          const obj = {
            key1: undefined,
            key2: 0
          };

          expect(Magix.has(obj,'key1')).to.be.ok;
          expect(Magix.has(obj,'key2')).to.be.ok;
          expect(Magix.has(obj,'key3')).not.ok;
        });

        it('keys', () => {
          const obj = { a: 1, b: 2, c: 3 };

          expect(Magix.keys(obj)).to.include.members([ 'a', 'b', 'c' ]);
        });

        it('inside', () => {
          const $ = S.all;
          const root = $('html');
          const body = $('body');
          
          expect(Magix.inside(body[0], root[0])).to.be.ok;
          expect(Magix.inside(root[0], body[0])).not.ok;
          expect(Magix.inside(root[0], root[0])).to.be.ok;
        });

        it('node', () => {
          expect(Magix.node('J_app_main')).to.equal(document.getElementById('J_app_main'));
        });

        it('nodeId', () => {
          const a = document.getElementById('J_app_main');
          const b = document.body;

          Magix.nodeId(b);

          expect(Magix.nodeId(a)).to.equal('J_app_main');
          expect(b['$a']).to.equal(1);
          expect(b.id).to.be.ok;
        })

        it('applyStyle', () => {
          Magix.applyStyle('testSubway', '#J_app_main { font-size: 20px; }');
          
          const fontSize = window.getComputedStyle(document.getElementById('J_app_main')).getPropertyValue('font-size');

          expect(fontSize).to.equal('20px');
        });

        it('use', done => {
          Magix.use('app/view/content2', TView => {
            expect(TView).to.equal(TestView);
            done();
          })
        });

        it('guid', () => {
          const keyMap = {};
          let repeat = false;
          let key = Magix.guid('mx-test-');

          expect(key.indexOf('mx-test-')).to.equal(0);

          keyMap[key] = true;

          for(let i = 0; i < 99999; i ++ ) {
            key = Magix.guid('mx-test-');
            repeat = !!keyMap[key];

            if (repeat) break;

            keyMap[key] = true;
          }

          expect(repeat).not.ok;
        })
      }
    });
  }
  Test.Api = Api;
})(window, window.KISSY, window.Test || (window.Test = {}), '');