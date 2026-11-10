# Footage (not committed: 53 MB)

`talk.mp4` is the H.264 transcode of `Video tumit pecah.mov` from the Google Drive folder.
Recreate it with:

    ffmpeg -i "Video tumit pecah.mov" -map 0:v:0 -map 0:a:0 -c:v libx264 -preset slow -crf 16 \
      -pix_fmt yuv420p -g 30 -keyint_min 30 -r 30 -af "aresample=async=1:first_pts=0" \
      -c:a aac -b:a 192k -ar 48000 -movflags +faststart assets/footage/talk.mp4

All cut points in `index.html` (`data-media-start`) are in this file's timebase.
