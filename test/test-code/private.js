/**
 * Magix 内部私有方法测试用例
 */
(function (win, S, Test, EMPTY) {
  let $;
  const expect = chai.expect;
  let priFun;
  let priVar;

  function Private() {
    describe('Private', () => {
      it('G_IsPrimitive', () => {
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];

        const G_IsPrimitive = priFun['get-G_IsPrimitive']();

        expect(G_IsPrimitive()).to.be.ok;
        expect(G_IsPrimitive(3)).to.be.ok;
        expect(G_IsPrimitive('234')).to.be.ok;
        expect(G_IsPrimitive(function(){})).to.be.ok;
        expect(G_IsPrimitive({ a: 1, b: 2 })).not.to.be.ok;
      });

      it('G_Set', () => {
        const G_Set = priFun['get-G_Set']();
        let oldData = {};
        let newData = { a: 230, b: 334 };
        let keys = {};
        let unChange = { c: 1 };
        let setObjA = {};
        let setObjB = {};

        // 初次设置
        expect(G_Set(newData, oldData, keys)).to.equal(1);
        expect(oldData).to.deep.equal({ a: 230, b: 334 });
        expect(keys).to.deep.equal({ a: 1, b: 1 });
        // 重置非对象数据
        expect(G_Set({ a: 3 }, oldData, keys)).to.equal(1);
        expect(oldData).to.deep.equal({ a: 3, b: 334 });
        // 重置非对象数据
        expect(G_Set({ a: 3 }, oldData, keys)).to.equal(0);
        // 重置为象数据
        expect(G_Set({ a: setObjA }, oldData, keys)).to.equal(1);
        expect(oldData).to.deep.equal({ a: setObjA, b: 334 });

        // 重置对象数据
        expect(G_Set({ a: setObjA }, oldData, keys)).to.equal(1);
        expect(oldData).to.deep.equal({ a: setObjA, b: 334 });
        // 重置为其它对象
        expect(G_Set({ a: setObjB }, oldData, keys)).to.equal(1);
        expect(oldData).to.deep.equal({ a: setObjB, b: 334 });
        // unchange 非对象类型
        expect(G_Set({ c: 1 }, oldData, keys, unChange)).to.equal(0);
        expect(keys).to.deep.equal({ a: 1, b: 1 });
        // unchange 对象类型
        expect(G_Set({ c: setObjA }, oldData, keys, unChange)).to.equal(0);
        expect(keys).to.deep.equal({ a: 1, b: 1 });

        expect(G_Set({ d: setObjA }, oldData, keys, unChange)).to.equal(1);
        expect(keys).to.deep.equal({ a: 1, b: 1, d: 1 });
      });

      it('G_GetAttribute', () => {
        const G_GetAttribute = priFun['get-G_GetAttribute']();
        const node = Magix.node('J_app_main');

        expect(G_GetAttribute(node, 'id')).to.equal('J_app_main');
      });

      it('G_TranslateData', () => {
        const G_TranslateData = priFun['get-G_TranslateData']();
        const G_SPLITER = priVar['get-G_SPLITER']();

        const data = {
          a: 1,
          b: 3,
          [ G_SPLITER + 'c' ]: 5,
          [ G_SPLITER + 'd' ]: { name: 3 }
        }

        expect(G_TranslateData(data, 'a')).to.equal('a');
        expect(G_TranslateData(data, G_SPLITER + 'c')).to.equal(5);
        expect(G_TranslateData(data, G_SPLITER + 'd')).to.deep.equal({ name: 3 });
        expect(G_TranslateData(data, {
          v1: 'a',
          v2: 'b',
          v3: 'f',
          v4: G_SPLITER + 'c',
          v5: {
            v6: 'd',
            v7: G_SPLITER + 'd'
          }
        })).to.deep.equal({
          v1: 'a',
          v2: 'b',
          v3: 'f',
          v4: 5,
          v5: {
            v6: 'd',
            v7: { name: 3 }
          }
        });
      });

      it('G_ParseExpr', () => {

      });
    });
  }
  Test.Private = Private;
})(window, window.KISSY, window.Test || (window.Test = {}), '');