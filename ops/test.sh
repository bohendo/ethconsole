#!/usr/bin/env bash
set -e

root="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# make sure a network for this project has been created
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

cmd=${1:-test}

docker run \
  --entrypoint="bash" \
  --interactive \
  --name="${project}_${cmd}" \
  --network "$project" \
  --rm \
  --tmpfs="/tmp" \
  --tty \
  --volume="$root:/root" \
  "${project}_builder" "/test.sh" "$cmd"
