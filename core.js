var utils = require('./utils'),
    scope = require('./scope'),
    _global = require('./core/global'),
    _array = require('./core/array'),
    _date = require('./core/date'),
    _function = require('./core/function'),
    _json = require('./core/json'),
    _regexp = require('./core/regexp'),
    _string = require('./core/string'),
    _math = require('./core/math'),
    _number = require('./core/number');

module.exports = {

  evaluate: function(node) {
    var handler = undefined;

    if (node.object && node.object.type === 'MemberExpression') {
      var newNode = module.exports.evaluate(node.object);
      if (newNode !== node.object) {
        node.object = newNode;
      }
    }
    if (node.object && node.object.type === 'Literal') {
      var method = node.property.name;
      handler = node.object.regex ? _regexp[method] : _string[method];
    } else if (node.property) {
      var method = node.property.name;
      // _array should be before _string here so we pick up the correct
      // multitype version of #length and #indexOf
      handler = _array[method] || _date[method] || _function[method] || _json[method] || _string[method] || _math[method] || _number[method];
    } else if (node.callee) {
      handler = _global[node.callee.name];
    }

    if (handler) {
      node = handler(node);
      node.scope = scope.create(node);
    }

    return node;
  }

}
