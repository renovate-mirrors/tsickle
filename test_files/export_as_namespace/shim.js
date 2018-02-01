/**
 * @fileoverview An example of how to shim an external namespace declared in a .d.ts that's an ES6
 * module.
 */

goog.module('test_files.export_as_namespace.export_as_namespace');

// Assign the external namespace. "exportNamespace" is assumed to be loaded separately, e.g. through a
// script tag or so.
exports = /** @type {tsickle_module_externs$test_files_export_as_namespace_export_as_namespace.exportNamespace} */ (window['exportNamespace']);
