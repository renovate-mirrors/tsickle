// Unlike declare.d.ts, this file is a module.

// "declare global" should show up in the global namespace.
declare global {
  var globalX: string;
  export class GlobalClass {}
  export namespace globalNamespace {
    var Y: string;
    export class GlobalNamespaced {}
  }
}

// This symbol will be emitted hidden with the file name as its prefix.
export var exported: string;
