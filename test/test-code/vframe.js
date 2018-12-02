/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function (win, S, Test, EMPTY) {
  let $;
  const expect = chai.expect;
  let priFun;
  let priVar;
  let TestView1;
  let TestView2

  function Vframe() {
    describe('Vframe', () => {
      before(done => {
        KISSY.use('app/view/content1, app/view/content2', (S, DView1, DView2) => {
          TestView1 = DView1;
          TestView2 = DView2;
          $ = S.all;
          priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
          priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
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

          $('body').append('<div id="vframe-container">vframe content</div>');

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
          expect(vf['$c']).to.deep.equal({}); 
          expect(vf['$cc']).to.equal(0); 
          expect(vf['$rc']).to.equal(0);
          expect(vf['$g']).to.equal(1); 
          expect(vf['$e']).to.deep.equal({});
          expect(vf['$f']).to.deep.equal([]);

          Vframe.off('add', onAdd);
        });

        it('mountView unmountView invoke', () => {
          const Vframe = Magix.Vframe;
          const vf = Vframe.get('vframe-container');
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
          let hasFireDestroy = false;

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
              '$a': 1,
              '$b' () {
                hasInvoke$b = true;
              },
              testInvoke(str) {
                return 'input is ' + str;
              },
              fire(name, a, b, c) {
                expect(name).to.equal('destroy');
                expect(a).to.equal(0);
                expect(b).to.equal(1);
                expect(c).to.equal(1);
                hasFireDestroy = true;
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

          expect(vf['$i']).to.equal('vframe content');
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

          mockViewInstance.$e = true;

          expect(vf.invoke('testInvoke', 'hello')).to.equal('input is hello');

          // mock 方法还原
          priFun['set-Vframe_TranslateQuery'](oriVframe_TranslateQuery);
          priFun['set-View_Prepare'](oriView_Prepare);
          priFun['set-G_Require'](oriG_Require);
          priFun['set-View_DelegateEvents'](oriView_DelegateEvents);
          vf.unmountView = oriUnmountView;

          // 测试unmountView
          let hasUnMountZone = false;
          let hasVframe_NotifyAlter = false;
          let hasView_DestroyAllResources = false;
          let hasView_UnDelegateEvents = false;
          const oriUnmountZone = vf.unmountZone;
          const G_SPLITER = priVar['get-G_SPLITER']();
          const invokeObj = {
            n: 'testInvoke',
            a: 'abc',
            k: G_SPLITER + 'testInvoke'
          };
          let ori$g = vf['$g'];

          let oriVframe_NotifyAlter = priFun['set-Vframe_NotifyAlter']((a, b) => {
            expect(a).to.equal(vf);
            expect(b).to.deep.equal({ id: vf.id });
            hasUnMountZone = true;
          });

          vf.unmountZone = (a, b) => {
            expect(a).to.equal(0);
            expect(b).to.equal(1);
            hasVframe_NotifyAlter = true;
          }

          let oriView_DestroyAllResources = priFun['set-View_DestroyAllResources']((a, b) => {
            expect(a).to.equal(mockViewInstance);
            expect(b).to.equal(1);
            hasView_DestroyAllResources = true;
          });

          let oriUnView_DelegateEvents = priFun['set-View_DelegateEvents']((a, b) => {
            expect(a).to.equal(mockViewInstance);
            expect(b).to.equal(1);
            hasView_UnDelegateEvents = true;
          });

          vf['$h'] = 1 // 测试还原HTML的逻辑
          priVar['set-Vframe_GlobalAlter'](0);

          vf.unmountView();

          expect(vf['$f']).to.deep.equal([]);
          expect(vf['$b']).to.equal(1);
          expect(hasUnMountZone).to.be.ok;
          expect(hasVframe_NotifyAlter).to.be.ok;
          expect(vf['$v']).to.equal(0);
          expect(priVar['get-Body_RangeEvents'][vf.id]).not.to.be.ok;
          expect(priVar['get-Body_RangeVframes'][vf.id]).not.to.be.ok;
          expect(hasFireDestroy).to.be.ok;
          expect(hasView_DestroyAllResources).to.be.ok;
          expect(hasView_UnDelegateEvents).to.be.ok;
          expect(mockViewInstance.owner).to.equal(0);
          expect(mockViewInstance['$a']).to.equal(-1);
          expect(priVar['get-Vframe_GlobalAlter']()).to.equal(0);
          expect(vf['$g'] - ori$g).to.equal(1);
          expect(Magix.node(vf.id).innerHTML).to.equal(vf['$i']);
          expect(vf.invoke('testInvoke', 'abc')).not.to.be.ok;
          expect(vf['$f'][G_SPLITER + 'testInvoke']).to.deep.equal(invokeObj);
          expect(vf['$f'][0]).to.deep.equal(invokeObj);

          
          vf.invoke('testInvoke', 'abc');
          
          expect(vf['$f'][0].r).to.be.ok;
          expect(vf['$f'][1]).to.deep.equal(invokeObj);

          // mock方法还原
          vf.unmountZone = oriUnmountZone;
          priFun['set-Vframe_NotifyAlter'](oriVframe_NotifyAlter);
          priFun['set-View_DestroyAllResources'](oriView_DestroyAllResources);
          priFun['set-View_DelegateEvents'](oriUnView_DelegateEvents);
        });

        it('mountVframe unmountVframe', () => {
          // 测试mountVframe
          $('body').append('<div id="child-vframe-container">child vframe</div>');
          priVar['set-Vframe_Cache']([]);

          const vf = Magix.Vframe.get('vframe-container');
          const Vframe_Cache = priVar['get-Vframe_Cache']();
          const Vframe_Vframes = priVar['get-Vframe_Vframes']();
          const viewPath = 'mockViewPath';
          const viewInitParams = { a: 1, b: 2 };
          let hasCreateVframe = false;
          let hasVframe_NotifyAlter = false;
          let hasMountView = false;
          let hasUnMountView = false;
          let useCacheVf = false;
          let hasOffAlter = false;
          let hasOffCreated = false;
          
          const mockVfInstance = {
            '$cr': 'abc',
            off(name) {
              if (name === 'alter') {
                hasOffAlter = true;
              } else if (name === 'created') {
                hasOffCreated = true;
              }
            },
            mountView(path, params) {
              expect(path).to.equal(viewPath);
              expect(params).to.equal(params);
              hasMountView = true;
            },
            unmountView() {
              hasUnMountView = true;
            }
          }

          let oriVfame = priFun['set-Vframe'](function (id, pId) {
            if (useCacheVf) {
              expect(this).to.equal(mockVfInstance);
            }

            expect(id).to.equal('child-vframe-container');
            expect(pId).to.equal(vf.id);

            mockVfInstance.pId = pId;
            hasCreateVframe = true;
            Vframe_Vframes[id] = mockVfInstance;

            return mockVfInstance;
          });

          let oriVframe_NotifyAlter = priFun['set-Vframe_NotifyAlter']((a, b) => {
            expect(a).to.equal(vf);
            expect(b).to.deep.equal({ id: 'child-vframe-container' });
            hasVframe_NotifyAlter = true;
          });

          vf.mountVframe('child-vframe-container', viewPath, viewInitParams);

          expect(hasVframe_NotifyAlter).to.be.ok;
          expect(vf['$n']).to.equal(0);
          expect(vf['$cc']).to.equal(1);
          expect(vf['$c']['child-vframe-container']).to.equal('child-vframe-container');
          expect(hasCreateVframe).to.be.ok;
          expect(hasMountView).to.be.ok;

          // 测试unmountVframe
          let hasVframe_RemoveVframe = false;
          let hasVframe_NotifyCreated = false;

          let oriVframe_RemoveVframe = priFun['set-Vframe_RemoveVframe']((a, b) => {
            delete Vframe_Vframes['child-vframe-container'];
            expect(a).to.equal('child-vframe-container');
            expect(b).to.equal(mockVfInstance['$cr']);
            hasVframe_RemoveVframe = true;
          });

          let oriVframe_NotifyCreated = priFun['set-Vframe_NotifyCreated'](a => {
            expect(a).to.equal(vf);
            hasVframe_NotifyCreated = true;
          });

          vf.unmountVframe('child-vframe-container');

          expect(hasUnMountView).to.be.ok;
          expect(hasVframe_RemoveVframe).to.be.ok;
          expect(hasOffAlter).to.be.ok;
          expect(hasOffCreated).to.be.ok;
          expect(mockVfInstance.id).to.equal(0);
          expect(mockVfInstance.pId).to.equal(0);
          expect(mockVfInstance['$c']).to.equal(0);
          expect(mockVfInstance['$e']).to.equal(0);
          expect(mockVfInstance['$h']).to.equal(0);
          expect(Vframe_Cache[0]).to.equal(mockVfInstance);
          expect(vf['$c']['child-vframe-container']).not.to.be.ok;
          expect(vf['$n']).to.equal(0);
          expect(vf['$cc']).to.equal(0);
          expect(hasVframe_NotifyCreated).to.be.ok;

          //使用VframeCache mountVframe
          useCacheVf = true;
          vf.mountVframe('child-vframe-container', viewPath, viewInitParams);

          // 还原mock的方法
          priFun['set-Vframe_RemoveVframe'](oriVframe_RemoveVframe);
          priFun['set-Vframe_NotifyCreated'](oriVframe_NotifyCreated);
          priFun['set-Vframe_NotifyAlter'](oriVframe_NotifyAlter);
          priFun['set-Vframe'](oriVfame);
        });

        it('mountZone unmountZone', () => {
          $('body').append(
            `<div id="zone-to-mount">
              <div id='vf1' mx-view='abc1'></div>
              <div id='vf2' mx-view='abc2'></div>
              <div id='vf3' mx-view='abc3'></div>
             </div>`);

          const vf = Magix.Vframe.get('vframe-container');
          const mountMap = {};
          let hasVframe_NotifyCreated = false;

          let oriVframe_NotifyCreated = priFun['set-Vframe_NotifyCreated'](a => {
            expect(a).to.equal(vf);
            hasVframe_NotifyCreated = true;
          });

          let oriMountVframe = vf.mountVframe;

          vf.mountVframe = (id, path) => {
            vf['$c'][id] = id;
            mountMap[id] = path;
            expect(vf['$d']).to.equal(1);
          }

          $('#vf2')[0]['$b'] = 1;

          vf.mountZone('zone-to-mount');

          expect(mountMap.vf1).to.equal('abc1');
          expect(mountMap.vf2).not.to.be.ok;
          expect(mountMap.vf3).to.equal('abc3');
          expect(vf['$d']).to.equal(0);
          expect(hasVframe_NotifyCreated).to.be.ok;

          // 测试unmountZone
          hasVframe_NotifyCreated = false;

          let oriUnmountVframe =  vf.unmountVframe;
          let ummountMap = {};

          vf.unmountVframe = (a, b) => {
            ummountMap[a] = true;
            expect(b).to.equal(1);
          }

          vf.unmountZone('vf2', 1);

          expect(hasVframe_NotifyCreated).not.to.be.ok;
          expect(ummountMap.vf1).not.to.be.ok;
          expect(ummountMap.vf3).not.to.be.ok;

          vf.unmountZone('vf1');

          expect(hasVframe_NotifyCreated).to.be.ok;
          expect(ummountMap.vf1).not.to.be.ok;
          expect(ummountMap.vf3).not.to.be.ok;

          vf.unmountZone('zone-to-mount');

          expect(ummountMap.vf1).to.be.ok;
          expect(ummountMap.vf3).to.be.ok;

          ummountMap = {};

          vf.unmountZone();
          expect(ummountMap.vf1).to.be.ok;
          expect(ummountMap.vf3).to.be.ok;

          //方法还原
          priFun['set-Vframe_NotifyCreated'](oriVframe_NotifyCreated);
          vf.mountVframe = oriMountVframe;
          vf.unmountVframe = oriUnmountVframe;
        });

        it('parent children', () => {
          $('body').append(
            `<div id="child1"></div><div id="child2"></div>`);

          const vf = Magix.Vframe.get('vframe-container');

          vf['$c'] = {};

          const child1 = vf.mountVframe('child1', 'app/view/content1');
          
          vf.mountVframe('child2', 'app/view/content2');
          expect(child1.parent(1)).to.equal(vf);
          expect(vf.children().sort()).to.deep.equal(['child1', 'child2'].sort());
        });

        it('on fire off', () => {
          const Vframe = Magix.Vframe;
          const vf = Vframe.get('vframe-container');

          expect(Vframe.on).to.equal(Magix.Event.on);
          expect(Vframe.fire).to.equal(Magix.Event.fire);
          expect(Vframe.fire).to.equal(Magix.Event.fire);
          expect(vf.on).to.equal(Magix.Event.on);
          expect(vf.fire).to.equal(Magix.Event.fire);
          expect(vf.fire).to.equal(Magix.Event.fire);
        })
      }
    });
  }
  Test.Vframe = Vframe;
})(window, window.KISSY, window.Test || (window.Test = {}), '');