KISSY.add('magix', (S, SE, DOM, SNode) => {
    if (typeof DEBUG == 'undefined') window.DEBUG = true;
    let $ = S.all;
    let G_IsObject = S.isObject;
    let G_IsArray = S.isArray;
    Inc('../tmpl/variable');
    Inc('../tmpl/cache');
    let G_Require = (name, fn) => {
        S.use(name && (name + G_EMPTY), (S, ...args) => {
            if (fn) {
                CallFunction(fn, args, S);
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
    let G_DOMEventLibBind = (node, type, cb, remove, scope) => {
        if (scope) {
            SE[`${remove ? 'un' : G_EMPTY}delegate`](node, type, cb, scope);
        } else {
            SE[remove ? 'detach' : 'on'](node, type, cb, scope);
        }
    };

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
    /*#if(modules.router||modules.state){#*/
    Inc('../tmpl/dispatcher');
    /*#}#*/
    /*#if(modules.updater&&modules.updaterAsync){#*/
    Inc('../tmpl/async');
    /*#}#*/
    Inc('../tmpl/vframe');
    /*#if(modules.nodeAttachVframe){#*/
    SNode[G_PROTOTYPE].invokeView = function (name, args) {
        let returned = [], e, vf;
        for (e of this) {
            vf = e.vframe;
            returned.push(vf && vf.invoke(name, args));
        }
        return returned;
    };
    /*#}#*/

    Inc('../tmpl/body');

    /*#if(modules.viewChildren){#*/
    Inc('../tmpl/children');
    /*#}#*/
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
    Inc('../tmpl/view');

    /*#if(modules.service){#*/
    let G_Type = S.type;
    let G_Now = S.now;
    Inc('../tmpl/service');
    /*#if(modules.servicePush){#*/
    Inc('../tmpl/svsx');
    /*#}#*/
    /*#}#*/
    Inc('../tmpl/base');
    /*#if(modules.defaultView){#*/
    S.add(MxGlobalView, () => View.extend());
    /*#}#*/
    return Magix;
}, {
    requires: ['event', 'dom', 'node']
});