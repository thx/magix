let path = require('path');
let fs = require('fs');
let rs = require('./lib/rs');
let tmpl = require('./lib/tmpl');
var pkg = require('../package.json');
let sep = path.sep;
let modulesReg = /\/\/#modules\s*=\s*([^\r\n]+)/;
let incReg = /Inc\((['"])(.+)\1\);*/g;
let modules = {
    base: 1, //base模块
    style: 1, //是否有样式处理

    updater: 1, //自动更新
    updaterDOM: 1, //dom增量更新
    updaterVDOM: 1,//v-dom增量更新
    updaterQuick: 1,//quick
    updaterAsync: 1,//异步更新界面
    updaterTouchAttr: 1,//当attr变化时是否更新view

    service: 1, //接口服务
    serviceCombine: 1, //接口combine
    servicePush: 1,//接口对象主动推送数据

    router: 1, //路由模块
    tipRouter: 1, //切换页面时，如果开发者明确告诉magix数据有改变，则会提示用户
    tipLockUrlRouter: 1, //锁定url功能
    edgeRouter: 1, //使用pushState
    forceEdgeRouter: 1, //强制使用pushState
    urlRewriteRouter: 1, //url重写
    updateTitleRouter: 1, //支持更新document.title

    state: 1, //状态
    cnum: 1, //Cache num
    ceach: 1, //Cache each

    vframeHost: 1, //父子化同一个view中嵌套存在的vframe
    layerVframe: 1,//
    collectView: 1, //收集同一个view中所有的子view并一次性发出请求，在请求combine时有用
    viewProtoMixins: 1, //支持mixins
    //viewSlot: 1,//view支持slot
    share: 1, //向子或孙view公开数据
    defaultView: 1, //自动初始化
    //autoEndUpdate: 1, //自动识别并结束更新。针对没有tmpl属性的view自动识别并结束更新
    linkage: 1, //vframe上是否带父子间调用的方法，通常在移动端并不需要
    viewInit: 1, //init方法
    viewInitAsync: 1,//init支持promise
    resource: 1, //资源管理
    configIni: 1, //是否有ini配置文件
    nodeAttachVframe: 1, //节点上挂vframe对象
    viewMerge: 1, //view是否提供merge方法供扩展原型链对象
    keepHTML: 1, //保留html
    naked: 1,//原生实现
    viewChildren: 1,//是否可以序列化子节点
    dispatcherRecast: 1//渲染拦截
};
rs.map({
    '@{vframe#view.entity}': '$v',
    '@{view#selector.events.object}': '$so',
    '@{view#shared.data}': '$sd',
    '@{view#events.object}': '$eo',
    '@{view#events.list}': '$el',
    '@{view#observe.router}': '$l',
    '@{view#observe.state}': '$os',
    '@{vframe#children.created}': '$cr',
    '@{vframe#children.altered}': '$ca',
    '@{service#meta}': '$m',
    '@{vframe#children}': '$c',
    '@{vframe#children.count}': '$cc',
    '@{vframe#children.ready.count}': '$rc',
    '@{view#resource}': '$r',
    '@{service#cache}': '$c',
    '@{service#send}': '$s',
    '@{vframe#mounted}': '$m',
    '@{updater#keys}': '$k',
    '@{updater#data.changed}': '$c'
});
let copyFile = (from, to, callback) => {
    let folders = path.dirname(to).split(sep);
    let p = '';
    while (folders.length) {
        p += folders.shift() + sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
    let content = fs.readFileSync(from);
    if (callback) {
        content = callback(content + '');
    }
    fs.writeFileSync(to, content);
};
module.exports = (options, es3) => {
    let enableModules = options.enableModules;
    let loaderType = options.loaderType || 'unknown';
    let tmplFile = options.tmplFile;
    let aimFile = options.aimFile;
    let getModules = m => {
        let map = {};
        let others = [];
        m.split(',').forEach(function (m) {
            m = m.trim();
            map[m] = 1;
            if (m == 'service') {
                m = 'ceach';
            }
            map[m] = 1;
        });
        for (let p in modules) {
            if (!map[p]) {
                others.push(p);
            }
        }
        return {
            enables: map,
            others
        };
    };
    copyFile(tmplFile, aimFile, content => {
        let match = content.match(modulesReg),
            m;
        if (match) {
            m = getModules(match[1]);
        } else {
            m = getModules(enableModules);
        }
        let dir = path.dirname(tmplFile);
        content = content.replace(incReg, (match, q, name) => {
            let file = path.resolve(dir, name + '.js');
            return fs.readFileSync(file) + '';
        });
        let header = '\/\/#snippet;\r\n\/\/#uncheck = jsThis,jsLoop;\r\n\/\/#exclude = loader,allProcessor;\r\n/*!' + pkg.version + ' Licensed MIT*/';
        header += '\r\n/*\r\nauthor:kooboy_li@163.com\r\nloader:' + loaderType;
        header += '\r\nenables:' + Object.keys(m.enables);
        header += '\r\n\r\noptionals:' + m.others;
        header += '\r\n*/\r\n';
        if (es3) {
            m.enables.es3 = true;
        }
        m.enables[loaderType] = true;
        if (loaderType == 'module') {
            m.enables.naked = true;
        }
        return rs.process(tmpl(header + content, m.enables));
    });
};