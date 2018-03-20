/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
goog.module('test_files.enum_value_literal_type.enum_value_literal_type');var module = module || {id: 'test_files/enum_value_literal_type/enum_value_literal_type.js'};// Note: if you only have one value in the enum, then the type of "x" below
// is just ExportedEnum, regardless of the annotation.  This might be a bug
// in TypeScript but this test is just trying to verify the behavior of
// exporting an enum's value, not that.

/** @enum {number} */
const ExportedEnum = {
    VALUE: 0,
    OTHERVALUE: 1,
};
exports.ExportedEnum = ExportedEnum;
ExportedEnum[ExportedEnum.VALUE] = "VALUE";
ExportedEnum[ExportedEnum.OTHERVALUE] = "OTHERVALUE";
/** @type {ExportedEnum} */
exports.x = ExportedEnum.VALUE;
