// More info on Webpack's Node API here: https://webpack.github.io/docs/node.js-api.html
// Allowing console calls below since this is a build file.
/* eslint-disable no-console */
const webpack = require('webpack');
const createConfig = require('../webpack/webpack.config');
const {
  chalkError,
  chalkSuccess,
  chalkWarning,
  chalkProcessing
} = require('./chalkConfig');

const {
  doneCallback
} = require('./buildCallback');

const branchName = process.env.CIQ_BUILD_BRANCH; // ok if this is undefined
process.env.NODE_ENV = 'production'; // this assures React is built in prod mode

console.log(chalkProcessing('Generating minified bundle for production via Webpack. This will take a moment...'));

webpack([
  createConfig({
    isDemo: false,
    apiStage: branchName
  }),
  createConfig({
    isDemo: true,
    apiStage: branchName
  })
]).run(doneCallback);