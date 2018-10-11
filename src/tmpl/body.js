/*
    dom event处理思路

    性能和低资源占用高于一切，在不特别影响编程体验的情况下，向性能和资源妥协

    1.所有事件代理到body上
    2.优先使用原生冒泡事件，使用mouseover+Magix.inside代替mouseenter
        'over<mouseover>':function(e){
            if(!Magix.inside(e.relatedTarget,e.eventTarget)){
                //enter
            }
        }
    3.事件支持嵌套，向上冒泡
    4.如果同一节点上同时绑定了mx-event和选择器事件，如
        <div data-menu="true" mx-click="clickMenu()"></div>

        'clickMenu<click>'(e){
            console.log('direct',e);
        },
        '$div[data-menu="true"]<click>'(e){
            console.log('selector',e);
        }

        那么先派发选择器绑定的事件再派发mx-event绑定的事件


    5.在当前view根节点上绑定事件，目前只能使用选择器绑定，如
        '$<click>'(e){
            console.log('view root click',e);
        }
    
    range:{
        app:{
            20:{
                mouseover:1,
                mousemove:1
            }
        }
    }
    view:{
        linkage:{
            40:1
        }
    }
 */
let Body_EvtInfoCache = new G_Cache(30, 10);
let Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(]+)\(([\s\S]*)?\)/;
let Body_RootEvents = {};
let Body_SearchSelectorEvents = {};
let Body_RangeEvents = {};
let Body_RangeVframes = {};
let Body_Guid = 0;
let Body_FindVframeInfo = (current, eventType) => {
    let vf, tempId, selectorObject, eventSelector, eventInfos = [],
        begin = current,
        info = G_GetAttribute(current,`mx-${eventType}`),
        match, view, vfs = [],
        selectorVfId = G_HashKey,
        backtrace = 0;
    if (info) {
        match = Body_EvtInfoCache.get(info);
        if (!match) {
            match = info.match(Body_EvtInfoReg) || G_EMPTY_ARRAY;
            match = {
                v: match[1],
                n: match[2],
                i: match[3]
            };
            Body_EvtInfoCache.set(info, match);
        }
        match = {
            ...match,
            r: info
        };
    }
    //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
    if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
        if ((selectorObject = Body_RangeVframes[tempId = begin['@{node#owner.vframe}']])
            && selectorObject[begin['@{node#guid}']] == 1) {
            view = 1;
            selectorVfId = tempId;//如果节点有缓存，则使用缓存
        }
        if (!view) { //先找最近的vframe
            vfs.push(begin);
            while (begin != G_DOCBODY && (begin = begin.parentNode)) { //找最近的vframe,且节点上没有mx-autonomy属性
                if (Vframe_Vframes[tempId = begin.id] ||
                    ((selectorObject = Body_RangeVframes[tempId = begin['@{node#owner.vframe}']]) &&
                        selectorObject[begin['@{node#guid}']] == 1)) {
                    selectorVfId = tempId;
                    break;
                }
                vfs.push(begin);
            }
            for (info of vfs) {
                if (!(tempId = Body_RangeVframes[selectorVfId])) {
                    tempId = Body_RangeVframes[selectorVfId] = {};
                }
                selectorObject = info['@{node#guid}'] || (info['@{node#guid}'] = ++Body_Guid);
                tempId[selectorObject] = 1;
                info['@{node#owner.vframe}'] = selectorVfId;
            }
        }
        //if (selectorVfId != G_HashKey) { //从最近的vframe向上查找带有选择器事件的view
        /*#if(modules.layerVframe){#*/
        //主要兼容服务端输出，不带id的情况
        let findParent = match && !match.v;
        /*#}#*/
        begin = current.id;
        if (Vframe_Vframes[begin]) {
            /*
                如果当前节点是vframe的根节点，则把当前的vf置为该vframe
                该处主要处理这样的边界情况
                <mx-vrame src="./test" mx-click="parent()"/>
                //.test.js
                export default Magix.View.extend({
                    '$<click>'(){
                        console.log('test clicked');
                    }
                });

                当click事件发生在mx-vframe节点上时，要先派发内部通过选择器绑定在根节点上的事件，然后再派发外部的事件
            */
            backtrace = selectorVfId = begin;
        }
        do {
            vf = Vframe_Vframes[selectorVfId];
            if (vf && (view = vf['@{vframe#view.entity}'])) {
                selectorObject = view['@{view#selector.events.object}'];
                eventSelector = selectorObject[eventType];
                if (eventSelector) {
                    for (begin = eventSelector.length; begin--;) {
                        tempId = eventSelector[begin];
                        selectorObject = {
                            r: tempId,
                            v: selectorVfId,
                            n: tempId
                        };
                        if (tempId) {
                            /*
                                事件发生时，做为临界的根节点只能触发`$`绑定的事件，其它事件不能触发
                            */
                            if (!backtrace &&
                                G_TargetMatchSelector(current, tempId)) {
                                eventInfos.push(selectorObject);
                            }
                        } else if (backtrace) {
                            eventInfos.unshift(selectorObject);
                        }
                    }
                }
                //防止跨view选中，到带模板的view时就中止或未指定
                /*#if(modules.layerVframe){#*/
                if (findParent) {
                    if (match.v) {
                        eventInfos.push({ ...match, v: selectorVfId });
                    } else {
                        match.v = selectorVfId;
                    }
                }
                /*#}#*/
                if (view.tmpl && !backtrace) {
                    /*#if(!modules.layerVframe){#*/
                    if (match && !match.v) match.v = selectorVfId;
                    /*#}#*/
                    break; //带界面的中止
                }
                backtrace = 0;
            }
        }
        while (vf && (selectorVfId = vf.pId));
        //}
    }
    if (match) {
        eventInfos.push(match);
    }
    return eventInfos;
};

