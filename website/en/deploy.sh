rm -rf build

vite build


cd build

## for github pages
touch CNAME && echo "datav.io" > CNAME
touch .nojekyll

git init
git config user.name "sunface"
git config user.email "cto@188.com"
git add .
git commit -m 'deploy'
git branch -M main
git remote add origin https://github.com/data-observe/datav.io.git

## push to github pages
git push -u -f origin main
