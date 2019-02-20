let Updater_EM = {
    '&': 'amp',
    '<': 'lt',
    '>': 'gt',
    '"': '#34',
    '\'': '#39',
    '\`': '#96'
};
let Updater_ER = /[&<>"'\`]/g;
let Updater_Safeguard = v => '' + (v == null ? '' : v);
let Updater_EncodeReplacer = m => `&${Updater_EM[m]};`;
let Updater_Encode = v => Updater_Safeguard(v).replace(Updater_ER, Updater_EncodeReplacer);

let Updater_Ref = ($$, v, k, f) => {
    for (f = $$[G_SPLITER]; --f;)
        if ($$[k = G_SPLITER + f] === v) return k;
    $$[k = G_SPLITER + $$[G_SPLITER]++] = v;
    return k;
};
let Updater_UM = {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A'
};
let Updater_URIReplacer = m => Updater_UM[m];
let Updater_URIReg = /[!')(*]/g;
let Updater_EncodeURI = v => encodeURIComponent(Updater_Safeguard(v)).replace(Updater_URIReg, Updater_URIReplacer);

let Updater_QR = /[\\'"]/g;
let Updater_EncodeQ = v => Updater_Safeguard(v).replace(Updater_QR, '\\$&');
/*#if(modules.vframeHost){#*/
let Updater_ChangedKeys = {};
/*#}#*/
/*#if(!modules.updaterAsync){#*/
let Updater_Digest = (updater, digesting) => {
    let keys = updater['@{updater#keys}'],
        changed = updater['@{updater#data.changed}'],
        selfId = updater['@{updater#view.id}'],
        vf = Vframe_Vframes[selfId],
        view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [], v: [], n: [] },
        node = G_GetById(selfId),
        tmpl, vdom, data = updater['@{updater#data}'],
        refData = updater['@{updater#ref.data}'],
        /*#if(modules.updaterQuick){#*/
        //vfsToVNodes = [],
        /*#}#*/
        redigest = trigger => {
            if (digesting.i < digesting.length) {
                Updater_Digest(updater, digesting);
            } else {
                ref = digesting.slice();
                digesting.i = digesting.length = 0;
                /*#if(!modules.mini){#*/
                if (trigger) {
                    view.fire('domready');
                }
                /*#}#*/
                G_ToTry(ref);
            }
        };
    digesting.i = digesting.length;
    updater['@{updater#data.changed}'] = 0;
    updater['@{updater#keys}'] = {};
    if (changed &&
        view &&
        node &&
        view['@{view#sign}'] > 0 &&
        (tmpl = view.tmpl) && view['@{view#updater}'] == updater) {
        //修正通过id访问到不同的对象
        /*#if(modules.vframeHost){#*/
        Updater_ChangedKeys[selfId] = keys;
        /*#}#*/
        view.fire('dompatch');
        delete Body_RangeEvents[selfId];
        delete Body_RangeVframes[selfId];
        /*#if(modules.updaterVDOM){#*/
        /*#if(modules.updaterQuick){#*/
        vdom = tmpl(data, Q_Create, selfId, refData, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ, G_IsArray, G_Assign/*, vfsToVNodes*/);
        //Updater_VframesToVNodes[selfId] = vfsToVNodes.reverse();
        /*#}else{#*/
        vdom = TO_VDOM(tmpl(data, selfId, refData, Updater_Encode, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ));
        /*#}#*/
        /*#}else{#*/
        vdom = I_GetNode(tmpl(data, selfId, refData, Updater_Encode, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ), node);
        /*#}#*/
        /*#if(modules.updaterVDOM){#*/
        V_SetChildNodes(node, updater['@{updater#vdom}'], vdom, ref, vf, keys);
        updater['@{updater#vdom}'] = vdom;
        /*#}else{#*/
        I_SetChildNodes(node, vdom, ref, vf, keys);
        /*#}#*/
        for (vdom of ref.d) {
            vdom[0].id = vdom[1];
        }
        for (vdom of ref.n) {
            if (vdom[0] == 1) {
                vdom[1].appendChild(vdom[2]);
            } else if (vdom[0] == 2) {
                vdom[1].removeChild(vdom[2]);
            } else if (vdom[0] == 4) {
                vdom[1].replaceChild(vdom[2], vdom[3]);
            } else {
                vdom[1].insertBefore(vdom[2], vdom[3]);
            }
        }
        /*
            在dom diff patch时，如果已渲染的vframe有变化，则会在vom tree上先派发created事件，同时传递inner标志，vom tree处理alter事件派发状态，未进入created事件派发状态

            patch完成后，需要设置vframe hold fire created事件，因为带有assign方法的view在调用render后，vom tree处于就绪状态，此时会导致提前派发created事件，应该hold，统一在endUpdate中派发

            有可能不需要endUpdate，所以hold fire要视情况而定
        */
        vf['@{vframe#hold.fire}'] = tmpl = ref.c || !view['@{view#rendered}'];
        for (vdom of ref.v) {
            vdom['@{view#render.short}']();
        }
        if (tmpl) {
            view.endUpdate(selfId);
        }
        /*#if(modules.vframeHost){#*/
        delete Updater_ChangedKeys[selfId];
        /*#}#*/
        /*#if(!modules.mini){#*/
        if (ref.c) {
            /*#if(modules.naked){#*/
            G_Trigger(G_DOCUMENT, 'htmlchanged', {
                vId: selfId
            });
            /*#}else if(modules.kissy){#*/
            G_DOC.fire('htmlchanged', {
                vId: selfId
            });
            /*#}else{#*/
            G_DOC.trigger({
                type: 'htmlchanged',
                vId: selfId
            });
            /*#}#*/
        }
        /*#}#*/
        redigest(1);
    } else {
        redigest();
    }
};
/*#}else{#*/
let Updater_Digest_Async = (updater, resolve) => {
    let keys = updater['@{updater#keys}'],
        changed = updater['@{updater#data.changed}'],
        selfId = updater['@{updater#view.id}'],
        vf = Vframe_Vframes[selfId],
        view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [], v: [], n: [] },
        node = G_GetById(selfId),
        /*#if(modules.updaterQuick){#*/
        //vfsToVNodes = [],
        /*#}#*/
        tmpl, vdom, data = updater['@{updater#data}'],
        refData = updater['@{updater#ref.data}'];
    if (changed &&
        view &&
        view['@{view#sign}'] > 0 &&
        (tmpl = view.tmpl) && view['@{view#updater}'] == updater) {
        updater['@{updater#data.changed}'] = 0;
        updater['@{updater#keys}'] = {};
        delete Body_RangeEvents[selfId];
        delete Body_RangeVframes[selfId];
        Async_SetNewTask(vf, () => {
            console.log('ui ready', selfId);
            Async_SetNewTask(vf, () => {
                console.log('complete', selfId);
                vf['@{vframe#hold.fire}'] = tmpl = ref.c || !view['@{view#rendered}'];
                if (tmpl) {
                    view.endUpdate(selfId);
                }
                if (ref.c) {
                    /*#if(modules.naked){#*/
                    G_Trigger(G_DOCUMENT, 'htmlchanged', {
                        vId: selfId
                    });
                    /*#}else if(modules.kissy){#*/
                    G_DOC.fire('htmlchanged', {
                        vId: selfId
                    });
                    /*#}else{#*/
                    G_DOC.trigger({
                        type: 'htmlchanged',
                        vId: selfId
                    });
                    /*#}#*/
                }
                /*#if(!modules.mini){#*/
                view.fire('domready');
                /*#}#*/
                if (resolve) resolve();
            });
            Async_AddTask(vf, () => {
                for (vdom of ref.d) {
                    vdom[0].id = vdom[1];
                }
            });
            refData = vdom => {
                if (vdom[0] == 1) {
                    vdom[1].appendChild(vdom[2]);
                } else if (vdom[0] == 2) {
                    vdom[1].removeChild(vdom[2]);
                } else {
                    /*#if(modules.updaterVDOM){#*/
                    V_CopyVNode(vdom[4], vdom[5], 1);
                    /*#}#*/
                    vdom[1].replaceChild(vdom[2], vdom[3]);
                }
            };
            for (vdom of ref.n) {
                Async_AddTask(vf, refData, vdom);
            }
            refData = vdom => {
                vdom['@{view#render.short}']();
            };
            for (vdom of ref.v) {
                Async_AddTask(vf, refData, vdom);
            }
            Async_CheckStatus(selfId);
        });
        Async_AddTask(vf, () => {
            /*#if(modules.updaterVDOM){#*/
            /*#if(modules.updaterQuick){#*/
            vdom = tmpl(data, Q_Create, selfId, refData, Updater_Encode, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ, G_IsArray, G_Assign/*, vfsToVNodes*/);
            //Updater_VframesToVNodes[selfId] = vfsToVNodes.reverse();
            /*#}else{#*/
            vdom = TO_VDOM(tmpl(data, selfId, refData, Updater_Encode, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ));
            /*#}#*/
            /*#}else{#*/
            vdom = I_GetNode(tmpl(data, selfId, refData, Updater_Encode, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ), node);
            /*#}#*/
            /*#if(modules.updaterVDOM){#*/
            V_SetChildNodes(node, updater['@{updater#vdom}'], vdom, ref, vf, keys);
            if (!updater['@{updater#vdom}']) updater['@{updater#vdom}'] = vdom;
            /*#}else{#*/
            I_SetChildNodes(node, vdom, ref, vf, keys);
            /*#}#*/
            Async_CheckStatus(selfId);
        });
    } else {
        if (resolve) resolve();
    }
};
/*#}#*/
/**
 * 使用mx-keys进行局部刷新的类
 * @constructor
 * @name Updater
 * @class
 * @beta
 * @module updater
 * @param {String} viewId Magix.View对象Id
 */
function Updater(viewId) {
    let me = this;
    me['@{updater#view.id}'] = viewId;
    me['@{updater#data.changed}'] = 1;
    me['@{updater#data}'] = {
        vId: viewId
    };
    me['@{updater#ref.data}'] = {
        [G_SPLITER]: 1
    };
    me['@{updater#digesting.list}'] = [];
    me['@{updater#keys}'] = {};
}
G_Assign(Updater[G_PROTOTYPE], {
    /**
     * @lends Updater#
     */
    /**
     * 获取放入的数据
     * @param  {String} [key] key
     * @return {Object} 返回对应的数据，当key未传递时，返回整个数据对象
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.updater.get('a'));
     * }
     */
    get(key, result) {
        result = this['@{updater#data}'];
        if (key) {
            result = result[key];
        }
        return result;
    },
    /**
     * 通过path获取值
     * @param  {String} path 点分割的路径
     * @return {Object}
     */
    /*gain: function (path) {
        let result = this.$d;
        let ps = path.split('.'),
            temp;
        while (result && ps.length) {
            temp = ps.shift();
            result = result[temp];
        }
        return result;
    },*/
    /**
     * 获取放入的数据
     * @param  {Object} obj 待放入的数据
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.updater.get('a'));
     * }
     */
    set(obj, unchanged) {
        let me = this;
        me['@{updater#data.changed}'] = G_Set(obj, me['@{updater#data}'], me['@{updater#keys}'], unchanged) || me['@{updater#data.changed}'];
        return me;
    },
    /**
     * 检测数据变化，更新界面，放入数据后需要显式调用该方法才可以把数据更新到界面
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     }).digest();
     * }
     */
    digest(data, unchanged, resolve) {
        let me = this.set(data, unchanged)/*#if(!modules.updaterAsync){#*/,
            digesting = me['@{updater#digesting.list}']/*#}#*/;
        /*
            view:
            <div>
                <mx-dropdown mx-focusout="rerender()"/>
            <div>

            view.digest=>dropdown.focusout=>view.redigest=>view.redigest.end=>view.digest.end

            view.digest中嵌套了view.redigest，view.redigest可能操作了view.digest中引用的dom,这样会导致view.redigest.end后续的view.digest中出错

            expect
            view.digest=>dropdown.focusout=>view.digest.end=>view.redigest=>view.redigest.end

            如果在digest的过程中，多次调用自身的digest，则后续的进行排队。前面的执行完成后，排队中的一次执行完毕
        */
        /*#if(modules.updaterAsync){#*/
        Updater_Digest_Async(me, resolve);
        /*#}else{#*/
        if (resolve) {
            digesting.push(resolve);
        }
        if (!digesting.i) {
            Updater_Digest(me, digesting);
        } else if (DEBUG) {
            console.warn('Avoid redigest while updater is digesting');
        }
        /*#}#*/
    }/*#if(!modules.mini){#*/,
    /**
     * 获取当前数据状态的快照，配合altered方法可获得数据是否有变化
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    snapshot() {
        let me = this;
        me['@{updater#data.string}'] = JSONStringify(me['@{updater#data}']);
        return me;
    },
    /**
     * 检测数据是否有变动
     * @return {Boolean} 是否变动
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 20,
     *         b: 30
     *     }).digest().snapshot(); //更新完界面后保存快照
     * },
     * 'save&lt;click&gt;': function() {
     *     //save to server
     *     console.log(this.updater.altered()); //false
     *     this.updater.set({
     *         a: 20,
     *         b: 40
     *     });
     *     console.log(this.updater.altered()); //true
     *     this.updater.snapshot(); //再保存一次快照
     *     console.log(this.updater.altered()); //false
     * }
     */
    altered() {
        let me = this;
        if (me['@{updater#data.string}']) {
            return me['@{updater#data.string}'] != JSONStringify(me['@{updater#data}']);
        }
    },
    /**
     * 翻译带@占位符的数据
     * @param {string} origin 源字符串
     */
    translate(data) {
        return G_TranslateData(this['@{updater#data}'], data);
    },
    /**
     * 翻译带@占位符的数据
     * @param {string} origin 源字符串
     */
    parse(origin) {
        return G_ParseExpr(origin, this['@{updater#ref.data}']);
    }
    /*#}#*/
});