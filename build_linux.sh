if [[ $EUID > 0 ]]
  then echo "Please run me as root!"
  exit
fi
docker build -t electron-wrapper ./docker
docker run -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=unix$DISPLAY -v`pwd`/docker/src:/app/src --rm -it electron-wrapper bash
echo "Now entering devenv via docker..."