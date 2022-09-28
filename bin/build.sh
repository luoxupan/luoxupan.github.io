#!/bin/bash

git checkout gh-pages
git pull
git merge master --allow-unrelated-histories

npm ci
npm run build:prod
