#!/bin/sh
# For a Mac with no Node, which cannot run start.mjs: gets the runtime's code the same way, then runs the setup inside it.
set -u
ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
field() { plutil -extract "runtimes.darwin-arm64.$1" raw -o - "$ROOT/runtime/runtime.json" 2>/dev/null; }
SHA=$(field sha256)
SETUP=${EHAI_HOME:-$HOME/.ehai}/setup
DIR=$SETUP/shell-$(printf '%s' "$SHA" | cut -c1-12)
PART=$DIR.part
if [ ! -d "$DIR/package/shell" ] && mkdir -p "$SETUP"; then
  curl -fsSL --proto-redir =https --retry 3 --connect-timeout 30 --speed-limit 1024 --speed-time 120 --continue-at - -o "$PART" "$(field urls.0)"
  got=$?
  if [ "$(shasum -a 256 "$PART" 2>/dev/null | cut -d' ' -f1)" = "$SHA" ]; then
    TMP=$(mktemp -d "$DIR.XXXXXX") && tar -xzf "$PART" -C "$TMP" package/shell && mv "$TMP" "$DIR"
    [ -z "${TMP:-}" ] || rm -rf "$TMP"
    rm -f "$PART"
  elif [ "$got" -eq 0 ]; then
    rm -f "$PART"
  fi
fi
[ -d "$DIR/package/shell" ] || { echo 'FAILED: could not download EffectHouse AI. It needs network access: check the network, and if this runs in a sandbox, ask to run it outside the sandbox, then run this again.'; exit 0; }
EHAI_PUBLIC_PLUGIN_ROOT=$ROOT exec /bin/sh "$DIR/package/shell/scripts/setup.sh"
