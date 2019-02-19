let gulp = require('gulp');
let uglifyES = require('gulp-uglify-es-scoped');
let uglify = require('gulp-uglify');
let fs = require('fs');
let rename = require('gulp-rename');
let header = require('gulp-header');
let doc = require('./lib/doc');
let pkg = require('../package.json');
let ts = require('typescript');
let customize = require('./customize');
let parser = require('@babel/parser');
let generate = require('@babel/generator').default;

let type = 'cmd,amd,kissy,webpack,module'; //打包kissy则type='kissy'
let enableModules = 'style,viewInit,service,router,resource,configIni,nodeAttachVframe,viewMerge,tipRouter,updater,viewProtoMixins,base,defaultView,autoEndUpdate,linkage,updateTitleRouter,urlRewriteRouter,state,updaterDOM,viewInitAsync';

//let mini='style,naked,updater,updaterVDOM,updaterQuick,mini'
//let enableModules = 'style,viewInit,router,viewMerge,tipRouter,updater,autoEndUpdate,linkage,state,updaterDOM,viewProtoMixins';

//let enableModules='';
//mobile
//let enableModules='defaultView,autoEndUpdate,linkage,base,style,viewInit,resource,nodeAttachVframe,updater,mxViewAttr,layerVframe,state';

// for shim
enableModules = 'style,viewInit,service,router,resource,configIni,nodeAttachVframe,viewMerge,tipRouter,updater,viewProtoMixins,base,defaultView,autoEndUpdate,linkage,updateTitleRouter,urlRewriteRouter,state,updaterDOM,eventEnterLeave,kissy';

function getAllPrivateFunAndVar(tree) {
  const expression = tree.program.body[0].expression;
  const FunctionExpression = expression.arguments[1];
  const functionBody = FunctionExpression.body;
  const prFunArr = [];
  const prVarArr = [];

  FunctionExpression.params.forEach(param => {
    prVarArr.push(param.name);
  });

  functionBody.body.forEach(node => {
    if (node.type === 'FunctionDeclaration') {
      prFunArr.push(node.id.name);
    } else if (node.type === 'VariableDeclaration') {
      var declaration = node.declarations[0];

      if (declaration.init && declaration.init.type === 'FunctionExpression') {
        prFunArr.push(declaration.id.name);
      } else {
        prVarArr.push(declaration.id.name)
      }
    }
  });

  return { prFunArr, prVarArr };
}

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
      let testStr;
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

      if (t === 'kissy') {
        let tree = parser.parse(str, {
            sourceType: 'script'
          });
    
          const tmpArr = str.split('return Magix;');
          // 输出替换私有方法模块
          const insertFunArr = [ 'Magix[\'$|_attrForTest_|$priFun$|_attrForTest_|$\']={' ];
          const { prFunArr, prVarArr } = getAllPrivateFunAndVar(tree);
          
          prFunArr.forEach((funName, index) => {
            insertFunArr.push('\'set-' + funName + '\':function(fun){ var ori=' + funName + ';' + funName + '=fun; return ori;},' + 
              '\'get-' + funName + '\':function(){ return ' + funName + ';}' + 
              (index === prFunArr.length - 1 ? '' : ',' ));
          });
    
          insertFunArr.push('};\n');
          tmpArr[0] = tmpArr[0] + insertFunArr.join('');
          // 输出私有变量
          const insertVarArr = [ '    Magix[\'$|_attrForTest_|$priVar$|_attrForTest_|$\']={' ];
    
          prVarArr.forEach((varName, index) => {
            insertVarArr.push('\'get-' + varName + '\':function(){ return ' + varName + ';},' + 
              '\'set-' + varName + '\':function(value){ ' + varName + ' = value;}' + 
              (index === prVarArr.length - 1 ? '' : ',' ));
          });
    
          insertVarArr.push('};\n');
          tmpArr[0] = tmpArr[0] + insertVarArr.join('');
          testStr = tmpArr.join('    return Magix;');
          
          fs.writeFileSync('../dist/' + t + '/magix-es3-debug-test.js', testStr);
      }

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
            .pipe(uglify({
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