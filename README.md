# NEAR Names

This repo is the source code for https://nearnames.com, which gets deployed automatically via [GitHub Pages](https://pages.github.com/).

# Local Setup

```
yarn
yarn start
```

# How It Works

We have built a Zapier endpoint that handles the smart contract function calls.

See `ACCOUNT_ID_CLAIM_URL` in [src/state/near.js](src/state/near.js).

TODO: Document where the Zapier endpoint is configured and what contract it touches.

# See Also

[OtherInfo.md](OtherInfo.md)
