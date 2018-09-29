let View_EvtMethodReg = /^(\$?)([^<]*)<([^>]+)>(?:&(.+))?$/;
/*#if(modules.viewProtoMixins){#*/
let processMixinsSameEvent = (exist, additional, temp) => {
    if (exist['@{~viewmixin#list}']) {
        temp = exist;
    } else {
        temp = function (e) {
            G_ToTry(temp['@{~viewmixin#list}'], e, this);
        };
        temp['@{~viewmixin#list}'] = [exist];
        temp['@{~viewmixin#is.mixin}'] = 1;
    }
    temp['@{~viewmixin#list}'] = temp['@{~viewmixin#list}'].concat(additional['@{~viewmixin#list}'] || additional);
    return temp;
};
/*#}#*/
//let View_MxEvt = /\smx-(?!view|vframe)[a-z]+\s*=\s*"/g;
/*#if(modules.resource){#*/
let View_DestroyAllResources = (me, lastly) => {
    let cache = me['@{view#resource}'], //reources
        p, c;
    for (p in cache) {
        c = cache[p];
        if (lastly || c.x) { //destroy
            View_DestroyResource(cache, p, 1);
        }
    }
};
let View_DestroyResource = (cache, key, callDestroy, old) => {
    let o = cache[key],
        fn, res;
    if (o && o != old) {
        //let processed=false;
        res = o.e; //entity
        fn = res.destroy;
        if (fn && callDestroy) {
            G_ToTry(fn, G_EMPTY_ARRAY, res);
        }
        delete cache[key];
    }
    return res;
};
/*#}#*/
let View_WrapMethod = (prop, fName, short, fn, me) => {
    fn = prop[fName];
    prop[fName] = prop[short] = function (...args) {
        me = this;
        if (me['@{view#sign}'] > 0) { //signature
            me['@{view#sign}']++;
            /*#if(!modules.mini){#*/
            me.fire('rendercall');
            /*#}#*/
            /*#if(modules.resource){#*/
            View_DestroyAllResources(me);
            /*#}#*/
            /*#if(!modules.keepHTML){#*/
            G_ToTry(fn, args, me);
            /*#}else{#*/
            fn.apply(me, args);
            /*#}#*/
        }
    };
};
let View_DelegateEvents = (me, destroy) => {
    let e, { '@{view#events.object}': eventsObject,
        '@{view#selector.events.object}': selectorObject,
        '@{view#events.list}': eventsList, id } = me; //eventsObject
    for (e in eventsObject) {
        Body_DOMEventBind(e, selectorObject[
            e], destroy);
    }
    for (e of eventsList) {
        G_DOMEventLibBind(e.e, e.n, G_DOMGlobalProcessor, destroy, {
            i: id,
            v: me,
            f: e.f,
            m: e.m,
            e: e.e
        });
    }
};
let View_Globals = {
    win: G_WINDOW,
    doc: G_DOCUMENT
};
/*#if(modules.viewProtoMixins||modules.viewMerge){#*/
let View_MergeMixins = (mixins, proto, ctors) => {
    let temp = {}, p, node, fn, exist;
    for (node of mixins) {
        for (p in node) {
            fn = node[p];
            exist = temp[p];
            if (p == 'ctor') {
                ctors.push(fn);
                continue;
            } else if (View_EvtMethodReg.test(p)) {
                if (exist) {
                    fn = processMixinsSameEvent(exist, fn);
                } else {
                    fn['@{~viewmixin#is.mixin}'] = 1;
                }
            } else if (DEBUG && exist && p != 'extend' && p != G_SPLITER) { //只在开发中提示
                Magix_Cfg.error(Error('merge duplicate:' + p));
            }
            temp[p] = fn;
        }
    }
    for (p in temp) {
        if (!G_Has(proto, p)) {
            proto[p] = temp[p];
        }
    }
};
/*#}#*/
function merge(...args) {
    let me = this, _ = me._ || (me._ = []);
    View_MergeMixins(args, me[G_PROTOTYPE], _);
    return me;
}

