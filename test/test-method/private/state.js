(function(win, S, Test, EMPTY) {
    const testFn = () => {
        const expect = chai.expect;
		let priFun;
		let priVar;

        it('State_IsObserveChanged', () => {
            priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
            priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
            
            const State_IsObserveChanged = priFun['get-State_IsObserveChanged']();
            const viewObj = {};
    
            expect(State_IsObserveChanged(viewObj, { a: 1, b: 1, c: 1, d: 1 })).not.to.be.ok;
    
            viewObj['$os'] = [ 'obKey1', 'obKey2', 'obKey3', 'obKey4' ];
    
            expect(State_IsObserveChanged(viewObj, { a: 1, b: 1, c: 1, d: 1 })).not.to.be.ok;
            expect(State_IsObserveChanged(viewObj, { a: 1, obKey3: 1, c: 1, d: 1 })).to.be.ok;
        });

        it('SetupKeysRef', () => {
            const SetupKeysRef = priFun['get-SetupKeysRef']();
            const State_AppDataKeyRef = priVar['get-State_AppDataKeyRef']();
    
            SetupKeysRef('testKey1,testKey2,testKey3');
    
            expect(State_AppDataKeyRef['testKey1']).to.equal(1);
            expect(State_AppDataKeyRef['testKey2']).to.equal(1);
            expect(State_AppDataKeyRef['testKey3']).to.equal(1);
    
            SetupKeysRef('testKey1,testKey3');
    
            expect(State_AppDataKeyRef['testKey1']).to.equal(2);
            expect(State_AppDataKeyRef['testKey2']).to.equal(1);
            expect(State_AppDataKeyRef['testKey3']).to.equal(2);
        });

        it('TeardownKeysRef', () => {
            const TeardownKeysRef = priFun['get-TeardownKeysRef']();
            const State_AppDataKeyRef = priVar['get-State_AppDataKeyRef']();
            const State_AppData = priVar['get-State_AppData']();
    
            TeardownKeysRef([
              'testKey1',
              'testKey2',
              'testKey3'
            ]);
    
            expect(State_AppDataKeyRef['testKey1']).to.equal(1);
            expect(State_AppDataKeyRef['testKey2']).not.to.be.ok;
            expect(State_AppDataKeyRef['testKey3']).to.equal(1);
            expect(State_AppData['testKey2']).not.to.be.ok;
    
            TeardownKeysRef([
              'testKey1',
              'testKey2',
              'testKey3'
            ]);
    
            expect(State_AppDataKeyRef['testKey1']).not.to.be.ok;
            expect(State_AppDataKeyRef['testKey3']).not.to.be.ok;
          });
    };

    Test.Private.state = testFn;
})(window, window.KISSY, window.Test || (window.Test = {}), '');