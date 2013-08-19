'use strict';

function RouteController(options) {
  this.app = options.app;
  this.methods = ['get', 'post', 'put', 'patch', 'delete'];
}

RouteController.prototype.route = function () {
  var that = this;
  return function (req, res, next) {
    var method = req.route.method;

    if (typeof that[method] === 'function') {
      console.log('[RouteController] calling', method);
      that[method].call(that, req, res, next);
    } else {
      var header = {Allow: this._allowedMethods()};
      that.err(res, method + ' not implemented', 405, headers);
    }
  };
};

RouteController.prototype._allowedMethods = function(){
  var allowed = [];
  for(var prop in this){
    if(typeof this[prop] === 'function' && this.methods.indexOf(prop) > -1){
      allowed.push(prop.toUpperCase());
    }
  }

  return allowed;
}

RouteController.prototype.error = function (res, err, status, headers) {
  if (typeof status !== 'number') {
    status = 500;
  }

  if (typeof headers === 'undefined') {
    headers = {};
  }

  console.log('[RouteController] error', err);

  res.set(headers);
  res.json(status, {message: err});
};

exports.createRoute = function(){
  function Route(){
    RouteController.apply(this, arguments);
  };

  Object.keys(RouteController.prototype).forEach(function(key){
    Route.prototype[key] = RouteController.prototype[key];
  });

  return Route;
}

exports.RouteController = RouteController;