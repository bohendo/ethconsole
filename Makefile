## Variables

VPATH=src:ops:build

me=$(shell whoami)
version=latest

webpack=node_modules/.bin/webpack

src=$(shell find src -type f -name "*.js")

$(shell mkdir -p build)

## Phony Rules

all: bundle.js
	@true

clean:
	rm -rf build/*

## Real Rules

bundle.js: node-modules $(src)
	$(webpack) --config ./ops/webpack.js

node-modules: package.json yarn.lock
	yarn install
	touch build/node-modules

