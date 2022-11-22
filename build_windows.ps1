docker build -t electron-wrapper .\docker
wsl ip route show
$Server = Read-Host -Prompt 'Input the IP above plus a :0.0 at the end:'
set-variable -name DISPLAY -value $Server
docker run -ti --rm -e DISPLAY=$DISPLAY --rm -it electron-wrapper bash
echo "Now entering devenv via docker..."