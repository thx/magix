/**
 * Magix View相关方法测试用例
 */
(function (win, S, Test, EMPTY) {
  const expect = chai.expect;
  let View;
  let priFun;
  let priVar;

  function ViewTest() {
    describe('View', () => {
      before(done => {
        KISSY.use('app/view/content1', (S, DView) => {
          TestView = DView;
          View = Magix.View;
          $ = S.all;
          priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
          priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
          done();
        });
      });

      it('constructor, init, render, on, fire, off', () => {
        const mockUpdater = {};
        let oriUpdater = priFun['set-Updater'](function(id) {
          mockUpdater.id = id;

          return mockUpdater;
        });
        const viewOwner = { id: 1 };
        const oriCtor = View._;
        let ctorParam = {};
        let hasInvokeCtor = false;

        View._ = [ (a, b) => {
          ctorParam.a = a;
          ctorParam.b = b;
          hasInvokeCtor = true;
        } ]

        let instance = new View('id1', viewOwner, { a: 1, b: 2 }, document.body);

        expect(instance.owner).to.equal(viewOwner);
        expect(instance.id).to.equal('id1');
        expect(typeof instance.init).to.equal('function');
        expect(typeof instance.render).to.equal('function');
        expect(instance['$l']).to.deep.equal({ k: [] });
        expect(instance['$r']).to.deep.equal({});
        expect(instance['$a']).to.equal(1);
        expect(instance.updater).to.equal(mockUpdater);
        expect(instance['$d']).to.equal(mockUpdater);
        expect(instance.on).to.equal(Magix.Event.on);
        expect(instance.fire).to.equal(Magix.Event.fire);
        expect(instance.fire).to.equal(Magix.Event.fire);
        expect(hasInvokeCtor).to.be.ok;
        expect(ctorParam.a).to.deep.equal({ a: 1, b: 2 });
        expect(ctorParam.b).to.deep.equal({
          node: document.body,
          deep: true
        });

        // 方法还原
        View._ = oriCtor;
        priFun['set-Updater'](oriUpdater);
      });

      it('merge', () => {
        const mergeObj = {
          ctor() {
            this.$attr = 'test';
          },
          test() {
              alert(this.$attr);
          }
        };

        let hasInvokeOriView_MergeMixins = false;

        const oriView_MergeMixins = priFun['set-View_MergeMixins']((args, view_proto, ctors) => {
          expect(args[0]).to.deep.equal(mergeObj);
          expect(view_proto).to.equal(View.prototype);
          expect(ctors).to.equal(View._);
          hasInvokeOriView_MergeMixins = true;
        });

        View.merge(mergeObj);
        expect(hasInvokeOriView_MergeMixins).to.be.ok;

        // 方法还原
        priFun['set-View_MergeMixins'](oriView_MergeMixins);
      });

      it('extend', () => {
        const oriG_Extend = priVar['get-G_Extend']();
        const extendOwner = {};
        const extendResult = {};
        const newViewInstance = {};
        let hasCallOViewCtor = false;
        let hasInvokeExtendCtor = false;

        const mixinCtors = [
          (a, b) => {
            expect(a).to.deep.equal({ a: 1, b: 2 });
            expect(b).to.deep.equal({ node: document.body, deep: true });
            expect(this).to.equal(newViewInstance);
          }
        ];

        const extendProtoParam = {
          ctor(a, b) {
            expect(a).to.deep.equal({ a: 1, b: 2 });
            expect(b).to.deep.equal({ node: document.body, deep: true });
            expect(this).to.equal(newViewInstance);
            hasInvokeExtendCtor = true;
          }
        };

        const MockView = function (nodeId, ownerVf, initParams, node, ctors) {
          expect(this).to.equal(newViewInstance);
          expect(nodeId).to.equal('newView');
          expect(ownerVf).to.equal(extendOwner);
          expect(initParams).to.deep.equal({ a: 1, b: 2 });
          expect(node).to.equal(document.body);
          expect(ctors).to.equal(mixinCtors);
          hasCallOViewCtor = true;
        };

        MockView.extend = View.extend;

        const extendStaticParam = { a1(){}, b1(){} };

        /**
         * mock G_Extend, 并在其中校验NView相关逻辑
         */
        priVar['set-G_Extend']((NView, sub, props, statics) => {
          let hasInvokeNViewCtor = false;

          expect(NView.merge).to.equal(View.merge);
          expect(NView.expect).to.equal(View.expect);
          expect(sub).to.equal(MockView);
          expect(props).to.deep.equal(extendProtoParam);
          expect(statics).to.deep.equal(extendStaticParam);

          NView._ = [() => {
            hasInvokeNViewCtor = true;
          }]

          NView.bind(newViewInstance)('newView', extendOwner, { a: 1, b: 2 }, document.body, mixinCtors);

          expect(hasCallOViewCtor).to.be.ok;
          expect(hasInvokeNViewCtor).to.be.ok;
          expect(hasInvokeExtendCtor).to.be.ok;

          return extendResult;
        });

        expect(MockView.extend(extendProtoParam, extendStaticParam)).to.equal(extendResult);
        priVar['set-G_Extend'](oriG_Extend);
      });

      it('beginUpdate', () => {
        let hasUnmountZone = false;

        const viewOwner =  {
          id: 1,
          unmountZone(id, num) {
            expect(id).to.equal('id2');
            expect(num).to.equal(1);
            hasUnmountZone = true;
          }
        };

        let instance = new View('id1', viewOwner, { a: 1, b: 2 }, document.body);

        instance['$a'] = 0;
        instance['$e'] = 0;

        instance.beginUpdate('id2');

        expect(hasUnmountZone).not.to.be.ok;
        instance['$a'] = 1;

        instance.beginUpdate('id2');

        expect(hasUnmountZone).not.to.be.ok;
        instance['$e'] = 1;

        instance.beginUpdate('id2');

        expect(hasUnmountZone).to.be.ok;
      });

      it('endUpdate', () => {
        let hasWrapAsync = false;
        let hasVframe_RunInvokes = false;
        let hasTimeout = false
        const oriTimeout = priVar['get-Timeout']();
        let hasMountZone = false;
        let expectId;
        let expectInner;

        const oriVframe_RunInvokes = priFun['set-Vframe_RunInvokes'](o => {
          expect(o).to.equal(viewOwner);
          hasVframe_RunInvokes = true;
        });

        priVar['set-Timeout']((a, b) => {
          hasTimeout = true;
          expect(a).to.equal('hasWrapAsync');
          expect(b).to.equal(0);
        });

        const viewOwner = {
          id: 1,
          mountZone(id, inner) {
            expect(id).to.equal(expectId);
            expect(inner).to.equal(expectInner);
            hasMountZone = true;
          }
        };

        let instance = new View('id1', viewOwner, { a: 1, b: 2 }, document.body);

        instance.wrapAsync = fn => {
          hasWrapAsync = true;
          fn();
          expect(hasVframe_RunInvokes).to.be.ok;

          return 'hasWrapAsync';
        };

        instance['$a'] = 0;
        instance['$e'] = 0;
        instance.endUpdate('id2', 1);

        expect(hasMountZone).not.to.be.ok;
        expect(hasTimeout).not.to.be.ok;
        expect(hasWrapAsync).not.to.be.ok;
        expect(instance['$e']).to.equal(0);

        instance['$a'] = 1;
        expectId = 'id2';
        expectInner = 1;
        instance.endUpdate('id2', 1);

        expect(hasMountZone).to.be.ok;
        expect(instance['$e']).to.equal(0);

        hasMountZone = false;
        expectId = 'id1';
        expectInner = undefined;
        instance.endUpdate();

        expect(hasMountZone).to.be.ok;
        expect(hasTimeout).to.be.ok;
        expect(hasWrapAsync).to.be.ok;
        expect(instance['$e']).to.equal(1);

        hasMountZone = false;
        hasTimeout = false;
        hasWrapAsync = false;
        expectId = 'id2';
        instance.endUpdate('id2');

        expect(hasMountZone).to.be.ok;
        expect(hasTimeout).not.to.be.ok;
        expect(hasWrapAsync).not.to.be.ok;

        priVar['set-Timeout'](oriTimeout);
        priFun['set-Vframe_RunInvokes'](oriVframe_RunInvokes);
      });

      it('wrapAsync', () => {
        const viewOwner = { id: 1 };
        let instance = new View('id1', viewOwner, { a: 1, b: 2 }, document.body);
        let expectContext = {};
        let hasInvokeWrapFn = false;

        let testFn = instance.wrapAsync(function() {
          expect(this).to.equal(expectContext);
          hasInvokeWrapFn = true;
        }, expectContext);

        testFn();

        expect(hasInvokeWrapFn).to.be.ok;

        hasInvokeWrapFn = false;
        testFn = instance.wrapAsync(function() {
          expect(this).to.equal(instance);
          hasInvokeWrapFn = true;
        });

        testFn();

        expect(hasInvokeWrapFn).to.be.ok;

        hasInvokeWrapFn = false;
        instance['$a'] ++;

        testFn();

        expect(hasInvokeWrapFn).not.to.be.ok;
        instance['$a'] = 0;

        testFn();

        expect(hasInvokeWrapFn).not.to.be.ok;
      });

      it('observeLocation, observeState, capture, release', () => {
        const viewOwner = { id: 1 };
        const captureRes = { a: 1, b: 2 };
        let instance = new View('id1', viewOwner, { a: 1, b: 2 }, document.body);
        let hasInvokeView_DestroyResource = false;
        const oriView_DestroyResource = priFun['set-View_DestroyResource']((a, b, c, d) => {
          expect(a).to.equal(instance['$r']);
          expect(b).to.equal('test1');
          expect(c).to.equal(1);
          expect(d).to.equal(captureRes);
          hasInvokeView_DestroyResource = true;
        });

        instance.observeLocation('a,b,c', true);

        expect(instance['$l'].p).to.be.ok;
        expect(instance['$l'].k).to.deep.equal(['a', 'b', 'c']);

        instance.observeLocation('d,e,f', false);

        expect(instance['$l'].p).not.to.be.ok;
        expect(instance['$l'].k).to.deep.equal(['d', 'e', 'f']);

        instance.observeLocation({ params: 'g,h,i', path: true });

        expect(instance['$l'].p).to.be.ok;
        expect(instance['$l'].k).to.deep.equal(['g', 'h', 'i']);

        instance.observeLocation({ params: 'j,k,l' });

        expect(instance['$l'].p).not.to.be.ok;
        expect(instance['$l'].k).to.deep.equal(['j', 'k', 'l']);

        instance.observeState('a,b,c');
      
        expect(instance['$os']).to.deep.equal(['a', 'b', 'c']);

        instance.capture('test1', captureRes, true);

        expect(hasInvokeView_DestroyResource).to.be.ok;
        expect(instance['$r'].test1).to.deep.equal({
          e: captureRes,
          x: true
        });

        expect(instance.capture('test1')).to.equal(captureRes); 

        hasInvokeView_DestroyResource = false;

        priFun['set-View_DestroyResource']((a, b, c) => {
          expect(a).to.equal(instance['$r']);
          expect(b).to.equal('test2');
          expect(c).to.be.ok;
          hasInvokeView_DestroyResource = true;
        });

        instance.release('test2', true);

        expect(hasInvokeView_DestroyResource).to.be.ok;

        hasInvokeView_DestroyResource = false;

        priFun['set-View_DestroyResource']((a, b, c) => {
          expect(a).to.equal(instance['$r']);
          expect(b).to.equal('test3');
          expect(c).not.to.be.ok;
          hasInvokeView_DestroyResource = true;
        });

        instance.release('test3');

        expect(hasInvokeView_DestroyResource).to.be.ok;

        priFun['set-View_DestroyResource'](oriView_DestroyResource);
      });

      it('leaveTip', () => {
        const Router = Magix.Router;
        const onObj = {};
        const offObj = {};
        const viewOnObj = {};
        const oriRouterOn = Router.on;
        const oriRouterOff = Router.off;
        const instance = new View('id1', { id: 1 }, { a: 1, b: 2 }, document.body);
        const event = {
          prevent() {
            hasPrevent = true;
          },
          resolve() {
            hasResolve = true;
          },
          reject() {
            hasReject = true;
          }
        };
        let hasPrevent = false;
        let hasResolve = false;
        let hasReject = false;
        let hasInvokeLeaveConfirm = false;
        let hasInvokeFn = false;
        let changeListener;
        let unloadListener;
        
        
        Router.on = (key, value) => {
          onObj[key] = value;
        };

        Router.off = (key, value) => {
          offObj[key] = value;
        };

        instance.on = (key, value) => {
          viewOnObj[key] = value;
        };

        instance.leaveConfirm = (fn1, fn2, msg) => {
          let attr = 'b';

          fn1();

          if (event.type === 'pageunload') {
            attr = 'a';
          } 

          expect(changeListener[attr]).to.equal(0);
          expect(hasResolve).to.be.ok;

          changeListener[attr] = 1;

          fn2();
          
          expect(changeListener[attr]).to.equal(0);
          expect(hasReject).to.be.ok;
          expect(msg).to.equal('testLeaveTip');

          hasInvokeLeaveConfirm = true;
        }

        instance.leaveTip('testLeaveTip', () => {
          hasInvokeFn = true;
          return true;
        });

        changeListener = onObj.change;
        unloadListener = onObj.pageunload;

        expect(typeof changeListener).to.equal('function');
        expect(typeof unloadListener).to.equal('function');
        expect(viewOnObj.unload).to.equal(changeListener);

        viewOnObj.destroy();

        expect(offObj.change).to.equal(changeListener);
        expect(offObj.pageunload).to.equal(unloadListener);

        unloadListener(event);

        expect(hasInvokeFn).to.be.ok;
        expect(event.msg).to.equal('testLeaveTip');

        event.type = 'pageunload';

        changeListener(event);

        expect(hasPrevent).to.be.ok;
        expect(hasInvokeLeaveConfirm).to.be.ok;

        // leaveConfirm 测试事件互斥
        instance.leaveConfirm = () => {};

        changeListener(event);

        expect(changeListener.a).to.equal(1);

        event.type = 'change';
        hasReject = false;
        hasPrevent = false;

        changeListener(event);

        expect(hasReject).to.be.ok;
        expect(hasPrevent).to.be.ok;

        // 测试fn返回false
        instance.leaveTip('testLeaveTip', () => {
          return false;
        });

        changeListener = onObj.change;
        unloadListener = onObj.pageunload;
        hasPrevent = false;
        hasReject = false;
        hasResolve = false;
        hasInvokeLeaveConfirm = false;
        delete event.msg;
        
        unloadListener(event);

        expect(event.msg).not.equal('testLeaveTip');

        event.type = 'pageunload';

        changeListener(event);

        expect(hasPrevent).not.to.be.ok;
        expect(changeListener.a).not.to.be.ok;
        expect(hasInvokeLeaveConfirm).not.to.be.ok;

        event.type = 'change';

        changeListener(event);

        expect(hasPrevent).not.to.be.ok;
        expect(hasReject).not.to.be.ok;

        Router.on = oriRouterOn;
        Router.off = oriRouterOff;
      })
    });
  }
  Test.View = ViewTest;
})(window, window.KISSY, window.Test || (window.Test = {}), '');