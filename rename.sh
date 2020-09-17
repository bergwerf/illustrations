#!/bin/zsh

for file in *'-'*
do
  mv -- "$file" "${file//-/_}"
done
