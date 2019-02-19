/**
 * Magix 内部私有方法测试用例
 */
(function (win, S, Test, EMPTY) {
  
  function Private() {
    describe('Private', () => {
      Private.util();
      Private.state();
      Private.router();
    });
  }

  Test.Private = Private;
})(window, window.KISSY, window.Test || (window.Test = {}), '');