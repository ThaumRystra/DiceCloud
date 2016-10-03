Vulcanize
==============================================================================
Warning: API Change for version 1.0.0.

This package a meteor build plugin that wraps the [vulcanize](https://www.npmjs.com/package/vulcanize) npm package, which is used to process web components into a single output file.

### Usage
1. Ensure all your components are located somewhere under your public directory. (via bower, zip, etc)
2. Include a `config.vulcanize` file in the root of your project.  This file will optionally define a path to the polyfill and paths to html imports for your components.  For Example:

````
{
    "polyfill": "/bower_components/webcomponentsjs/webcomponents.min.js",
    "useShadowDom": true, // optional, defaults to shady dom (polymer default)
    "imports": [
        "/bower_components/paper-button/paper-button.html",
        "/bower_components/paper-checkbox/paper-checkbox.html"
    ]
}
````
- By specifying a path to the polyfill we can ensure that it is injected into the bundle before any imports.

- By setting `useShadowDom` to true, we configure polymer to opt out of shady dom and use full shadow dom.  This is pretty much required at the moment unless you only use polymer elements as leaf nodes.  Any light dom (child elements) that gets rendered by blaze, react, etc will not be accounted for otherwise.

- Running your app in development as usual will result in individual imports being added to your `<head>` tag, resulting in multiple subsequent HTTP requests (good in development - debugging).

- Running `meteor`, `meteor build`, `modulus deploy`, etc with the `VULCANIZE=true` environment variable set will result in all your html imports being vulcanized or concatenated into a single html import (good in production).  The resulting file will be called `vulcanized-{md5}.html`, which will be automatically added to your `<head>` tag.  For example, `VULCANIZE=true meteor`, `VULCANIZE=true modulus deploy`.

- Setting the `CDN_PREFIX` environment variable will prepend the string to the beginning of the file path that is inserted into your HTML's `<head>` tag.