function extend(props, statics) {
    let me = this;
    props = props || {};
    let ctor = props.ctor;
    /*#if(modules.viewProtoMixins){#*/
    let ctors = [];
    if (ctor) ctors.push(ctor);
    /*#}#*/
    function NView(nodeId, ownerVf, initParams, node/*#if(modules.viewChildren&&modules.updaterQuick){#*/, vnode/*#}#*//*#if(modules.viewChildren){#*/, parentVf /*#}#*//*#if(modules.viewProtoMixins){#*/, mixinCtors /*#}#*/, cs, z, params/*#if(modules.viewProtoMixins){#*/, concatCtors/*#}#*/) {
        me.call(z = this, nodeId, ownerVf, initParams, node/*#if(modules.viewChildren&&modules.updaterQuick){#*/, vnode/*#}#*//*#if(modules.viewChildren){#*/, parentVf/*#}#*//*#if(modules.viewProtoMixins){#*/, mixinCtors/*#}#*/);
        cs = NView._;
        /*#if(modules.viewProtoMixins){#*/
        params = [initParams, {
            node,/*#if(modules.viewChildren&&modules.updaterQuick){#*/
            vnode,
            /*#}#*/
            deep: !z.tmpl/*#if(modules.viewChildren){#*/,
            map: Children_Wrap(/*#if(modules.updaterQuick){#*/vnode/*#}else{#*/node/*#}#*/, parentVf)/*#}#*/
        }];
        if (cs) G_ToTry(cs, params, z);
        concatCtors = ctors.concat(mixinCtors);
        if (concatCtors.length) {
            G_ToTry(concatCtors, params, z);
        }
        /*#}else{#*/
        params = {
            node,/*#if(modules.viewChildren&&modules.updaterQuick){#*/
            vnode,
            /*#}#*/
            deep: !z.tmpl/*#if(modules.viewChildren){#*/,
            map: Children_Wrap(/*#if(modules.updaterQuick){#*/vnode/*#}else{#*/node/*#}#*/, parentVf)/*#}#*/
        };
        if (cs) G_ToTry(cs, [initParams, params], z);
        if (ctor) ctor.call(z, initParams, params);
        /*#}#*/
    }
    NView.merge = merge;
    NView.extend = extend;
    return G_Extend(NView, me, props, statics);
}
/**
 * 预处理view
 * @param  {View} oView view子类
 * @param  {Vom} vom vom
 */
