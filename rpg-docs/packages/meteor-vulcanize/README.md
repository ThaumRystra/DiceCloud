Vulcanize
==============================================================================
This package a meteor build plugin that wraps the [vulcanize](https://www.npmjs.com/package/vulcanize) npm package, which is used to process web components into a single output file.

### Usage
1. Ensure all your components are located somewhere under your public directory.
2. Include an `imports.html` file anywhere available to the client, that contains the html imports that would normally go inside your `<head>` tag.

````
<!-- Core Components -->
<link rel="import" href="/components/core-animation/core-animation.html">
<link rel="import" href="/components/core-animated-pages/core-animated-pages.html">
<link rel="import" href="/components/core-animated-pages/transitions/slide-from-right.html">
<link rel="import" href="/components/core-drawer-panel/core-drawer-panel.html">
<link rel="import" href="/components/core-pages/core-pages.html">
...

<!-- Paper Components -->
<link rel="import" href="/components/paper-dialog/paper-action-dialog.html">
<link rel="import" href="/components/paper-dialog/paper-dialog-transition.html">
<link rel="import" href="/components/paper-input/paper-input.html">
...
````

- Running your app in development as usual will result in the contents of `imports.html` being added to your `<head>` tag, resulting in multiple subsequent HTTP requests (good in development - debugging).

- Running `meteor`, `meteor build`, `modulus deploy`, etc with the `VULCANIZE=true` environment variable set will result in all your html imports being vulcanized or concatenated into a single html import (good in production).  The resulting file will be called `vulcanized.html`, which will be automatically added to your `<head>` tag.  For example, `VULCANIZE=true meteor`, `VULCANIZE=true modulus deploy`.

- Setting the `CDN_PREFIX` environment variable will prepend the string to the beginning of the file path that is inserted into your HTML's `<head>` tag.
