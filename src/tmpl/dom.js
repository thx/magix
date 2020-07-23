/*
2017.8.1
    直接应用节点对比方案，需要解决以下问题
    1.　view销毁问题，节点是边对比边销毁或新增，期望是view先统一销毁，然后再统一渲染
    2.　需要识别view内的节点变化，如
        <div mx-viwe="app/view">
            <%for(let i=0;i<count;i++){%>
                <span><%=i%></span>
            <%}%>
        </div>
        从外层的div看，并没有变化，但是内部的节点发生了变化，该view仍然需要销毁
2018.1.10
    组件情况：
    1. 组件带模板，最常见的情况
    2. 组件带模板，还有可能访问dom节点，如<mx-dropdown><i value="1">星期一</i></mx-dropdown>
    3. 组件没有模板
    

    组件前后数据是否一致，通过JSON.stringify序列化比较
    比较组件节点内的html片断是否变化

    渲染情况：
    1.　通过标签渲染
    2.　动态渲染
 */

//https://github.com/DylanPiercey/set-dom/blob/master/src/index.js
//https://github.com/patrick-steele-idem/morphdom
let I_SVGNS = 'http://www.w3.org/2000/svg';
let I_MATHNS = 'http://www.w3.org/1998/Math/MathML';
let I_WrapMap = {

    // Support: IE <=9 only
    option: [1, '<select multiple>'],

    // XHTML parsers do not magically insert elements in the
    // same way that tag soup parsers do. So we cannot shorten
    // this by omitting <tbody> or other required elements.
    thead: [1, '<table>'],
    col: [2, '<table><colgroup>'],
    tr: [2, '<table><tbody>'],
    td: [3, '<table><tbody><tr>'],
    area: [1, '<map>'],
    param: [1, '<object>'],
    g: [1, `<svg xmlns="${I_SVGNS}">`],
    m: [1, `<math xmlns="${I_MATHNS}">`],
    _: [0, '']
};

let I_RTagName = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i;
// Support: IE <=9 only
I_WrapMap.optgroup = I_WrapMap.option;

I_WrapMap.tbody = I_WrapMap.tfoot = I_WrapMap.colgroup = I_WrapMap.caption = I_WrapMap.thead;
I_WrapMap.th = I_WrapMap.td;
let I_Doc = G_DOCUMENT.implementation.createHTMLDocument(G_EMPTY);
let I_Base = I_Doc.createElement('base');
I_Base.href = G_DOCUMENT.location.href;
I_Doc.head.appendChild(I_Base);

let I_UnmountVframs = (vf, n) => {
    if (n.nodeType == 1) {
        let id = IdIt(n);
        vf.unmountZone(id, 1);
        if (vf['@{vframe#children}'][id]) {
            vf.unmountVframe(id, 1);
        }
    }
};
let I_GetNode = (html, node) => {
    let tmp = I_Doc.createElement('div');
    // Deserialize a standard representation
    let ns = node.namespaceURI, tag;
    if (ns == I_SVGNS) {
        tag = 'g';
    } else if (ns == I_MATHNS) {
        tag = 'm';
    } else {
        tag = (I_RTagName.exec(html) || [0, ''])[1];
    }
    let wrap = I_WrapMap[tag] || I_WrapMap._;
    tmp.innerHTML = wrap[1] + html;

    // Descend through wrappers to the right content
    let j = wrap[0];
    while (j--) {
        tmp = tmp.lastChild;
    }
    return tmp;
};
//https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
let I_Specials = {
    INPUT: [G_VALUE, 'checked'],
    TEXTAREA: [G_VALUE],
    OPTION: ['selected']
};
let I_SetAttributes = (oldNode, newNode, ref, keepId) => {
    delete oldNode['@{node#is.keyed}'];
    let a, i, key, value;
    let oldAttributes = oldNode.attributes,
        newAttributes = newNode.attributes;
    for (i = oldAttributes.length; i--;) {
        a = oldAttributes[i].name;
        if (!newNode.hasAttribute(a)) {
            if (a == 'id') {
                if (!keepId) {
                    ref.d.push([oldNode, G_EMPTY]);
                }
            } else {
                ref.c = 1;
                oldNode.removeAttribute(a);
            }
        }
    }

    // Set new attributes.
    for (i = newAttributes.length; i--;) {
        a = newAttributes[i];
        key = a.name;
        value = a[G_VALUE];
        if (G_GetAttribute(oldNode, key) != value) {
            if (key == 'id') {
                ref.d.push([oldNode, value]);
            } else {
                ref.c = 1;
                oldNode.setAttribute(key, value);
            }
        }
    }
};
/*#if(modules.updaterTouchAttr){#*/
let I_AttrDiff = (oldNode, newNode) => {
    let oldAttributes = oldNode.attributes,
        newAttributes = newNode.attributes,
        diff = false, i = newAttributes.length, a, b, name;
    if (oldAttributes.length == i) {
        for (; i--;) {
            a = newAttributes[i];
            name = a.name;
            b = oldAttributes[name];
            if (!b || a[G_VALUE] != b[G_VALUE]) {
                diff = true;
                break;
            }
        }
    } else {
        diff = true;
    }
    return diff;
};
/*#}#*/
let I_SpecialDiff = (oldNode, newNode) => {
    let nodeName = oldNode.nodeName, i;
    let specials = I_Specials[nodeName];
    let result = 0;
    if (specials) {
        for (i of specials) {
            if (oldNode[i] != newNode[i]) {
                result = 1;
                oldNode[i] = newNode[i];
            }
        }
    }
    return result;
};

