# \<element-seed\>

## Intro

A FamilySearch shared web component element seed.

## Running the element locally

### Install Frontier CLI

First, make sure you have the [Frontier CLI](https://www.github.com/fs-webdev/frontier-cli) installed. Follow the instructions in the readme to install.

### Viewing Your Element

```bash
frontier element serve
```

You should see an output indicating a URL at which your element is being served.

**NOTE: This server is an extension of the default `polymer serve` command available in the Polymer CLI. The only difference is that this server proxies all FamilySearch API URLs**

### Running Tests

```bash
frontier element test
```

Your application is set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `frontier element test` to run your application's test suite locally. Your element's tests will be run in SauceLabs against our supported browser suite.
