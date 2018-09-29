
let $ = selector => G_DOCUMENT.querySelectorAll(selector);
let G_Trigger = (element, type, data) => {
    let e = G_DOCUMENT.createEvent('Events');
    e.initEvent(type, true, true);
    for (let p in data) {
        e[p] = data[p];
    }
    element.dispatchEvent(e);
};
let G_TargetMatchSelector = (element, selector) => {
    if (!selector || !element || element.nodeType !== 1) return 0;
    let matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
        element.oMatchesSelector || element.matchesSelector;
    return matchesSelector.call(element, selector);
};
let G_MxId = e => e._mx || (e._mx = G_Id('e'));
let G_EventHandlers = {};
let returnTrue = () => true,
    returnFalse = () => false,
    eventMethods = {
        preventDefault: 'isDefaultPrevented',
        //stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
    };

let G_EventCompatible = e => {
    if (!e.isDefaultPrevented) {
        for (let key in eventMethods) {
            let value = eventMethods[key];
            let src = e[key];
            e[key] = (...a) => {
                e[value] = returnTrue;
                return src && src.apply(e, a);
            };
            e[value] = returnFalse;
        }
        if (e.defaultPrevented !== undefined ? e.defaultPrevented :
            'returnValue' in e ? e.returnValue === false :
                e.getPreventDefault && e.getPreventDefault())
            e.isDefaultPrevented = returnTrue;
    }
    return e;
};
let G_AddEvent = (element, type, data, fn) => {
    let id = G_MxId(element);
    let collections = G_EventHandlers[id] || (G_EventHandlers[id] = []);
    let h = {
        '@{~dom#data.viewId}': data && data.i,
        '@{~dom#real.fn}': fn,
        '@{~dom#type}': type,
        '@{~dom#event.proxy}'(e) {
            e = G_EventCompatible(e);
            //if (e.isImmediatePropagationStopped()) return;
            fn.call(element, e, data);
        }
    };
    collections.push(h);
    element.addEventListener(type, h['@{~dom#event.proxy}'], data && data.m);
};
let G_RemoveEvent = (element, type, data, cb) => {
    let id = G_MxId(element);
    let collections = G_EventHandlers[id];
    if (collections) {
        let found;
        for (let c, i = collections.length; i--;) {
            c = collections[i];
            if (c['@{~dom#type}'] == type && c['@{~dom#real.fn}'] === cb) {
                let cd = c['@{~dom#data.viewId}'];
                if (!data || (data && data.i == cd)) {
                    found = c;
                    collections.splice(i, 1);
                    break;
                }
            }
        }
        if (found) {
            element.removeEventListener(type, found['@{~dom#event.proxy}'], data && data.m);
        }
    }
};
let G_DOMGlobalProcessor = (e, d) => {
    //d = e.data;
    e.eventTarget = d.e;
    G_ToTry(d.f, e, d.v);
};
let G_DOMEventLibBind = (node, type, cb, remove, scope) => {
    if (remove) {
        G_RemoveEvent(node, type, scope, cb);
    } else {
        G_AddEvent(node, type, scope, cb);
    }
};