let I_GetCompareKey = (node, key) => {
    if (node.nodeType == 1) {
        if (node['@{node#is.keyed}']) {
            key = node['@{node#reused.key}'];
        } else {
            key = node['@{node#auto.id}'] ? G_EMPTY : G_GetAttribute(node, 'id');
            if (!key) {
                key = G_GetAttribute(node, G_Tag_Key);
            }
            if (!key) {
                key = G_GetAttribute(node, G_MX_VIEW);
                if (key) {
                    key = G_ParseUri(key)[G_PATH];
                }
            }
            node['@{node#is.keyed}'] = 1;
            node['@{node#reused.key}'] = key;
        }
    }
    return key;
};

let I_SetChildNodes = (oldParent, newParent, ref, vframe, keys) => {
    let oldNode = oldParent.lastChild;
    let newNode = newParent.firstChild;
    let tempNew, tempOld, extra = 0,
        nodeKey, foundNode, keyedNodes = {}, newKeyedNodes = {}, next;
    // Extract keyed nodes from previous children and keep track of total count.
    while (oldNode) {
        extra++;
        nodeKey = I_GetCompareKey(oldNode);
        if (nodeKey) {
            nodeKey = keyedNodes[nodeKey] || (keyedNodes[nodeKey] = []);
            nodeKey.push(oldNode);
        }
        oldNode = oldNode.previousSibling;
        // if (newNode) {
        //     nodeKey = I_GetCompareKey(newNode);
        //     if (nodeKey) {
        //         newKeyedNodes[nodeKey] = 1;
        //     }
        //     newNode = newNode.nextSibling;
        // }
    }
    while (newNode) {
        nodeKey = I_GetCompareKey(newNode);
        if (nodeKey) {
            newKeyedNodes[nodeKey] = (newKeyedNodes[nodeKey] || 0) + 1;
        }
        newNode = newNode.nextSibling;
    }
    newNode = newParent.firstChild;
    //removed = newParent.childNodes.length < extra;
    oldNode = oldParent.firstChild;
    while (newNode) {
        extra--;
        tempNew = newNode;
        newNode = newNode.nextSibling;
        nodeKey = I_GetCompareKey(tempNew);
        foundNode = keyedNodes[nodeKey];
        if (foundNode && (foundNode = foundNode.pop())) {
            while (foundNode != oldNode) {
                next = oldNode.nextSibling;
                oldParent.appendChild(oldNode);
                oldNode = next;
            }
            oldNode = foundNode.nextSibling;
            if (newKeyedNodes[nodeKey]) {
                newKeyedNodes[nodeKey]--;
            }
            // if (foundNode != oldNode) {//如果找到的节点和当前不同，则移动
            //     if (removed && oldNode.nextSibling == foundNode) {
            //         oldParent.appendChild(oldNode);
            //         oldNode = foundNode.nextSibling;
            //     } else {
            //         oldParent.insertBefore(foundNode, oldNode);
            //     }
            // } else {
            //     oldNode = oldNode.nextSibling;
            // }
            /*#if(modules.updaterAsync){#*/
            Async_AddTask(vframe, I_SetNode, foundNode, tempNew, oldParent, ref, vframe, keys);
            /*#}else{#*/
            I_SetNode(foundNode, tempNew, oldParent, ref, vframe, keys);
            /*#}#*/
        } else if (oldNode) {
            tempOld = oldNode;
            nodeKey = I_GetCompareKey(tempOld);
            if (nodeKey && keyedNodes[nodeKey] && newKeyedNodes[nodeKey]) {
                extra++;
                ref.c = 1;
                ref.n.push([8, oldParent, tempNew, tempOld]);
                //I_LazyId(ref, tempNew);
                // If the old child had a key we skip over it until the end.
                //oldParent.insertBefore(tempNew, tempOld);
            } else {
                oldNode = oldNode.nextSibling;
                // Otherwise we diff the two non-keyed nodes.
                /*#if(modules.updaterAsync){#*/
                Async_AddTask(vframe, I_SetNode, tempOld, tempNew, oldParent, ref, vframe, keys);
                /*#}else{#*/
                I_SetNode(tempOld, tempNew, oldParent, ref, vframe, keys);
                /*#}#*/
            }
        } else {
            //I_LazyId(ref, tempNew);
            // Finally if there was no old node we add the new node.
            //oldParent.appendChild(tempNew);
            ref.c = 1;
            ref.n.push([1, oldParent, tempNew]);
        }
    }

    // If we have any remaining unkeyed nodes remove them from the end.
    tempOld = oldParent.lastChild;
    while (extra-- > 0) {
        I_UnmountVframs(vframe, tempOld);
        if (DEBUG) {
            if (!tempOld.parentNode) {
                console.error('Avoid remove node on view.destroy in digesting');
            }
        }
        ref.n.push([2, oldParent, tempOld]);
        tempOld = tempOld.previousSibling;
        //oldParent.removeChild(tempOld);
        ref.c = 1;
    }
};

