#!/bin/bash

# dir="./dist/page/undoredo"
# if [ ! -d $dir ]; then
#   mkdir -p $dir;
# fi

path=($(cat ./bash/path.txt))
for i in ${path[@]}
do
if [ ! -d $i ]; then
  mkdir -p $i;
else
  cp ./dist/index.html $i
fi
done
