/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const Path = require('path');

/**
 * Cache bust and reload the requested node module. If you every need to `require` something
 * in a functions file or includes file you should `reacquire` it instead.
 *
 * @param {String} module The normal require string for a module.
 * @return {*} The module freshly required by node.
 */
const reacquire = function (module) {
    if (module.indexOf('..') > -1) {
        // Strip off one level of previous directory and merge with the files absolute path.
        module = Path.join(__dirname, module.replace('..', ''));
    }
    delete require.cache[require.resolve(module)];
    return require(module);
};

module.exports = reacquire;