let I_SetNode = (oldNode, newNode, oldParent, ref, vf, keys) => {
    //优先使用浏览器内置的方法进行判断
    /*
        特殊属性优先判断，先识别特殊属性是否发生了改变
        如果特殊属性发生了变化，是否更新取决于该节点上是否渲染了view
        如果渲染了view则走相关的view流程
        否则才更新特殊属性

        场景：<input value="{{=abc}}"/>
        updater.digest({abc:'abc'});
        然后用户删除了input中的abc修改成了123
        此时依然updater.digest({abc:'abc'}),问input中的值该显示abc还是123?
        目前是显示abc
    */
    if (I_SpecialDiff(oldNode, newNode) ||
        (oldNode.nodeType == 1 && oldNode.hasAttribute(G_Tag_View_Key)) ||
        !(oldNode.isEqualNode && oldNode.isEqualNode(newNode))) {
        if (oldNode.nodeName === newNode.nodeName &&
            oldNode.type === newNode.type) {
            // Handle regular element node updates.
            if (oldNode.nodeType === 1) {
                let staticKey = G_GetAttribute(newNode, G_Tag_Key);
                if (staticKey &&
                    staticKey == G_GetAttribute(oldNode, G_Tag_Key)) {
                    return;
                }
                // If we have the same nodename then we can directly update the attributes.

                let newMxView = G_GetAttribute(newNode, G_MX_VIEW),
                    newHTML = newNode.innerHTML;
                /*#if(!modules.updaterTouchAttr){#*/
                let newStaticAttrKey = G_GetAttribute(newNode, G_Tag_Attr_Key);
                /*#}#*/
                let updateAttribute =/*#if(modules.updaterTouchAttr){#*/ I_AttrDiff(oldNode, newNode)/*#}else{#*/!newStaticAttrKey || newStaticAttrKey != G_GetAttribute(oldNode, G_Tag_Attr_Key)/*#}#*/,
                    updateChildren, unmountOld,
                    oldVf = Vframe_Vframes[G_GetAttribute(oldNode, 'id')],
                    assign,
                    view,
                    uri = newMxView && G_ParseUri(newMxView),
                    params,
                    htmlChanged, paramsChanged;
                if (newMxView && oldVf &&
                    (!G_GetAttribute(newNode, 'id') || G_GetAttribute(newNode, 'id') == G_GetAttribute(oldNode, 'id')) &&
                    oldVf['@{vframe#view.path}'] == uri[G_PATH] &&
                    (view = oldVf['@{vframe#view.entity}'])) {
                    htmlChanged = newHTML != oldVf['@{vframe#template}'];
                    paramsChanged = newMxView != oldVf[G_PATH];
                    assign = G_GetAttribute(oldNode, G_Tag_View_Key);
                    //如果组件内html没改变，参数也没改变
                    //我们要检测引用参数是否发生了改变
                    if (!htmlChanged && !paramsChanged && assign) {
                        //对于mxv属性，带value的必定是组件
                        //所以对组件，我们只检测参数与html，所以组件的hasMXV=0
                        params = assign.split(G_COMMA);
                        /*#if(modules.vframeHost){#*/
                        newStaticAttrKey = Updater_ChangedKeys[oldVf.hId || oldVf.pId];
                        /*#}#*/
                        for (assign of params) {
                            //支持模板内使用this获取整个数据对象
                            //如果使用this来传递数据，我们把this的key处理成#号
                            //遇到#号则任意的数据改变都需要更新当前这个组件
                            if (assign == G_HashKey || G_Has(keys, assign) /*#if(modules.vframeHost){#*/ || G_Has(newStaticAttrKey, assign)/*#}#*/) {
                                paramsChanged = 1;
                                break;
                            }
                        }
                    }
                    //目前属性变化并不更新view,如果要更新，只需要再判断下updateAttribute即可
                    if (paramsChanged || htmlChanged /*#if(modules.updaterTouchAttr){#*/ || updateAttribute/*#}#*/) {
                        assign = view['@{view#rendered}'] && view['@{view#assign.fn}'];
                        if (assign) {
                            params = uri[G_PARAMS];
                            //处理引用赋值
                            /*#if(modules.viewChildren){#*/newStaticAttrKey = /*#}#*/Vframe_TranslateQuery(/*#if(modules.vframeHost){#*/oldVf.hId ||/*#}#*/oldVf.pId, newMxView, params);
                            oldVf['@{vframe#template}'] = newHTML;
                            //oldVf['@{vframe#data.stringify}'] = newDataStringify;
                            oldVf[G_PATH] = newMxView;//update ref
                            uri = {
                                node: newNode,/*#if(modules.viewChildren){#*/
                                map: Children_Wrap(newNode, newStaticAttrKey),
                                /*#}#*/
                                //html: newHTML,
                                deep: !view.tmpl,
                                attr: updateAttribute,
                                //mxv: hasMXV,
                                inner: htmlChanged,
                                query: paramsChanged,
                                keys
                            };
                            //updateAttribute = 1;
                            /*if (updateAttribute) {
                                updateAttribute = G_EMPTY;
                                I_SetAttributes(oldNode, newNode, ref, 1);
                            }*/
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
                    } //else {//view没发生变化，则只更新特别的几个属性
                    //updateAttribute = 1;
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
                    //对于view，我们只更新特别的几个属性
                    I_SetAttributes(oldNode, newNode, ref, oldVf && newMxView);
                }
                // Update all children (and subchildren).
                if (updateChildren) {
                    //ref.c = 1;
                    I_SetChildNodes(oldNode, newNode, ref, vf, keys);
                }
            } else if (oldNode.nodeValue !== newNode.nodeValue) {
                ref.c = 1;
                oldNode.nodeValue = newNode.nodeValue;
            }
        } else {
            // we have to replace the node.
            I_UnmountVframs(vf, oldNode);
            //I_LazyId(ref, newNode);
            //oldParent.replaceChild(newNode, oldNode);
            ref.c = 1;
            ref.n.push([4, oldParent, newNode, oldNode]);
        }
    }
};