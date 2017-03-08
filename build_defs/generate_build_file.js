#!/usr/bin/env node
// From https://github.com/jasonchoimtt/angular/blob/bazel_build/build_defs/node_modules_indexer.js

'use strict';
const fs = require('fs');
const path = require('path');

function printUsageAndExit() {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]}
                <package root location> [output file] [--verify]
For each dependency in package.json, resolve the dependencies required by that
package and serialize the dependency graph into a Bazel macro using
nodejs_module, nodejs_binary and ts_ext_library.`);
  process.exit(1);
}

function main() {
  const root = process.argv[2];
  if (!root) {
    printUsageAndExit();
  }

  const packageJson = JSON.parse(fs.readFileSync(root));
  const nodeModules = path.join(path.dirname(root), 'node_modules');

  // Only create targets for direct dependencies
  const targets =
      Object.keys(readDependencies(packageJson, ['dependencies', 'devDependencies'])).sort();

  const packages = traceNodeModules(nodeModules);
  const packageMap = {};
  for (const pkg of packages) {
    packageMap[pkg] = tracePackage(path.join(nodeModules, pkg));
  }

  function collectSrcs(target, visited) {
    const isFirst = !visited;
    visited = visited || {};
    return Object
        .keys(packageMap[target].deps)
        // If the package is a target,
        // a) it is a direct dependency: ignore it since it will be in "deps"
        // b) otherwise: collect its dependencies to "srcs" too
        .filter(dep => (!isFirst || targets.indexOf(dep) === -1) && !visited.hasOwnProperty(target))
        .map(dep => collectSrcs(dep, Object.assign({[target]: true}, visited)))
        .reduce((a, b) => Object.assign(a, b), {[target]: true});
  }

  const targetDefs = targets.map(target => {
    // Find out the set of dependencies and classify them into targets (deps)
    // and non-targets (srcs)
    return {
      name: target,
      srcs: Object.keys(collectSrcs(target)).sort().map(src => 'node_modules/' + src),
      deps: Object.keys(packageMap[target].deps).sort().filter(dep => targets.indexOf(dep) !== -1),
      typings: packageMap[target].typings,
    };
  });

  let output = `###Generated by generate_build_files.js###
package(default_visibility=["//visibility:public"])
alias(
    name = "node",
    actual = "//:nodejs_bin",
)

load("//:typescript.bzl", "ts_declaration")

`;

  for (const def of targetDefs) {
    let fn;
    const args = {
      name: `"${escapeName(def.name)}"`,
      // srcs: `[${def.srcs.map(src => `"${src}"`).join(', ')}]`,
    };
    if (!def.typings) {
      fn = 'nodejs_module';
      args.deps = `[${def.deps.map(dep => `":${escapeName(dep)}"`).join(', ')}]`;
      // skip for now
      continue;
    } else {
      fn = 'ts_declaration';

      // ts_ext_library "deps" must be typescript targets
      // make the non-typescript targets put in "data"
      const tsDeps = def.deps.filter(dep => !!dep.typings);
      const nodeDeps = def.deps.filter(dep => !dep.typings);
      // args.deps = `[${tsDeps.map(dep => `":${escapeName(dep)}"`).join(', ')}]`;
      // args.data = `[${nodeDeps.map(dep => `":${escapeName(dep)}"`).join(', ')}]`;


      args.srcs = `native.glob(["${path.join('node_modules', def.name, '**/*.d.ts')}"])`;
      // args.ambient = def.typings.ambient ? 'True' : 'False';
      // args.entry_point = `"${path.join('node_modules', def.name, def.typings.path)}"`;
      // args.root_dir = `"${path.join('node_modules', def.name)}"`;
    }
    output += `${fn}(${Object.keys(args).map(k => `${k}=${args[k]}`).join(', ')})\n`;
  }

  fs.writeFileSync(process.argv[3], output, {encoding: 'utf-8'});
}

function readDependencies(packageJson, types) {
  types = types || ['dependencies', 'optionalDependencies', 'peerDependencies'];
  return types.map(type => packageJson[type]).reduce((a, b) => Object.assign(a, b), {});
}

function traceNodeModules(nodeModules) {
  const packages = [];
  for (const dir of fs.readdirSync(nodeModules)) {
    if (dir[0] === '@') {
      for (const subdir of fs.readdirSync(path.join(nodeModules, dir))) {
        const pkg = dir + '/' + subdir;
        if (fs.statSync(path.join(nodeModules, pkg)).isDirectory()) {
          packages.push(pkg);
        }
      }
    } else {
      if (fs.statSync(path.join(nodeModules, dir)).isDirectory()) {
        packages.push(dir);
      }
    }
  }

  return packages;
}

/**
 * Finds the "external" dependencies given the package directory.
 * External means that it is from outside of the package directory.
 */
function tracePackage(packageDir) {
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json')));
  } catch (err) {
  }

  if (packageJson) {
    const deps = readDependencies(packageJson);

    const internalNodeModules = path.join(packageDir, 'node_modules');
    const internalDeps =
        fs.existsSync(internalNodeModules) ? traceNodeModules(internalNodeModules) : [];

    for (const dep of internalDeps) {
      Object.assign(deps, tracePackage(path.join(internalNodeModules, dep)).deps);
    }
    for (const dep of internalDeps) {
      delete deps[dep];
    }

    let typings = null;
    let typingsPath;

    // Collect d.ts file info if "typings" or "types" is defined
    if (typeof packageJson.typings === 'string') typingsPath = packageJson.typings;
    else if (typeof packageJson.types === 'string') typingsPath = packageJson.types;

    if (typingsPath) {
      if (!typingsPath.match(/\.ts$/)) {
        typingsPath += '.d.ts';
      }

      // Apply the heuristic that anything in @types is ambient
      const looksAmbient = packageDir.indexOf('/@types/') !== -1;

      // Remove the ./ prefix with normalize
      typings = {path: path.normalize(typingsPath), ambient: looksAmbient};
    }

    return {deps: deps, typings: typings};
  } else {
    // Assume no deps if package.json does not exist / is malformed
    return {deps: {}, typings: null};
  }
}

function escapeName(name) {
  return name.replace(/@|!/g, '_').replace(/\//g, '_');
}

if (require.main === module) {
  main();
}