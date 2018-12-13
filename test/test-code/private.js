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
      it('G_GetAttribute', () => {
        priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
        priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];

        const G_GetAttribute = priFun['get-G_GetAttribute']();
        const node = Magix.node('J_app_main');

        expect(G_GetAttribute(node, 'id')).to.equal('J_app_main');
      })
    });
  }
  Test.Private = Private;
})(window, window.KISSY, window.Test || (window.Test = {}), '');