## Variables

VPATH=.flags # prerequisite search path
$(shell mkdir -p $(VPATH))

webpack=node_modules/.bin/webpack

src=$(shell find src -type f -name "*.js")

$(shell mkdir -p build)

## Phony Rules

default: bundle

clean:
	rm -rf build/* .flags/*

bundle: node-modules ops/webpack.js tsconfig.json src/*.ts
	tsc --project tsconfig.json
	touch .flags/$@

node-modules: package.json
	npm install
	touch .flags/$@
