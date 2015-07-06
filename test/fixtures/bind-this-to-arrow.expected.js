// not bind
(function(){}['bind'](this));

// not bind
(function(){}[bind](this));

(() => {});

[1, 2, 3].forEach((/*value*/) => {});

a.b.c.forEach(() => something());

a.b.c.forEach((arg) => {

}, opts);

a.b.c.forEach((arg) => {
  a.b.c.forEach((arg) => {
    a.b.c.forEach((arg) => {
    }, opts);
  }, opts);
}, opts);

a.b.c.forEach(function named(arg) {
  named();
}.bind(this), opts);

a.b.c.forEach((arg) => {
  otherName();
}, opts);

a.b.c.forEach(function named(arg) {
  arguments;
}.bind(this), opts);
