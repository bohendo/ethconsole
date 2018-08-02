#!/bin/bash

DIR="`cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd`"

node -i -r $DIR/../build/bundle.js
