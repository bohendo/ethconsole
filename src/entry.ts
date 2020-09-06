import * as eth from "ethers";
import { ledger } from "./ledger";

const provider = new eth.providers.JsonRpcProvider(process.env.ETH_PROVIDER);

(global as any).eth = eth;
(global as any).ledger = ledger;
(global as any).log = (msg) => console.log(JSON.stringify(msg, undefined, 2));
(global as any).provider = provider;
(global as any).wallet = eth.Wallet.fromMnemonic('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat').connect(provider);
