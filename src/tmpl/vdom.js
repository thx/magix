let V_SPECIAL_PROPS = {
    input: [G_VALUE, 'checked'],
    textarea: [G_VALUE],
    option: ['selected']
};

let V_TEXT_NODE = G_COUNTER;
if (DEBUG) {
    V_TEXT_NODE = '#text';
}
let V_UnmountVframs = (vf, n) => {
    let id = IdIt(n);
    if (id) {
        if (vf['@{vframe#children}'][id]) {
            vf.unmountVframe(id, 1);
        } else {
            vf.unmountZone(id, 1);
        }
    }
};
let V_NSMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
};
let V_IgnoreKeys = {
    mxv: 1,
    mxa: 1,
    mxs: 1
};
let V_SetAttributes = (oldNode, lastVDOM, newVDOM, ref) => {
    let key, value,
        nMap = newVDOM['@{~v#node.attrs.map}'],
        oMap = lastVDOM['@{~v#node.attrs.map}'];
    if (lastVDOM) {
        for (key in oMap) {
            if (!G_Has(nMap, key)) {//如果旧有新木有
                if (key == 'id') {
                    ref.d.push([oldNode, G_EMPTY]);
                } else {
                    ref.c = 1;
                    oldNode.removeAttribute(key);
                }
            }
        }
    }
    for (key in nMap) {
        if (!G_Has(V_IgnoreKeys, key)) {
            value = nMap[key];
            //旧值与新值不相等
            if (!lastVDOM || oMap[key] !== value) {
                if (key == 'id') {
                    ref.d.push([oldNode, value]);
                } else {
                    ref.c = 1;
                    oldNode.setAttribute(key, value);
                }
            }
        }
    }
};

