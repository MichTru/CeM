#!/bin/sh
# Archivo per i titoli: istanza a larghezza 125 (expanded), pesi 500–600,
# solo maiuscole latine, cifre e punteggiatura (i titoli sono sempre in maiuscolo).
set -e
cd "$(dirname "$0")/.."
SRC=node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2
TMP=$(mktemp -d)
fonttools varLib.instancer "$SRC" wdth=125 wght=500:600 -o "$TMP/archivo.ttf" >/dev/null
pyftsubset "$TMP/archivo.ttf" \
  --unicodes="U+0020-0040,U+0041-005A,U+005B-0060,U+007B-007E,U+00A0,U+00A9,U+00AB,U+00B7,U+00BB,U+00C0-00DD,U+0152,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026" \
  --layout-features="kern,liga,case" --flavor=woff2 \
  --output-file=public/fonts/archivo-expanded-maiuscole.woff2
rm -rf "$TMP"
ls -la public/fonts
