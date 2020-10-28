#!/bin/bash

root="`cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null && pwd`"

if [[ -f "./$1" ]]
then
    node --no-deprecation --interactive --require $root/build/entry.js --require ./$1
else
    node --no-deprecation --interactive --require $root/build/entry.js
fi