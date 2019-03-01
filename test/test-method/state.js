/**
 * Magix View相关方法测试用例
 */
(function (win, S, Test, EMPTY) {
  let $;
  const expect = chai.expect;
  let State;
  let priFun;
  let priVar;

  function StateTest() {
    describe('State', () => {
      it('on, fire, off', () => {
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
        State = Magix.State;

        expect(State.on).to.equal(Magix.Event.on);
        expect(State.fire).to.equal(Magix.Event.fire);
        expect(State.off).to.equal(Magix.Event.off);
      });

      it('get', () => {
        const State_AppData = priVar['get-State_AppData']();
        const testValue2 = { a: 1 };
        
        State_AppData.testValue1 = 'adfsf';
        State_AppData.testValue2 = testValue2;

        expect(State.get('testValue1')).to.equal('adfsf');
        expect(State.get('testValue2')).to.equal(testValue2);

        const result = State.get();

        expect(result.testValue1).to.equal('adfsf');
        expect(result.testValue2).to.equal(testValue2);
      });

      it('set', () => {
        const testData = {};
        const State_AppData = priVar['get-State_AppData']();
        const State_ChangedKeys = priVar['get-State_ChangedKeys']();
        const oriState_DataIsChanged = priVar['get-State_DataIsChanged']();
        const unChangeObj = {};

        const oriG_Set = priFun['set-G_Set']((a, b, c, d) => {
          expect(a).to.equal(testData);
          expect(b).to.equal(State_AppData);
          expect(c).to.equal(State_ChangedKeys);
          expect(d).to.equal(unChangeObj);

          return 'has invoke G_set';
        });

        expect(State.set(testData, unChangeObj)).to.equal(State);
        expect(priVar['get-State_DataIsChanged']()).to.equal('has invoke G_set');

        priVar['set-State_DataIsChanged'](oriState_DataIsChanged);
        priFun['set-G_Set'](oriG_Set);
      });

      it('digest', () => {
        let unChangeObj;
        const setData = {};
        const G_CHANGED = priVar['get-G_CHANGED']();
        const State_ChangedKeys = priVar['get-State_ChangedKeys']();
        const oriSet = State.set;
        const oriFire = State.fire;
        let hasInvokeSet = false;
        let hasInvokeFire = false;

        State.set = (a, b) => {
          expect(a).to.equal(setData);
          expect(b).to.equal(unChangeObj);
          hasInvokeSet = true;
        }
        
        State.fire = (a, b) => {
          expect(a).to.equal(G_CHANGED);
          expect(b).to.deep.equal({
            keys: priVar['get-State_ChangedKeys']()
          });

          hasInvokeFire = true;
        }

        State_ChangedKeys.testKey = 1;
        priVar['set-State_DataIsChanged'](0);

        State.digest();

        expect(hasInvokeSet).not.to.be.ok;
        expect(hasInvokeFire).not.to.be.ok;
        expect(State_ChangedKeys.testKey).to.equal(1);

        unChangeObj = {};

        State.digest(setData, unChangeObj);

        expect(hasInvokeSet).to.be.ok;

        priVar['set-State_DataIsChanged'](1);
        hasInvokeSet = false;

        State.digest(setData, unChangeObj);

        expect(hasInvokeSet).to.be.ok;
        expect(hasInvokeFire).to.be.ok;
        expect(priVar['get-State_ChangedKeys']()).to.deep.equal({});
        expect(priVar['get-State_DataIsChanged']()).to.equal(0);

        State.set = oriSet;
        State.fire = oriFire;
      });

      it('clean', () => {
        let keys = {};
        let hasInvokeSetupKeysRef = false;
        let hasInvokeTeardownKeysRef = false;
        let hasInvokeOn = false;
        const invokeObj = {
          on(key, fn) {
            expect(key).to.equal('destroy');
            expect(fn()).to.equal('TeardownKeysRef Result');
            expect(hasInvokeTeardownKeysRef).to.be.ok;

            hasInvokeOn = true;
          }
        }

        const oriSetupKeysRef = priFun['set-SetupKeysRef'](a => {
          expect(a).to.equal(keys);
          hasInvokeSetupKeysRef = true;
          return { a: 1 };
        });

        const oriTeardownKeysRef = priFun['set-TeardownKeysRef'](a => {
          expect(a).to.deep.equal({ a: 1 });
          hasInvokeTeardownKeysRef = true;

          return 'TeardownKeysRef Result';
        });

        const result = State.clean(keys);
        const ctor = result.ctor;

        expect(result).to.be.a('object');
        expect(ctor).to.be.a('function');

        ctor.call(invokeObj);

        expect(hasInvokeSetupKeysRef).to.be.ok;
        expect(hasInvokeOn).to.be.ok;

        priFun['set-SetupKeysRef'](oriSetupKeysRef);
        priFun['set-TeardownKeysRef'](oriTeardownKeysRef);
      })
    });
  }
  Test.State = StateTest;
})(window, window.KISSY, window.Test || (window.Test = {}), '');