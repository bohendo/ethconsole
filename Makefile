
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

default: js

start: js
	bash ops/start.sh

clean:
	rm -rf build .flags

purge: clean
	rm -rf .cache .config node_modules .npm

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

js: builder node-modules tsconfig.json $(shell find src $(find_options))
	$(log_start)
	$(docker_run) "tsc --project tsconfig.json"
	$(log_finish) && mv -f $(totalTime) .flags/$@
