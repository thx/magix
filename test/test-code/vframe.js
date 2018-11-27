/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function (win, S, Test, EMPTY) {
  const $ = S.all;
  const expect = chai.expect;
  let TestView;

  function Vframe() {
    describe('Vframe', () => {
      before(done => {
        KISSY.use('app/view/content2', (S, DView) => {
          TestView = DView;
          done();
        });
      });
      if (isMagix3Shim) {
        it('vframe.mountView', () => {
          const Vframe = Magix.Vframe;
          const vframe = win.addFrameData.vframe;

          const proto = vframe.view.__proto__;

          expect(vframe.view instanceof Magix.View).to.be.ok;
          expect(S.isFunction(proto.tmpl)).to.be.ok;
          expect(vframe.view['sign']).to.equal(vframe.view.$s);
          // View_prepare
          expect(S.isFunction(proto['a<click>'])).to.be.ok; // 存在a方法
          expect(proto['a<click>']()).to.equal('a0'); // 自身的a方法
          expect(S.isFunction(proto['b<click>'])).to.be.ok; // 存在b方法
          expect(proto['b<click>']()).to.equal('b1'); // 一级父view的b方法
          expect(S.isFunction(proto['c<click>'])).to.be.ok; // 存在c方法
          expect(proto['c<click>']()).to.equal('c1'); // 一级父view的c方法
          expect(S.isFunction(proto['d<click>'])).to.be.ok; // 存在d方法
          expect(proto['d<click>']()).to.equal('d2'); // 二级父view的d方法
          // View_Ctors
          expect(vframe.view.path).to.equal(vframe.$j); // view有path属性，与vframe$j相等
          expect(vframe.view.sign).to.equal(vframe.view.$s); // view有sign属性，与$s相等
          vframe.view.sign = '?';
          expect(vframe.view.sign).to.be.not.equal('?'); // view的sign参数不能被重写
          // mountZone
          expect(Object.keys(Vframe.all())).to.be.deep.equal(['J_app_main', 'mx_64', 'mx_65']);
          expect(vframe.$d).to.equal(0);
        });

        it('vframe.event', function(done) {
          this.timeout(10000);

          const vframe = Magix.Vframe.get('mx_65');
          const testEvent = () => {
            if (vframe.$v) {
              expect(vframe.num).to.equal(undefined);
              S.one('input.btn').fire('click');
              expect(vframe.num).to.equal(2);
              done();
            } else {
              setTimeout(testEvent, 25);
            }
          };

          testEvent();
        });

        it('vframe.setHTML', function(done) {
          this.timeout(10000);
          const vframe = Magix.Vframe.get('mx_65');

          vframe.on('content2html', () => {
            expect(S.one('#mx_65').html()).to.equal('<p>1111</p>');
            done();
          });
        })

        it('vframe.postMessageTo', function(done) {
          this.timeout(10000);
          const vframe1 = Magix.Vframe.get('mx_64');
          const vframe2 = Magix.Vframe.get('mx_65');

          vframe2.on('content2postmessage', () => {
            expect(vframe1.receive).to.equal(1);
            done();
          });
        });

        it('View.prototype', () => {
          const view = win.addFrameData.vframe.view;

          expect(view.vom).to.be.deep.equal(Magix.Vframe); // 存在vom
          expect(view.location.get('row')).to.equal('4');
          expect(view.$('#J_app_main')).to.be.deep.equal(Magix.node('#J_app_main'));
          expect(view.parentView).to.be.ok;
          expect(view.notifyUpdate()).to.equal(view.$s);
          expect(view.wrapEvent).to.be.ok;
          expect(view.wrapMxEvent(1)).to.equal('1');

          view.manage('dialog', {id: 1});

          expect(view.$r.dialog).to.be.ok; // dialog被托管
          expect(view.getManaged('dialog')).to.be.deep.equal({id: 1}); // getManaged ok

          view.removeManaged('dialog');

          expect(view.$r.dialog).not.to.be.ok; // removeManaged ok
        });

        it('vframe.unmountView', () => {
          const vframe = win.addFrameData.vframe;
          const view = vframe.view;
          vframe.unmountView();

          expect(S.isObject(view.owner)).to.be.ok;
          expect(view.owner.id).not.to.be.ok;
        });

        it('vframe.defineProperties', () => {
          const Vframe = Magix.Vframe;

          Vframe.prototype.mountZoneVframes = 1
          Vframe.prototype.unmountZoneVframes = 1

          expect(Vframe.prototype.mountZoneVframes).not.equal(1); // mountZoneVframes方法不能被重写
          expect(Vframe.prototype.unmountZoneVframes).not.equal(1); // unmountZoneVframes方法不能被重写
        });
      }

      if (isMagix3) {
        it('Vframe constructor, all, get and prototype', () => {
          const $ = S.all;
          const Vframe = Magix.Vframe;
          let addVf;
          const onAdd = data => {
            addVf = data.vframe;
          };

          $('body').append('<div id="vframe-container"></div>');

          Vframe.on('add', onAdd);

          const vf = new Vframe('vframe-container', 'pId');

          expect(Vframe.all()['vframe-container']).to.equal(vf);
          expect(Vframe.get('vframe-container')).to.equal(vf);
          expect(addVf).to.equal(vf);
          expect(document.getElementById('vframe-container').vframe).to.equal(vf);
          expect(vf.id).to.equal('vframe-container');
          expect(vf.pId).to.equal('pId');
          expect(vf.mountView).to.be.a('function');
          expect(vf.unmountView).to.be.a('function');
          expect(vf.mountVframe).to.be.a('function');
          expect(vf.mountZone).to.be.a('function');
          expect(vf.unmountVframe).to.be.a('function');
          expect(vf.unmountZone).to.be.a('function');
          expect(vf.parent).to.be.a('function');
          expect(vf.children).to.be.a('function');
          expect(vf.invoke).to.be.a('function');

          Vframe.off('add', onAdd);
        });

        it('mountView', () => {
          const Vframe = Magix.Vframe;
          const vf = Vframe.get('vframe-container');
          const priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
          const priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
          let hasUnMountView = false;
          let hasTransQuery = false;
          let hasGRequire = false;
          let hasInvoke$b = false;
          let hasInvokeViewInit = false;
          let hasEndUpdate = false;
          let hasView_Prepare = false;
          let hasView_DelegateEvents = false;
          let initParams = { a: '1', b: '2' };
          let mockViewInstance = {};

          // mock 要mount的View
          const MockView = function (id, me, params, node, ctors) {
            expect(id).to.equal(vf.id);
            expect(me).to.equal(vf);
            expect(node).to.equal(document.getElementById(vf.id));
            expect(params).to.deep.equal({ a: '1', b: '2', c: '1' });
            expect(ctors).to.equal('ctors');

            mockViewInstance = {
              init(extra, config) {
                expect(extra).to.deep.equal({ a: '1', b: '2', c: '1' });
                expect(config).to.deep.equal({
                  node: document.getElementById(vf.id),
                  deep: true
              });
                hasInvokeViewInit = true;
              },
              endUpdate() {
                hasEndUpdate = true;
              },
              '$b' () {
                hasInvoke$b = true;
              }
            }

            return mockViewInstance;
          }

          //mock 方法
          let oriVframe_TranslateQuery = priFun['set-Vframe_TranslateQuery']((pId, viewPath, params) => {
            expect(viewPath).to.equal('app/view/content2?c=1');
            expect(pId).to.equal(vf.pId);
            expect(params).to.deep.equal({ c: '1' })
            hasTransQuery = true;
          });

          let oriView_Prepare = priFun['set-View_Prepare'](TView => {
            expect(TView).to.equal(MockView);
            hasView_Prepare = true;
            return 'ctors';
          });

          let oriG_Require = priFun['set-G_Require']((name, fn) => {
            expect(name).to.equal('app/view/content2');
            fn(MockView);
            hasGRequire = true;
          });

          let oriView_DelegateEvents = priFun['set-View_DelegateEvents'](view => {
            expect(view).to.equal(mockViewInstance);
            hasView_DelegateEvents = true;
          });

          let oriUnmountView = vf.unmountView;

          vf.unmountView = () => {
            hasUnMountView = true;
          }

          vf.mountView('app/view/content2?c=1', initParams);

          expect(hasTransQuery).to.be.ok;
          expect(hasUnMountView).to.be.ok;
          expect(hasInvokeViewInit).to.be.ok;
          expect(hasInvoke$b).to.be.ok;
          expect(hasView_Prepare).to.be.ok;
          expect(hasGRequire).to.be.ok;
          expect(hasEndUpdate).to.be.ok;
          expect(hasView_DelegateEvents).to.be.ok;
          expect(vf['$v']).to.equal(mockViewInstance);
          expect(vf['$h']).to.equal(0);
          expect(vf['$a']).to.equal(priVar['get-Dispatcher_UpdateTag']());

          // mock 方法还原
          priFun['set-Vframe_TranslateQuery'](oriVframe_TranslateQuery);
          priFun['set-View_Prepare'](oriView_Prepare);
          priFun['set-G_Require'](oriG_Require);
          priFun['set-View_DelegateEvents'](oriView_DelegateEvents);
          vf.unmountView = oriUnmountView;
        });
      }
    });
  }
  Test.Vframe = Vframe;
})(window, window.KISSY, window.Test || (window.Test = {}), '');