let View_Prepare = oView => {
    if (!oView[G_SPLITER]) { //只处理一次
        oView[G_SPLITER] = /*#if(modules.viewProtoMixins){#*/[] /*#}else{#*/ 1 /*#}#*/;
        let prop = oView[G_PROTOTYPE],
            currentFn, matches, selectorOrCallback, events, eventsObject = {},
            eventsList = [],
            selectorObject = {},
            node, isSelector, p, item, mask, mod, modifiers;

        /*#if(modules.viewProtoMixins){#*/
        matches = prop.mixins;
        if (matches) {
            View_MergeMixins(matches, prop, oView[G_SPLITER]);
        }
        /*#}#*/
        for (p in prop) {
            currentFn = prop[p];
            matches = p.match(View_EvtMethodReg);
            if (matches) {
                [, isSelector, selectorOrCallback, events, modifiers] = matches;
                mod = {};
                if (modifiers) {
                    modifiers = modifiers.split(G_COMMA);
                    for (item of modifiers) {
                        mod[item] = true;
                    }
                }
                events = events.split(G_COMMA);
                for (item of events) {
                    node = View_Globals[selectorOrCallback];
                    mask = 1;
                    if (isSelector) {
                        if (node) {
                            eventsList.push({
                                f: currentFn,
                                e: node,
                                n: item,
                                m: mod
                            });
                            continue;
                        }
                        mask = 2;
                        node = selectorObject[item];
                        if (!node) {
                            node = selectorObject[item] = [];
                        }
                        if (!node[selectorOrCallback]) {
                            node[selectorOrCallback] = 1;
                            node.push(selectorOrCallback);
                        }
                    }
                    eventsObject[item] = eventsObject[item] | mask;
                    item = selectorOrCallback + G_SPLITER + item;
                    node = prop[item];
                    /*#if(modules.viewProtoMixins){#*/
                    //for in 就近遍历，如果有则忽略
                    if (!node) { //未设置过
                        prop[item] = currentFn;
                    } else if (node['@{~viewmixin#is.mixin}']) { //现有的方法是mixins上的
                        if (currentFn['@{~viewmixin#is.mixin}']) { //2者都是mixins上的事件，则合并
                            prop[item] = processMixinsSameEvent(currentFn, node);
                        } else if (G_Has(prop, p)) { //currentFn方法不是mixin上的，也不是继承来的，在当前view上，优先级最高
                            prop[item] = currentFn;
                        }
                    }
                    /*#}else{#*/
                    if (!node) {
                        prop[item] = currentFn;
                    }
                    /*#}#*/
                }
            }
        }
        //console.log(prop);
        View_WrapMethod(prop, 'render', '@{view#render.short}');
        prop['@{view#events.object}'] = eventsObject;
        prop['@{view#events.list}'] = eventsList;
        prop['@{view#selector.events.object}'] = selectorObject;
        prop['@{view#assign.fn}'] = prop.assign;
    }
    /*#if(modules.viewProtoMixins){#*/
    return oView[G_SPLITER];
    /*#}#*/
};
/*#if(modules.router){#*/
let View_IsObserveChanged = view => {
    let loc = view['@{view#observe.router}'];
    let res, i, params;
    if (loc.f) {
        if (loc.p) {
            res = Router_LastChanged[G_PATH];
        }
        if (!res && loc.k) {
            params = Router_LastChanged[G_PARAMS];
            for (i of loc.k) {
                res = G_Has(params, i);
                if (res) break;
            }
        }
        // if (res && loc.c) {
        //     loc.c.call(view);
        // }
    }
    return res;
};
/*#}#*/
/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @example
 * // 关于事件:
 * // html写法：
 *
 * //  &lt;input type="button" mx-click="test({id:100,name:'xinglie'})" value="test" /&gt;
 * //  &lt;a href="http://etao.com" mx-click="test({com:'etao.com'})"&gt;http://etao.com&lt;/a&gt;
 *
 * // js写法：
 *
 *     'test&lt;click&gt;':function(e){
 *          e.preventDefault();
 *          //e.current 处理事件的dom节点(即带有mx-click属性的节点)
 *          //e.target 触发事件的dom节点(即鼠标点中的节点，在current里包含其它节点时，current与target有可能不一样)
 *          //e.params  传递的参数
 *          //e.params.com,e.params.id,e.params.name
 *      },
 *      'test&lt;mousedown&gt;':function(e){
 *
 *       }
 *
 *  //上述示例对test方法标注了click与mousedown事件，也可以合写成：
 *  'test&lt;click,mousedown&gt;':function(e){
 *      alert(e.type);//可通过type识别是哪种事件类型
 *  }
 */


