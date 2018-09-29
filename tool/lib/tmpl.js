var tmpl = function (text, data) {
  var settings, render, noMatch, matcher, index, source, escaper, escapes, template;

  matcher = /\/\*#=([\s\S]+?)#\*\/|\/\*#([\s\S]+?)#\*\/|$/g;

  index = 0;
  source = "__p+='";
  escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  text.replace(matcher, function (match, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escaper, function (match) {
      return '\\' + escapes[match];
    });

    if (interpolate)
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";

    if (evaluate)
      source += "';$expr='" + evaluate + "'\n" + evaluate + "\n__p+='";

    index = offset + match.length;
    return match;
  });

  source += "';\n";
  //source = 'with(obj||{}){\n' + source + '}\n';
  source = "var __t,__p='',__j=Array.prototype.join,$expr=''," +
    "print=function(){__p+=__j.call(arguments,'');};\ntry{" + source + "return __p;}catch(e){console.log('eeeeeeee',e);$throw(e,$expr) }\n";
  //console.log(source);
  try {
    //console.log(source);
    render = new Function('modules', '$throw', source);
  } catch (e) {
    //e.source = source;
    //console.log('xxxxxxxx',e);
    throw e;
  }

  if (data)
    return render(data, expr => {
      console.log('aaaaaaaaaa',expr);
    });

  template = function (data) {
    return render.call(this, data);
  };

  template.source = 'function(modules){\n' + source + '}';

  return template;
};
module.exports = tmpl;