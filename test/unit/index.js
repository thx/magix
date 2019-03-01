(function(win, S, Test) {
    const $ = S.all;

    window.DEBUG = false;

    S.config({
      packages: [{
        name: 'app',
        base: '/test'
      }]
    });

    describe('Magix unit test', () => {
      before(done => {
        const rootNode = document.createElement('div');

        rootNode.id = 'J_app_main';
        document.body.append(rootNode);
        
        iniMagix().then(() => {
          done();
        });
      });

      Test.forEach(unit => {
          unit();
      });
    });
  })(window, window.KISSY, window.Test || (window.Test = []));