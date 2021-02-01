#!/bin/bash
set -e

export ETHCONSOLE_HARDHAT=true

hardhat node --hostname 0.0.0.0 --port 8545  \
  | pino-pretty --colorize --ignore module,pid,hostname &
pid=$!

echo "Waiting for localnet evm instance to wake up (pid=$pid)"
wait-for -q -t 30 localhost:8545 2>&1 | sed '/nc: bad address/d'

wait $pid
