#!/usr/bin/env bash
set -e

package="$1"
version="$2"

# set sed flags so that they're valid on either linux or mac
if [[ "$(uname)" == "Darwin" ]]
then sedFlag=(-i '')
else sedFlag=(-i)
fi

if [[ -z "$version" ]]
then version=$(npm info "$package" version)
fi

if [[ -z "$package" || -z "$version" || -n "$3" ]]
then echo "Usage: bash ops/upgrade-package.sh <package> <version>" && exit 1
else echo "Setting package $package to version $version in all modules that depend on it"
fi

if [[ -d "modules" ]]
then packages=$(ls package.json modules/*/package.json)
else packages=package.json
fi

echo
echo "Before:"
grep -r '"'"$package"'": "' $packages
echo

find $packages \
  -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed "${sedFlag[@]}" -E 's|"'"$package"'": "[a-z0-9.^-]+"|"'"$package"'": "'"$version"'"|g' {} \;

echo "After:"
grep -r '"'"$package"'": "' $packages
echo
