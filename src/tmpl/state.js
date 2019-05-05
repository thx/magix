let State_AppData = {};
let State_AppDataKeyRef = {};
let State_ChangedKeys = {};
let State_DataIsChanged = 0;
/*#if(modules.router){#*/
let State_DataWhereSet = {};
/*#}#*/
let State_IsObserveChanged = (view, keys, r) => {
    let oKeys = view['@{view#observe.state}'], ok;
    if (oKeys) {
        for (ok of oKeys) {
            r = G_Has(keys, ok);
            if (r) break;
        }
    }
    return r;
};
let SetupKeysRef = keys => {
    keys = (keys + G_EMPTY).split(',');
    for (let key of keys) {
        if (G_Has(State_AppDataKeyRef, key)) {
            State_AppDataKeyRef[key]++;
        } else {
            State_AppDataKeyRef[key] = 1;
        }
    }
    return keys;
};
let TeardownKeysRef = keys => {
    let key, v;
    for (key of keys) {
        if (G_Has(State_AppDataKeyRef, key)) {
            v = --State_AppDataKeyRef[key];
            if (!v) {
                delete State_AppDataKeyRef[key];
                delete State_AppData[key];
                /*#if(modules.router){#*/
                if (DEBUG) {
                    delete State_DataWhereSet[key];
                }
                /*#}#*/
            }
        }
    }
};
/*#if(modules.router){#*/
if (DEBUG) {
    setTimeout(() => {
        Router.on('changed', () => {
            setTimeout(() => {
                let keys = [];
                let cls = [];
                for (let p in State_DataWhereSet) {
                    if (!State_AppDataKeyRef[p]) {
                        cls.push(p);
                        keys.push('key:"' + p + '" set by page:"' + State_DataWhereSet[p] + '"');
                    }
                }
                if (keys.length) {
                    console.warn('beware! Remember to clean ' + keys + ' in {Magix.State}   Clean use view.mixins like mixins:[Magix.State.clean("' + cls + '")]');
                }
            }, 200);
        });
    }, 0);
}
/*#}#*/
if (DEBUG) {
    let Started = 0;
    let NotifyList = [];
    let NotifyTimer = 0;
    let Notify = () => {
        let locker = {};
        for (let n of NotifyList) {
            if (!locker[n.msg]) {
                console.warn(n.msg);
                locker[n.msg] = 1;
            }
        }
        NotifyList.length = 0;
        Started = 0;
    };
    var ClearNotify = key => {
        for (let i = NotifyList.length; i--;) {
            let n = NotifyList[i];
            if (n.key == key) {
                NotifyList.splice(i, 1);
            }
        }
    };
    var DelayNotify = (key, msg) => {
        clearTimeout(NotifyTimer);
        Started = 0;
        NotifyList.push({
            key,
            msg
        });
        if (!Started) {
            Started = 1;
            NotifyTimer = setTimeout(Notify, 500);
        }
    };
}
/**
 * 可观察的内存数据对象
 * @name State
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @beta
 * @module router
 */
let State = {
    /**
     * @lends State
     */
    /**
     * 从Magix.State中获取数据
     * @param {String} [key] 数据key
     * @return {Object}
     */
    get(key) {
        let r = key ? State_AppData[key] : State_AppData;
        if (DEBUG) {
            /*#if(modules.router){#*/
            if (key && Magix_Booted) {
                let loc = Router.parse();
                if (G_Has(State_DataWhereSet, key) && State_DataWhereSet[key] != loc.path) {
                    console.warn('beware! You get state:"{Magix.State}.' + key + '" where it set by page:' + State_DataWhereSet[key]);
                }
            }
            /*#}#*/
            r = Safeguard(r, dataKey => {
                /*#if(modules.router){#*/
                if (Magix_Booted) {
                    let loc = Router.parse();
                    if (G_Has(State_DataWhereSet, dataKey) && State_DataWhereSet[dataKey] != loc.path) {
                        console.warn('beware! You get state:"{Magix.State}.' + dataKey + '" where it set by page:' + State_DataWhereSet[dataKey]);
                    }
                }
                /*#}#*/
            }, (path, value) => {
                let sub = key ? key : path;
                DelayNotify(sub, 'beware! You direct modify "{Magix.State}.' + sub + '"  You should call Magix.State.set() and Magix.State.digest() to notify other views {Magix.State} changed');
            });
        }
        return r;
    },
    /**
     * 设置数据
     * @param {Object} data 数据对象
     */
    set(data, unchanged) {
        State_DataIsChanged = G_Set(data, State_AppData, State_ChangedKeys, unchanged) || State_DataIsChanged;
        /*#if(modules.router){#*/
        if (DEBUG && Magix_Booted) {
            let loc = Router.parse();
            for (let p in data) {
                State_DataWhereSet[p] = loc.path;
            }
        }
        /*#}#*/
        return this;
    },
    /**
     * 检测数据变化，如果有变化则派发changed事件
     * @param  {Object} data 数据对象
     */
    digest(data, unchanged) {
        if (data) {
            State.set(data, unchanged);
        }
        if (State_DataIsChanged) {
            if (DEBUG) {
                for (let p in State_ChangedKeys) {
                    ClearNotify(p);
                }
            }
            State_DataIsChanged = 0;
            //防止在change事件中再次digest造成的死循环
            let keys = G_Assign({}, State_ChangedKeys);
            State_ChangedKeys = {};
            this.fire(G_CHANGED, {
                keys
            });
        }
    },
    /**
     * 获取当前数据与上一次数据有哪些变化
     * @return {Object}
     */
    diff() {
        return State_ChangedKeys;
    },
    /**
     * 清除数据，该方法需要与view绑定，写在view的mixins中，如mixins:[Magix.Sate.clean('user,permission')]
     * @param  {String} keys 数据key
     */
    clean(keys) {
        if (DEBUG) {
            let called = false;
            setTimeout(() => {
                if (!called) {
                    throw new Error('Magix.State.clean only used in View.mixins like mixins:[Magix.State.clean("p1,p2,p3")]');
                }
            }, 1000);
            return {
                '\x1e': keys,
                ctor() {
                    let me = this;
                    called = true;
                    keys = SetupKeysRef(keys);
                    me.on('destroy', () => {
                        TeardownKeysRef(keys);
                    });
                }
            };
        }
        return {
            ctor() {
                keys = SetupKeysRef(keys);
                this.on('destroy', () => TeardownKeysRef(keys));
            }
        };
    }/*#if(!modules.mini){#*/,
    ...MEvent
    /*#}#*/
    /**
     * 当State中的数据有改变化后触发
     * @name State.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.keys  包含哪些数据变化的key集合
     */
};
Magix.State = State;