#!/bin/sh
# Scarica le foto pubbliche dell'account Flickr di Cassani & Martignani
# elencate in assets-src/flickr/manifest.csv, una alla volta.
# Da lanciare dalla radice del repo su un computer normale:
#   sh scripts/scarica-foto-flickr.sh
set -e
cd "$(dirname "$0")/.."
tail -n +2 assets-src/flickr/manifest.csv | while IFS=, read -r id album rest; do
  url=$(printf '%s' "$rest" | grep -oE 'https://live\.staticflickr\.com/[^,]+')
  mkdir -p "assets-src/flickr/$album"
  out="assets-src/flickr/$album/$id.jpg"
  [ -s "$out" ] && continue
  curl -fsS -m 60 -o "$out" "$url" && echo "ok $album/$id" || { echo "ERRORE $id"; rm -f "$out"; }
  sleep 1
done