let Body_DOMEventProcessor = domEvent => {
    let { target, type } = domEvent;
    let eventInfos;
    let ignore;
    let vframe, view, eventName, fn;
    let lastVfId;
    let params, arr = [];
    while (target != G_DOCBODY) {
        eventInfos = Body_FindVframeInfo(target, type);
        if (eventInfos.length) {
            arr = [];
            for (let { v, r, n, i } of eventInfos) {
                if (!v && DEBUG) {
                    return Magix_Cfg.error(Error(`bad ${type}:${r}`));
                }
                if (lastVfId != v) {
                    if (lastVfId && domEvent.isPropagationStopped()) {
                        break;
                    }
                    lastVfId = v;
                }
                vframe = Vframe_Vframes[v];
                view = vframe && vframe['@{vframe#view.entity}'];
                if (view) {
                    eventName = n + G_SPLITER + type;
                    fn = view[eventName];
                    if (fn) {
                        domEvent.eventTarget = target;
                        params = i ? G_ParseExpr(i, view['@{view#updater}']['@{updater#ref.data}']) : {};
                        domEvent[G_PARAMS] = params;
                        G_ToTry(fn, domEvent, view);
                        //没发现实际的用途
                        /*if (domEvent.isImmediatePropagationStopped()) {
                            break;
                        }*/
                    }
                    if (DEBUG) {
                        if (!fn) { //检测为什么找不到处理函数
                            if (eventName[0] == '\u001f') {
                                console.error('use view.wrapEvent wrap your html');
                            } else {
                                console.error('can not find event processor:' + n + '<' + type + '> from view:' + vframe.path);
                            }
                        }
                    }
                } else {//如果处于删除中的事件触发，则停止事件的传播
                    domEvent.stopPropagation();
                }
                if (DEBUG) {
                    if (!view && view !== 0) { //销毁
                        console.error('can not find vframe:' + v);
                    }
                }
            }
        }
        /*|| e.mxStop */
        if (((ignore = Body_RangeEvents[fn = target['@{node#owner.vframe}']]) &&
            (ignore = ignore[target['@{node#guid}']]) &&
            ignore[type]) ||
            domEvent.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
            //如果从某个节点开始忽略某个事件的处理，则如果缓存中有待处理的节点，把这些节点owner.vframe处理成当前节点的owner.vframe
            if (arr.length) {
                arr.push(fn);
            }
            break;
        } else {
            //如果某个节点是view临界节点
            //先追加id，后续节点的owner.vframe则是该节点
            lastVfId = target.id;
            if (Vframe_Vframes[lastVfId]) {
                arr.push(lastVfId);
            }
            //缓存
            arr.push(target);
        }
        target = target.parentNode || G_DOCBODY;
    }
    if ((fn = arr.length)) {
        ignore = G_HashKey;
        for (; fn--;) {
            view = arr[fn];
            if (view.nodeType) {
                if (!(eventInfos = Body_RangeEvents[ignore])) {
                    eventInfos = Body_RangeEvents[ignore] = {};
                }
                lastVfId = view['@{node#guid}'] || (view['@{node#guid}'] = ++Body_Guid);
                if (!(params = eventInfos[lastVfId])) {
                    params = eventInfos[lastVfId] = {};
                    //view['@{node#owner.vframe}'] = ignore;
                }
                params[type] = 1;
            } else {
                ignore = view;
            }
        }
    }
};
let Body_DOMEventBind = (type, searchSelector, remove) => {
    let counter = Body_RootEvents[type] | 0;
    let offset = (remove ? -1 : 1);
    if (!counter || remove === counter) { // remove=1  counter=1
        G_DOMEventLibBind(G_DOCBODY, type, Body_DOMEventProcessor, remove);
    }
    Body_RootEvents[type] = counter + offset;
    if (searchSelector) { //记录需要搜索选择器的事件
        Body_SearchSelectorEvents[type] = (Body_SearchSelectorEvents[type] | 0) + offset;
    }
};