const marked = require('marked');

const MarkdownCompiler = (function () {

    const compile = function (data) {
        return marked(data);
    };

    const doDefaultCompile = function () {
        return 'before';
    };

    const fileExtension = function () {
        return '.html';
    };

    return {
        compile,
        doDefaultCompile,
        fileExtension
    };

}());

module.exports = MarkdownCompiler;
