/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.jsx.jsx');var module = module || {id: 'test_files/jsx/jsx.js'};/** @type {!JSX.Element} */
let simple = React.createElement("div", null);
/** @type {string} */
let hello = 'hello';
/** @type {!JSX.Element} */
let helloDiv = React.createElement("div", null,
    hello,
    "hello, world",
    React.createElement(Component, null));
React.render(helloDiv, /** @type {!HTMLElement} */ ((document.body)));
