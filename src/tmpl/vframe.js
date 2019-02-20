let Vframe_RootVframe;
let Vframe_GlobalAlter;
let Vframe_Vframes = {};
let Vframe_Promise = { then: f => f() };
let Vframe_NotifyCreated = vframe => {
    if (!vframe['@{vframe#destroyed}'] && !vframe['@{vframe#hold.fire}'] && vframe['@{vframe#children.count}'] == vframe['@{vframe#children.ready.count}']) { //childrenCount === readyCount
        if (!vframe['@{vframe#children.created}']) { //childrenCreated
            vframe['@{vframe#children.created}'] = 1; //childrenCreated
            vframe['@{vframe#children.altered}'] = 0; //childrenAlter
            /*#if(!modules.mini){#*/
            vframe.fire('created'); //不在view上派发事件，如果view需要绑定，则绑定到owner上，view一般不用该事件，如果需要这样处理：this.owner.oncreated=function(){};this.ondestroy=function(){this.owner.off('created')}
            /*#}#*/
        }
        let { id, pId } = vframe, p = Vframe_Vframes[pId];
        if (p && !G_Has(p['@{vframe#children.ready}'], id)) { //readyChildren
            p['@{vframe#children.ready}'][id] = 1; //readyChildren
            p['@{vframe#children.ready.count}']++; //readyCount
            Vframe_NotifyCreated(p);
        }
    }
};
let Vframe_NotifyAlter = (vframe, e) => {
    if (!vframe['@{vframe#children.altered}'] && vframe['@{vframe#children.created}']) { //childrenAlter childrenCreated 当前vframe触发过created才可以触发alter事件
        vframe['@{vframe#children.created}'] = 0; //childrenCreated
        vframe['@{vframe#children.altered}'] = 1; //childreAleter
        /*#if(!modules.mini){#*/
        vframe.fire('alter', e);
        /*#}#*/
        let { id, pId } = vframe, p = Vframe_Vframes[pId];
        //let vom = vframe.owner;
        if (p && G_Has(p['@{vframe#children.ready}'], id)) { //readyMap
            p['@{vframe#children.ready.count}']--; //readyCount
            delete p['@{vframe#children.ready}'][id]; //readyMap
            Vframe_NotifyAlter(p, e);
        }
    }
};
let Vframe_TranslateQuery = (pId, src, params, pVf) => {
    pVf = Vframe_Vframes[pId];
    pVf = pVf && pVf['@{vframe#view.entity}'];
    pVf = pVf ? pVf['@{view#updater}']['@{updater#ref.data}'] : {};
    if (src.indexOf(G_SPLITER) > 0) {
        G_TranslateData(pVf, params);
    }
    return pVf;
};
/**
 * 获取根vframe;
 * @return {Vframe}
 * @private
 */
let Vframe_Root = (rootId, e) => {
    if (!Vframe_RootVframe) {
        /*
            尽可能的延迟配置，防止被依赖时，配置信息不正确
        */
        G_DOCBODY = G_DOCUMENT.body;

        rootId = Magix_Cfg.rootId;
        e = G_GetById(rootId);
        if (!e) {
            G_DOCBODY.id = rootId;
        }
        Vframe_RootVframe = new Vframe(rootId);
    }
    return Vframe_RootVframe;
};


