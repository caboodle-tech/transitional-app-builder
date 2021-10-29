function title(args) {
    let value = '';
    if (args[0]) {
        value = args[0];
    }
    if (args[1]) {
        value = `${args[1]} | ${value}`;
    }
    return value;
}

module.exports = { title };
