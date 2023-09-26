## delete old files 
rm -rf ./release


## create release folder
mkdir release
mkdir release/darwin release/linux release/windows

## build backend 
cd backend
GOOS=darwin GOARCH=amd64 go build -o ../release/darwin/datav
GOOS=linux GOARCH=amd64 go build -o ../release/linux/datav
GOOS=windows GOARCH=amd64 go build -o ../release/windows/datav.exe

## copy files
cp datav.yaml ../release/darwin/datav.yaml
cp datav.yaml ../release/linux/datav.yaml
cp datav.yaml ../release/windows/datav.yaml
cp datav.sql ../release/darwin/datav.sql
cp datav.sql ../release/linux/datav.sql
cp datav.sql ../release/windows/datav.sql

## build ui

## install external plugins
cd ../ui/external-plugins
go run buildPlugins.go

## build ui static files
cd ..
npm install -g vite
vite build
cp ./404.html ./build/404.html
cp -r build ../release/darwin/ui
cp -r build ../release/linux/ui
cp -r build ../release/windows/ui

## zip files
cd ../release
zip -r datav-darwin-amd64.zip darwin
zip -r datav-linux-amd64.zip linux
zip -r datav-windows-amd64.zip windows
rm -rf darwin linux windows


git status