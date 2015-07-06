// not bind
(function(){}['bind'](this));

// not bind
(function(){}[bind](this));

(function(){}.bind(this));

[1, 2, 3].forEach(function(/*value*/) {

}.bind(this));

a.b.c.forEach(function(/*value*/) {
  return something();
}.bind(this));

a.b.c.forEach(function(arg) {

}.bind(this), opts);

a.b.c.forEach(function(arg) {
  a.b.c.forEach(function(arg) {
    a.b.c.forEach(function(arg) {
    }.bind(this), opts);
  }.bind(this), opts);
}.bind(this), opts);

a.b.c.forEach(function named(arg) {
  named();
}.bind(this), opts);

a.b.c.forEach(function named(arg) {
  otherName();
}.bind(this), opts);

a.b.c.forEach(function named(arg) {
  arguments;
}.bind(this), opts);
