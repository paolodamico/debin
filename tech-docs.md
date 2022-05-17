# Technical docs

This document contains a few details on the technical docs for this project.

- Project was initially created using `create-react-app` and webpack configuration extended using `cra-webpack-rewired` to properly polyfill the packages required by `waku-js`.
- Everything is written on typescript.
- Styles are loaded locally from SCSS files (no special prefixing, so collisions must be avoided).
- All logic and state management is handled using [Kea 3.0](https://keajs.org). Kea logic must be typed which happens through the `kea-typegen` package that runs in the background when running `yarn start`. You'll notice files such as `connectionLogicType.ts` pop up (for further reference, check out the Kea docs).
- Icons from [Font Awesome Free](https://fontawesome.com/) under [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/).

## A note on routing

We use [kea-router](https://github.com/keajs/kea-router) to easily handling routing. Normally URLs would look something like this `https://debin.io/my-route`, however IPFS doesn't properly support this routing ([learn more](https://docs.fleek.co/hosting/troubleshooting/#my-single-page-application-spa-breaks-when-changing-routes-via-an-ipfs-gatway)), and we had to implement some hacky handlers to use the older hash routing instead.

You may wish to disable this hash routing if you're not running on IPFS. Look for `:TRICKY:` notes in the code.
