#!/bin/sh
# Loop video lenti (Ken Burns) ricavati dalle foto, muti, sotto 1,5 MB.
set -e
cd "$(dirname "$0")/.."
OUT=public/video
mk() { # sorgente nome zoom-da zoom-a x-centro y-centro
  in=assets-src/sito/$1; name=$2
  vf="scale=3200:-1,zoompan=z='$3+($4-$3)*on/191':x='iw*$5-iw/zoom/2':y='ih*$6-ih/zoom/2':d=192:s=1280x720:fps=24,colorchannelmixer=rr=1.035:bb=0.93,eq=contrast=0.97:brightness=-0.01:saturation=0.96,format=yuv420p"
  ffmpeg -y -loglevel error -loop 1 -i "$in" -vf "$vf" -frames:v 192 -an -c:v libvpx-vp9 -b:v 0 -crf 42 -row-mt 1 "$OUT/$name.webm"
  ffmpeg -y -loglevel error -loop 1 -i "$in" -vf "$vf" -frames:v 192 -an -c:v libx264 -preset slow -crf 27 -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -y -loglevel error -i "$OUT/$name.mp4" -frames:v 1 -q:v 4 "$OUT/$name-poster.jpg"
}
mk hs04-1600x888.jpg loop-cucina-isola-salvia 1.0 1.12 0.55 0.55
mk hs06-1600x888.jpg loop-giorno-velluto-verde 1.12 1.0 0.42 0.5
mk hs05-1600x888.jpg loop-giorno-vetrata 1.0 1.1 0.6 0.55
