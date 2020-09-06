## Variables

VPATH=src:ops:build

webpack=node_modules/.bin/webpack

src=$(shell find src -type f -name "*.js")

$(shell mkdir -p build)

## Phony Rules

all: bundle

clean:
	rm -rf build/*

bundle: node-modules
	./node_modules/.bin/webpack --config ops/webpack.js

node-modules: package.json
	npm install
	touch build/node-modules

