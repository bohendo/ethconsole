#!/bin/bash

DIR="`cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd`"

node --no-deprecation --interactive --require $DIR/../src/entry.js