let Vframe_AddVframe = (id, vframe) => {
    if (!G_Has(Vframe_Vframes, id)) {
        Vframe_Vframes[id] = vframe;
        /*#if(!modules.mini){#*/
        Vframe.fire('add', {
            vframe
        });
        /*#}#*/
        /*#if(modules.nodeAttachVframe){#*/
        id = G_GetById(id);
        if (id) id.vframe = vframe;
        /*#}#*/
    }
};
/*#if(modules.linkage){#*/
let Vframe_RunInvokes = (vf, list, o) => {
    list = vf['@{vframe#invoke.list}']; //invokeList
    while (list.length) {
        o = list.shift();
        if (!o.r) { //remove
            vf.invoke(o.n, o.a); //name,arguments
        }
        delete list[o.k]; //key
    }
};
/*#}#*/
let Vframe_Cache = [];
let Vframe_RemoveVframe = (id, fcc, vframe) => {
    vframe = Vframe_Vframes[id];
    if (vframe) {
        delete Vframe_Vframes[id];
        /*#if(!modules.mini){#*/
        Vframe.fire('remove', {
            vframe,
            fcc //fireChildrenCreated
        });
        /*#}#*/
        if (DEBUG) {
            let nodes = G_DOCUMENT.querySelectorAll('#' + id);
            if (nodes.length > 1) {
                Magix_Cfg.error(Error(`remove vframe error. dom id:"${id}" duplicate`));
            }
        }
        id = G_GetById(id);
        if (id) {
            id['@{node#mounted.vframe}'] = 0;
            /*#if(modules.nodeAttachVframe){#*/
            id.vframe = 0;
            /*#}#*/
            /*#if(modules.updaterDOM){#*/
            id['@{node#auto.id}'] = 0;
            /*#}#*/
        }
    }
};
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {String} path 当前view的路径名，包括参数
 * @property {String} pId 父vframe的id，如果是根节点则为undefined
 */
