# Changelog

## [0.1.9](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.8...react-well-completion-v0.1.9) (2026-05-15)


### Features

* EarthLayer renders from deepest non-liner shoe; configurable fill ([439ce0b](https://github.com/mik3dev/react-well-completion/commit/439ce0b29696c8be3a3edbdea2147881ffcf0878))
* parseBackendWell infers isLiner from Tope (pies) &gt; 0 ([ffd1bac](https://github.com/mik3dev/react-well-completion/commit/ffd1bacdb3ab76ac514c4493db31b172c257fac8))

## [0.1.8](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.7...react-well-completion-v0.1.8) (2026-05-07)


### Features

* profile panel fills the freed half in horizontal half-section ([92fa36f](https://github.com/mik3dev/react-well-completion/commit/92fa36f13ddf64141d41bb7f5c6f1e022d740f42))

## [0.1.7](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.6...react-well-completion-v0.1.7) (2026-05-07)


### Features

* add buildScale profile utility ([219c366](https://github.com/mik3dev/react-well-completion/commit/219c36689a4fede1c8bfe54bfab1b13f50878a45))
* add configurable BrandTheme to WellDiagram ([c0cec40](https://github.com/mik3dev/react-well-completion/commit/c0cec409d93b54ae6910401d3c97e230ebf074f4))
* add configurable BrandTheme to WellDiagram ([3f0c812](https://github.com/mik3dev/react-well-completion/commit/3f0c81260c64899ea6153b5c360bd9cd8dd5763e))
* add formatTooltipValue profile utility ([ea73763](https://github.com/mik3dev/react-well-completion/commit/ea73763c43a0c03d18d614ed8389c05d58953f48))
* add parseBackendWell function and parseFractionalDiameter utility ([fda320f](https://github.com/mik3dev/react-well-completion/commit/fda320f6aa674151416a7810ded1d4f26bc36c6f))
* add Profile, ProfilePoint, ProfileLayout public types ([a61464e](https://github.com/mik3dev/react-well-completion/commit/a61464e7fd9b0382ad7048e0cc7bb9b314157a80))
* add ProfileCurve component (polyline + hover dots) ([c58e13e](https://github.com/mik3dev/react-well-completion/commit/c58e13e929bffd4e2400498129d1d9fe4f48f7bb))
* add ProfilePanel orchestrator (parallel tracks layout) ([c29118f](https://github.com/mik3dev/react-well-completion/commit/c29118f97c86658e78b2df14af8b2df5452dbd25))
* add ProfileTrack component (header + axis + curve area) ([97db6a4](https://github.com/mik3dev/react-well-completion/commit/97db6a4127c4ca55a7df78b6b654bf92262dc2f0))
* add sortAndFilterPoints profile utility ([f30a15b](https://github.com/mik3dev/react-well-completion/commit/f30a15ba5e61445f323bc06f4848c15c598883b7))
* add valueToPos and getProfileColor profile utilities ([c74225a](https://github.com/mik3dev/react-well-completion/commit/c74225a9aff49445b6625ce9940229acdf6cfaf1))
* export parseBackendWell and parseFractionalDiameter from library ([d3838a6](https://github.com/mik3dev/react-well-completion/commit/d3838a6c8f96170fed882cccd0e7d156538adf1c))
* extract types, hooks, and utils to react-well-completion library ([ad72f0a](https://github.com/mik3dev/react-well-completion/commit/ad72f0a4118ca3fb978d5954c594dba58dd2508a))
* move all diagram components to react-well-completion library ([5b6f1a7](https://github.com/mik3dev/react-well-completion/commit/5b6f1a7c5cfe192ad6c310cdf76e8565a006dd45))
* render ProfilePanel in WellDiagram (horizontal mode) ([d211b05](https://github.com/mik3dev/react-well-completion/commit/d211b058ddadc927fdf5ba22144c5c2418e22f95))
* render ProfilePanel in WellDiagram (vertical mode) ([c5ef870](https://github.com/mik3dev/react-well-completion/commit/c5ef87028569c6472aba3b9819c65de5d0c7ab6a))
* support optional top/base in TubingSegment rendering ([fc366e0](https://github.com/mik3dev/react-well-completion/commit/fc366e0fb9658fabbc548ece73c6256e5e9ccaba))
* update types for backend compatibility (TubingSegment, Mandrel, Sleeve, Well) ([a4982c5](https://github.com/mik3dev/react-well-completion/commit/a4982c5ce9598b0395bf00aaace369d892f75c2e))


### Bug Fixes

* drop unused profileLayout destructure to satisfy lint ([bebbdd7](https://github.com/mik3dev/react-well-completion/commit/bebbdd73c70c25e419c46f256283ec6b3dbf631e))
* perforations render at correct casing wall, extending outward only ([bf4f11f](https://github.com/mik3dev/react-well-completion/commit/bf4f11f7b772ccbcfe0e0668a335ad6286f537da))
* position mandrels and bottom-hole equipment on tubing diameter ([f68a10b](https://github.com/mik3dev/react-well-completion/commit/f68a10be719fb9b3fddc483bad7966422c8aebc9))
* render earth and sand fills relative to depth-specific casings ([ad98432](https://github.com/mik3dev/react-well-completion/commit/ad98432a4ea0cfbb0b0f7c288489c9731c88c8b5))
* render earth/formation outside casings, not inside ([17d2d84](https://github.com/mik3dev/react-well-completion/commit/17d2d841f6c8d2d5afab79beb00101b927160b31))
* **review:** add tooltip test, document two-line format, JSDoc Profile fields ([946e02a](https://github.com/mik3dev/react-well-completion/commit/946e02a79a9a470e3169bbcd1b64175d004341f2))
* scope package name to @mik3dev/react-well-completion ([8c90a73](https://github.com/mik3dev/react-well-completion/commit/8c90a736624f4c5746c06489fc6bfc29cb89f617))

## [0.1.5](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.4...react-well-completion-v0.1.5) (2026-04-18)


### Bug Fixes

* perforations render at correct casing wall, extending outward only ([bf4f11f](https://github.com/mik3dev/react-well-completion/commit/bf4f11f7b772ccbcfe0e0668a335ad6286f537da))
* render earth/formation outside casings, not inside ([17d2d84](https://github.com/mik3dev/react-well-completion/commit/17d2d841f6c8d2d5afab79beb00101b927160b31))

## [0.1.4](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.3...react-well-completion-v0.1.4) (2026-04-18)


### Bug Fixes

* position mandrels and bottom-hole equipment on tubing diameter ([f68a10b](https://github.com/mik3dev/react-well-completion/commit/f68a10be719fb9b3fddc483bad7966422c8aebc9))
* render earth and sand fills relative to depth-specific casings ([ad98432](https://github.com/mik3dev/react-well-completion/commit/ad98432a4ea0cfbb0b0f7c288489c9731c88c8b5))

## [0.1.3](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.2...react-well-completion-v0.1.3) (2026-04-06)


### Features

* add parseBackendWell function and parseFractionalDiameter utility ([fda320f](https://github.com/mik3dev/react-well-completion/commit/fda320f6aa674151416a7810ded1d4f26bc36c6f))
* export parseBackendWell and parseFractionalDiameter from library ([d3838a6](https://github.com/mik3dev/react-well-completion/commit/d3838a6c8f96170fed882cccd0e7d156538adf1c))
* support optional top/base in TubingSegment rendering ([fc366e0](https://github.com/mik3dev/react-well-completion/commit/fc366e0fb9658fabbc548ece73c6256e5e9ccaba))
* update types for backend compatibility (TubingSegment, Mandrel, Sleeve, Well) ([a4982c5](https://github.com/mik3dev/react-well-completion/commit/a4982c5ce9598b0395bf00aaace369d892f75c2e))

## [0.1.2](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.1...react-well-completion-v0.1.2) (2026-03-28)


### Bug Fixes

* scope package name to @mik3dev/react-well-completion ([8c90a73](https://github.com/mik3dev/react-well-completion/commit/8c90a736624f4c5746c06489fc6bfc29cb89f617))

## [0.1.1](https://github.com/mik3dev/react-well-completion/compare/react-well-completion-v0.1.0...react-well-completion-v0.1.1) (2026-03-28)


### Features

* add configurable BrandTheme to WellDiagram ([c0cec40](https://github.com/mik3dev/react-well-completion/commit/c0cec409d93b54ae6910401d3c97e230ebf074f4))
* add configurable BrandTheme to WellDiagram ([3f0c812](https://github.com/mik3dev/react-well-completion/commit/3f0c81260c64899ea6153b5c360bd9cd8dd5763e))
* extract types, hooks, and utils to react-well-completion library ([ad72f0a](https://github.com/mik3dev/react-well-completion/commit/ad72f0a4118ca3fb978d5954c594dba58dd2508a))
* move all diagram components to react-well-completion library ([5b6f1a7](https://github.com/mik3dev/react-well-completion/commit/5b6f1a7c5cfe192ad6c310cdf76e8565a006dd45))
