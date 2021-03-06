const {
  chalkError,
  chalkSuccess,
  chalkWarning,
  chalkProcessing
} = require('./chalkConfig');
const fs = require('fs');

module.exports.doneCallback = (error, stats) => {
  if (error) { // so a fatal error occurred. Stop here.
    console.log(chalkError(error));
    return 1;
  }

  const jsonStats = stats.toJson();
  if (jsonStats.errors.length) {
    return jsonStats.errors.map(error => console.log(chalkError(error)));
  }

  const bundleStats = jsonStats.children ? jsonStats.children[0] : jsonStats;
  fs.writeFileSync('./stats.json', JSON.stringify(bundleStats, null, 2));

  // // uncomment if you want warnings, but there are a LOT
  // if (jsonStats.warnings.length) {
  //   console.log(chalkWarning('Webpack generated the following warnings: '));
  //   jsonStats.warnings.map(warning => console.log(chalkWarning(warning)));
  // }

  // console.log(`Webpack stats: ${stats}`);

  // if we got this far, the build succeeded.
  console.log(chalkSuccess('Your app is compiled in production mode in /dist. It\'s ready to roll!'));

  return 0;
};