function View(id, owner, ops, node, me) {
    me = this;
    me.owner = owner;
    me.id = id;
    /*#if(modules.router){#*/
    me['@{view#observe.router}'] = {
        k: []
    };
    /*#}#*/
    /*#if(modules.resource){#*/
    me['@{view#resource}'] = {};
    /*#}#*/
    me['@{view#sign}'] = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
    /*#if(modules.updater){#*/
    me.updater = me['@{view#updater}'] = new Updater(me.id);
    /*#}#*/
    /*#if(modules.viewMerge){#*/
    id = View._;
    if (id) G_ToTry(id, [ops, {
        node,
        deep: !me.tmpl
    }], me);
    /*#}#*/
}
G_Assign(View, {
    /**
     * @lends View
     */
    /**
     * 扩展View
     * @param  {Object} props 扩展到原型上的方法
     * @example
     * define('app/tview',function(require){
     *     let Magix = require('magix');
     *     Magix.View.merge({
     *         ctor:function(){
     *             this.$attr='test';
     *         },
     *         test:function(){
     *             alert(this.$attr);
     *         }
     *     });
     * });
     * //加入Magix.config的exts中
     *
     *  Magix.config({
     *      //...
     *      exts:['app/tview']
     *
     *  });
     *
     * //这样完成后，所有的view对象都会有一个$attr属性和test方法
     * //当然上述功能也可以用继承实现，但继承层次太多时，可以考虑使用扩展来消除多层次的继承
     * //同时当项目进行中发现所有view要实现某个功能时，该方式比继承更快捷有效
     *
     *
     */
    /*#if(modules.viewMerge){#*/
    merge,
    /*#}#*/
    /**
     * 继承
     * @param  {Object} [props] 原型链上的方法或属性对象
     * @param {Function} [props.ctor] 类似constructor，但不是constructor，当我们继承时，你无需显示调用上一层级的ctor方法，magix会自动帮你调用
     * @param {Array} [props.mixins] mix到当前原型链上的方法对象，该对象可以有一个ctor方法用于初始化
     * @param  {Object} [statics] 静态对象或方法
     * @example
     * let Magix = require('magix');
     * let Sortable = {
     *     ctor: function() {
     *         console.log('sortable ctor');
     *         //this==当前mix Sortable的view对象
     *         this.on('destroy', function() {
     *             console.log('dispose')
     *         });
     *     },
     *     sort: function() {
     *         console.log('sort');
     *     }
     * };
     * module.exports = Magix.View.extend({
     *     mixins: [Sortable],
     *     ctor: function() {
     *         console.log('view ctor');
     *     },
     *     render: function() {
     *         this.sort();
     *     }
     * });
     */
    extend
});
G_Assign(View[G_PROTOTYPE] /*#if(!modules.mini){#*/, MEvent/*#}#*/, {
    /**
     * @lends View#
     */
    /*#if(modules.viewInit){#*/
    /**
     * 初始化调用的方法
     * @beta
     * @module viewInit
     * @param {Object} extra 外部传递的数据对象
     */
    init: G_NOOP,
    /*#}#*/
    /*
     * 包装mx-event事件，比如把mx-click="test<prevent>({key:'field'})" 包装成 mx-click="magix_vf_root^test<prevent>({key:'field})"，以方便识别交由哪个view处理
     * @function
     * @param {String} html 处理的代码片断
     * @param {Boolean} [onlyAddPrefix] 是否只添加前缀
     * @return {String} 处理后的字符串
     * @example
     * View.extend({
     *     'del&lt;click&gt;':function(e){
     *         S.one(G_HashKey+e.currentId).remove();
     *     },
     *     'addNode&lt;click&gt;':function(e){
     *         let tmpl='&lt;div mx-click="del"&gt;delete&lt;/div&gt;';
     *         //因为tmpl中有mx-click，因此需要下面这行代码进行处理一次
     *         tmpl=this.wrapEvent(tmpl);
     *         S.one(G_HashKey+e.currentId).append(tmpl);
     *     }
     * });
     */
    /**
     * 通知当前view即将开始进行html的更新
     * @param {String} [id] 哪块区域需要更新，默认整个view
     */
    beginUpdate(id, me) {
        me = this;
        if (me['@{view#sign}'] > 0 && me['@{view#rendered}']) {
            me.owner.unmountZone(id, 1);
            /*me.fire('prerender', {
                id: id
            });*/
        }
    },
    /**
     * 通知当前view结束html的更新
     * @param {String} [id] 哪块区域结束更新，默认整个view
     */
    endUpdate(id, inner, me /*#if(modules.linkage){#*/, o, f /*#}#*/) {
        me = this;
        if (me['@{view#sign}'] > 0) {
            id = id || me.id;
            /*me.fire('rendered', {
                id
            });*/
            if (inner) {
                f = inner;
            } else {
                /*#if(modules.linkage){#*/
                f = me['@{view#rendered}'];
                /*#}#*/
                me['@{view#rendered}'] = 1;
            }
            /*#if(modules.linkage){#*/
            o = me.owner;
            o.mountZone(id, inner);
            if (!f) {
                /*#if(modules.es3){#*/
                Timeout(me.wrapAsync(() => {
                    Vframe_RunInvokes(o);
                }), 0);
                /*#}else{#*/
                Timeout(me.wrapAsync(Vframe_RunInvokes), 0, o);
                /*#}#*/
            }
            /*#}else{#*/
            me.owner.mountZone(id, inner);
            /*#}#*/
        }
    },
    /*#if(!modules.mini){#*/
    /**
     * 包装异步回调
     * @param  {Function} fn 异步回调的function
     * @return {Function}
     * @example
     * render:function(){
     *     setTimeout(this.wrapAsync(function(){
     *         //codes
     *     }),50000);
     * }
     * // 为什么要包装一次？
     * // 在单页应用的情况下，可能异步回调执行时，当前view已经被销毁。
     * // 比如上例中的setTimeout，50s后执行回调，如果你的回调中去操作了DOM，
     * // 则会出错，为了避免这种情况的出现，可以调用view的wrapAsync包装一次。
     * // (该示例中最好的做法是在view销毁时清除setTimeout，
     * // 但有时候你很难控制回调的执行，比如JSONP，所以最好包装一次)
     */
    wrapAsync(fn, context) {
        let me = this;
        let sign = me['@{view#sign}'];
        return (...a) => {
            if (sign > 0 && sign == me['@{view#sign}']) {
                return fn.apply(context || me, a);
            }
        };
    },
    /*#}#*/
    /*#if(modules.router){#*/
    /**
     * 监视地址栏中的参数或path，有变动时，才调用当前view的render方法。通常情况下location有变化不会引起当前view的render被调用，所以你需要指定地址栏中哪些参数有变化时才引起render调用，使得view只关注与自已需要刷新有关的参数
     * @param {Array|String|Object} params  数组字符串
     * @param {Boolean} [isObservePath] 是否监视path
     * @beta
     * @module router
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observeLocation('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的render被调用
     *          this.observeLocation(null,true);//关注path的变化
     *          //也可以写成下面的形式
     *          //this.observeLocation('page,rows',true);
     *          //也可以是对象的形式
     *          this.observeLocation({
     *              path: true,
     *              params:['page','rows']
     *          });
     *      },
     *      render:function(){
     *          let loc=Magix.Router.parse();
     *          console.log(loc);//获取地址解析出的对象
     *          let diff=Magix.Router.diff();
     *          console.log(diff);//获取当前地址与上一个地址差异对象
     *      }
     * });
     */
    observeLocation(params, isObservePath) {
        let me = this,
            loc;
        loc = me['@{view#observe.router}'];
        loc.f = 1;
        if (G_IsObject(params)) {
            isObservePath = params[G_PATH];
            params = params[G_PARAMS];
        }
        //if (isObservePath) {
        loc.p = isObservePath;
        //}
        if (params) {
            loc.k = (params + G_EMPTY).split(G_COMMA);
        }
    },
    /*#}#*/
    /*#if(modules.state){#*/
    /**
     * 监视Magix.State中的数据变化
     * @param  {String|Array} keys 数据对象的key
     */
    observeState(keys) {
        this['@{view#observe.state}'] = (keys + G_EMPTY).split(G_COMMA);
    },
    /*#}#*/
    /*#if(modules.resource){#*/
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String} key 资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} [destroyWhenCalleRender] 调用render方法时是否销毁托管的资源
     * @return {Object} 返回托管的资源
     * @beta
     * @module resource
     * @example
     * View.extend({
     *     render: function(){
     *         let me = this;
     *         let dropdown = new Dropdown();
     *
     *         me.capture('dropdown',dropdown,true);
     *     },
     *     getTest: function(){
     *         let dd = me.capture('dropdown');
     *         console.log(dd);
     *     }
     * });
     */
    capture(key, res, destroyWhenCallRender, cache) {
        cache = this['@{view#resource}'];
        if (res) {
            View_DestroyResource(cache, key, 1, res);
            cache[key] = {
                e: res,
                x: destroyWhenCallRender
            };
            //service托管检查
            if (DEBUG && res && (res.id + G_EMPTY).indexOf('\x1es') === 0) {
                res['@{service#captured}'] = 1;
                if (!destroyWhenCallRender) {
                    console.warn('beware! May be you should set destroyWhenCallRender = true');
                }
            }
        } else {
            cache = cache[key];
            res = cache && cache.e;
        }
        return res;
    },
    /**
     * 释放管理的资源
     * @param  {String} key 托管时的key
     * @param  {Boolean} [destroy] 是否销毁资源
     * @return {Object} 返回托管的资源，无论是否销毁
     * @beta
     * @module resource
     */
    release(key, destroy) {
        return View_DestroyResource(this['@{view#resource}'], key, destroy);
    },
    /*#}#*/
    /*#if(modules.tipRouter){#*/
    /**
     * 离开提示
     * @param  {String} msg 提示消息
     * @param  {Function} fn 是否提示的回调
     * @beta
     * @module tipRouter
     * @example
     * let Magix = require('magix');
     * module.exports = Magix.View.extend({
     *     init:function(){
     *         this.leaveTip('页面数据未保存，确认离开吗？',function(){
     *             return true;//true提示，false，不提示
     *         });
     *     }
     * });
     */
    leaveTip(msg, fn) {
        let me = this;
        let changeListener = e => {
            let a = '@{~tip#router.change}', // a for router change
                b = '@{~tip#view.unload}'; // b for viewunload change
            if (e.type != G_CHANGE) {
                a = '@{~tip#view.unload}';
                b = '@{~tip#router.change}';
            }
            if (changeListener[a]) {
                e.prevent();
                e.reject();
            } else if (fn()) {
                e.prevent();
                changeListener[b] = 1;
                me.leaveConfirm(() => {
                    changeListener[b] = 0;
                    e.resolve();
                }, () => {
                    changeListener[b] = 0;
                    e.reject();
                }, msg);
            }
        };
        let unloadListener = e => {
            if (fn()) {
                e.msg = msg;
            }
        };
        Router.on(G_CHANGE, changeListener);
        Router.on(G_PAGE_UNLOAD, unloadListener);
        me.on('unload', changeListener);
        me.on('destroy', () => {
            Router.off(G_CHANGE, changeListener);
            Router.off(G_PAGE_UNLOAD, unloadListener);
        });
    },
    /*#}#*/
    /*#if(modules.share){#*/
    /**
     * 向子(孙)view公开数据
     * @param  {String} key key
     * @param  {Object} data 数据
     * @beta
     * @module share
     */
    share(key, data) {
        let me = this;
        if (!me['@{view#shared.data}']) {
            me['@{view#shared.data}'] = {};
        }
        me['@{view#shared.data}'][key] = data;
    },
    /**
     * 获取祖先view上公开的数据
     * @param  {String} key key
     * @return {Object}
     * @beta
     * @module share
     * @example
     * //父view
     * render:function(){
     *     this.share('x',{a:20});
     * }
     * //子view
     * render:function(){
     *     let d=this.getShared('x');
     * }
     */
    getShared(key) {
        let me = this;
        let sd = me['@{view#shared.data}'];
        let exist;
        if (sd) {
            exist = G_Has(sd, key);
            if (exist) {
                return sd[key];
            }
        }
        let vf = me.owner.parent();
        if (vf) {
            return vf.invoke('getShared', key);
        }
    },
    /*#}#*/
    /**
     * 设置view的html内容
     * @param {String} id 更新节点的id
     * @param {Strig} html html字符串
     * @example
     * render:function(){
     *     this.setHTML(this.id,this.tmpl);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
     * }
     */
    /*
        Q:为什么删除setHTML?
        A:统一使用updater更新界面。
        关于api的分级，高层api更内聚，一个api完成很多功能。方便开发者，但不灵活。
        底层api职责更单一，一个api只完成一个功能，灵活，但不方便开发者
        更新界面来讲，updater是一个高层api，但是有些功能却无法完成，如把view当成壳子或容器渲染第三方的组件，组件什么时间加载完成、渲染、更新了dom、如何通知magix等，这些问题在updater中是无解的，而setHTML这个api又不够底层，同样也无法完成一些功能，所以这个api食之无味，故删除
     */
    /*setHTML(id, html) {
        let me = this,
            n, i = me.id;
        me.beginUpdate(id);
        if (me['@{view#sign}'] > 0) {
            n = G_GetById(id);
            if (n) G_HTML(n, View_SetEventOwner(html, i), i);
        }
        me.endUpdate(id);
        me.fire('domready');
    }*/
    /**
     * 渲染view，供最终view开发者覆盖
     * @function
     */
    render: G_NOOP
    /**
     * 当前view的dom就绪后触发
     * @name View#domready
     * @event
     * @param {Object} e view 完成渲染后触发
     */

    /**
     * view销毁时触发
     * @name View#destroy
     * @event
     * @param {Object} e
     */

    /**
     * 异步更新ui的方法(render)被调用前触发
     * @name View#rendercall
     * @event
     * @param {Object} e
     */
});
Magix.View = View;