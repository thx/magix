let When_Center = {};
G_Assign(Service_Manager, {
    commit(error, key, data) {
        let bag = new Bag();
        bag.set(data);
        for (let k in When_Center) {
            let i = When_Center[k];
            if (i.t == 1) {
                if (i.m[key]) {
                    G_ToTry(i.f, [error, bag]);
                }
            } else {
                for (let x = i.m.length, y; x--;) {
                    y = i.m[x];
                    if (y == key) {
                        if (!i.r[x]) {
                            i.c++;
                        }
                        i.r[x] = bag;
                        i.e[x] = error;
                    }
                }
                if (i.c == i.r.length) {
                    for (let x = 0; x < i.e.length; x++) {
                        if (i.e[x]) {
                            error = i.e[x];
                            break;
                        }
                    }
                    G_ToTry(i.f, [error].concat(i.r));
                }
            }
        }
        this.fire('end', {
            error,
            bag
        });
    },
    whenOne(models, callback) {
        let key = G_Id('sw');
        When_Center[key] = {
            t: 1,
            m: G_ToMap(models),
            f: callback
        };
        return {
            key,
            destroy() {
                delete When_Center[key];
            }
        };
    },
    whenAll(models, callback) {
        let key = G_Id('sw');
        When_Center[key] = {
            m: models,
            r: [],
            e: [],
            c: 0,
            f: callback
        };
        return {
            key,
            destroy() {
                delete When_Center[key];
            }
        };
    },
    offWhen(key) {
        delete When_Center[key];
    }
});