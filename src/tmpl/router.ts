
/*#if(modules.router){#*/
/*#if(modules.mxevent){#*/
let Changed = 'changed';
/*#}#*/
/*#if(modules.routerTip){#*/
let Change = 'change';
let Page_Unload = 'pageunload';
/*#}#*/
let Router_VIEW = 'view';
let Router_HrefCache = new MxCache();
let Router_ChgdCache = new MxCache();
let Router_WinLoc = location;
let Router_LastChanged;
let Router_Silent = 0;
let Router_LLoc = {
    query: {},
    params: {},
    href: Empty
};
let Router_TrimHashReg = /(?:^.*\/\/[^\/]+|#.*$)/gi;
let Router_TrimQueryReg = /^[^#]*#?/;
function GetParam(key, defaultValue) {
    let r = this[Params][key];
    if (defaultValue !== Undefined) {
        if (G_IsType(defaultValue) == 'Number') {
            r = Number(r);
            r = isNaN(r) ? defaultValue : r;
        } else {
            r = r || defaultValue + Empty;
        }
    }
    return r;
}
/*#if(modules.routerState){#*/
let Router_State = 1;
/*#}#*/

let Router_PNR_Routers, Router_PNR_UnmatchView,
    Router_PNR_DefaultView, Router_PNR_DefaultPath;

let Router_PNR_Rewrite;
/*#if(modules.recast){#*/
let Router_PNR_Recast;
/*#}#*/
let Router_AttachViewAndPath = (loc, view?) => {
    if (!Router_PNR_Routers) {
        Router_PNR_Routers = Mx_Cfg.routes || {};
        Router_PNR_UnmatchView = Mx_Cfg.unmatchView;
        Router_PNR_DefaultView = Mx_Cfg.defaultView;
        //支持默认配置带参数的情况
        Router_PNR_DefaultPath = ParseUri(Mx_Cfg.defaultPath || '/');
        Router_PNR_Rewrite = Mx_Cfg.rewrite;
        /*#if(modules.recast){#*/
        Router_PNR_Recast = Mx_Cfg.recast;
        /*#}#*/
    }
    if (!loc[Router_VIEW]) {
        let path = loc.hash[Path]
        /*#if(modules.routerState){#*/ || (Router_State && loc.query[Path])/*#}#*/;
        if (!path) {
            path = Router_PNR_DefaultPath[Path];
            Assign(loc[Params], Router_PNR_DefaultPath[Params]);
        }

        if (Router_PNR_Rewrite) {
            path = Router_PNR_Rewrite(path, loc[Params], Router_PNR_Routers);
        }
        view = Router_PNR_Routers[path] || Router_PNR_UnmatchView || Router_PNR_DefaultView;
        loc[Path] = path;
        loc[Router_VIEW] = view;
        if (IsObject(view)) {
            if (DEBUG) {
                if (!view.view) {
                    console.error(path, ' config missing view!', view);
                }
            }
            Assign(loc, view);
        }
    }
};

let Router_GetChged = (oldLocation, newLocation) => {
    let oKey = oldLocation.href;
    let nKey = newLocation.href;
    let tKey = oKey + Spliter + nKey;
    let result = Router_ChgdCache.get(tKey);
    if (!result) {
        let hasChanged, rps;
        result = {
            params: rps = {},
            force: !oKey //是否强制触发的changed，对于首次加载会强制触发一次
        };
        let oldParams = oldLocation[Params],
            newParams = newLocation[Params],
            tArr = Keys(oldParams).concat(Keys(newParams)),
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
        setDiff(Path);
        setDiff(Router_VIEW);
        Router_ChgdCache.set(tKey, result = {
            a: hasChanged,
            b: result
        });
    }
    return result;
};
let Router_Parse = (href?) => {
    href = href || Router_WinLoc.href;

    let result = Router_HrefCache.get(href),
        srcQuery, srcHash, query, hash, params;
    if (!result) {
        srcQuery = href.replace(Router_TrimHashReg, Empty);
        srcHash = href.replace(Router_TrimQueryReg, Empty);
        query = ParseUri(srcQuery);
        hash = ParseUri(srcHash);
        params = Assign({}, query[Params], hash[Params]);
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
            result = Safeguard(result);
        }
    }
    return result;
};
let Router_Diff = () => {
    let location = Router_Parse();
    let changed = Router_GetChged(Router_LLoc, Router_LLoc = location);
    if (!Router_Silent && changed.a) {
        Router_LastChanged = changed.b;
        if (Router_LastChanged[Path]) {
            location = location.title || Mx_Cfg.title;
            if (location) {
                Doc_Document.title = location;
            }
        }
        /*#if(modules.mxevent){#*/
        Router.fire(Changed, Router_LastChanged);
        /*#}else{#*/
        Dispatcher_NotifyChange(Router_LastChanged);
        /*#}#*/
    }
    Router_Silent = 0;
    if (DEBUG) {
        Router_LastChanged = Safeguard(Router_LastChanged);
    }
    return Router_LastChanged;
};
let Router =/*#if(modules.mxevent){#*/ Assign(/*#}#*/{
    parse: Router_Parse,
    diff: Router_Diff,
    to(pn, params, replace, silent) {
        if (!params && IsObject(pn)) {
            params = pn;
            pn = Empty;
        }
        let temp = ParseUri(pn);
        let tParams = temp[Params];
        let tPath = temp[Path];
        let lPath = Router_LLoc[Path]; //历史路径
        let lParams = Router_LLoc[Params];
        let lQuery = Router_LLoc.query[Params];
        Assign(tParams, params); //把路径中解析出来的参数与用户传递的参数进行合并

        if (tPath) { //设置路径带参数的形式，如:/abc?q=b&c=e或不带参数 /abc
            /*#if(modules.routerState){#*/
            if (!Router_State) { //pushState不用处理
                /*#}#*/
                for (lPath in lQuery) { //未出现在query中的参数设置为空
                    if (!Has(tParams, lPath)) tParams[lPath] = Empty;
                }
                /*#if(modules.routerState){#*/
            }
            /*#}#*/
        } else if (lParams) { //只有参数，如:a=b&c=d
            tPath = lPath; //使用历史路径
            tParams = Assign({}, lParams, tParams);
        }
        Router_Update(tPath, tParams, Router_LLoc, replace, silent, lQuery);
    }
}/*#if(modules.mxevent){#*/, MxEvent)/*#}#*/;
/*#}#*/