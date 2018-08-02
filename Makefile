## Variables

VPATH=src:ops:build

me=$(shell whoami)
version=latest

webpack=node_modules/.bin/webpack

src=$(shell find src -type f -name "*.js")

$(shell mkdir -p build)

## Phony Rules

all: node-modules
	@true

clean:
	rm -rf build/*

## Real Rules

node-modules: package.json
	yarn install
	touch build/node-modules

