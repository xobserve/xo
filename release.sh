## delete old files 
rm -rf ./release


## create release folder
mkdir release
mkdir release/darwin release/linux release/windows

## build query 
cd query
GOOS=darwin GOARCH=amd64 go build -o ../release/darwin/observex
GOOS=linux GOARCH=amd64 go build -o ../release/linux/observex
GOOS=windows GOARCH=amd64 go build -o ../release/windows/observex.exe

## copy files
cp observex.yaml ../release/darwin/observex.yaml
cp observex.yaml ../release/linux/observex.yaml
cp observex.yaml ../release/windows/observex.yaml
cp observex.sql ../release/darwin/observex.sql
cp observex.sql ../release/linux/observex.sql
cp observex.sql ../release/windows/observex.sql

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
zip -r observex-darwin-amd64.zip darwin
zip -r observex-linux-amd64.zip linux
zip -r observex-windows-amd64.zip windows
rm -rf darwin linux windows


git status