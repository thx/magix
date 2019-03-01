/**
 * Magix Bag相关方法测试用例
 */
(function (win, S, Test, EMPTY) {
    let $;
    const expect = chai.expect;
    let Bag;
    let priFun;
    let priVar;
  
    function BagTest() {
      describe('Bag', () => {
        it('constructor', () => {
          priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
          priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];
          Bag = priFun['get-Bag']();

          const G_COUNTER = priVar['get-G_COUNTER']();
  
          const bag = new Bag();
          
          expect(bag.id).to.equal('b' + G_COUNTER);
          expect(bag.$).to.deep.equal({});
        });

        it('get', () => {
            const bag = new Bag();

            bag.$ = {
                a: {
                    b: {
                        c: {
                            d: [ 1, 2, 3 ]
                        }
                    }
                }
            };

            // 无dValue，path正确
            expect(bag.get([ 'a', 'b' ])).to.deep.equal({
                c: {
                    d: [ 1, 2, 3 ]
                }
            });
            
            expect(bag.get('a.b.c.d')).to.deep.equal( [ 1, 2, 3 ]);
            // 无dValue，path错误
            expect(bag.get([ 'a', 'b', 'c', 'd', 'e' ])).not.to.be.ok;
            expect(bag.get('a.b.c.d.e.f')).not.to.be.ok;
            // 有dValue，type 相等
            expect(bag.get([ 'a', 'b' ]), { f: 1 }).to.deep.equal({
                c: {
                    d: [ 1, 2, 3 ]
                }
            });
            expect(bag.get('a.b.c.d', [ 2 ])).to.deep.equal([ 1, 2, 3 ]);

            // 有dValue，path正确 type 不等
            expect(bag.get([ 'a', 'b' ], 'default result')).to.equal('default result');
            expect(bag.get('a.b.c', [ 256 ])).to.deep.equal([ 256 ]);

            // 有dValue，path错误
            expect(bag.get([ 'a', 'b', 'c', 'd', 'e' ], { h: 1 })).to.deep.equal({ h: 1 });
            expect(bag.get('a.b.c.d.e.f', 23432)).to.equal(23432);
        });

        it('set', () => {
            let hasInvokeG_Assign = false;
            const bag = new Bag();
            let result;

            const oriG_Assign = priFun['set-G_Assign']((a, b) => {
                expect(a).to.equal(bag.$);
                expect(b).to.deep.equal(result);
                hasInvokeG_Assign = true;
            });

            // key 不为 obj
            result = { abc: { a: 1, z: 3 } };

            bag.set('abc', { a: 1, z: 3 });

            expect(hasInvokeG_Assign).to.be.ok;

            // key 为 obj
            hasInvokeG_Assign = false;
            result = { def: { g: 1, i: 3 } };

            bag.set({ def: { g: 1, i: 3 } });

            expect(hasInvokeG_Assign).to.be.ok;

            priFun['set-G_Assign'](oriG_Assign);
        })
      });
    }
    Test.Bag = BagTest;
  })(window, window.KISSY, window.Test || (window.Test = {}), '');