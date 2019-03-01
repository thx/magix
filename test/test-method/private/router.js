(function (win, S, Test, EMPTY) {
	const testFn = () => {
		const expect = chai.expect;
		let priFun;
		let priVar;

		it('Router_UpdateHash', () => {
			priFun = Magix['$|_attrForTest_|$priFun$|_attrForTest_|$'];
			priVar = Magix['$|_attrForTest_|$priVar$|_attrForTest_|$'];

			const Router_UpdateHash = priFun['get-Router_UpdateHash']();
			const oriRouter_WinLoc = priVar['get-Router_WinLoc']();
			let hasInvokeReplace = false;
			let pathArg = '/campaign-list';

			const Router_WinLocForTest = {
				hash: '',
				replace(a) {
					expect(a).to.equal('#!' + pathArg);

					hasInvokeReplace = true;
				}
			};

			priVar['set-Router_WinLoc'](Router_WinLocForTest);

			// replace = false
			Router_UpdateHash(pathArg);

			expect(Router_WinLocForTest.hash).to.equal('#!' + pathArg);
			expect(hasInvokeReplace).not.to.be.ok;

			// replace = true
			Router_WinLocForTest.hash = '';

			Router_UpdateHash(pathArg, true);

			expect(Router_WinLocForTest.hash).to.equal('');
			expect(hasInvokeReplace).to.be.ok;

			priVar['set-Router_WinLoc'](oriRouter_WinLoc);
		});

		it('Router_Update', () => {
			const Router_Update = priFun['get-Router_Update']();
			const pathArg = '/report/index';
			const paramsArg = {};
			const locArg = {
				srcHash: '/rtReport/index'
			};
			const replaceArg = {};
			const silentArg = {};
			const lQueryArg = {};
			const oriRouter_Silent = priVar['get-Router_Silent']();
			let resultOfG_ToUri = '/rtReport/index';
			let hasInvokeG_ToUri = false;
			let hasInvokeRouter_UpdateHash = false;

			const oriG_ToUri = priFun['set-G_ToUri']((a, b, c) => {
				expect(a).to.equal(pathArg);
				expect(b).to.equal(paramsArg);
				expect(c).to.equal(lQueryArg);

				hasInvokeG_ToUri = true;

				return resultOfG_ToUri;
			});

			const oriRouter_UpdateHash = priFun['set-Router_UpdateHash']((a, b) => {
				expect(a).to.equal(resultOfG_ToUri);
				expect(b).to.equal(replaceArg);

				hasInvokeRouter_UpdateHash = true;
			});

			// G_ToUri return = loc.srcHash
			priVar['set-Router_Silent'](0);

			Router_Update(pathArg, paramsArg, locArg, replaceArg, silentArg, lQueryArg);

			expect(hasInvokeG_ToUri).to.be.ok;
			expect(hasInvokeRouter_UpdateHash).not.to.be.ok;
			expect(priVar['get-Router_Silent']()).to.equal(0);

			// G_ToUri return != loc.srcHash
			resultOfG_ToUri = '/report/bidword';
			hasInvokeG_ToUri = false;

			Router_Update(pathArg, paramsArg, locArg, replaceArg, silentArg, lQueryArg);

			expect(hasInvokeG_ToUri).to.be.ok;
			expect(hasInvokeRouter_UpdateHash).to.be.ok;
			expect(priVar['get-Router_Silent']()).to.equal(silentArg);

			priFun['set-G_ToUri'](oriG_ToUri);
			priFun['set-Router_UpdateHash'](oriRouter_UpdateHash);
			priVar['set-Router_Silent'](oriRouter_Silent);
		});

		it('Router_Bind', () => {
			let resultOfRouter_Parse = '#!/index';
			let hasInvokeRouter_Diff = false;
			let hashchangeCallback;
			let beforeunloadCallback;
			let msgOfG_PAGE_UNLOAD;
			let hasInvokeFire = false;
			let hasInvokeRouter_UpdateHash = false;
			let updateHash;
			const Router_Bind = priFun['get-Router_Bind']();
			const G_PAGE_UNLOAD = priVar['get-G_PAGE_UNLOAD']();
			const G_CHANGE = priVar['get-G_CHANGE']();

			const oriRouter_Parse = priFun['set-Router_Parse'](() => ({
				srcHash: resultOfRouter_Parse
			}));

			const oriG_DOMEventLibBind = priFun['set-G_DOMEventLibBind']((a, b, c) => {
				expect(a).to.equal(window);

				if (b === 'hashchange') {
					hashchangeCallback = c;
				} else if (b === 'beforeunload') {
					beforeunloadCallback = c;
				}
			});

			const oriRouter_UpdateHash = priFun['set-Router_UpdateHash'](a => {
				expect(a).to.equal(updateHash);

				hasInvokeRouter_UpdateHash = true;
			});

			const oriRouter_Diff = priFun['set-Router_Diff'](() => {
				hasInvokeRouter_Diff = true;
			});

			const oriRouter = Magix.Router;

			// start test

			Router_Bind();

			expect(hashchangeCallback).to.be.a('function');
			expect(beforeunloadCallback).to.be.a('function');
			expect(hasInvokeRouter_Diff).to.be.ok;

			// test hashchange callback
			let rejectFn;
			let resolveFn;
			let preventFn;
			let doInFire = () => {};
			let fireEvent;

			priVar['set-Router']({
				fire(type, data) {
					expect(type).to.equal(G_CHANGE);

					rejectFn = data.reject;
					resolveFn = data.resolve;
					preventFn = data.prevent;
					fireEvent = data;

					expect(rejectFn).to.be.a('function');
					expect(resolveFn).to.be.a('function');
					expect(preventFn).to.be.a('function');

					doInFire();

					hasInvokeFire = true;
				}
			});

			// lastHash = newHash
			hashchangeCallback();

			expect(hasInvokeFire).not.to.be.ok;

			// lastHash != newHash not suspend
			resultOfRouter_Parse = '#!/detail';
			updateHash = resultOfRouter_Parse;

			hashchangeCallback();

			expect(hasInvokeFire).to.be.ok;
			expect(hasInvokeRouter_UpdateHash).to.be.ok;
			expect(hasInvokeRouter_Diff).to.be.ok;
			expect(fireEvent.p).to.equal(1);

			// 验证 lastHash 已更新
			hasInvokeFire = false;

			hashchangeCallback();

			expect(hasInvokeFire).not.to.be.ok;

			// lastHash != newHash has suspend
			doInFire = () => {
				preventFn();
			};
			hasInvokeRouter_UpdateHash = false;
			hasInvokeRouter_Diff = false;
			resultOfRouter_Parse = '#!/home';

			hashchangeCallback();

			expect(hasInvokeFire).to.be.ok;
			expect(hasInvokeRouter_UpdateHash).not.to.be.ok;
			expect(hasInvokeRouter_Diff).not.to.be.ok;

			// test reject 
			rejectFn();

			expect(fireEvent.p).to.equal(1);
			expect(hasInvokeRouter_UpdateHash).to.be.ok;

			// test suspend has set empty
			resultOfRouter_Parse = '#!/list';
			updateHash = resultOfRouter_Parse;
			hasInvokeRouter_UpdateHash = false;
			hasInvokeRouter_Diff = false;
			doInFire = () => {};

			hashchangeCallback();

			expect(hasInvokeRouter_UpdateHash).to.be.ok;
			expect(hasInvokeRouter_Diff).to.be.ok;

			// test beforeunload callback
			const eventObj = {};

			priVar['set-Router']({
				fire(type, data = {}) {
					expect(type).to.equal(G_PAGE_UNLOAD);
					hasInvokeFire = true;
					data.msg = msgOfG_PAGE_UNLOAD;
				}
			});

			hasInvokeFire = false;

			// hasn't fire msg
			expect(beforeunloadCallback(eventObj)).not.to.be.ok;
			expect(hasInvokeFire).to.be.ok;

			// has fire msg
			hasInvokeFire = false;
			msgOfG_PAGE_UNLOAD = 'before unload fire msg';

			expect(beforeunloadCallback(eventObj)).to.equal(msgOfG_PAGE_UNLOAD);
			expect(eventObj.returnValue).to.equal(msgOfG_PAGE_UNLOAD);
			expect(hasInvokeFire).to.be.ok;

			priVar['set-Router'](oriRouter);
			priFun['set-Router_Parse'](oriRouter_Parse);
			priFun['set-G_DOMEventLibBind'](oriG_DOMEventLibBind);
			priFun['set-Router_Diff'](oriRouter_Diff);
			priFun['set-Router_UpdateHash'](oriRouter_UpdateHash);
		});

		it('Router_AttachViewAndPath', () => {
			const Router_AttachViewAndPath = priFun['get-Router_AttachViewAndPath']();
			const oriRouter_PNR_Routers = priVar['get-Router_PNR_Routers']();
			const Magix_Cfg = priVar['get-Magix_Cfg']();
			let expectRewritePath;
			let hasInvokeRewritePath = false;

			priVar['set-Router_PNR_Routers']();

			const locArg = {
				params: {},
				hash: {
					path: 'report/index'
				},
				query: {
					path: 'report/daily'
				}
			}

			Magix_Cfg.routes = {
				'report/index': 'report/view/index',
				'report/daily': 'report/view/daily',
				'mix/result': {
					extAttr1: 1,
					extAttr2: 2
				}
			};

			Magix_Cfg.unmatchView = 'common/view/error';
			Magix_Cfg.defaultView = 'common/view/default';
			Magix_Cfg.defaultPath = 'common/default';

			Magix_Cfg.rewrite = (a, b, c) => {
				expect(a).to.equal(expectRewritePath);
				expect(b).to.equal(locArg.params);
				expect(c).to.equal(Magix_Cfg.routes);
				
				hasInvokeRewritePath = true;

				return a;
			};

			// has path and view
			expectRewritePath = 'report/index';

			Router_AttachViewAndPath(locArg);

			expect(locArg.path).to.equal('report/index');
			expect(locArg.view).to.equal('report/view/index');
			expect(hasInvokeRewritePath).to.be.ok;

			// no hash path, Router_Edge = 1, has query path
			delete locArg.path;
			delete locArg.view;
			expectRewritePath = 'report/daily';
			delete locArg.hash.path;
			hasInvokeRewritePath = false;
			priVar['set-Router_Edge'](1);

			Router_AttachViewAndPath(locArg);

			expect(locArg.path).to.equal('report/daily');
			expect(locArg.view).to.equal('report/view/daily');
			expect(hasInvokeRewritePath).to.be.ok;

			// no hash path, Router_Edge = 0, has query path, has unmatchView
			delete locArg.path;
			delete locArg.view;
			expectRewritePath = 'common/default';
			hasInvokeRewritePath = false;
			priVar['set-Router_Edge'](0);

			Router_AttachViewAndPath(locArg);

			expect(locArg.path).to.equal('common/default');
			expect(locArg.view).to.equal('common/view/error');
			expect(hasInvokeRewritePath).to.be.ok;

			// no hash path, Router_Edge = 0, has query path, no unmatchView
			delete locArg.path;
			delete locArg.view;
			expectRewritePath = 'common/default';
			delete Magix_Cfg.unmatchView;
			hasInvokeRewritePath = false;
			priVar['set-Router_PNR_Routers'](undefined);

			Router_AttachViewAndPath(locArg);

			expect(locArg.path).to.equal('common/default');
			expect(locArg.view).to.equal('common/view/default');
			expect(hasInvokeRewritePath).to.be.ok;

			// hash path is mix
			delete locArg.path;
			delete locArg.view;
			expectRewritePath = 'mix/result';
			locArg.hash.path = 'mix/result';
			hasInvokeRewritePath = false;

			Router_AttachViewAndPath(locArg);

			expect(locArg.path).to.equal('mix/result');
			expect(locArg.view).to.deep.equal({
				extAttr1: 1,
				extAttr2: 2
			});
			expect(locArg.extAttr1).to.equal(1);
			expect(locArg.extAttr2).to.equal(2);
			expect(hasInvokeRewritePath).to.be.ok;

			priVar['get-Router_PNR_Routers'](oriRouter_PNR_Routers);
		});

		it('Dispatcher_NotifyChange', () => {
			let hasInvokeVframe_Root = false;
			let hasInvokeMountView = false;
			let hasInvokeDispatcher_Update = false;
			let G_COUNTER = priVar['get-G_COUNTER']();
			const keys = [];
			const targetView = {
				to: {}
			}

			const Dispatcher_NotifyChange = priFun['get-Dispatcher_NotifyChange']();

			const oriDispatcher_Update = priFun['set-Dispatcher_Update']((a, b) => {
				expect(a).to.equal(rootVf);
				expect(b).to.equal(keys);

				hasInvokeDispatcher_Update = true;
			});

			const rootVf = {
				mountView(a) {
					expect(a).to.equal(targetView.to);

					hasInvokeMountView = true;
				}
			};

			const oriVframe_Root = priFun['set-Vframe_Root'](() => {
				hasInvokeVframe_Root = true;

				return rootVf;
			});

			// event 包含 view
			Dispatcher_NotifyChange({
				view: targetView
			});

			expect(hasInvokeVframe_Root).to.be.ok;
			expect(hasInvokeMountView).to.be.ok;
			expect(hasInvokeDispatcher_Update).not.to.be.ok;

			// event 不包含view
			hasInvokeVframe_Root = false;
			hasInvokeMountView = false;

			Dispatcher_NotifyChange({
				keys
			});

			expect(hasInvokeVframe_Root).to.be.ok;
			expect(hasInvokeMountView).not.to.be.ok;
			expect(hasInvokeDispatcher_Update).to.be.ok;
			expect(priVar['get-Dispatcher_UpdateTag']()).to.equal(G_COUNTER);
			expect(priVar['get-G_COUNTER']()).to.equal(G_COUNTER + 1);

			priFun['set-Vframe_Root'](oriVframe_Root);
			priFun['set-Dispatcher_Update'](oriDispatcher_Update);
		});
	};

	Test.Private.router = testFn;
})(window, window.KISSY, window.Test || (window.Test = {}), '');