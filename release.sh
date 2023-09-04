## delete old files 
rm -rf ./release

## create release folder
mkdir release
mkdir release/macos release/linux

## build backend 
cd backend
GOOS=darwin GOARCH=amd64 go build -o ../release/macos/datav
GOOS=linux GOARCH=amd64 go build -o ../release/linux/datav

## copy files
cp datav.yaml ../release/macos/datav.yaml
cp datav.yaml ../release/linux/datav.yaml
cp datav.sql ../release/macos/datav.sql
cp datav.sql ../release/linux/datav.sql

## build ui
cd ../ui
npm install -g vite
vite build
cp ./404.html ./build/404.html
cp -r build ../release/macos/ui
cp -r build ../release/linux/ui