#!/bin/bash

DIR="`cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd`"

if [[ -f "$1" ]]
then
    node --no-deprecation --interactive --require $DIR/../src/entry.js --require $1
else
    node --no-deprecation --interactive --require $DIR/../src/entry.js
fi
