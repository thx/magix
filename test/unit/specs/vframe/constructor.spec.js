(function(win, S, Test) {
    const expect = chai.expect;
    let Vframe;

    function vframeCtorTest() {
        describe('Vframe constructor', () => {
            it('should set instance id and pid', () => {
               Vframe = Magix.Vframe;
                const vf = new Vframe('vframeId1', 'parentVframeId11');

                expect(vf.id).equal('vframeId1');
                expect(vf.pId).equal('parentVframeId11');
            })
        });
    }

    Test.push(vframeCtorTest);
})(window, window.KISSY, window.Test || (window.Test = []))