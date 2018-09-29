let Router_VIEW = 'view';
let Router_HrefCache = new G_Cache();
let Router_ChgdCache = new G_Cache();
let Router_WinLoc = G_WINDOW.location;
let Router_LastChanged;
let Router_Silent = 0;
let Router_LLoc = {
    query: {},
    params: {},
    href: G_EMPTY
};
let Router_TrimHashReg = /(?:^.*\/\/[^\/]+|#.*$)/gi;
let Router_TrimQueryReg = /^[^#]*#?!?/;
function GetParam(key, defaultValue) {
    return this[G_PARAMS][key] || defaultValue !== G_Undefined && defaultValue || G_EMPTY;
}
let Router_Edge = 0;
/*#if(!modules.forceEdgeRouter){#*/
let Router_Hashbang = G_HashKey + '!';
let Router_UpdateHash = (path, replace) => {
    path = Router_Hashbang + path;
    if (replace) {
        Router_WinLoc.replace(path);
    } else {
        Router_WinLoc.hash = path;
    }
};
let Router_Update = (path, params, loc, replace, silent, lQuery) => {
    path = G_ToUri(path, params, lQuery);
    if (path != loc.srcHash) {
        Router_Silent = silent;
        Router_UpdateHash(path, replace);
    }
};
/*#if(modules.tipRouter){#*/
let Router_Bind = () => {
    let lastHash = Router_Parse().srcHash;
    let newHash, suspend;
    G_DOMEventLibBind(G_WINDOW, 'hashchange', (e, loc, resolve) => {
        if (suspend) {
            /*#if(modules.tipLockUrlRouter){#*/
            Router_UpdateHash(lastHash);
            /*#}#*/
            return;
        }
        loc = Router_Parse();
        newHash = loc.srcHash;
        if (newHash != lastHash) {
            resolve = () => {
                e.p = 1;
                lastHash = newHash;
                suspend = G_EMPTY;
                Router_UpdateHash(newHash);
                Router_Diff();
            };
            e = {
                reject() {
                    e.p = 1;
                    suspend = G_EMPTY;
                    /*#if(!modules.tipLockUrlRouter){#*/
                    Router_UpdateHash(lastHash);
                    /*#}#*/
                },
                resolve,
                prevent() {
                    suspend = 1;
                    /*#if(modules.tipLockUrlRouter){#*/
                    Router_UpdateHash(lastHash);
                    /*#}#*/
                }
            };
            Router.fire(G_CHANGE, e);
            if (!suspend && !e.p) {
                resolve();
            }
        }
    });
    G_DOMEventLibBind(G_WINDOW, 'beforeunload', (e, te, msg) => {
        e = e || G_WINDOW.event;
        te = {};
        Router.fire(G_PAGE_UNLOAD, te);
        if ((msg = te.msg)) {
            //chrome use e.returnValue and ie use return value
            if (e) e.returnValue = msg;
            return msg;
        }
    });
    Router_Diff();
};
/*#}else{#*/
let Router_Bind = () => {
    G_DOMEventLibBind(G_WINDOW, 'hashchange', Router_Diff);
    Router_Diff();
};
/*#}#*/
/*#}#*/
/*#if(modules.edgeRouter||modules.forceEdgeRouter){#*/
let WinHistory = G_WINDOW.history;
/*#if(!modules.forceEdgeRouter){#*/
if (WinHistory.pushState) {
    /*#}#*/
    Router_Edge = 1;
    let Router_DidUpdate;
    let Router_UpdateState = (path, replace) => WinHistory[replace ? 'replaceState' : 'pushState'](G_EMPTY, G_EMPTY, path);
    let Router_Popstate;
    let Router_Update = (path, params, loc, replace, silent) => {
        path = G_ToUri(path, params);
        if (path != loc.srcQuery) {
            Router_Silent = silent;
            Router_UpdateState(path, replace);
            if (Router_Popstate) {
                Router_Popstate(1);
            } else {
                Router_Diff();
            }
        }
    };
    /*#if(modules.tipRouter){#*/
    let Router_Bind = () => {
        let initialURL = Router_WinLoc.href;
        let lastHref = initialURL;
        let newHref, suspend;
        G_DOMEventLibBind(G_WINDOW, 'popstate', Router_Popstate = (f, e, resolve) => {
            newHref = Router_WinLoc.href;
            let initPop = !Router_DidUpdate && newHref == initialURL;
            Router_DidUpdate = 1;
            if (initPop) return;
            if (suspend) {
                /*#if(modules.tipLockUrlRouter){#*/
                Router_UpdateState(lastHref);
                /*#}#*/
                return;
            }
            if (newHref != lastHref) {
                resolve = () => {
                    e.p = 1;
                    suspend = G_EMPTY;
                    lastHref = newHref;
                    if (!f) Router_UpdateState(newHref);
                    Router_Diff();
                };
                e = {
                    reject() {
                        suspend = G_EMPTY;
                        e.p = 1;
                        /*#if(!modules.tipLockUrlRouter){#*/
                        Router_UpdateState(lastHref);
                        /*#}#*/
                    },
                    resolve,
                    prevent() {
                        suspend = 1;
                        /*#if(modules.tipLockUrlRouter){#*/
                        Router_UpdateState(lastHref);
                        /*#}#*/
                    }
                };
                Router.fire(G_CHANGE, e);
                if (!suspend && !e.p) {
                    resolve();
                }
            }
        });
        G_WINDOW.onbeforeunload = (e, te, msg) => {
            e = e || G_WINDOW.event;
            te = {};
            Router.fire(G_PAGE_UNLOAD, te);
            if ((msg = te.msg)) {
                if (e) e.returnValue = msg;
                return msg;
            }
        };
        Router_Diff();
    };
    /*#}else{#*/
    let Router_Bind = () => {
        let initialURL = Router_WinLoc.href;
        G_DOMEventLibBind(G_WINDOW, 'popstate', () => {
            let initPop = !Router_DidUpdate && Router_WinLoc.href == initialURL;
            Router_DidUpdate = 1;
            if (initPop) return;
            Router_Diff();
        });
        Router_Diff();
    };
    /*#}#*/
    /*#if(!modules.forceEdgeRouter){#*/
}
/*#}#*/
/*#}#*/

let Router_PNR_Routers, Router_PNR_UnmatchView, /*Router_PNR_IsFun,*/
    Router_PNR_DefaultView, Router_PNR_DefaultPath;

/*#if(modules.urlRewriteRouter){#*/
let Router_PNR_Rewrite;
/*#}#*/
/*#if(modules.dispatcherRecast){#*/
let Router_PNR_Recast;
/*#}#*/
/*#if(modules.updateTitleRouter){#*/
let DefaultTitle = G_DOCUMENT.title;
/*#}#*/
let Router_AttachViewAndPath = (loc, view) => {
    if (!Router_PNR_Routers) {
        Router_PNR_Routers = Magix_Cfg.routes || {};
        Router_PNR_UnmatchView = Magix_Cfg.unmatchView;
        Router_PNR_DefaultView = Magix_Cfg.defaultView;
        Router_PNR_DefaultPath = Magix_Cfg.defaultPath || '/';
        //Router_PNR_IsFun = G_IsFunction(Router_PNR_Routers);
        //if (!Router_PNR_IsFun && !Router_PNR_Routers[Router_PNR_DefaultPath]) {
        //    Router_PNR_Routers[Router_PNR_DefaultPath] = Router_PNR_DefaultView;
        //}
        /*#if(modules.urlRewriteRouter){#*/
        Router_PNR_Rewrite = Magix_Cfg.rewrite;
        //if (!G_IsFunction(Router_PNR_Rewrite)) {
        //    Router_PNR_Rewrite = G_NULL;
        //}
        /*#}#*/
        /*#if(modules.dispatcherRecast){#*/
        Router_PNR_Recast = Magix_Cfg.recast;
        /*#}#*/
    }
    if (!loc[Router_VIEW]) {
        /*#if(modules.forceEdgeRouter){#*/
        let path = loc.query[G_PATH] || Router_PNR_DefaultPath;
        /*#}else{#*/
        let path = loc.hash[G_PATH] || (Router_Edge && loc.query[G_PATH]) || Router_PNR_DefaultPath;
        /*#}#*/

        /*#if(modules.urlRewriteRouter){#*/
        if (Router_PNR_Rewrite) {
            path = Router_PNR_Rewrite(path, loc[G_PARAMS], Router_PNR_Routers);
        }
        /*#}#*/

        //if (Router_PNR_IsFun) {
        //    view = Router_PNR_Routers.call(Magix_Cfg, path, loc);
        //} else {
        view = Router_PNR_Routers[path] || Router_PNR_UnmatchView || Router_PNR_DefaultView;
        //}
        loc[G_PATH] = path;
        loc[Router_VIEW] = view;
        /*#if(modules.updateTitleRouter){#*/
        if (G_IsObject(view)) {
            if (DEBUG) {
                if (!view.view) {
                    console.error(path, ' config missing view!', view);
                }
            }
            G_Assign(loc, view);
        }
        /*#}#*/
    }
};

let Router_GetChged = (oldLocation, newLocation) => {
    let oKey = oldLocation.href;
    let nKey = newLocation.href;
    let tKey = oKey + G_SPLITER + nKey;
    let result = Router_ChgdCache.get(tKey);
    if (!result) {
        let hasChanged, rps;
        result = {
            params: rps = {},
            //isParam: Router_IsParam,
            //location: newLocation,
            force: !oKey //是否强制触发的changed，对于首次加载会强制触发一次
        };
        let oldParams = oldLocation[G_PARAMS],
            newParams = newLocation[G_PARAMS],
            tArr = G_Keys(oldParams).concat(G_Keys(newParams)),
            key;
        let setDiff = key => {
            let from = oldParams[key],
                to = newParams[key];
            if (from != to) {
                rps[key] = {
                    from,
                    to
                };
                hasChanged = 1;
            }
        };
        for (key of tArr) {
            setDiff(key);
        }
        oldParams = oldLocation;
        newParams = newLocation;
        rps = result;
        setDiff(G_PATH);
        setDiff(Router_VIEW);
        Router_ChgdCache.set(tKey, result = {
            a: hasChanged,
            b: result
        });
    }
    return result;
};
let Router_Parse = href => {
    href = href || Router_WinLoc.href;

    let result = Router_HrefCache.get(href),
        srcQuery, srcHash, query, hash, params;
    if (!result) {
        srcQuery = href.replace(Router_TrimHashReg, G_EMPTY);
        srcHash = href.replace(Router_TrimQueryReg, G_EMPTY);
        query = G_ParseUri(srcQuery);
        hash = G_ParseUri(srcHash);
        params = {
            ...query[G_PARAMS]
            /*#if(!modules.forceEdgeRouter){#*/, ...hash[G_PARAMS]/*#}#*/
        };
        result = {
            get: GetParam,
            href,
            srcQuery,
            srcHash,
            query,
            hash,
            params
        };
        if (Magix_Booted) {
            Router_AttachViewAndPath(result);
            Router_HrefCache.set(href, result);
        }
        if (DEBUG) {
            result.params = Safeguard(result.params);
            result = Safeguard(result);
        }
    }
    return result;
};
let Router_Diff = () => {
    let location = Router_Parse();
    let changed = Router_GetChged(Router_LLoc, Router_LLoc = location);
    if (!Router_Silent && changed.a) {
        /*#if(modules.updateTitleRouter){#*/
        Router_LastChanged = changed.b;
        if (Router_LastChanged[G_PATH]) {
            G_DOCUMENT.title = location.title || DefaultTitle;
        }
        /*#}#*/
        Router.fire(G_CHANGED, /*#if(modules.updateTitleRouter){#*/ Router_LastChanged /*#}else{#*/ Router_LastChanged = changed.b /*#}#*/);
    }
    Router_Silent = 0;
    if (DEBUG) {
        Router_LastChanged = Safeguard(Router_LastChanged);
    }
    return Router_LastChanged;
};
//let PathTrimFileParamsReg=/(\/)?[^\/]*[=#]$/;//).replace(,'$1').replace(,EMPTY);
//let PathTrimSearch=/\?.*$/;
/**
 * 路由对象，操作URL
 * @name Router
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @beta
 * @module router
 */
let Router = {
    /**
     * @lends Router
     */
    /**
     * 解析href的query和hash，默认href为location.href
     * @param {String} [href] href
     * @return {Object} 解析的对象
     */
    parse: Router_Parse,
    /**
     * 根据location.href路由并派发相应的事件,同时返回当前href与上一个href差异对象
     * @example
     * let diff = Magix.Router.diff();
     * if(diff.params.page || diff.params.rows){
     *     console.log('page or rows changed');
     * }
     */
    diff: Router_Diff,
    /**
     * 导航到新的地址
     * @param  {Object|String} pn path或参数字符串或参数对象
     * @param {String|Object} [params] 参数对象
     * @param {Boolean} [replace] 是否替换当前历史记录
     * @example
     * let R = Magix.Router;
     * R.to('/list?page=2&rows=20');//改变path和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
     * R.to('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
     * R.to({//通过对象修改参数，地址栏上的其它参数会保留
     *     page:2,
     *     rows:20
     * });
     * R.to('/list',{//改变path和相关参数，丢弃地址栏上原有的其它参数
     *     page:2,
     *     rows:20
     * });
     *
     * //凡是带path的修改地址栏，都会把原来地址栏中的参数丢弃
     * 传递对象，内部对value会进行encodeURIComponent操作，传递字符串需要开发者自己处理。
     * R.to({
     *  page:2,
     *  rows:20
     * },null,true);//使用location.replace操作hash
     * R.to({
     *  page:2,
     *  rows:20
     * },null,null,true);//静默更新url但不派发事件
     */
    to(pn, params, replace, silent) {
        if (!params && G_IsObject(pn)) {
            params = pn;
            pn = G_EMPTY;
        }
        let temp = G_ParseUri(pn);
        let tParams = temp[G_PARAMS];
        let tPath = temp[G_PATH];
        let lPath = Router_LLoc[G_PATH]; //历史路径
        let lParams = Router_LLoc[G_PARAMS];
        let lQuery = Router_LLoc.query[G_PARAMS];
        G_Assign(tParams, params); //把路径中解析出来的参数与用户传递的参数进行合并

        if (tPath) { //设置路径带参数的形式，如:/abc?q=b&c=e或不带参数 /abc
            //tPath = G_Path(lPath, tPath);
            if (!Router_Edge) { //pushState不用处理
                for (lPath in lQuery) { //未出现在query中的参数设置为空
                    if (!G_Has(tParams, lPath)) tParams[lPath] = G_EMPTY;
                }
            }
        } else if (lParams) { //只有参数，如:a=b&c=d
            tPath = lPath; //使用历史路径
            tParams = { ...lParams, ...tParams }; //复制原来的参数，合并新的参数
        }
        Router_Update(tPath, tParams, Router_LLoc, replace, silent, lQuery);
    }/*#if(!modules.mini){#*/,
    ...MEvent
    /*#}#*/

    /**
     * 当location.href有改变化后触发
     * @name Router.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.path  如果path发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.view 如果view发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.params 如果参数发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Boolean} e.force 标识是否是第一次强制触发的changed，对于首次加载完Magix，会强制触发一次changed
     */
};
Magix.Router = Router;