go run main.go generate

mkdir out
cp -r ./templates ./out/

GOOS=darwin GOARCH=amd64 go build 
mv datav ./out
cp web.conf ./out

cd ui
yarn build
cd ..
mv ui/build out/