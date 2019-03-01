function iniMagix() {
    return new Promise(resolve => {
        KISSY.use('magix, sizzle', (S, M) => {
            window.Magix = M;
            resolve();
        });
    });
}