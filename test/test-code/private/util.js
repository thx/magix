(function (win, S, Test, EMPTY) {
    const testFn = () => {
        const expect = chai.expect;
		let priFun;
		let priVar;

        it('G_IsPrimitive', () => {
            priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
            priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];

            const G_IsPrimitive = priFun['get-G_IsPrimitive']();

            expect(G_IsPrimitive()).to.be.ok;
            expect(G_IsPrimitive(3)).to.be.ok;
            expect(G_IsPrimitive('234')).to.be.ok;
            expect(G_IsPrimitive(function () {})).to.be.ok;
            expect(G_IsPrimitive({
                a: 1,
                b: 2
            })).not.to.be.ok;
        });

        it('G_Set', () => {
            const G_Set = priFun['get-G_Set']();
            let oldData = {};
            let newData = {
                a: 230,
                b: 334
            };
            let keys = {};
            let unChange = {
                c: 1
            };
            let setObjA = {};
            let setObjB = {};

            // 初次设置
            expect(G_Set(newData, oldData, keys)).to.equal(1);
            expect(oldData).to.deep.equal({
                a: 230,
                b: 334
            });
            expect(keys).to.deep.equal({
                a: 1,
                b: 1
            });
            // 重置非对象数据
            expect(G_Set({
                a: 3
            }, oldData, keys)).to.equal(1);
            expect(oldData).to.deep.equal({
                a: 3,
                b: 334
            });
            // 重置非对象数据
            expect(G_Set({
                a: 3
            }, oldData, keys)).to.equal(0);
            // 重置为象数据
            expect(G_Set({
                a: setObjA
            }, oldData, keys)).to.equal(1);
            expect(oldData).to.deep.equal({
                a: setObjA,
                b: 334
            });

            // 重置对象数据
            expect(G_Set({
                a: setObjA
            }, oldData, keys)).to.equal(1);
            expect(oldData).to.deep.equal({
                a: setObjA,
                b: 334
            });
            // 重置为其它对象
            expect(G_Set({
                a: setObjB
            }, oldData, keys)).to.equal(1);
            expect(oldData).to.deep.equal({
                a: setObjB,
                b: 334
            });
            // unchange 非对象类型
            expect(G_Set({
                c: 1
            }, oldData, keys, unChange)).to.equal(0);
            expect(keys).to.deep.equal({
                a: 1,
                b: 1
            });
            // unchange 对象类型
            expect(G_Set({
                c: setObjA
            }, oldData, keys, unChange)).to.equal(0);
            expect(keys).to.deep.equal({
                a: 1,
                b: 1
            });

            expect(G_Set({
                d: setObjA
            }, oldData, keys, unChange)).to.equal(1);
            expect(keys).to.deep.equal({
                a: 1,
                b: 1,
                d: 1
            });
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
                [G_SPLITER + 'c']: 5,
                [G_SPLITER + 'd']: {
                    name: 3
                }
            }

            expect(G_TranslateData(data, 'a')).to.equal('a');
            expect(G_TranslateData(data, G_SPLITER + 'c')).to.equal(5);
            expect(G_TranslateData(data, G_SPLITER + 'd')).to.deep.equal({
                name: 3
            });
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
                    v7: {
                        name: 3
                    }
                }
            });
        });

        it('Magix_CacheSort', () => {
            const Magix_CacheSort = priFun['get-Magix_CacheSort']();

            const ori = [{
                    f: 1,
                    t: 53
                },
                {
                    f: 23,
                    t: 3
                },
                {
                    f: 43,
                    t: 2
                },
                {
                    f: 3,
                    t: 5
                },
                {
                    f: 4,
                    t: 7
                },
                {
                    f: 5,
                    t: 8
                },
                {
                    f: 19,
                    t: 38
                },
                {
                    f: 153,
                    t: 2
                },
                {
                    f: 4,
                    t: 6
                },
            ];
            const target = [{
                    f: 153,
                    t: 2
                },
                {
                    f: 43,
                    t: 2
                },
                {
                    f: 23,
                    t: 3
                },
                {
                    f: 19,
                    t: 38
                },
                {
                    f: 5,
                    t: 8
                },
                {
                    f: 4,
                    t: 7
                },
                {
                    f: 4,
                    t: 6
                },
                {
                    f: 3,
                    t: 5
                },
                {
                    f: 1,
                    t: 53
                }
            ];

            expect(ori.sort(Magix_CacheSort)).to.deep.equal(target);
        });

        it('G_DOMGlobalProcessor', () => {
            const G_DOMGlobalProcessor = priFun['get-G_DOMGlobalProcessor']();

            const context = {
                e: {},
                f: {},
                v: {}
            };
            const argObj = {};
            let hasInvokeG_ToTry = false;

            const oriG_ToTry = priFun['set-G_ToTry']((a, b, c) => {
                expect(a).to.equal(context.f);
                expect(b).to.equal(argObj);
                expect(c).to.equal(context.v);
                expect(argObj.eventTarget).to.equal(context.e);

                hasInvokeG_ToTry = true;
            });

            G_DOMGlobalProcessor.call(context, argObj);

            expect(hasInvokeG_ToTry).to.be.ok;

            priFun['set-G_ToTry'](oriG_ToTry);
        });

        it('G_DOMEventLibBind', () => {
            const G_DOMEventLibBind = priFun['get-G_DOMEventLibBind']();
            const oriSE = priVar['get-SE']();
            const nodeArg = {};
            const typeArg = {};
            const cbArg = () => {};
            let scopeArg = true;
            let invokeMethod;

            function valideArg(a, b, c, d) {
                expect(a).to.equal(nodeArg);
                expect(b).to.equal(typeArg);
                expect(c).to.equal(cbArg);
                expect(d).to.equal(scopeArg);
            }

            priVar['set-SE']({
                delegate(a, b, c, d) {
                    valideArg(a, b, c, d);
                    invokeMethod = 'delegate';
                },
                undelegate(a, b, c, d) {
                    valideArg(a, b, c, d);
                    invokeMethod = 'undelegate';
                },
                detach(a, b, c, d) {
                    valideArg(a, b, c, d);
                    invokeMethod = 'detach';
                },
                on(a, b, c, d) {
                    valideArg(a, b, c, d);
                    invokeMethod = 'on';
                }
            });

            // scope = true, remove = false;
            G_DOMEventLibBind(nodeArg, typeArg, cbArg, false, scopeArg);

            expect(invokeMethod).to.equal('delegate');

            // scope = true, remove = true;
            G_DOMEventLibBind(nodeArg, typeArg, cbArg, true, scopeArg);

            expect(invokeMethod).to.equal('undelegate');

            // scope = false, remove = false;
            scopeArg = false;

            G_DOMEventLibBind(nodeArg, typeArg, cbArg, false, scopeArg);

            expect(invokeMethod).to.equal('on');

            // scope = false, remove = true;
            G_DOMEventLibBind(nodeArg, typeArg, cbArg, true, scopeArg);

            expect(invokeMethod).to.equal('detach');

            priVar['set-SE'](oriSE);
        });

        it('Magix_ParamsFn', () => {
            const Magix_ParamsFn = priFun['get-Magix_ParamsFn']();
            const Magix_ParamsObjectTemp = priVar['get-Magix_ParamsObjectTemp']();

            Magix_ParamsFn(true, 'paramName', 'http%3A%2F%2Fwww.a.com%2Fa%2Fb.html%3Fa%3Db%23!%2Fhome%3Fe%3D%E6%8E%A8%E5%B9%BF%E8%AE%A1%E5%88%92');

            expect(Magix_ParamsObjectTemp['paramName']).to.equal('http://www.a.com/a/b.html?a=b#!/home?e=推广计划');
        });

        it('G_ParseExpr', () => {
            const G_SPLITER = priVar['get-G_SPLITER']();
            const dataArg = {};
            const expr = '{"' + G_SPLITER + 'name": "zero", id: 2342}';
            let resultObj;

            const G_ParseExpr = priFun['get-G_ParseExpr']();
            const oriG_TranslateData = priFun['set-G_TranslateData']((a, b) => {
                expect(a).to.equal(dataArg);
                expect(b).to.deep.equal({
                    [G_SPLITER + 'name']: 'zero',
                    id: 2342
                });

                resultObj = b;
            });

            expect(G_ParseExpr('{ text: "abc", value: "def"}', dataArg)).to.deep.equal({
                text: 'abc',
                value: 'def'
            });

            expect(resultObj).not.to.be.ok;

            expect(G_ParseExpr(expr, dataArg)).to.equal(resultObj);

            priFun['set-G_TranslateData'](oriG_TranslateData);
        });

        it('GetParam', () => {
            const GetParam = priFun['get-GetParam']();
            const G_PARAMS = priVar['get-G_PARAMS']();
            const testObj = {
              [ G_PARAMS ]: {
                a1: 'value of a',
                b2: 'value of b',
                c3: 'value of c'
              }
            }
    
            expect(GetParam.call(testObj, 'a1', 'default value')).to.equal('value of a');
            expect(GetParam.call(testObj, 'a3', 'default value')).to.equal('default value');
            expect(GetParam.call(testObj, 'c1')).to.equal('');
        });
    };

    Test.Private.util = testFn;
})(window, window.KISSY, window.Test || (window.Test = {}), '');