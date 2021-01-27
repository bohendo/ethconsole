#!/bin/bash

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

if [[ -f "./$1" ]]
then arg="--require ./$1"
fi

node --no-deprecation --interactive --require $root/build/entry.js "$arg"

exit # Don't use docker until/unless we figure out how usb connections work

if [[ "$(uname)" == "Darwin" ]]
then id=0:0
else id="$(id -u):$(id -g)"
fi

docker run \
  --env="ETH_PROVIDER=${ETH_PROVIDER}" \
  --env="ETH_MNEMONIC=${ETH_MNEMONIC}" \
  --interactive \
  --name=ethconsole \
  --rm \
  --tty \
  --volume="$root:/root" \
  "${project}_builder" "$id" "node --no-deprecation --interactive --require /root/build/entry.js $arg"
