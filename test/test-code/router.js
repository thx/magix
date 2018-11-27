/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(win, S, Test, EMPTY) {
  const $ = S.all;

  Test.Router = () => {
    const expect = chai.expect;

    describe('Router', () => {
      it('router.parse', () => {
        const Router = Magix.Router;

        let result;
        const hrefList = [
          {
            href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
            res: [{
              pathnameDiff: {},
              paramDiff: {},
              hashOwn: {},
              queryOwn: {},
              href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
              srcQuery: 'https://a.b.c.com/?p0=000',
              srcHash: '/d/e?p1=111&p2=aaa',
              query: {
                pathname: '/',
                params: {
                  p0: '000'
                }
              },
              path: '/d/e',
              pathname: '/d/e',
              hash: {
                pathname: '/d/e',
                params: {
                  p1: '111',
                  p2: 'aaa'
                }
              },
              params: {
                p0: '000',
                p1: '111',
                p2: 'aaa'
              },
              view: 'app/view/default'
            }, {
              href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
              srcQuery: '/?p0=000',
              srcHash: '/d/e?p1=111&p2=aaa',
              query: {
                pathname: '/',
                path: '/',
                params: {
                  p0: '000'
                }
              },
              path: '/d/e',
              pathname: '/d/e',
              hash: {
                pathname: '/d/e',
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
              },
              view: 'app/view/default'
            }, {
              href: 'https://a.b.c.com/?p0=000#!/d/e?p1=111&p2=aaa',
              srcQuery: '/?p0=000',
              srcHash: '/d/e?p1=111&p2=aaa',
              query: {
                path: '/',
                params: {
                  p0: '000'
                }
              },
              path: '/d/e',
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
              },
              view: 'app/view/error'
            }]
          }
        ]
        hrefList.forEach( h => {
          if (isMagix1) {
            result = Router.parseQH(h.href);
            delete result.get;
            expect(result).to.include(h.res[0]);
          } else if (isMagix3Shim) {
            result = Router.parse(h.href);
            delete result.get;
            expect(result).to.deep.equal(h.res[1]);
          } else {
            result = Router.parse(h.href);
            delete result.get;
            expect(result).to.deep.equal(h.res[2]);
          }
        });
      });

      it('router.un', () => {
        const Router = Magix.Router;
  
        if (isMagix1 || isMagix3Shim) {
          expect(Router.un).to.be.a('function');
        } else {
          expect(Router.un).not.to.be.ok;
          expect(Router.off).to.be.a('function');
        }
      })
  
      it('router.navigate', () => {
        const Router = Magix.Router;
  
        if (isMagix1 || isMagix3Shim) {
          expect(Router.navigate).to.be.a('function');
        } else {
          expect(Router.navigate).not.ok;
          expect(Router.to).to.be.a('function');
        }
      });
  
      it('router.change', done => {
        const Router = Magix.Router;
  
        const list = [{
          target: '/list?page=2&rows=20',
          res: {
            href: "http://localhost:9876/context.html#!/list?page=2&rows=20", 
            srcQuery: "/context.html", 
            srcHash: "/list?page=2&rows=20", 
            params: {
              page: "2",
              rows: "20"
            },
            path: "/list",
            pathname: "/list",
            query: {
              params: {},
              path: "/context.html",
              pathname: "/context.html"
            },
            hash: {
              params: {page: "2", rows: "20"},
              path: "/list",
              pathname: "/list"
            },
            view: "app/view/default"
          }
        }, {
          target: 'page=3&rows=40',
          res: {
            href: "http://localhost:9876/context.html#!/list?page=3&rows=40", 
            srcQuery: "/context.html", 
            srcHash: "/list?page=3&rows=40", 
            params: {
              page: "3",
              rows: "40"
            },
            path: "/list",
            pathname: "/list",
            query: {
              params: {},
              path: "/context.html",
              pathname: "/context.html"
            },
            hash: {
              params: {page: "3", rows: "40"},
              path: "/list",
              pathname: "/list"
            },
            view: "app/view/default"
          }
        }, {
          target: {
            page: 8,
            row: 4
          },
          res: {
            href: "http://localhost:9876/context.html#!/list?page=8&rows=40&row=4", 
            srcQuery: "/context.html", 
            srcHash: "/list?page=8&rows=40&row=4", 
            params: {
              page: "8",
              rows: "40",
              row: "4"
            },
            path: "/list",
            pathname: "/list",
            query: {
              params: {},
              path: "/context.html",
              pathname: "/context.html"
            },
            hash: {
              params: {page: "8", rows: "40", row: "4"},
              path: "/list",
              pathname: "/list"
            },
            view: "app/view/default"
          }
        }];
  
        let curCase = 0;
        const $ = S.all;
  
        const testResult = () => {
          if (isMagix1 || isMagix3Shim) {
            const location = S.clone(Magix.View.prototype.location);
  
            delete location.get;
            expect(location).to.deep.equal(list[curCase].res);
          }
          
          curCase ++;
  
          if (curCase <= list.length - 1) {
            doNavigate();
          } else {
            $(window).detach('hashchange', testResult);
            done();
          }
        }
  
        const doNavigate = () => {
          const item = list[curCase];
  
          if (isMagix1 || isMagix3Shim) {
            Router.navigate(item.target);
          } else {
            Router.to(item.target);
          }
        }
  
        $(window).detach('hashchange', testResult).on('hashchange', testResult);
  
        doNavigate();
      });
    });
  }
})(window, window.KISSY, window.Test || (window.Test = {}), '');