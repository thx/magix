/**
 * Magix View相关方法测试用例
 */
(function (win, S, Test, EMPTY) {
  let $;
  const expect = chai.expect;
  let Updater;
  let priFun;
  let priVar;

  function UpdaterTest() {
    describe('Updater', () => {
      it('constructor', () => {
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
        Updater = priFun['get-Updater']();
        
        const G_SPLITER = priVar['get-G_SPLITER']();
        const updater = new Updater('viewId1');

        expect(updater['$b']).to.equal('viewId1');
        expect(updater['$c']).to.equal(1);
        expect(updater['$d']).to.deep.equal({ vId: 'viewId1' });
        expect(updater['$a']).to.deep.equal({ [G_SPLITER]: 1 });
        expect(updater['$e']).to.deep.equal([]);
        expect(updater['$k']).to.deep.equal({});
      });

      it('set, get, snapshot, altered', () => {
        const updater = new Updater('viewId2');
        const setObj = {};

        expect(updater.set({ a: 1, b: 2 })).to.equal(updater);
        expect(updater.get('a')).to.equal(1);
        expect(updater.get('b')).to.equal(2);
        expect(updater.altered()).not.to.be.ok;

        updater.set({ b: setObj });
        updater.snapshot();

        expect(updater.get('b')).to.equal(setObj);
        expect(updater['$f']).to.equal(JSON.stringify({
          vId: 'viewId2',
          a: 1, 
          b: setObj
        }));

        expect(updater.altered()).not.be.ok;

        updater.set({ c: 1 });

        expect(updater.altered()).to.be.ok;
      });
      
      it('digest', () => {
        const updater = new Updater('viewId1');
        const testData = {};
        const unChangeObj = {};
        let hasInvokeUpdater_Digest = false;
        let hasInvokeSet = false;

        updater.set = (data, unchanged) => {
          expect(data).to.equal(testData);
          expect(unchanged).to.equal(unChangeObj);
          hasInvokeSet = true;
          return updater;
        }

        const oriUpdater_Digest = priFun['set-Updater_Digest']((a, b) => {
          expect(a).to.equal(updater);
          expect(b).to.equal(updater['$e']);
          hasInvokeUpdater_Digest = true;
        });

        updater['$e'].i = 1;

        updater.digest(testData, unChangeObj);

        expect(hasInvokeSet).to.be.ok;
        expect(hasInvokeUpdater_Digest).not.to.be.ok;

        hasInvokeSet = false;
        delete updater['$e'].i;

        updater.digest(testData, unChangeObj);

        expect(hasInvokeSet).to.be.ok;
        expect(hasInvokeUpdater_Digest).to.be.ok;
        
        priFun['set-Updater_Digest'](oriUpdater_Digest);
      });

      it('translate', () => {
        const testData = {};
        const updater = new Updater('viewId1');
        let hasInvokeG_TranslateData = false;
        const oriG_TranslateData = priFun['set-G_TranslateData']((a, b) => {
          expect(a).to.equal(updater['$d']);
          expect(b).to.equal(testData);
          hasInvokeG_TranslateData = true;
        });

        updater.translate(testData);

        expect(hasInvokeG_TranslateData).to.be.ok;

        priFun['set-G_TranslateData'](oriG_TranslateData);
      });

      it('parse', () => {
        const updater = new Updater('viewId1');
        let hasInvokeG_ParseExpr = false;
        const oriG_ParseExpr = priFun['set-G_ParseExpr']((a, b) => {
          expect(a).to.equal('testString');
          expect(b).to.equal(updater['$a']);
          hasInvokeG_ParseExpr = true;
        });

        updater.parse('testString');

        expect(hasInvokeG_ParseExpr).to.be.ok;

        priFun['set-G_ParseExpr'](oriG_ParseExpr);
      });
    });
  }
  Test.Updater = UpdaterTest;
})(window, window.KISSY, window.Test || (window.Test = {}), '');