let gulp = require('gulp');
let uglifyES = require('gulp-terser-scoped');
let fs = require('fs');
let rename = require('gulp-rename');
let header = require('gulp-header');
let doc = require('./lib/doc');
let pkg = require('../package.json');
let ts = require('typescript');
let customize = require('./customize');

let type = 'cmd,amd,kissy,webpack,module'; //打包kissy则type='kissy'
let enableModules = 'style,viewInit,service,router,resource,configIni,nodeAttachVframe,viewMerge,tipRouter,updater,viewProtoMixins,base,defaultView,autoEndUpdate,linkage,updateTitleRouter,urlRewriteRouter,state,updaterDOM,viewInitAsync';

//let mini='style,naked,updater,updaterVDOM,updaterQuick,mini'
//let enableModules = 'style,viewInit,router,viewMerge,tipRouter,updater,autoEndUpdate,linkage,state,updaterDOM,viewProtoMixins';

//let enableModules='';
//mobile
//let enableModules='defaultView,autoEndUpdate,linkage,base,style,viewInit,resource,nodeAttachVframe,updater,layerVframe,state';

gulp.task('combine', () => {
    type.split(',').forEach(t => {
        customize({
            loaderType: t,
            tmplFile: '../src/' + t + '/magix.js',
            aimFile: '../dist/' + t + '/magix-debug.js',
            enableModules: enableModules
        });
        if (t !== 'module') {
            customize({
                loaderType: t,
                tmplFile: '../src/' + t + '/magix.js',
                aimFile: '../dist/' + t + '/magix-es3-debug.js',
                enableModules: enableModules
            }, true);
            let c = fs.readFileSync('../dist/' + t + '/magix-es3-debug.js') + '';
            let str = ts.transpileModule(c, {
                compilerOptions: {
                    lib: ['ES7', 'ESNext', 'ES6'],
                    target: 'es3',
                    module: ts.ModuleKind.None
                }
            });
            str = str.outputText;
            str = str.replace(/^[^#]+/, '//');
            str = str.replace(/__assign\(/g, 'G_Assign(');
            fs.writeFileSync('../dist/' + t + '/magix-es3-debug.js', str);
        }
    });
});

gulp.task('compress', () => {
    type.split(',').forEach(t => {
        gulp.src('../dist/' + t + '/magix-debug.js')
            .pipe(uglifyES({
                esModule: t == 'module',
                compress: {
                    expression: true,
                    keep_fargs: false,
                    drop_console: true,
                    global_defs: {
                        DEBUG: false
                    }
                },
                output: {
                    ascii_only: true
                }
            }))
            .pipe(header('/*!<%=ver%> MIT kooboy_li@163.com*/', {
                ver: pkg.version
            }))
            .pipe(rename('magix.js'))
            .pipe(gulp.dest('../dist/' + t + '/'));
        gulp.src('../dist/' + t + '/magix-es3-debug.js')
            .pipe(uglifyES({
                compress: {
                    expression: true,
                    keep_fargs: false,
                    drop_console: true,
                    global_defs: {
                        DEBUG: false
                    }
                },
                output: {
                    ascii_only: true
                }
            }))
            .pipe(header('/*!<%=ver%> MIT kooboy_li@163.com*/', {
                ver: pkg.version
            }))
            .pipe(rename('magix-es3.js'))
            .pipe(gulp.dest('../dist/' + t + '/'));
    });
});

gulp.task('doc', ['combine'], () => {
    let content = fs.readFileSync('../dist/' + (type.split(',')[0]) + '/magix-debug.js').toString();
    let main = doc(content);
    fs.writeFileSync('../../magix-doc3/tmpl/data.js', 'define("data",function(){return ' + JSON.stringify(main) + '})');
});