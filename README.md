# Webpack Plugin: Integrity

Webpack 4.x plugin to emit a JSON file with the hashes generated by `webpack-subresource-integrity`.

Note: **this plugin doesn't generate the integrity hashes** themselves,
you must have [webpack-subresource-integrity](https://www.npmjs.com/package/webpack-subresource-integrity)
in your plugins as well (or some other way to set "integrity" in `compilation.assets`).


---
## Install

Add the [NPM package](https://www.npmjs.com/package/@wildpeaks/integrity-webpack-plugin) to your dependencies:

	npm install @wildpeaks/integrity-webpack-plugin


---
## Configuration

In `webpack.config.js`:
````js
const SriPlugin = require("webpack-subresource-integrity");
const IntegrityPlugin = require("@wildpeaks/integrity-webpack-plugin");

module.exports = {
  target: "web",
  // ...
  plugins: [
    new SriPlugin({
      hashFuncNames: ["sha256", "sha384"]
    }),
    new IntegrityPlugin()
  ]
};
````

The default filename is `integrity.json`, but you can override it:
````js
const SriPlugin = require("webpack-subresource-integrity");
const IntegrityPlugin = require("@wildpeaks/integrity-webpack-plugin");

module.exports = {
  target: "web",
  // ...
  plugins: [
    new SriPlugin({
      hashFuncNames: ["sha256", "sha384"]
    }),
    new IntegrityPlugin("subfolder/custom-name.json"))
  ]
};
````


---
## Result

The resulting JSON will look something like:
````json
{
  "script1.js": "sha256-aaaaaaa sha384-bbbbbbbbbbbb",
  "script2.js": "sha256-ccccccc sha384-dddddddddddd",
  "styles.js": "sha256-eeeeeee sha384-ffffffffffff"
}
````

If you're using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin),
these will be the same values that are set in the attribute **integrity**
of `script` and `link[rel="stylesheet"]` tags.

