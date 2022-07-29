
SHELL=/bin/bash # shell make will use to execute commands
VPATH=.flags # prerequisite search path
$(shell mkdir -p build $(VPATH))

########################################
# Run shell commands to fetch info from environment

root=$(shell cd "$(shell dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )
project=$(shell cat $(root)/package.json | grep '"name":' | head -n 1 | cut -d '"' -f 4)
commit=$(shell git rev-parse HEAD | head -c 8)

find_options=-type f -not -path "*/node_modules/*" -not -name "address-book.json" -not -name "*.swp" -not -path "*/.*" -not -path "*/cache/*" -not -path "*/build/*" -not -path "*/dist/*" -not -name "*.log"

# If Linux, give the container our uid & gid so we know what to reset permissions to. If Mac, the docker-VM takes care of this for us so pass root's id (ie noop)
id=$(shell if [[ "`uname`" == "Darwin" ]]; then echo 0:0; else echo "`id -u`:`id -g`"; fi)

interactive=$(shell if [[ -t 0 && -t 2 ]]; then echo "--interactive"; else echo ""; fi)

########################################
# Finish Setting Up

docker_run=docker run --name=$(project)_builder $(interactive) --tty --rm --volume=$(root):/root $(project)_builder $(id)

startTime=.flags/.startTime
totalTime=.flags/.totalTime
log_start=@echo "=============";echo "[Makefile] => Start building $@"; date "+%s" > $(startTime)
log_finish=@echo $$((`date "+%s"` - `cat $(startTime)`)) > $(totalTime); rm $(startTime); echo "[Makefile] => Finished building $@ in `cat $(totalTime)` seconds";echo "=============";echo

########################################
## Command/control rules

default: ethprovider

start: transpiled-ts
	bash ops/start.sh

echidna: compiled-sol
	echidna-test src.sol/Echidna.sol --test-mode assertion

start-ethprovider: ethprovider
	bash ops/start-ethprovider.sh
restart-ethprovider: stop-ethprovider ethprovider
	bash ops/start-ethprovider.sh
stop-ethprovider:
	bash ops/stop.sh ethprovider

clean:
	rm -rf build .flags

purge: clean
	rm -rf .cache .config node_modules .npm

########################################
## Tests

test: transpiled-ts
	bash ops/test.sh test

watch:
	bash ops/test.sh watch

########################################
## Build Rules

builder: $(shell find ops/builder $(find_options))
	$(log_start)
	docker build --file ops/builder/Dockerfile $(image_cache) --tag $(project)_builder ops/builder
	docker tag ${project}_builder ${project}_builder:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@

node-modules: package.json
	$(log_start)
	npm install
	$(log_finish) && mv -f $(totalTime) .flags/$@

compiled-sol: builder node-modules hardhat.config.ts $(shell find src.sol $(find_options))
	$(log_start)
	$(docker_run) "npm run compile"
	$(log_finish) && mv -f $(totalTime) .flags/$@

transpiled-ts: builder node-modules compiled-sol $(shell find src.ts deployments $(find_options))
	$(log_start)
	$(docker_run) "npm run transpile"
	$(log_finish) && mv -f $(totalTime) .flags/$@

ethprovider: transpiled-ts $(shell find ops/ethprovider $(find_options))
	$(log_start)
	docker build --file ops/ethprovider/Dockerfile --tag $(project)_ethprovider ops/ethprovider
	docker tag ${project}_ethprovider ${project}_ethprovider:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@
