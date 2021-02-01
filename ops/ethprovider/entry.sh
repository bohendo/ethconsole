#!/bin/bash
set -e

hardhat node --hostname 0.0.0.0 --port 8545 --as-network localhost \
  | pino-pretty --colorize --ignore module,pid,hostname &
pid=$!

echo "Waiting for localnet evm instance to wake up (pid=$pid)"
wait-for -q -t 30 localhost:8545 2>&1 | sed '/nc: bad address/d'
echo "Good morning, localnet evm!"

wait $pid
