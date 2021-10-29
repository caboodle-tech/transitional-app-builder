function copyright(args) {
    let start = null;
    if (args[0]) {
        start = args[0];
    }
    return `&copy; ${getYearString(start)}. All Rights Reserved.`;
}

function getYearString(start) {
    start = start || new Date().getFullYear();
    const end = new Date().getFullYear();
    if (start === end) {
        return start;
    }
    return `${start} &ndash; ${end}`;
}

module.exports = { copyright };
