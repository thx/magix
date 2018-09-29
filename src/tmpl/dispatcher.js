let Dispatcher_UpdateTag = 0;
/**
 * 通知当前vframe，地址栏发生变化
 * @param {Vframe} vframe vframe对象
 * @private
 */
let Dispatcher_Update = (vframe, /*#if(modules.state){#*/ stateKeys, /*#}#*/ view, isChanged, cs, c) => {
    if (vframe && vframe['@{vframe#update.tag}'] != Dispatcher_UpdateTag &&
        (view = vframe['@{vframe#view.entity}']) &&
        view['@{view#sign}'] > 1) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的G_WINDOW.location.href对象，对于销毁的也不需要广播
        /*#if(modules.state&&modules.router){#*/
        isChanged = stateKeys ? State_IsObserveChanged(view, stateKeys) : View_IsObserveChanged(view);
        /*#}else if(modules.state){#*/
        isChanged = State_IsObserveChanged(view, stateKeys);
        /*#}else{#*/
        isChanged = View_IsObserveChanged(view);
        /*#}#*/
        /**
         * 事件对象
         * @type {Object}
         * @ignore
         */
        /*let args = {
                location: RefLoc,
                changed: RefG_LocationChanged,*/
        /**
         * 阻止向所有的子view传递
         * @ignore
         */
        /* prevent: function() {
                    args.cs = EmptyArr;
                },*/
        /**
         * 向特定的子view传递
         * @param  {Array} c 子view数组
         * @ignore
         */
        /*to: function(c) {
                    c = (c + EMPTY).split(COMMA);
                    args.cs = c;
                }
            };*/
        if (isChanged) { //检测view所关注的相应的参数是否发生了变化
            view['@{view#render.short}']();
        }
        cs = vframe.children();
        for (c of cs) {
            Dispatcher_Update(Vframe_Vframes[c]/*#if(modules.state){#*/, stateKeys /*#}#*/);
        }
    }
};
/**
 * 向vframe通知地址栏发生变化
 * @param {Object} e 事件对象
 * @param {Object} e.location G_WINDOW.location.href解析出来的对象
 * @private
 */
let Dispatcher_NotifyChange = (e, vf, view) => {
    /*#if(modules.dispatcherRecast){#*/
    if (!Router_PNR_Recast || !Router_PNR_Recast(e)) {
        /*#}#*/
        vf = Vframe_Root();
        /*#if(modules.router){#*/
        if ((view = e[Router_VIEW])) {
            vf.mountView(view.to);
        } else {/*#}#*/
            Dispatcher_UpdateTag = G_COUNTER++;
            Dispatcher_Update(vf /*#if(modules.state){#*/, e.keys /*#}#*/);

        /*#if(modules.router){#*/
        }/*#}#*/
        /*#if(modules.dispatcherRecast){#*/
    }
    /*#}#*/
};