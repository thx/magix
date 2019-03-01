/**
 * Magix.Router 相关测试用例
 */
(function(win, S, Test, EMPTY) {
  const $ = S.all;

  Test.Router = () => {
    const expect = chai.expect;
    let Router;
    let priFun;
    let priVar;

    describe('Router', () => {
      it('parse', () => {
        Router = Magix.Router;
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];

        let result;
        const GetParam = priFun['get-GetParam']();
        const oriRouter_AttachViewAndPath = priFun['get-Router_AttachViewAndPath']();

        function validResult(result, validator, validateGet) {
          if (validateGet) {
            expect(result.get).to.equal(GetParam);
            delete result.get;
          }
          
          expect(result).to.deep.equal(validator);
        }

        const hrefList = [
          {
            href: 'https://a.b.c.com',
            res: {
              href: 'https://a.b.c.com',
              srcQuery: '',
              srcHash: '',
              query: {
                path: '',
                params: {}
              },
              hash: {
                path: '',
                params: {}
              },
              params: {}
            }
          },
          {
            href: 'https://a.b.c.com/?p0=000',
            res: {
              href: 'https://a.b.c.com/?p0=000',
              srcQuery: '/?p0=000',
              srcHash: '',
              query: {
                path: '/',
                params: {
                  p0: '000'
                }
              },
              hash: {
                path: '',
                params: {}
              },
              params: {
                p0: '000'
              }
            }
          },
          {
            href: 'https://a.b.c.com/#!/d/e?p1=111&p2=aaa',
            res: {
              href: 'https://a.b.c.com/#!/d/e?p1=111&p2=aaa',
              srcQuery: '/',
              srcHash: '/d/e?p1=111&p2=aaa',
              query: {
                path: '/',
                params: {}
              },
              hash: {
                path: '/d/e',
                params: {
                  p1: '111',
                  p2: 'aaa'
                }
              },
              params: {
                p1: '111',
                p2: 'aaa'
              }
            }
          },
          {
            href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
            res: {
              href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
              srcQuery: '/?p0=000',
              srcHash: '/d/e?p1=111&p2=aaa',
              query: {
                path: '/',
                params: {
                  p0: '000'
                }
              },
              hash: {
                path: '/d/e',
                params: {
                  p1: '111',
                  p2: 'aaa'
                }
              },
              params: {
                p0: '000',
                p1: '111',
                p2: 'aaa'
              }
            }
          }
        ]

        hrefList.forEach( h => {
          let hasInvokeRouter_AttachViewAndPath = false;

          priFun['set-Router_AttachViewAndPath'](a => {
            validResult(a, h.res, true);
            hasInvokeRouter_AttachViewAndPath = true;
          });

          result = Router.parse(h.href);

          expect(hasInvokeRouter_AttachViewAndPath).to.be.ok;
          validResult(result, h.res);
        });

        priFun['set-Router_AttachViewAndPath'](oriRouter_AttachViewAndPath);
      });

      it('diff', () => {
        const routerLastChange = {};
        const G_PATH = priVar['get-G_PATH']();
        const parseLocation = { title: 'test-doc-title' };
        const changedObj = {
          a: 1,
          b: {
            [G_PATH]: 1
          }
        };

        let hasInvokeRouter_Parse = false;
        let hasInvokeRouter_GetChged = false;
        let hasInvokeFire = false;
        let Router_LLoc = priVar['get-Router_LLoc']();
        const oriFire = Router.fire;

        priVar['set-Router_LastChanged'](routerLastChange);

        const oriRouter_Parse = priFun['set-Router_Parse'](() => {
          hasInvokeRouter_Parse = true;
          return parseLocation;
        });

        const oriRouter_GetChged = priFun['set-Router_GetChged']((a, b) => {
          expect(a).to.equal(Router_LLoc);
          expect(b).to.equal(parseLocation);
          hasInvokeRouter_GetChged = true;
          return changedObj;
        });

        Router.fire = (a, b) => {
          expect(a).to.equal(priVar['get-G_CHANGED']());
          expect(b).to.equal(changedObj.b);
          hasInvokeFire = true;
        }

        priVar['set-Router_Silent'](1);

        // Router_Silent = 1 ,changed.a = 1
        expect(Router.diff()).to.equal(routerLastChange);
        expect(priVar['get-Router_Silent']()).to.equal(0);
        expect(hasInvokeRouter_Parse).to.be.ok;
        expect(hasInvokeRouter_GetChged).to.be.ok;

        hasInvokeRouter_Parse = false;
        hasInvokeRouter_GetChged = false;
        changedObj.a = 0;
        Router_LLoc = priVar['get-Router_LLoc']();

        // Router_Silent = 0 ,changed.a = 0
        expect(Router.diff()).to.equal(routerLastChange);
        expect(priVar['get-Router_Silent']()).to.equal(0);
        expect(hasInvokeRouter_Parse).to.be.ok;
        expect(hasInvokeRouter_GetChged).to.be.ok;

        hasInvokeRouter_Parse = false;
        hasInvokeRouter_GetChged = false;
        changedObj.a = 1;
        Router_LLoc = priVar['get-Router_LLoc']();

        // Router_Silent = 0 ,changed.a = 1, location has path
        expect(Router.diff()).to.equal(changedObj.b);
        expect(hasInvokeRouter_Parse).to.be.ok;
        expect(hasInvokeRouter_GetChged).to.be.ok;
        expect(priVar['get-Router_Silent']()).to.equal(0);
        expect(document.title).to.equal('test-doc-title');
        expect(hasInvokeFire).to.be.ok;

        hasInvokeRouter_Parse = false;
        hasInvokeRouter_GetChged = false;
        hasInvokeFire = false;
        changedObj.b = {};
        document.title = 'test-page';
        Router_LLoc = priVar['get-Router_LLoc']();
        priVar['set-Router_LastChanged'] = {};

        // Router_Silent = 0 ,changed.a = 1, location has no path
        expect(Router.diff()).to.equal(changedObj.b);
        expect(hasInvokeRouter_Parse).to.be.ok;
        expect(hasInvokeRouter_GetChged).to.be.ok;
        expect(priVar['get-Router_Silent']()).to.equal(0);
        expect(document.title).to.equal('test-page');
        expect(hasInvokeFire).to.be.ok;

        priFun['set-Router_Parse'](oriRouter_Parse);
        priFun['set-Router_GetChged'](oriRouter_GetChged);
        Router.fire = oriFire;
      });

      it('to', () => {
        let testIndex = 0;
        let hasInvokeRouter_Update = false;
        const replaceArg = {};
        const silentArg = {};
        const G_EMPTY = priVar['get-G_EMPTY']();
        const G_PARAMS = priVar['get-G_PARAMS']();
        const G_PATH = priVar['get-G_PATH']();

        const testCaseArr = [{
          // 空参数情况
          args: {
            pn: ''
          }, 
          result: {
            tParams: {}
          }
        }, {
          // 空参数情况
          args: {
            params: {}
          }, 
          result: {
            tParams: {}
          }
        }, {
          // 仅有pn的情况
          args: {
            pn: '/list?page=2&rows=20'
          },
          result: {
            tPath: '/list',
            tParams: {
              page: '2',
              rows: '20'
            }
          }
        }, {
          // 仅有params的情况
          args: {
            params: {
              line: 3,
              rows: 14
            }
          },
          result: {
            tParams: {
              line: 3,
              rows: 14
            }
          }
        }, {
          // 有pn的情况和params的情况
          args: {
            pn: '/list1?page=3&rows=21',
            params: {
              line: 1,
              rows: 10
            }
          },
          result: {
            tPath: '/list1',
            tParams: {
              line: 1,
              page: '3',
              rows: 10
            }
          }
        }, {
          // 有path，需要覆盖query.params
          lloc: {
            query: {
              [ G_PARAMS ]: {
                b: 2,
                c: 3
              }
            }
          },
          args: {
            pn: '/list3?page=5&rows=30',
            params: {
              line: 10,
              rows: 10
            }
          },
          result: {
            tPath: '/list3',
            tParams: {
              b: G_EMPTY,
              c: G_EMPTY,
              page: '5',
              rows: 10,
              line: 10
            }
          }
        }, {
          // 无path，需要合并last_location.params的情况
          lloc: {
            [ G_PATH ]: '/abc',
            [ G_PARAMS ]:  {
              a: 1
            },
            query: {
              [ G_PARAMS ]: {
                b: 2,
                c: 3
              }
            }
          },
          args: {
            params: {
              line: 510,
              rows: 130
            }
          },
          result: {
            tPath: '/abc',
            tParams: {
              a: 1,
              rows: 130,
              line: 510
            }
          }
        }, {
          // 需要覆盖last_location的情况
          lloc: {
            [ G_PARAMS ]:  {
              a: 1
            },
            query: {
              [ G_PARAMS ]: {
                b: 2,
                c: 3
              }
            }
          },
          args: {
            pn: '/list?page=2&rows=20',
            params: {
              line: 10,
              rows: 10
            }
          },
          result: {
            tPath: '/list',
            tParams: {
              b: G_EMPTY,
              c: G_EMPTY,
              page: '2',
              rows: 10,
              line: 10
            }
          }
        }];
        
        const oriRouter_Update = priFun['set-Router_Update']((a, b, c, d, e, f) => {
          const testCase = testCaseArr[testIndex].result;
          const Router_LLoc = priVar['get-Router_LLoc']();

          expect(a).to.equal(testCase.tPath);
          expect(b).to.deep.equal(testCase.tParams);
          expect(c).to.equal(Router_LLoc);
          expect(d).to.equal(replaceArg);
          expect(e).to.equal(silentArg);
          expect(f).to.equal(Router_LLoc.query[priVar['get-G_PARAMS']()]);
          hasInvokeRouter_Update = true;
        });

        priVar['set-Router_LLoc']({
          query: {},
          params: {},
          href: G_EMPTY
        });

        testCaseArr.forEach((tc, index) => {
          const args = tc.args;

          testIndex = index;
          hasInvokeRouter_Update = false;

          if (tc.lloc) {
            priVar['set-Router_LLoc'](tc.lloc);
          }

          if (args.pn || args.pn === '') {
            Router.to(args.pn, args.params, replaceArg, silentArg);
          } else {
            Router.to(args.params, null, replaceArg, silentArg);
          }
          
          expect(hasInvokeRouter_Update).to.be.ok;
        });
        
        priFun['set-Router_Update'](oriRouter_Update);
      })

      it('on, fire, off', () => {
        const Event = Magix.Event;

        expect(Router.on).to.equal(Event.on);
        expect(Router.fire).to.equal(Event.fire);
        expect(Router.off).to.equal(Event.off);
      })
    });
  }
})(window, window.KISSY, window.Test || (window.Test = {}), '');