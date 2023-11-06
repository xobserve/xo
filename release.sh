## delete old files 
rm -rf ./release


## create release folder
mkdir release
mkdir release/darwin release/linux release/windows

## build query 
cd query
GOOS=darwin GOARCH=amd64 go build -o ../release/darwin/xobserve
GOOS=linux GOARCH=amd64 go build -o ../release/linux/xobserve
GOOS=windows GOARCH=amd64 go build -o ../release/windows/xobserve.exe

## copy files
cp xobserve.yaml ../release/darwin/xobserve.yaml
cp xobserve.yaml ../release/linux/xobserve.yaml
cp xobserve.yaml ../release/windows/xobserve.yaml
cp xobserve.sql ../release/darwin/xobserve.sql
cp xobserve.sql ../release/linux/xobserve.sql
cp xobserve.sql ../release/windows/xobserve.sql

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
zip -r xobserve-darwin-amd64.zip darwin
zip -r xobserve-linux-amd64.zip linux
zip -r xobserve-windows-amd64.zip windows
rm -rf darwin linux windows


git status