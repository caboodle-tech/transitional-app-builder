const reaquire = require('../reacquire');

const config = reaquire('../config.json');

function mainStylesheet() {
    if (config) {
        if (config.css) {
            return `<link rel="stylesheet" type="text/css" href="${config.css.to}">`;
        }
    }
    return '<link rel="stylesheet" type="text/css" href="css/main.css">';
}

module.exports = { mainStylesheet };
