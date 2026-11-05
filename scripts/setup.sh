#!/bin/sh
# Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
# SPDX-License-Identifier: Apache-2.0
# First-time setup on a Mac: checks the whole pinned runtime archive, then runs the rest on the Node and code inside it.
export LC_ALL=C LANG=C EHAI_PUBLIC_PLUGIN_ROOT="$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)"
PATH=/usr/bin:/bin:/usr/sbin:/sbin:$PATH
fail() { echo "FAILED: $1"; exit 1; }
field() { plutil -extract "runtimes.darwin-arm64.$1" raw -o - "$EHAI_PUBLIC_PLUGIN_ROOT/runtime/runtime.json" 2>/dev/null; }
[ "$(sysctl -n hw.optional.arm64 2>/dev/null)" = 1 ] && SHA=$(field sha256) || fail 'this computer is not an Apple silicon Mac, or the plugin names no runtime for it.'
DIR=${EHAI_HOME:-$HOME/.ehai}/runtime/$(field version)/lib/node_modules/ehai
if [ ! -x "$DIR/bin/node" ]; then
  DIR=$(mktemp -d "${TMPDIR:-/tmp}/ehai-setup.XXXXXX")/package || fail 'cannot write a temporary folder.'
  trap 'rm -rf "${DIR%/package}"' EXIT
  echo 'Downloading the EffectHouse AI runtime...'
  curl -fsSL --proto-redir =https --retry 3 --connect-timeout 30 --speed-limit 1024 --speed-time 120 --max-filesize "$(field bytes)" -o "$DIR.tgz" "$(field urls.0)" || fail "the runtime download failed (curl exit $?). Check the network or proxy, then run this again."
  [ "$(shasum -a 256 "$DIR.tgz" | cut -d ' ' -f 1)" = "$SHA" ] || fail 'the runtime download does not match its pinned SHA-256; nothing from it was run.'
  tar -xzf "$DIR.tgz" -C "${DIR%/package}" package/bin/node package/shell/scripts || fail 'could not unpack the runtime archive.'
  export EHAI_VERIFIED_RUNTIME="$DIR.tgz"
fi
"$DIR/bin/node" "$DIR/shell/scripts/setup-runtime.mjs"
