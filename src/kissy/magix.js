KISSY.add('magix', (S, SE, DOM) => {
    if (typeof DEBUG == 'undefined') window.DEBUG = true;
    let $ = S.all;
    let G_IsObject = S.isObject;
    let G_IsArray = S.isArray;
    Inc('../tmpl/variable');
    Inc('../tmpl/cache');
    let G_Require = (name, fn) => {
        S.use(name && (name + G_EMPTY), (S, ...args) => {
            if (fn) {
                fn.apply(S, args);
            }
        });
    };
    let G_Extend = S.extend;
    let G_TargetMatchSelector = DOM.test;
    function G_DOMGlobalProcessor(e, d) {
        d = this;
        e.eventTarget = d.e;
        G_ToTry(d.f, e, d.v);
    }
    /*#if(modules.eventEnterLeave){#*/
    let Specials = {
        mouseenter: 1,
        mouseleave: 1,
        pointerenter: 1,
        pointerleave: 1
    };
    let G_DOMEventLibBind = (node, type, cb, remove, scope, selector) => {
        selector = Specials[type] === 1 ? `[mx-${type}]` : G_EMPTY;
        if (scope || selector) {
            SE[`${remove ? 'un' : G_EMPTY}delegate`](node, type, selector, cb, scope);
        } else {
            SE[remove ? 'detach' : 'on'](node, type, cb, scope);
        }
    };
    /*#}else{#*/
    let G_DOMEventLibBind = (node, type, cb, remove, scope) => {
        if (scope) {
            SE[`${remove ? 'un' : G_EMPTY}delegate`](node, type, cb, scope);
        } else {
            SE[remove ? 'detach' : 'on'](node, type, cb, scope);
        }
    };
    /*#}#*/

    Inc('../tmpl/safeguard');
    Inc('../tmpl/magix');
    Inc('../tmpl/event');
    /*#if(modules.state){#*/
    Inc('../tmpl/state');
    /*#}#*/
    /*#if(modules.router){#*/
    //let G_IsFunction = S.isFunction;
    Inc('../tmpl/router');
    /*#}#*/
    /*#if(modules.mxViewAttr){#*/
    let G_Trim = S.trim;
    /*#}#*/
    /*#if(modules.router||modules.state){#*/
    Inc('../tmpl/dispatcher');
    /*#}#*/
    /*#if(modules.updater&&modules.updaterAsync){#*/
    Inc('../tmpl/async');
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe){#*/
    DOM[G_PROTOTYPE].invokeView = function (name, args) {
        let returned = [], e, vf;
        for (e of this) {
            vf = e.vframe;
            returned.push(vf && vf.invoke(name, args));
        }
        return returned;
    };
    /*#}#*/

    Inc('../tmpl/body');

    /*#if(modules.updater){#*/
    /*#if(!modules.updaterVDOM&&!modules.updaterDOM){#*/
    Inc('../tmpl/tmpl');
    /*#}#*/
    /*#if(modules.updaterVDOM){#*/
    /*#if(modules.updaterQuick){#*/
    Inc('../tmpl/quick');
    /*#}else{#*/
    Inc('../tmpl/tovdom');
    /*#}#*/
    Inc('../tmpl/vdom');
    /*#}else if(modules.updaterDOM){#*/
    Inc('../tmpl/dom');
    /*#}#*/
    Inc('../tmpl/updater');
    /*#}#*/
    /*#if(modules.viewSlot){#*/
    Inc('../tmpl/slot');
    /*#}#*/
    Inc('../tmpl/view');

    /*#if(modules.service){#*/
    let G_Type = S.type;
    let G_Now = S.now;
    Inc('../tmpl/service');
    /*#}#*/
    Inc('../tmpl/base');
    /*#if(modules.defaultView){#*/
    S.add(MxGlobalView, () => View.extend());
    /*#}#*/
    return Magix;
}, {
        requires: ['event', 'dom', 'node']
    });