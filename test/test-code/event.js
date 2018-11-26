/**
 * @description https://lark.alipay.com/jintai.yzq/subway/magix1to3
 */
(function(window, S, Test, EMPTY) {
  const expect = chai.expect;
  let Event;

  Test.Event = () => {
    describe('Event', () => {
      it('event.un', done => {
        Event = Magix.Event;

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