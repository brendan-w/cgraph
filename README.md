cgraph
======

Function call graphing utility for C

Authors: Brendan Whitfield and Will Paul

C-Graph takes a given Github repo, extracts the C files, and generates a function call graph. It then displays this as a force directed graph on the right and a panel of code on the left. This allows programmers to work their way through a code base as it would be executed (network) instead of how it is written (linear).

Released under GPL 2.1 License

Current version accessible at [cgraph.herokuapp.com](http://cgraph.herokuapp.com)

## Run locally

Requires Node.

Clone this repo then:

```
npm install
```

To run on port 8000:

```
node server/app.js
```

Then point your browser to 0.0.0.0:8000
