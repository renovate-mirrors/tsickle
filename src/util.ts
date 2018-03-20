/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// toArray is a temporary function to help in the use of
// ES6 maps and sets when running on node 4, which doesn't
// support Iterators completely.

import * as path from 'path';
import * as ts from 'typescript';

/**
 * Constructs a new ts.CompilerHost that overlays sources in substituteSource
 * over another ts.CompilerHost.
 *
 * @param substituteSource A map of source file name -> overlay source text.
 */
export function createSourceReplacingCompilerHost(
    substituteSource: Map<string, string>, delegate: ts.CompilerHost): ts.CompilerHost {
  return {
    getSourceFile,
    getCancellationToken: delegate.getCancellationToken,
    getDefaultLibFileName: delegate.getDefaultLibFileName,
    writeFile: delegate.writeFile,
    getCurrentDirectory: delegate.getCurrentDirectory,
    getCanonicalFileName: delegate.getCanonicalFileName,
    useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
    getNewLine: delegate.getNewLine,
    fileExists: delegate.fileExists,
    readFile: delegate.readFile,
    directoryExists: delegate.directoryExists,
    getDirectories: delegate.getDirectories,
  };

  function getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile|undefined {
    const path: string = ts.sys.resolvePath(fileName);
    const sourceText = substituteSource.get(path);
    if (sourceText !== undefined) {
      return ts.createSourceFile(fileName, sourceText, languageVersion);
    }
    return delegate.getSourceFile(path, languageVersion, onError);
  }
}

/**
 * Returns the input string with line endings normalized to '\n'.
 */
export function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n/g, '\n');
}

/** @return true if node has the specified modifier flag set. */
export function hasModifierFlag(node: ts.Node, flag: ts.ModifierFlags): boolean {
  return (ts.getCombinedModifierFlags(node) & flag) !== 0;
}

export function isDtsFileName(fileName: string): boolean {
  return /\.d\.ts$/.test(fileName);
}

/**
 * Determine the lowest-level common parent directory of the given list of files.
 */
export function getCommonParentDirectory(fileNames: string[]): string {
  const pathSplitter = /[\/\\]+/;
  const commonParent = fileNames[0].split(pathSplitter);
  for (let i = 1; i < fileNames.length; i++) {
    const thisPath = fileNames[i].split(pathSplitter);
    let j = 0;
    while (thisPath[j] === commonParent[j]) {
      j++;
    }
    commonParent.length = j;  // Truncate without copying the array
  }
  if (commonParent.length === 0) {
    return '/';
  } else {
    return commonParent.join(path.sep);
  }
}
