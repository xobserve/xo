rm -rf build

vite build

## for github pages
## Github pages doesn't support single page application well, so we need to add a  404.html for refirecting
cp ./404.html ./build/404.html

cd build

## for github pages
touch CNAME && echo "play.xobserve.io" > CNAME
touch .nojekyll

git init
git config user.name "sunface"
git config user.email "cto@188.com"
git add .
git commit -m 'deploy'
git branch -M main
git remote add origin https://github.com/xObserve/play.xobserve.io.git

## push to github pages
git push -u -f origin main
