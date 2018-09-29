//从子节点中获取数据
let Children_Is = 'mx-is';
let Children_Parse = (node, data, parent) => {
    let hasMxIs = !parent;
    let hasMXV = node['@{~v#node.has.mxv}'];
    /*#if(modules.updaterQuick){#*/
    let map = {
        attrs: {},
        subs: [],
        nodes: node['@{~v#node.children}']
    };
    let nodes = node['@{~v#node.children}'];
    let attrs = node['@{~v#node.attrs.map}'];
    if (attrs && parent) {
        let ra = map.attrs;
        for (let a in attrs) {
            if (a == Children_Is) {
                hasMxIs = 1;
                map.is = attrs[a];
            } else {
                ra[a] = G_TranslateData(data, attrs[a]);
            }
        }
    }
    /*#}else{#*/
    let map = {
        attrs: {},
        subs: [],
        html: node.innerHTML
    };
    let nodes = node.childNodes;
    let attrs = node.attributes;
    if (attrs && parent) {
        let ra = map.attrs;
        for (let a of attrs) {
            if (a.name == Children_Is) {
                hasMxIs = 1;
                map.is = a.value;
            } else if (a.name == G_Tag_View_Key) {
                hasMXV = 1;
            } else {
                ra[a.name] = G_TranslateData(data, a.value);
            }
        }
    }
    /*#}#*/
    if (hasMxIs) {
        if (parent) {
            parent.mxv = hasMXV;
            parent.subs.push(map);
        }
        for (let n of nodes) {
            Children_Parse(n, data, map);
        }
    }
    return map;
};
let Children_Wrap = (node, data) => () => Children_Parse(node, data);