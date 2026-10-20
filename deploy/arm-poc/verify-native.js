// Checks that a Meteor bundle's native modules work on this machine.
// Usage: node verify-native.js <bundle dir>
// Exits non-zero if a module DiceCloud needs at runtime fails to load.
const fs = require('fs');
const path = require('path');

const bundle = process.argv[2];
if (!bundle) {
  console.error('usage: node verify-native.js <bundle dir>');
  process.exit(2);
}
const server = path.join(bundle, 'programs', 'server');

// ELF e_machine values
const MACHINES = { 0x3e: 'x86_64', 0xb7: 'aarch64' };

function elfMachine(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const header = Buffer.alloc(20);
    fs.readSync(fd, header, 0, 20, 0);
    if (header.readUInt32BE(0) !== 0x7f454c46) return 'not-elf';
    const machine = header[5] === 2 ? header.readUInt16BE(18) : header.readUInt16LE(18);
    return MACHINES[machine] || `unknown(0x${machine.toString(16)})`;
  } finally {
    fs.closeSync(fd);
  }
}

function findNodeFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findNodeFiles(full, found);
    else if (entry.name.endsWith('.node')) found.push(full);
  }
  return found;
}

console.log(`node ${process.version} on ${process.arch}`);

// 1. Report the architecture of every compiled module in the bundle.
//    Leftover x86 files are only a problem if something loads them, which
//    the require checks below decide.
const leftovers = [];
for (const file of findNodeFiles(server)) {
  const machine = elfMachine(file);
  if (machine !== 'aarch64') leftovers.push(`${machine}  ${path.relative(bundle, file)}`);
}
if (leftovers.length) {
  console.log(`WARN ${leftovers.length} non-arm64 .node file(s) remain:`);
  leftovers.forEach((line) => console.log(`  ${line}`));
}

// 2. Load the modules the server actually uses.
let failed = false;
function check(label, modulePath, test, required = true) {
  try {
    test(require(modulePath));
    console.log(`OK   ${label}`);
  } catch (e) {
    console.log(`${required ? 'FAIL' : 'WARN'} ${label}: ${e.message.split('\n')[0]}`);
    if (required) failed = true;
  }
}

const npmModules = path.join(server, 'npm', 'node_modules');
check('fibers', path.join(server, 'node_modules', 'fibers'), (Fiber) => {
  let ran = false;
  Fiber(() => { ran = true; }).run();
  if (!ran) throw new Error('fiber did not run');
});
check('bcrypt', path.join(npmModules, 'bcrypt'), (bcrypt) => {
  const hash = bcrypt.hashSync('reverent-abyss', 4);
  if (!bcrypt.compareSync('reverent-abyss', hash)) throw new Error('hash mismatch');
});
// sharp is a dependency but no server code imports it, so it is not fatal
check('sharp', path.join(npmModules, 'sharp'), (sharp) => {
  if (!sharp.versions) throw new Error('sharp loaded without versions');
}, false);

if (failed) {
  console.error('Native module check FAILED: this bundle will not run on this machine.');
  process.exit(1);
}
console.log('Native module check passed.');