function Vframe(id, pId, /*#if(modules.vframeHost){#*/hId,/*#}#*/ me) {
    me = this;
    me.id = id;
    if (DEBUG) {
        let bad = 0;
        if (!pId && id != Magix_Cfg.rootId) {
            bad = 1;
        }
        if (!bad && id && pId) {
            let parent = Vframe_Vframes[pId];
            if (!parent || !parent['@{vframe#children}'][id]) {
                bad = 1;
            }
        }
        if (bad) {
            console.error('beware! Avoid use new Magix.Vframe() outside');
        }
    }
    //me.vId=id+'_v';
    me['@{vframe#children}'] = {}; //childrenMap
    me['@{vframe#children.count}'] = 0; //childrenCount
    me['@{vframe#children.ready.count}'] = 0; //readyCount
    me['@{vframe#sign}'] = me['@{vframe#sign}'] || 1; //signature
    me['@{vframe#children.ready}'] = {}; //readyMap
    /*#if(modules.linkage){#*/
    me['@{vframe#invoke.list}'] = []; //invokeList
    /*#}#*/
    /*#if(modules.updaterAsync){#*/
    me['@{vframe#async.priority}'] = G_COUNTER++;
    /*#}#*/
    me.pId = pId;

    /*#if(modules.vframeHost){#*/
    me.hId = hId;
    /*#}#*/
    Vframe_AddVframe(id, me);
}
/*#if(!modules.mini){#*/
G_Assign(Vframe, {
    /**
     * @lends Vframe
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all() {
        return Vframe_Vframes;
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe|undefined} vframe对象
     */
    get(id) {
        return Vframe_Vframes[id];
    }
    /**
     * 注册vframe对象时触发
     * @name Vframe.add
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
    /**
     * 删除vframe对象时触发
     * @name Vframe.remove
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     * @param {Boolean} e.fcc 是否派发过created事件
     */
}/*#if(!modules.mini){#*/, MEvent/*#}#*/);
/*#}#*/
G_Assign(Vframe[G_PROTOTYPE]/*#if(!modules.mini){#*/, MEvent/*#}#*/, {
    /**
     * @lends Vframe#
     */
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
     * @param {Object|Null} [viewInitParams] 调用view的init方法时传递的参数
     */
    mountView(viewPath, viewInitParams /*,keepPreHTML*/) {
        let me = this;
        let id = me.id;
        let node = G_GetById(id),
            pId = /*#if(modules.vframeHost){#*/me.hId ||/*#}#*/ me.pId, po, sign, view, params /*#if(modules.viewProtoMixins){#*/, ctors /*#}#*/ /*#if(modules.updater){#*/, parentVf/*#}#*//*#if(modules.viewChildren&&modules.updaterQuick){#*/, vnode/*#}#*/;
        if (!me['@{vframe#alter.node}'] && node) { //alter
            me['@{vframe#alter.node}'] = 1;
            me['@{vframe#template}'] = node.innerHTML; //.replace(ScriptsReg, ''); template
        }
        me.unmountView(/*keepPreHTML*/);
        me['@{vframe#destroyed}'] = 0; //destroyed 详见unmountView
        po = G_ParseUri(viewPath || G_EMPTY);
        view = po[G_PATH];
        if (node && view) {
            me[G_PATH] = viewPath;
            params = po[G_PARAMS];
            /*#if(modules.updater){#*/
            /*#if(modules.viewChildren){#*/parentVf = /*#}#*/Vframe_TranslateQuery(pId, viewPath, params);
            me['@{vframe#view.path}'] = po[G_PATH];
            /*#}#*/
            G_Assign(params, viewInitParams);
            sign = me['@{vframe#sign}'];
            G_Require(view, TView => {
                if (sign == me['@{vframe#sign}']) { //有可能在view载入后，vframe已经卸载了
                    if (!TView) {
                        return Magix_Cfg.error(Error(`id:${id} cannot load:${view}`));
                    }
                    /*#if(modules.viewProtoMixins){#*/
                    ctors = View_Prepare(TView);
                    /*#}else{#*/
                    View_Prepare(TView);
                    /*#}#*/
                    /*#if(modules.viewChildren&&modules.updaterQuick){#*/
                    vnode = node['@{node#vnode}'];
                    /*#}#*/
                    view = new TView(id, me, params, node/*#if(modules.viewChildren&&modules.updaterQuick){#*/, vnode/*#}#*//*#if(modules.viewChildren){#*/, parentVf/*#}#*//*#if(modules.viewProtoMixins){#*/, ctors /*#}#*/);

                    if (DEBUG) {
                        let viewProto = TView.prototype;
                        let importantProps = {
                            id: 1,
                            updater: 1,
                            owner: 1,
                            '@{view#observe.router}': 1,
                            '@{view#resource}': 1,
                            '@{view#sign}': 1,
                            '@{view#updater}': 1
                        };
                        for (let p in view) {
                            if (G_Has(view, p) && viewProto[p]) {
                                throw new Error(`avoid write ${p} at file ${viewPath}!`);
                            }
                        }
                        view = Safeguard(view, null, (key, value) => {
                            if (G_Has(viewProto, key) ||
                                (G_Has(importantProps, key) &&
                                    (key != '@{view#sign}' || !isFinite(value)) &&
                                    (key != 'owner' || value !== 0))) {
                                throw new Error(`avoid write ${key} at file ${viewPath}!`);
                            }
                        }, true);
                    }
                    me['@{vframe#view.entity}'] = view;
                    /*#if(modules.router||modules.state){#*/
                    me['@{vframe#update.tag}'] = Dispatcher_UpdateTag;
                    /*#}#*/
                    View_DelegateEvents(view);
                    /*#if(modules.viewInit){#*/
                    /*#if(modules.viewInitAsync){#*/
                    params =/*#}#*/ G_ToTry(view.init, [params, {
                        node,
                        /*#if(modules.updaterQuick&&modules.viewChildren){#*/
                        vnode,
                        /*#}#*/
                        deep: !view.tmpl/*#if(modules.viewChildren){#*/,
                        map: Children_Wrap(/*#if(modules.updaterQuick){#*/vnode/*#}else{#*/node/*#}#*/, parentVf)/*#}#*/
                    }], view);
                    /*#}#*/
                    /*#if(modules.viewInitAsync){#*/
                    if (!params) params = Vframe_Promise;
                    sign = ++me['@{vframe#sign}'];
                    params.then(() => {
                        if (sign == me['@{vframe#sign}']) {
                            /*#}#*/
                            view['@{view#render.short}']();
                            if (!view.tmpl) { //无模板
                                me['@{vframe#alter.node}'] = 0; //不会修改节点，因此销毁时不还原
                                if (!view['@{view#rendered}']) {
                                    view.endUpdate();
                                }
                            }
                            /*#if(modules.viewInitAsync){#*/
                        }
                    });
                    /*#}#*/
                }
            });
        }
    },
    /**
     * 销毁对应的view
     */
    unmountView( /*keepPreHTML*/) {
        let me = this;
        let { '@{vframe#view.entity}': v, id } = me,
            node, reset;
        /*#if(modules.linkage){#*/
        me['@{vframe#invoke.list}'] = []; //invokeList 销毁当前view时，连同调用列表一起销毁
        /*#}#*/
        if (v) {
            if (!Vframe_GlobalAlter) {
                reset = 1;
                Vframe_GlobalAlter = {
                    id
                };
            }
            me['@{vframe#destroyed}'] = 1; //用于标记当前vframe处于$v销毁状态，在当前vframe上再调用unmountZone时不派发created事件
            me.unmountZone(0, 1);
            Vframe_NotifyAlter(me, Vframe_GlobalAlter);

            me['@{vframe#view.entity}'] = 0; //unmountView时，尽可能早的删除vframe上的$v对象，防止$v销毁时，再调用该 vfrmae的类似unmountZone方法引起的多次created
            if (v['@{view#sign}'] > 0) {
                v['@{view#sign}'] = 0;
                delete Body_RangeEvents[id];
                delete Body_RangeVframes[id];
                /*#if(modules.updaterAsync){#*/
                Async_DeleteTask(id);
                /*#}#*/
                /*#if(!modules.mini){#*/
                v.fire('destroy', 0, 1, 1);
                /*#}#*/
                /*#if(modules.resource){#*/
                View_DestroyAllResources(v, 1);
                /*#}#*/
                View_DelegateEvents(v, 1);
                v.owner = 0;
            }
            v['@{view#sign}']--;
            node = G_GetById(id);
            if (node && me['@{vframe#alter.node}'] /*&&!keepPreHTML*/) { //如果$v本身是没有模板的，也需要把节点恢复到之前的状态上：只有保留模板且$v有模板的情况下，这条if才不执行，否则均需要恢复节点的html，即$v安装前什么样，销毁后把节点恢复到安装前的情况
                /*#if(!modules.keepHTML){#*/
                /*#if(modules.naked){#*/
                node.innerHTML = me['@{vframe#template}'];
                /*#}else{#*/
                $(node).html(me['@{vframe#template}']);
                /*#}#*/
                /*#}#*/
            }
            if (reset)
                Vframe_GlobalAlter = 0;
        }
        me['@{vframe#sign}']++; //增加signature，阻止相应的回调，见mountView
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} [viewInitParams] 传递给view init方法的参数
     * @return {Vframe} vframe对象
     * @example
     * // html
     * // &lt;div id="magix_vf_defer"&gt;&lt;/div&gt;
     *
     *
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe(vfId/*#if(modules.vframeHost){#*/, hostId/*#}#*/, viewPath, viewInitParams /*, keepPreHTML*/) {
        let me = this,
            vf, id = me.id, c = me['@{vframe#children}'];
        Vframe_NotifyAlter(me, {
            id: vfId
        }); //如果在就绪的vframe上渲染新的vframe，则通知有变化
        //let vom = me.owner;
        vf = Vframe_Vframes[vfId];
        if (!vf) {
            if (!G_Has(c, vfId)) { //childrenMap,当前子vframe不包含这个id
                /*#if(modules.linkage){#*/
                me['@{vframe#children.list}'] = 0; //childrenList 清空缓存的子列表
                /*#}#*/
                me['@{vframe#children.count}']++; //childrenCount ，增加子节点
            }
            c[vfId] = vfId; //map
            //
            vf = Vframe_Cache.pop();
            if (vf) {
                Vframe.call(vf, vfId, id/*#if(modules.vframeHost){#*/, hostId/*#}#*/);
            } else {
                vf = new Vframe(vfId, id/*#if(modules.vframeHost){#*/, hostId/*#}#*/);
            }
            //vf = Vframe_GetVf(id, me.id);// new Vframe(id, me.id);
        }
        vf.mountView(viewPath, viewInitParams /*,keepPreHTML*/);
        return vf;
    },
    /**
     * 加载某个区域下的view
     * @param {HTMLElement|String} zoneId 节点对象或id
     * @example
     * // html
     * // &lt;div id="zone"&gt;
     * //   &lt;div mx-view="path/to/v1"&gt;&lt;/div&gt;
     * // &lt;/div&gt;
     *
     * view.onwer.mountZone('zone');//即可完成zone节点下的view渲染
     */
    mountZone(zoneId, inner /*,keepPreHTML*/) {
        let me = this;
        let vf, id, vfs = [];
        zoneId = zoneId || me.id;

        let vframes = $(`${G_HashKey}${zoneId} [${G_MX_VIEW}]`);
        /*
            body(#mx-root)
                div(mx-vframe=true,mx-view='xx')
                    div(mx-vframe=true,mx-view=yy)
            这种结构，自动构建父子关系，
            根结点渲染，获取到子列表[div(mx-view=xx)]
                子列表渲染，获取子子列表的子列表
                    加入到忽略标识里
            会导致过多的dom查询

            现在使用的这种，无法处理这样的情况，考虑到项目中几乎没出现过这种情况，先采用高效的写法
            上述情况一般出现在展现型页面，dom结构已经存在，只是附加上js行为
            不过就展现来讲，一般是不会出现嵌套的情况，出现的话，把里面有层级的vframe都挂到body上也未尝不可，比如brix2.0
         */

        me['@{vframe#hold.fire}'] = 1; //hold fire creted
        //me.unmountZone(zoneId, 1); 不去清理，详情见：https://github.com/thx/magix/issues/27
        /*#if(modules.collectView){#*/
        let temp = [];
        for (vf of vframes) {
            temp.push(G_GetAttribute(vf, G_MX_VIEW));
        }
        G_Require(temp);
        /*#}#*/
        /*#if(modules.vframeHost){#*/
        let subs = {},
            svfs, subVf;
        /*#}#*/
        for (vf of vframes) {
            if (!vf['@{node#mounted.vframe}']) { //防止嵌套的情况下深层的view被反复实例化
                id = IdIt(vf);
                /*#if(modules.vframeHost){#*/
                if (!G_Has(subs, id)) {
                    /*#}#*/
                    vf['@{node#mounted.vframe}'] = 1;
                    vfs.push([id, G_GetAttribute(vf, G_MX_VIEW)/*#if(modules.vframeHost){#*/, G_GetAttribute(vf, G_Tag_View_Owner)/*#}#*/]);
                    /*#if(modules.vframeHost){#*/
                }
                svfs = $(`${G_HashKey}${id} [${G_MX_VIEW}]`);
                for (subVf of svfs) {
                    id = IdIt(subVf);
                    subs[id] = 1;
                }
                /*#}#*/
            }
        }
        for ([id, vf/*#if(modules.vframeHost){#*/, subVf/*#}#*/] of vfs) {
            if (DEBUG && document.querySelectorAll(`#${id}`).length > 1) {
                Magix_Cfg.error(Error(`mount vframe error. dom id:"${id}" duplicate`));
            }
            if (DEBUG) {
                if (vfs[id]) {
                    Magix_Cfg.error(Error(`vf.id duplicate:${id} at ${me[G_PATH]}`));
                } else {
                    me.mountVframe(vfs[id] = id/*#if(modules.vframeHost){#*/, subVf/*#}#*/, vf);
                }
            } else {
                me.mountVframe(id/*#if(modules.vframeHost){#*/, subVf/*#}#*/, vf);
            }
        }
        me['@{vframe#hold.fire}'] = 0;
        if (!inner) {
            Vframe_NotifyCreated(me);
        }
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     */
    unmountVframe(id /*,keepPreHTML*/, inner) { //inner 标识是否是由内部调用，外部不应该传递该参数
        let me = this,
            vf;
        id = id ? me['@{vframe#children}'][id] : me.id;
        //let vom = me.owner;
        vf = Vframe_Vframes[id];
        if (vf) {
            let { '@{vframe#children.created}': cr, pId } = vf;
            vf.unmountView(/*keepPreHTML*/);
            Vframe_RemoveVframe(id, cr);
            vf.id = vf.pId/*#if(modules.vframeHost){#*/ = vf.hId/*#}#*/ = vf['@{vframe#children}'] = vf['@{vframe#children.ready}'] = 0; //清除引用,防止被移除的view内部通过setTimeout之类的异步操作有关的界面，影响真正渲染的view
            /*#if(!modules.updaterVDOM){#*/
            vf['@{vframe#alter.node}'] = 0;
            /*#}#*/
            vf.off('alter');
            vf.off('created');
            //if (Vframe_Cache.length < 10) {
            Vframe_Cache.push(vf);
            //}
            vf = Vframe_Vframes[pId];
            if (vf && G_Has(vf['@{vframe#children}'], id)) { //childrenMap
                delete vf['@{vframe#children}'][id]; //childrenMap
                /*#if(modules.linkage){#*/
                vf['@{vframe#children.list}'] = 0;
                /*#}#*/
                vf['@{vframe#children.count}']--; //cildrenCount
                if (!inner) Vframe_NotifyCreated(vf); //移除后通知完成事件
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId] 节点对象或id
     */
    unmountZone(zoneId, inner) {
        let me = this;
        let p;
        for (p in me['@{vframe#children}']) {
            if (!zoneId || (p != zoneId && G_NodeIn(p, zoneId))) {
                me.unmountVframe(p /*,keepPreHTML,*/, 1);
            }
        }
        if (!inner) Vframe_NotifyCreated(me);
    } /*#if(modules.linkage){#*/,
    /**
     * 获取父vframe
     * @param  {Integer} [level] 向上查找层级，默认1,取当前vframe的父级
     * @return {Vframe|undefined}
     * @beta
     * @module linkage
     */
    parent(level, vf) {
        vf = this;
        level = (level >>> 0) || 1;
        while (vf && level--) {
            vf = Vframe_Vframes[vf.pId];
        }
        return vf;
    },
    /*#if(modules.vframeHost){#*/
    /**
     * 获取当前组件所在的view
     */
    host(vf) {
        vf = this;
        vf = Vframe_Vframes[vf.hId || vf.pId];
        return vf;
    },
    /*#}#*/
    /**
     * 获取当前vframe的所有子vframe的id。返回数组中，vframe在数组中的位置并不固定
     * @return {Array[String]}
     * @beta
     * @module linkage
     * @example
     * let children = view.owner.children();
     * console.log(children);
     */
    children(me) {
        me = this;
        return me['@{vframe#children.list}'] || (me['@{vframe#children.list}'] = G_Keys(me['@{vframe#children}']));
    },
    /**
     * 调用view的方法
     * @param  {String} name 方法名
     * @param  {Array} [args] 参数
     * @return {Object}
     * @beta
     * @module linkage
     * @example
     * // html
     * // &lt;div&gt; mx-view="path/to/v1" id="test"&gt;&lt;/div&gt;
     * let vf = Magix.Vframe.get('test');
     * vf.invoke('methodName',['args1','agrs2']);
     */
    invoke(name, args) {
        let result;
        let vf = this,
            view, fn, o, list = vf['@{vframe#invoke.list}'],
            key;
        if ((view = vf['@{vframe#view.entity}']) && view['@{view#rendered}']) { //view rendered
            result = (fn = view[name]) && G_ToTry(fn, args, view);
        } else {
            o = list[key = G_SPLITER + name];
            if (o) {
                o.r = args === o.a; //参数一样，则忽略上次的
            }
            o = {
                n: name,
                a: args,
                k: key
            };
            list.push(o);
            list[key] = o;
        }
        return result;
    }


    /*#}#*/


    /**
     * 子孙view修改时触发
     * @name Vframe#alter
     * @event
     * @param {Object} e
     */

    /**
     * 子孙view创建完成时触发
     * @name Vframe#created
     * @event
     * @param {Object} e
     */
});
Magix.Vframe = Vframe;


/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有$cc(childrenCount)属性和$c(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和$r(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */