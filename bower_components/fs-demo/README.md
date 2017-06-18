# \<fs-demo\>

[![Code Climate](https://codeclimate.com/repos/5915d97019ec0e0269000287/badges/23f339bd1f7d5caee2ab/gpa.svg)](https://codeclimate.com/repos/5915d97019ec0e0269000287/feed) [![Test Coverage](https://codeclimate.com/repos/5915d97019ec0e0269000287/badges/23f339bd1f7d5caee2ab/coverage.svg)](https://codeclimate.com/repos/5915d97019ec0e0269000287/coverage) [![Issue Count](https://codeclimate.com/repos/5915d97019ec0e0269000287/badges/23f339bd1f7d5caee2ab/issue_count.svg)](https://codeclimate.com/repos/5915d97019ec0e0269000287/feed) [![Build Status](https://travis-ci.com/fs-webdev/fs-demo.svg?token=qtmfas6idwDtRAQ3ysxy&branch=master)](https://travis-ci.com/fs-webdev/fs-demo)

## Intro

Provides login, person, and language changing for components demo pages.

## Utilization

:TODO
Example 1:

## Properties

- `sample`

Sample title.
Sample description.

## Docs

FamilySearch component catalog entry: [fs-demo](https://beta.familysearch.org/frontier/elements/elements/fs-demo).

## Running the component

1. (Once) Install the [Polymer CLI](https://www.npmjs.com/package/polymer-cli): ```npm i -g polymer-cli```
1. (Once) Install the [frontier-cli](https://github.com/fs-webdev/frontier-cli): ```npm i -g https://github.com/fs-webdev/frontier-cli```
1. Run `bower i` to load all of the dependencies.

This component's demo page is viewable by running:

```bash
frontier element serve -d
```

This component's auto-generated documentation is viewable by running:

```bash
frontier element serve
```

## Running Tests

This component is set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester).

To run tests locally, run:

```bash
wct --skip-plugin sauce
```

If you need to debug locally, run:

```bash
polymer test --skip-plugin sauce --local chrome -p
```