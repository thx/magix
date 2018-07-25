/*
    slot
*/

let Slot_Slot = 'slot';
let Slot_RemoveReg = /\s+slot(\s*=\s*"[^"]*")?/g;
/*#if(modules.updaterQuick){#*/
let Slot = {
    from(nodes) {
        let map = {}, n, nMap, slot, c;
        for (n of nodes) {
            nMap = n['@{~v#node.attrs.map}'];
            if ((slot = nMap[Slot_Slot])) {
                delete nMap[Slot_Slot];
                n['@{~v#node.outer.html}'] = n['@{~v#node.outer.html}'].replace(Slot_RemoveReg, '');
                c = map[slot];
                if (c) {
                    if (!c.length) {
                        c = map[slot] = [c];
                    }
                    c.push(n);
                } else {
                    map[slot] = n;
                }
            }
        }
        return map;
    }
};
/*#}else{#*/
let Slot_Default = 'default';
let Slot = {
    from(node) {
        let map = {}, n, sn;
        let named, nodes = node.childNodes;
        for (n of nodes) {
            if (n.hasAttribute(Slot_Slot)) {
                named = 1;
                sn = n.getAttribute(Slot_Slot) || Slot_Default;
                map[sn] = n.outerHTML.replace(Slot_RemoveReg, '');
            }
        }
        if (!named) {
            map[Slot_Default] = node.innerHTML.replace(Slot_RemoveReg, '');
        }
        return map;
    }
};
/*#}#*/
Magix.Slot = Slot;