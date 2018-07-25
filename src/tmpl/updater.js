/*#if(modules.updaterQuick){#*/
//let Updater_VframesToVNodes = {};
/*#}#*/
/*#if(!modules.updaterAsync){#*/
let Updater_Digest = (updater, digesting) => {
    let keys = updater['@{updater#keys}'],
        changed = updater['@{updater#data.changed}'],
        selfId = updater['@{updater#view.id}'],
        vf = Vframe_Vframes[selfId],
        view = vf && vf['@{vframe#view.entity}'],
        ref = { d: [], v: [] },
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
        view['@{view#sign}'] > 0 &&
        (tmpl = view.tmpl) && view['@{view#updater}'] == updater) {
        //修正通过id访问到不同的对象
        view.fire('dompatch');
        delete Body_RangeEvents[selfId];
        delete Body_RangeVframes[selfId];
        console.time('[updater time:' + selfId + ']');
        /*#if(modules.updaterVDOM){#*/
        /*#if(modules.updaterQuick){#*/
        vdom = tmpl(data, refData, Q_Create, selfId, Q_Encode, Q_Safeguard, Q_EncodeURI, Q_Ref, Q_EncodeQ/*, vfsToVNodes*/);
        //Updater_VframesToVNodes[selfId] = vfsToVNodes.reverse();
        /*#}else{#*/
        vdom = TO_VDOM(tmpl(data, selfId, refData));
        /*#}#*/
        /*#}else{#*/
        vdom = I_GetNode(tmpl(data, selfId, refData), node);
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

        for (vdom of ref.v) {
            vdom['@{view#render.short}']();
        }
        if (ref.c || !view['@{view#rendered}']) {
            view.endUpdate(selfId);
        }
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
        console.timeEnd('[updater time:' + selfId + ']');
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
        ref = { d: [], v: [] },
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
            for (vdom of ref.d) {
                vdom[0].id = vdom[1];
            }

            for (vdom of ref.v) {
                vdom['@{view#render.short}']();
            }
            if (ref.c || !view['@{view#rendered}']) {
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
            console.time('[updater time:' + selfId + ']');
            /*#if(modules.updaterVDOM){#*/
            /*#if(modules.updaterQuick){#*/
            vdom = tmpl(data, refData, Q_Create, selfId, Q_Encode, Q_Safeguard, Q_EncodeURI, Q_Ref, Q_EncodeQ/*, vfsToVNodes*/);
            //Updater_VframesToVNodes[selfId] = vfsToVNodes.reverse();
            /*#}else{#*/
            vdom = TO_VDOM(tmpl(data, selfId, refData));
            /*#}#*/
            /*#}else{#*/
            vdom = I_GetNode(tmpl(data, selfId, refData), node);
            /*#}#*/
            /*#if(modules.updaterVDOM){#*/
            V_SetChildNodes(node, updater['@{updater#vdom}'], vdom, ref, vf, keys);
            if (!updater['@{updater#vdom}']) updater['@{updater#vdom}'] = vdom;
            /*#}else{#*/
            I_SetChildNodes(node, vdom, ref, vf, keys);
            /*#}#*/
            console.timeEnd('[updater time:' + selfId + ']');
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
    set(obj) {
        let me = this;
        me['@{updater#data.changed}'] = G_Set(obj, me['@{updater#data}'], me['@{updater#keys}']) || me['@{updater#data.changed}'];
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
    digest(data, resolve) {
        let me = this.set(data)/*#if(!modules.updaterAsync){#*/,
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
        digesting.push(resolve);
        if (!digesting.i) {
            Updater_Digest(me, digesting);
        } else if (DEBUG) {
            console.warn('Avoid redigest while updater is digesting');
        }
        /*#}#*/
    },
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
});