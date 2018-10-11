let G_COUNTER = 0;
let G_EMPTY = '';
let G_EMPTY_ARRAY = [];
let G_COMMA = ',';
let G_NULL = null;
let G_WINDOW = window;
let G_Undefined = void G_COUNTER;
let G_DOCUMENT = document;
let GA = G_DOCUMENT.documentElement.getAttribute;
let G_GetAttribute = (node, attr) => GA.call(node, attr);
/*#if(!modules.naked){#*/
let G_DOC = $(G_DOCUMENT);
/*#}#*/
let Timeout = G_WINDOW.setTimeout;
let G_CHANGED = 'changed';
let G_CHANGE = 'change';
let G_PAGE_UNLOAD = 'pageunload';
let G_VALUE = 'value';
let G_Tag_Key = 'mxs';
let G_Tag_Attr_Key = 'mxa';
let G_Tag_View_Key = 'mxv';
/*#if(modules.vframeHost){#*/
let G_Tag_View_Owner = 'mxo';
/*#}#*/
let G_HashKey = '#';
function G_NOOP() { }
/*#if(modules.service||modules.updater){#*/
let JSONStringify = JSON.stringify;
/*#}#*/
let G_DOCBODY; //initilize at vframe_root
/*
    关于spliter
    出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
 */
let G_SPLITER = '\x1e';
let Magix_StrObject = 'object';
let G_PROTOTYPE = 'prototype';
let G_PARAMS = 'params';
let G_PATH = 'path';
let G_MX_VIEW = 'mx-view';
// let Magix_PathRelativeReg = /\/\.(?:\/|$)|\/[^\/]+?\/\.{2}(?:\/|$)|\/\/+|\.{2}\//; // ./|/x/../|(b)///
// let Magix_PathTrimFileReg = /\/[^\/]*$/;
// let Magix_ProtocalReg = /^(?:https?:)?\/\//i;
let Magix_PathTrimParamsReg = /[#?].*$/;
let Magix_ParamsReg = /([^=&?\/#]+)=?([^&#?]*)/g;
let Magix_IsParam = /(?!^)=|&/;
let G_Id = prefix => (prefix || 'mx_') + G_COUNTER++;
/*#if(modules.defaultView){#*/
let MxGlobalView = G_Id();
/*#}#*/
let Magix_Cfg = {
    rootId: G_Id(),
    /*#if(modules.defaultView){#*/
    defaultView: MxGlobalView,
    /*#}#*/
    error(e) {
        throw e;
    }
};

let G_GetById = id => typeof id == Magix_StrObject ? id : G_DOCUMENT.getElementById(id);
/*#if(modules.updater||modules.state){#*/
let G_IsPrimitive = args => !args || typeof args != Magix_StrObject;
let G_Set = (newData, oldData, keys, unchanged) => {
    let changed = 0,
        now, old, p;
    for (p in newData) {
        now = newData[p];
        old = oldData[p];
        if ((!G_IsPrimitive(now) || old !== now) && !G_Has(unchanged, p)) {
            keys[p] = 1;
            changed = 1;
        }
        oldData[p] = now;
    }
    return changed;
};
/*#}#*/
let G_NodeIn = (a, b, r) => {
    a = G_GetById(a);
    b = G_GetById(b);
    if (a && b) {
        r = a == b;
        if (!r) {
            try {
                r = (b.compareDocumentPosition(a) & 16) == 16;
            } catch (_magix) { }
        }
    }
    return r;
};
/*#if(modules.es3){#*/
function G_Assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (G_Has(s, p))
            t[p] = s[p];
    }
    return t;
}
/*#if(!modules.mini){#*/
let G_Keys = (obj, keys, p) => {
    keys = [];
    for (p in obj) {
        if (G_Has(obj, p)) {
            keys.push(p);
        }
    }
    return keys;
};
/*#}#*/
let Magix_HasProp = Magix_Cfg.hasOwnProperty;
/*#}else{#*/
let {
    assign: G_Assign,
     /*#if(!modules.mini){#*/keys: G_Keys,/*#}#*/
    hasOwnProperty: Magix_HasProp
} = Object;
/*#}#*/
/*#if(modules.style){#*/
/*#if(modules.naked){#*/
let Header = document.head;
let Temp = document.createElement('div');
/*#}else{#*/
let Header = $('head');
/*#}#*/
let View_ApplyStyle = (key, css) => {
    if (DEBUG && G_IsArray(key)) {
        for (let i = 0; i < key.length; i += 2) {
            View_ApplyStyle(key[i], key[i + 1]);
        }
        return;
    }
    if (css && !View_ApplyStyle[key]) {
        View_ApplyStyle[key] = 1;
        if (DEBUG) {
            if (key.indexOf('$throw_') === 0) {
                throw new Error(css);
            }
            /*#if(modules.naked){#*/
            Temp.innerHTML = `<style id="${key}">${css}`;
            Header.appendChild(Temp.firstChild);
            /*#}else{#*/
            Header.append(`<style id="${key}">${css}`);
            /*#}#*/
        } else {/*#if(modules.naked){#*/
            Temp.innerHTML = `<style>${css}`;
            Header.appendChild(Temp.firstChild);
            /*#}else{#*/
            Header.append(`<style>${css}`);
            /*#}#*/
        }
    }
};
/*#}#*/
let IdIt = n => G_GetAttribute(n, 'id') || (/*#if(!modules.updaterVDOM){#*/n['@{node#auto.id}'] = 1, /*#}#*/n.id = G_Id());
let G_ToTry = (fns, args, context, r, e) => {
    args = args || G_EMPTY_ARRAY;
    if (!G_IsArray(fns)) fns = [fns];
    if (!G_IsArray(args)) args = [args];
    for (e of fns) {
        try {
            r = e && e.apply(context, args);
        } catch (x) {
            Magix_Cfg.error(x);
        }
    }
    return r;
};

let G_Has = (owner, prop) => owner && Magix_HasProp.call(owner, prop); //false 0 G_NULL '' undefined
/*#if(modules.updater){#*/
let G_TranslateData = (data, params) => {
    let p, val;
    if (G_IsPrimitive(params)) {
        p = params + G_EMPTY;
        if (p[0] == G_SPLITER && G_Has(data, p)) {
            params = data[p];
        }
    } else {
        for (p in params) {
            val = params[p];
            val = G_TranslateData(data, val);
            params[p] = val;
        }
    }
    return params;
};
/*#}#*/