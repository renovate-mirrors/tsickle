/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.clutz.no_externs.strip_clutz_type');var module = module || {id: 'test_files/clutz.no_externs/strip_clutz_type.js'};
var goog_some_name_space_1 = goog.require('some.name.space');
const tsickle_forward_declare_1 = goog.forwardDeclare("some.name.space");
const tsickle_forward_declare_2 = goog.forwardDeclare("some.other");
goog.require("some.other"); // force type-only module to be loaded
/** @type {!tsickle_forward_declare_1.ClutzedClass} */
let clutzedClass = new goog_some_name_space_1.ClutzedClass();
console.log(clutzedClass);
/** @type {!tsickle_forward_declare_2.ClutzedInterface} */
let typeAliased = clutzedClass.field;
goog_some_name_space_1.clutzedFn(typeAliased);
