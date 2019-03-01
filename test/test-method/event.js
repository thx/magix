/**
 * Magix.Event 相关测试用例
 */
(function(window, S, Test, EMPTY) {
  const expect = chai.expect;
  let Event;
  let priFun;
  let priVar;
  let G_SPLITER;

  Test.Event = () => {
    describe('Event', () => {
      it('on off', () => {
        Event = Magix.Event;
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
        G_SPLITER = priVar['get-G_SPLITER']();
        
        let testBindAnonymityFn = false;
        const fn = () => 'test fn';

        Event.on('testEvent', fn);
        Event.on('testEvent', () => {
          testBindAnonymityFn = true;
        });

        Event[G_SPLITER + 'testEvent'][1].f();

        expect(Event[G_SPLITER + 'testEvent'][0].f).to.equal(fn);
        expect(testBindAnonymityFn).to.be.ok;

        Event.off('testEvent', fn);

        expect(Event[G_SPLITER + 'testEvent'][0].f).not.to.be.ok;

        Event.off('testEvent');
        expect(Event[G_SPLITER + 'testEvent']).not.to.be.ok;
        expect(Event['ontestEvent']).not.to.be.ok;
      });

      it('fire', () => {
        let testArr = [];
        const fnToBeOff = data => { testArr.push(data + 2); };
        let onFnValue;

        Event.on('testEvent', data => { testArr.push(data + 1); });
        Event.on('testEvent', fnToBeOff);
        Event.on('testEvent', data => { testArr.push(data + 3); });
        Event.ontestEvent = data => { onFnValue = data; }; 

        Event.fire('testEvent', '0', false, false);

        expect(testArr).deep.equal([ '01', '02', '03' ]);
        expect(onFnValue).equal('0');

        Event.off('testEvent', fnToBeOff);
        testArr = [];

        Event.fire('testEvent', '0', false, true);

        expect(testArr).deep.equal([ '03', '01' ]);
        expect(Event[G_SPLITER + 'testEvent'].length).equal(2);

        Event.fire('testEvent', '0', true, true);
        
        expect(Event[G_SPLITER + 'testEvent']).not.to.be.ok;
      })

      it('un', done => {
        if (isMagix1 || isMagix3Shim) {
          expect(Event.un).to.be.a('function');
        } else {
          expect(Event.un).not.ok;
          expect(Event.off).to.be.a('function');
        }

        done();
      });
    });
  }
})(window, window.KISSY, window.Test || (window.Test = {}), ''); 