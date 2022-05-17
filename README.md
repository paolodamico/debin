<img src="public/favicon.svg" height="100" alt="Debin logo" />

# Debin

A completely decentralized way of sharing temporary and permanent messages. Debin uses [Waku][waku] and [IPFS][ipfs] decentralized networks to temporarily or permanently store messages, respectively.

- 🔗 Easily share any text message with someone else (e.g. temporary secrets or one-time-passwords). Just send the link.
- 🔒 All messages are encrypted on the browser and only transferred and stored encrypted.
- 🌎 Messages are relayed using decentralized, trustless and censorship-resistant networks.
- 🕑 Messages on Waku are kept for ~30 days. Messages on IPFS are kept permanently. We hope to implement a way to delete messages when [Web3.storage][web3] adds support for this in the future.

> ⚠️ This is a beta project. Please be mindful of the information you share.

## 🌐 Hosted version

Debin can be found at https://debin.io, which is hosted on IPFS through [Fleek](https://fleek.co).

## 🔨 Developing locally

It's easy to run this project locally to modify it or contribute.

- Git clone this repository.
  ```
  git clone https://github.com/paolodamico/debin
  ```
- Install Node (`v16` recommended) via your favorite method and install dependencies (as shown below).
  ```
  yarn install
  ```
- Start the server & automatic [kea](https://keajs.org) typegen generation (we use Kea for easier logic and state management).
  ```
  yarn start
  ```
- Messages to IPFS are uploaded using a [Cloudflare worker](https://workers.cloudflare.com/) that connects to [Web3.storage](https://web3.storage). To test IPFS upload too, you'll need to create your own `ipfs-message-upload/wranger.toml` file from `wrangler.template.toml`, **be sure to set your own `WEB3_STORAGE_TOKEN`** (which you can obtain from [Web3.storage][web3]; this service is used to upload and pin files on IPFS). Do this in a separate console.
  ```
  cd ipfs-message-upload/
  cp wranger.template.toml wrangler.toml
  # edit wranger.toml now with your `WEB3_STORAGE_TOKEN`
  code wrangler.toml # or vi wrangler.toml ; or nano wrangler.toml
  wrangler dev
  l # to run the Cloudflare worker locally
  ```
- Finally, update `logics/ipfsLogic.ts` and set `IPFS_UPLOAD_RELAY` to the localhost address where the worker is listening (e.g. `http://localhost:8787`).
- You can find more information on the technologies used and conventions in the [Technical docs](tech-docs.md).

## 🚀 Deploying your own version

Deploying your own version is very easy. Using a serverless environment (e.g. Fleek, Netlify, Vercel) might be easiest.

### IPFS relay service

1. First of all, you'll need to sign up for a free [Web3.storage][web3] account if you still haven't.
2. Follow the instructions on developing locally to generate your own `wranger.toml` file. You can choose to use your own domain instead of Cloudflare's default (like we did, `https://ipfs.debin.io`) to host the IPFS relay service.
3. Once you have your `wrangler.toml` file, you can deploy your worker using `wrangler publish` (remember to be in the `/ipfs-message-upload` folder). You can run this command any time you update your IPFS service or its configuration.

### Frontend

1. Update `logics/ipfsLogic.ts` and set `IPFS_UPLOAD_RELAY` to the location of your deployed IPFS relay service.
2. Run the `yarn build` command to generate the production-ready files.
3. Make only the files on the `/build` directory available in your installation, with `index.html` as the default.

[waku]: https://waku.org/
[ipfs]: https://ipfs.io/
[web3]: https://web3.storage
