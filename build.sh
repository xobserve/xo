## build backend
mkdir build
cd backend
go build -o datav
mv datav ../build
cd ..

## build ui
cd ui
vite build
cd ..
mv ui/build build/ui