let V_SpecialDiff = (oldNode, lastVDOM, newVDOM) => {
    let tag = lastVDOM['@{~v#node.tag}'], c, now;
    let specials = V_SPECIAL_PROPS[tag];
    let nMap = newVDOM['@{~v#node.attrs.map}'];
    let result = 0;
    if (specials) {
        for (c of specials) {
            now = G_Has(nMap, c) ? c != G_VALUE || nMap[c] : c == G_VALUE && G_EMPTY;
            if (oldNode[c] != now) {
                result = 1;
                oldNode[c] = now;
            }
        }
    }
    return result;
};
let V_CreateNode = (vnode, owner, ref) => {
    let tag = vnode['@{~v#node.tag}'], c;
    if (tag == V_TEXT_NODE) {
        c = G_DOCUMENT.createTextNode(vnode['@{~v#node.outer.html}']);
    } else {
        c = G_DOCUMENT.createElementNS(V_NSMap[tag] || owner.namespaceURI, tag);

        /*#if(modules.viewChildren){#*/
        if (vnode['@{~v#node.attrs.map}'][G_MX_VIEW]) {
            c['@{node#vnode}'] = vnode;
        }
        /*#}#*/
        V_SetAttributes(c, 0, vnode, ref);
        for (tag of vnode['@{~v#node.children}']) {
            c.appendChild(V_CreateNode(tag, owner, ref));
        }
    }
    return c;
};
/*let V_GenKeyedNodes = (vnodes, nodes, start, end) => {
    let keyed = {}, i = end, v, key;
    for (; i >= start; i--) {
        v = vnodes[i];
        key = v['@{~v#node.compare.key}'];
        if (key) {
            key = keyed[key] || (keyed[key] = []);
            key.push({
                '@{~v#old.list.node}': nodes[i],
                '@{~v#old.vlist.node}': v
            });
        }
    }
    return keyed;
};*/
let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, keys) => {
    if (lastVDOM) {//view首次初始化，通过innerHTML快速更新
        if (lastVDOM['@{~v#node.has.mxv}'] ||
            lastVDOM['@{~v#node.html}'] != newVDOM['@{~v#node.html}']) {
            let i, oi = 0,
                oldChildren = lastVDOM['@{~v#node.children}'],
                newChildren = newVDOM['@{~v#node.children}'], oc, nc,
                oldCount = oldChildren.length, newCount = newChildren.length,
                reused = newVDOM['@{~v#node.reused}'],
                nodes = realNode.childNodes, compareKey,
                keyedNodes = {};
            for (i = oldCount; i--;) {
                oc = oldChildren[i];
                compareKey = oc['@{~v#node.compare.key}'];
                if (compareKey) {
                    compareKey = keyedNodes[compareKey] || (keyedNodes[compareKey] = []);
                    compareKey.push(nodes[i]);
                }
            }
            /* let oldStartIdx = 0,
                 oldEndIdx = oldCount - 1,
                 newStartIdx = 0,
                 newEndIdx = newCount - 1,
                 oldStartVNode = oldChildren[oldStartIdx],
                 oldEndVNode = oldChildren[oldEndIdx],
                 newStartVNode = newChildren[newStartIdx],
                 newEndVNode = newChildren[newEndIdx];
     
             while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                 if (newStartVNode['@{~v#node.compare.key}'] == oldStartVNode['@{~v#node.compare.key}']) {
                     V_SetNode(nodes[newStartIdx], realNode, oldStartVNode, newStartVNode, ref, vframe, data);
                     newStartVNode = newChildren[++newStartIdx];
                     oldStartVNode = oldChildren[++oldStartIdx];
                 } else if (newEndVNode['@{~v#node.compare.key}'] == oldEndVNode['@{~v#node.compare.key}']) {
                     V_SetNode(nodes[newEndIdx], realNode, oldEndVNode, newEndVNode, ref, vframe, data);
                     newEndVNode = newChildren[--newEndIdx];
                     oldEndVNode = oldChildren[--oldEndIdx];
                 } else {
                     if (!keyedNodes) keyedNodes = V_GenKeyedNodes(oldChildren, nodes, oldStartIdx, oldEndIdx);
     
                 }
             }
             if (newStartIdx > newEndIdx) {
                 for (i = oldStartIdx; i <= oldEndIdx; i++) {
                     oi = nodes[oldStartIdx];//删除多余的旧节点
                     V_UnmountVframs(vframe, oi);
                     realNode.removeChild(oi);
                     ref.c = 1;
                 }
             }*/

            /*#if(modules.updaterAsync){#*/
            for (i = 0; i < newCount; i++) {
                oc = oldChildren[i];
                nc = newChildren[i];
                compareKey = keyedNodes[nc['@{~v#node.compare.key}']];
                if (compareKey && (compareKey = compareKey.pop())) {
                    //orn = compareKey;//['@{~v#old.list.node}'];
                    //ovn = compareKey['@{~v#old.vlist.node}'];
                    while (compareKey != nodes[i]) {//如果找到的节点和当前不同，则移动
                        //oldChildren.splice(i, 0, oc = ovn);//移动虚拟dom
                        // for (oi = oldChildren.length; oi--;) {//从后向前清理虚拟dom
                        //     if (oldChildren[oi] == ovn) {
                        //         oldChildren.splice(oi, 1);
                        //         break;
                        //     }
                        // }
                        realNode.appendChild(nodes[i]);
                        oldChildren.push(oldChildren[i]);
                        oldChildren.splice(i, 1);
                        oc = oldChildren[i];
                    }
                    if (reused[oc['@{~v#node.compare.key}']]) {
                        reused[oc['@{~v#node.compare.key}']]--;
                    }
                    Async_AddTask(vframe, V_SetNode, nodes[i], realNode, oc, nc, ref, vframe, keys);
                } else if (oc) {//有旧节点，则更新
                    if (keyedNodes[oc['@{~v#node.compare.key}']] &&
                        reused[oc['@{~v#node.compare.key}']]) {
                        oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                        oldCount++;
                        ref.c = 1;
                        //ref.n.push([8, realNode, V_CreateNode(nc, realNode, ref), nodes[i]]);
                        realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                    } else {
                        Async_AddTask(vframe, V_SetNode, nodes[i], realNode, oc, nc, ref, vframe, keys);
                    }
                } else {//添加新的节点
                    oldChildren.push(nc);
                    ref.n.push([1, realNode, V_CreateNode(nc, realNode, ref)]);
                    //realNode.appendChild(V_CreateNode(nc, realNode, ref));
                    ref.c = 1;
                }
            }
            oi = oldCount - newCount;
            if (oi > 0) {
                oldChildren.splice(-oi);
                ref.c = 1;
            }
            /*#}else{#*/
            for (i = 0; i < newCount; i++) {
                nc = newChildren[i];
                oc = oldChildren[i];
                compareKey = keyedNodes[nc['@{~v#node.compare.key}']];
                if (compareKey && (compareKey = compareKey.pop())) {
                    while (compareKey != nodes[i]) {//如果找到的节点和当前不同，则移动
                        //oldChildren.splice(i, 0, oc = ovn);//移动虚拟dom
                        // for (oi = oldChildren.length; oi--;) {//从后向前清理虚拟dom
                        //     if (oldChildren[oi] == ovn) {
                        //         oldChildren.splice(oi, 1);
                        //         break;
                        //     }
                        // }
                        realNode.appendChild(nodes[i]);
                        oldChildren.push(oldChildren[i]);
                        oldChildren.splice(i, 1);
                        oc = oldChildren[i];
                    }
                    if (reused[oc['@{~v#node.compare.key}']]) {
                        reused[oc['@{~v#node.compare.key}']]--;
                    }
                    V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, keys);
                } else if (oc) {//有旧节点，则更新
                    if (keyedNodes[oc['@{~v#node.compare.key}']] &&
                        reused[oc['@{~v#node.compare.key}']]) {
                        oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                        oldCount++;
                        ref.c = 1;
                        ref.n.push([8, realNode, V_CreateNode(nc, realNode, ref), nodes[i]]);
                        // realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[i]);
                    } else {
                        V_SetNode(nodes[i], realNode, oc, nc, ref, vframe, keys);
                        //ref.c = 1;
                    }
                } else {//添加新的节点

                    ref.n.push([1, realNode, V_CreateNode(nc, realNode, ref)]);
                    //realNode.appendChild(V_CreateNode(nc, realNode, ref));
                    ref.c = 1;
                }
            }
            /*#}#*/
            for (i = newCount; i < oldCount; i++) {
                oi = nodes[i];//删除多余的旧节点
                V_UnmountVframs(vframe, oi);
                if (DEBUG) {
                    if (!oi.parentNode) {
                        console.error('Avoid remove node on view.destroy in digesting');
                    }
                }
                ref.n.push([2, realNode, oi]);
                //realNode.removeChild(oi);
            }
        }
        /*#if(modules.updaterAsync){#*/
        if (lastVDOM['@{~v#node.outer.html}'] != newVDOM['@{~v#node.outer.html}']) {
            V_CopyVNode(lastVDOM, newVDOM);
        }
        /*#}#*/
    } else {
        ref.c = 1;
        lastVDOM = V_CreateNode(newVDOM, realNode, ref);
        realNode.innerHTML = '';
        while (lastVDOM.firstChild) {
            realNode.appendChild(lastVDOM.firstChild);
        }
    }
};
/*#if(modules.updaterAsync){#*/
let V_CopyVNode = (lastVDOM, newVDOM, withChildren, p) => {
    for (p in lastVDOM) {
        if (withChildren || p != '@{~v#node.children}') {
            delete lastVDOM[p];
        }
    }
    for (p in newVDOM) {
        if (withChildren || p != '@{~v#node.children}') {
            lastVDOM[p] = newVDOM[p];
        }
    }
};
/*#}#*/
let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, keys) => {
    if (DEBUG) {
        if (oldParent.nodeName == 'TEMPLATE') {
            console.error('unsupport template tag');
        }
        if ((realNode.nodeName == '#text' && lastVDOM['@{~v#node.tag}'] != '#text') || (
            realNode.nodeName != '#text' && realNode.nodeName.toLowerCase() != lastVDOM['@{~v#node.tag}'])) {
            console.error('Your code is not match the DOM tree generated by the browser. near:' + lastVDOM['@{~v#node.html}'] + '. Is that you lost some tags or modified the DOM tree?');
        }
    }
    let lastAMap = lastVDOM['@{~v#node.attrs.map}'],
        newAMap = newVDOM['@{~v#node.attrs.map}'];
    if (V_SpecialDiff(realNode, lastVDOM, newVDOM) ||
        lastVDOM['@{~v#node.has.mxv}'] ||
        lastVDOM['@{~v#node.outer.html}'] != newVDOM['@{~v#node.outer.html}']) {
        if (lastVDOM['@{~v#node.tag}'] == newVDOM['@{~v#node.tag}']) {
            if (lastVDOM['@{~v#node.tag}'] == V_TEXT_NODE) {
                ref.c = 1;
                /*#if(modules.updaterAsync){#*/
                lastVDOM['@{~v#node.outer.html}'] = newVDOM['@{~v#node.outer.html}'];
                /*#}#*/
                realNode.nodeValue = newVDOM['@{~v#node.outer.html}'];
            } else if (!lastAMap[G_Tag_Key] ||
                lastAMap[G_Tag_Key] != newAMap[G_Tag_Key]) {
                let newMxView = newAMap[G_MX_VIEW],
                    newHTML = newVDOM['@{~v#node.html}'];
                let updateAttribute = lastVDOM['@{~v#node.attrs}'] != newVDOM['@{~v#node.attrs}'],
                    updateChildren, unmountOld,
                    oldVf = Vframe_Vframes[realNode.id],
                    assign,
                    view,
                    uri = newMxView && G_ParseUri(newMxView),
                    params,
                    htmlChanged,
                    paramsChanged;
                /*
                    如果存在新旧view，则考虑路径一致，避免渲染的问题
                 */

                /*
                    只检测是否有参数控制view而不检测数据是否变化的原因：
                    例：view内有一input接收传递的参数，且该input也能被用户输入
                    var d1='xl';
                    var d2='xl';
                    当传递第一份数据时，input显示值xl，这时候用户修改了input的值且使用第二份数据重新渲染这个view，问input该如何显示？
                */
                //旧节点有view,新节点有view,且是同类型的view
                if (newMxView && oldVf &&
                    oldVf['@{vframe#view.path}'] == uri[G_PATH] &&
                    lastAMap.id == newAMap.id &&//id如果不一样也要销毁，只有id同时存在且相同或同时不存在id才可以
                    (view = oldVf['@{vframe#view.entity}'])) {
                    htmlChanged = newHTML != lastVDOM['@{~v#node.html}'];
                    paramsChanged = newMxView != oldVf[G_PATH];
                    assign = lastAMap[G_Tag_View_Key];
                    if (!htmlChanged && !paramsChanged && assign) {
                        params = assign.split(G_COMMA);
                        /*#if(modules.vframeHost){#*/
                        lastAMap = Updater_ChangedKeys[oldVf.hId || oldVf.pId];
                        /*#}#*/
                        for (assign of params) {
                            if (assign == G_HashKey || G_Has(keys, assign)/*#if(modules.vframeHost){#*/ || G_Has(lastAMap, assign)/*#}#*/) {
                                paramsChanged = 1;
                                break;
                            }
                        }
                    }
                    if (paramsChanged || htmlChanged /*#if(modules.updaterTouchAttr){#*/ || updateAttribute/*#}#*/) {
                        assign = view['@{view#rendered}'] && view['@{view#assign.fn}'];
                        //如果有assign方法,且有参数或html变化
                        if (assign) {
                            params = uri[G_PARAMS];
                            //处理引用赋值
                            /*#if(modules.viewChildren){#*/lastAMap = /*#}#*/Vframe_TranslateQuery(/*#if(modules.vframeHost){#*/oldVf.hId ||/*#}#*/oldVf.pId, newMxView, params);
                            //oldVf['@{vframe#template}'] = newHTML;
                            //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                            oldVf[G_PATH] = newMxView;//update ref
                            //如果需要更新，则进行更新的操作
                            uri = {
                                //node: newVDOM,//['@{~v#node.children}'],
                                //html: newHTML,
                                //mxv: hasMXV,
                                node: realNode,
                                attr: updateAttribute,
                                /*#if(modules.viewChildren){#*/
                                vnode: newVDOM,
                                map: Children_Wrap(newVDOM, lastAMap),
                                /*#}#*/
                                //html: newHTML,
                                deep: !view.tmpl,
                                inner: htmlChanged,
                                query: paramsChanged,
                                keys
                            };
                            //updateAttribute = 1;
                            if (G_ToTry(assign, [params, uri], view)) {
                                ref.v.push(view);
                            }
                            //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                            //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                            updateChildren = uri.deep;
                        } else {
                            unmountOld = 1;
                            updateChildren = 1;
                        }
                    }// else {
                    // updateAttribute = 1;
                    //}
                } else {
                    updateChildren = 1;
                    unmountOld = oldVf;
                }
                if (unmountOld) {
                    ref.c = 1;
                    oldVf.unmountVframe(0, 1);
                }
                if (updateAttribute) {
                    V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
                }
                // Update all children (and subchildren).
                //自闭合标签不再检测子节点
                if (updateChildren &&
                    !(newVDOM['@{~v#node.self.close}'] &&
                        lastVDOM['@{~v#node.self.close}'])) {
                    //ref.c = 1;
                    V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, keys);
                } else {
                    /*#if(modules.updaterAsync){#*/
                    V_CopyVNode(lastVDOM, newVDOM);
                    /*#}#*/
                }
            }
        } else {
            /*#if(modules.updaterAsync){#*/
            //V_CopyVNode(lastVDOM, newVDOM, 1);
            /*#}#*/
            V_UnmountVframs(vframe, realNode);

            ref.n.push([4, oldParent, V_CreateNode(newVDOM, oldParent, ref), realNode/*#if(modules.updaterAsync){#*/, lastVDOM, newVDOM/*#}#*/]);
            //oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
            ref.c = 1;
        }
    }
};