#!/bin/sh
# Rebuilds the native npm modules of an x86-built Meteor bundle for the
# current (arm64) machine. Usage: rebuild-native.sh <bundle dir>
set -eu

BUNDLE="${1:?usage: rebuild-native.sh <bundle dir>}"
SERVER="$BUNDLE/programs/server"

# 1. Meteor's own server dependencies (fibers and friends). These are not in
#    the bundle; npm installs and compiles them here, as Meteor's README says.
echo "==> Installing server dependencies (fibers)"
(cd "$SERVER" && npm install --production --unsafe-perm)

# 2. The app's npm dependencies and the npm dependencies of Meteor packages
#    were installed on the x86 build machine. Rebuild every tree that holds
#    a compiled module.
rebuild_tree() {
  echo "==> npm rebuild in $1"
  (cd "$1" && npm rebuild --update-binary)
}

rebuild_tree "$SERVER/npm"
for pkg in "$SERVER"/npm/node_modules/meteor/*/; do
  if [ -d "$pkg/node_modules" ] && find "$pkg/node_modules" -name binding.gyp -print -quit | grep -q .; then
    rebuild_tree "$pkg"
  fi
done

# 3. sharp 0.33 ships its binary as a per-platform optional package rather than
#    an install script, so npm rebuild does not fetch the arm64 one. Unpack the
#    matching @img packages by hand.
SHARP="$SERVER/npm/node_modules/sharp"
if [ -f "$SHARP/package.json" ]; then
  for name in @img/sharp-linux-arm64 @img/sharp-libvips-linux-arm64; do
    version="$(node -e "const p=require('$SHARP/package.json');console.log((p.optionalDependencies||{})['$name']||'')")"
    [ -n "$version" ] || continue
    target="$SERVER/npm/node_modules/$name"
    echo "==> Fetching $name@$version"
    tmp="$(mktemp -d)"
    (cd "$tmp" && npm pack "$name@$version" >/dev/null)
    rm -rf "$target" && mkdir -p "$target"
    tar -xzf "$tmp"/*.tgz -C "$target" --strip-components=1
    rm -rf "$tmp"
  done
fi

echo "==> Native rebuild finished"
