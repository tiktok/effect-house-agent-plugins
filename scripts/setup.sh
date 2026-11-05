#!/bin/sh
# Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
# SPDX-License-Identifier: Apache-2.0
# For a Mac with no Node, which cannot run start.mjs: gets the runtime's code the same way, then runs the setup inside it.
set -u
export LC_ALL=C LANG=C
USER_PATH=$PATH PATH=/usr/bin:/bin
ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
fail() { printf 'FAILED: %s\n' "$1" >&2; exit 1; }
field() { plutil -extract "runtimes.darwin-arm64.$1" raw -o - "$ROOT/runtime/runtime.json" 2>/dev/null; }
SHA=$(field sha256)
SETUP=${EHAI_HOME:-$HOME/.ehai}/setup
DIR=$SETUP/shell-$(printf '%s' "$SHA" | cut -c1-12)
PART=$DIR.part
if [ ! -d "$DIR/package/shell" ] && mkdir -p "$SETUP"; then
  curl -fsSL --proto-redir =https --retry 3 --connect-timeout 30 --speed-limit 1024 --speed-time 120 --max-filesize "$(field bytes)" --continue-at - -o "$PART" "$(field urls.0)"
  got=$?
  if [ "$got" -ne 0 ]; then
    [ "$got" -ne 63 ] || rm -f "$PART"
    fail "runtime download failed (curl exit $got)."
  fi
  ACTUAL_SHA=$(shasum -a 256 "$PART") || fail 'could not calculate runtime SHA-256 (see error above).'
  if [ -n "$SHA" ] && [ "${ACTUAL_SHA%% *}" = "$SHA" ]; then
    TMP=$(mktemp -d "$DIR.XXXXXX") && tar -xzf "$PART" -C "$TMP" package/shell && mv "$TMP" "$DIR"
    [ -z "${TMP:-}" ] || rm -rf "$TMP"
    rm -f "$PART"
  else
    rm -f "$PART"
    fail 'the runtime download does not match its pinned SHA-256.'
  fi
fi
[ -d "$DIR/package/shell" ] || fail 'could not prepare the EffectHouse AI setup files (see error above).'
PATH=$USER_PATH EHAI_PUBLIC_PLUGIN_ROOT=$ROOT exec /bin/sh "$DIR/package/shell/scripts/setup.sh"
