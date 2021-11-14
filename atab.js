/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const CmdLine = require('child_process');
const FS = require('fs');
const OS = require('os');
const Path = require('path');
const Server = require('@caboodle-tech/node-simple-server');

/**
 * Transitional App Builder (Tab)
 *
 * @param {String} [rootDir] The absolute path to use otherwise default to: __dirname
 * @return {Tab} A new instance of the Tab class.
 */
const Tab = (function compiler(rootDir) {

    let COMPILE_LIST = [];
    let CONFIG = {};
    let FUNCS = {};
    let GLOBS = {};
    let GLOBS_REGEX = {};
    let LIVE_SERVER = null;
    const REGEX = {};
    let ROOT = `${process.cwd()}/`;
    let TEMPS = {};
    const TMP_DIR = Path.join(OS.tmpdir(), 'atab');
    let TEMPS_REGEX = {};
    let WHITELIST = [];

    /**
     * Copy a directory recursively to the provided location.
     *
     * @param {String} src The source directory to copy.
     * @param {String} dest The destination directory.
     */
    const copyDir = function (src, dest) {
        FS.mkdirSync(dest, { recursive: true });
        const entries = FS.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = Path.join(src, entry.name);
            const destPath = Path.join(dest, entry.name);
            if (entry.isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                // eslint-disable-next-line no-loop-func
                FS.copyFile(srcPath, destPath, FS.constants.COPYFILE_FICLONE, (error, data) => {
                    if (error !== null) {
                        console.log(`ERROR: Could not copy ${srcPath.replace(ROOT, '')} to the project directory. (${error.code})`);
                    }
                });
            }
        }
    };

    /**
     * Copy a file or directory to a specified location; note that this is
     * backwards compared to FS.copyFile which would be (app, pub) or
     * (srcPath, destPath).
     *
     * @param {String} pub Where to copy the file or directory to.
     * @param {String} app Where the file or directory to copy is located.
     */
    const copyFile = function (pub, app) {
        // Is this a directory?
        if (FS.lstatSync(app).isDirectory()) {
            // Yes, just create the directory.
            FS.mkdirSync(pub, { recursive: true });
        } else {
            // No, make sure the directory path exists first and then copy the file.
            FS.mkdirSync(Path.parse(pub).dir, { recursive: true });
            FS.copyFile(app, pub, FS.constants.COPYFILE_FICLONE, (error, data) => {
                if (error !== null) {
                    console.log(`ERROR: Could not copy ${app.replace(ROOT, '')} to the public directory. (${error.code})`);
                }
            });
        }
    };

    /**
     * Cache bust and reload the requested node module. If you every need to `require` something
     * in functions file or includes file you should `reacquire` it instead.
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

    /**
     * Compile an individual file and write it to the public directory.
     *
     * @param {String} file The root relative path to the file to compile.
     */
    const compile = function (file) {
        // Do not compile this file if it is in the ignore list.
        if (skipCompile(file)) {
            return;
        }

        // Get the correct absolute path for where to store this file based on OS.
        let pub = file.replace(/app\/|app\\/, (match) => {
            if (match.indexOf('/') > -1) {
                return 'public/';
            }
            return 'public\\';
        });

        // Do not compile this file if its file extension is not in the compile whitelist.
        const ext = Path.extname(file);
        if (!COMPILE_LIST.includes(ext)) {
            // Just copy to the release directory.
            copyFile(pub, file);
            return;
        }

        // Make sure the file path contains the ROOT.
        if (!pub.includes(ROOT)) {
            pub = Path.join(ROOT, pub);
        }

        // Get the files content and set the default compile flag to true.
        let data = getFile(file, true);

        // Get the specific compiler for this type of file.
        const compilerModule = COMPILE_LIST._compilers[COMPILE_LIST._keys[ext]];

        // Compile the file.
        const compileMode = compilerModule.doDefaultCompile();
        switch (compileMode.toUpperCase().trim()) {
            case 'AFTER':
                // Use a specific compiler first then TAB's.
                data = compilerModule.compile(data);
                data = defaultCompile(data);
                break;
            case 'BEFORE':
                // Use TAB's compiler first then a specific compiler.
                data = defaultCompile(data);
                data = compilerModule.compile(data);
                break;
            default:
                // Just use TAB's compiler.
                data = compilerModule.compile(data);
        }

        // If this files extension is different after compiling we need to track that.
        const newExt = compilerModule.fileExtension();
        if (ext !== newExt) {
            pub = pub.replace(ext, newExt);
            if (!WHITELIST.includes(pub)) {
                WHITELIST.push(pub);
            }
        }

        // Save the file to the public directory.
        writeFile(pub, data);
    };

    /**
     * Perform a full application compile by recursively compiling all files in the app directory.
     */
    const compileApp = function () {
        const files = getDirFiles('app');
        files.forEach((file) => {
            compile(file);
        });
    };

    /**
     * If a CSS preprocessor is configured in the settings run it; less or sass.
     */
    const compileCSS = function compileCSS() {
        if (CONFIG.css) {
            const CSS = CONFIG.css;
            if (CSS.preprocessor && CSS.from && CSS.to) {
                // Check that the source file exists first.
                if (!FS.existsSync(Path.join(ROOT, 'app', CSS.from))) {
                    console.log(`ERROR: ${Path.join('app', CSS.from)} does not exist.`);
                    return;
                }
                let cmd = 'npx ';
                switch (CSS.preprocessor.toUpperCase()) {
                    case 'LESS':
                    case 'LESSC':
                        cmd += 'lessc';
                        break;
                    case 'SASS':
                        cmd += 'sass';
                        break;
                    default:
                }
                const from = Path.join(ROOT, 'app', CSS.from);
                const to = Path.join(ROOT, 'public', CSS.to);
                cmd = `${cmd} ${from} ${to}`;
                runCmd(cmd);
            }
        }
    };

    /**
     * TAB's compiler.
     *
     * @param {String} data The data to compile according to TAB's rules.
     * @return {String} The compiled data.
     */
    const defaultCompile = function (data) {
        let variables = {};
        [data, variables] = stripVariables(data);
        data = replaceTemplates(data);
        data = replaceFunctions(data, variables);
        data = replaceGlobals(data);
        data = replaceVariables(data, variables);
        return data;
    };

    /**
     * Check for files or directories that should no longer exist in the public directory.
     */
    const garbageCollection = async function () {

        // Get all files and directories from the public directory.
        const pub = getDirFiles('./public');
        let dirs = getDirs('./public');
        // Fastest way to extend one array with the values of another.
        dirs.forEach((item) => {
            pub.push(item);
        });
        // Free up memory.
        dirs = null;

        // Determine if we need to remove any CSS directories from our list.
        let css = null;
        if (CONFIG.css) {
            if (CONFIG.css.to) {
                // Yes we do, keep track of them.
                css = Path.join('app', Path.dirname(CONFIG.css.to));
            }
        }

        /*
         * Loop through the list of directories and files and delete any from the public
         * directory if they are not found in the app directory; css excluded usually.
         */
        for (let i = 0; i < pub.length; i++) {
            const pubFile = pub[i];
            const appFile = pubFile.replace('public', 'app');
            if (!appFile.includes(css) && !FS.existsSync(appFile)) {
                // Check the whitelist first; .md files become .html for example.
                if (WHITELIST.includes(pubFile)) {
                    // eslint-disable-next-line no-continue
                    continue;
                }
                // We have to check on the public file too in case it was deleted already.
                if (FS.existsSync(pubFile)) {
                    if (FS.statSync(pubFile).isDirectory()) {
                        FS.rmSync(pubFile, { recursive: true });
                    } else {
                        FS.unlinkSync(pubFile);
                    }
                }
            }
        }
    };

    /**
     * Recursively gather all directories under a specified directory.
     *
     * @param {String} [dir] The directory to start from; should be omitted on initial call.
     * @return {Array} An array of all directories found.
     */
    const getDirs = function (dir, dirsAry) {
        // If no array was provided this is the first run, make sure the dir exists first.
        if (!dirsAry) {
            dirsAry = [];
            if (!FS.existsSync(dir)) {
                return dirsAry;
            }
            // Make sure to add root to the path.
            if (!dir.includes(ROOT)) {
                dir = Path.join(ROOT, dir);
            }
        }
        // Recursively search directories and record paths.
        FS.readdirSync(dir).forEach((file) => {
            const absPath = Path.join(dir, file);
            if (FS.statSync(absPath).isDirectory()) {
                if (!dirsAry.includes(absPath)) {
                    dirsAry.push(absPath);
                }
                return getDirs(absPath, dirsAry);
            }
            const check = Path.dirname(absPath);
            if (!dirsAry.includes(check)) {
                dirsAry.push(check);
            }
            return dirsAry;
        });
        return dirsAry;
    };

    /**
     * Recursively build an array of paths to all files and directories from the
     * requested directory.
     *
     * @param {String} [dir] The directory to start from; should be omitted on initial call.
     * @return {Array} An array of all directories and files found.
     */
    const getDirFiles = function (dir, filesAry) {
        // Paths are usually relative which will break on windows OS.
        dir = makePathAbsolute(dir);
        // If no array was provided this is the first run, make sure the dir exists first.
        if (!filesAry) {
            filesAry = [];
            if (!FS.existsSync(dir)) {
                return filesAry;
            }
            // Make sure to add root to the path.
            if (!dir.includes(ROOT)) {
                dir = Path.join(ROOT, dir);
            }
        }
        // Recursively search directories and record paths.
        FS.readdirSync(dir).forEach((file) => {
            const absPath = Path.join(dir, file);
            if (FS.statSync(absPath).isDirectory()) {
                return getDirFiles(absPath, filesAry);
            }
            return filesAry.push(absPath);
        });
        return filesAry;
    };

    /**
     * Read a files contents into the application.
     *
     * @param {String} file The root relative path to the file to read into the application.
     * @param {Boolean} forceString Force getFile to return a string even for JSON files.
     * @return {String|JSON} The files contents as a string or a JSON object if the file
     *                       was a JSON file.
     */
    const getFile = function getFile(file, forceString) {
        file = makePathAbsolute(file);
        /*
         * Load the file and if possible parse JSON strings into JSON objects.
         * The rs+ flag is used to cache bust and insure we get the actual file contents.
         */
        if (Path.extname(file) === '.json' && forceString !== true) {
            return JSON.parse(FS.readFileSync(file, { encoding: 'utf-8', flag: 'rs+' }));
        }
        return FS.readFileSync(file, { encoding: 'utf-8', flag: 'rs+' });
    };

    /**
     * Getter to return the root path being used for this application.
     *
     * @return {String} The root path being used for this application.
     */
    const getRoot = function () {
        return ROOT;
    };

    /**
     * Initializes a new TAB project at the current location.
     */
    const initializeNewProject = function (opts) {

        // Copy all template files to the project directory.
        const templates = Path.normalize(Path.join(TMP_DIR, 'templates'));
        FS.readdirSync(templates).forEach((item) => {
            const dest = Path.join(ROOT, item);
            const file = Path.join(templates, item);
            if (FS.statSync(file).isDirectory()) {
                copyDir(file, dest);
            } else {
                FS.copyFile(file, dest, FS.constants.COPYFILE_FICLONE, (error, data) => {
                    if (error !== null) {
                        console.log(`ERROR: Could not copy ${file.replace(ROOT, '')} to the project directory. (${error.code})`);
                    }
                });
            }
        });

        // Create config paths and load the base config file.
        const configBase = Path.join(ROOT, 'private', 'config-base.json');
        const configLive = Path.join(ROOT, 'private', 'config.json');
        const configObj = getFile(configBase);

        // Update the config object as needed.
        switch (opts.css) {
            case 'LESS':
                configObj.css.from = 'less/main.less';
                configObj.css.preprocessor = 'less';
                configObj.css.to = 'css/main.css';
                configObj.ignore.directories.push('less');
                FS.rmSync(Path.join(ROOT, 'app', 'sass'), { recursive: true });
                // Make sure the LESS package is installed.
                runCmd(`cd ${ROOT} && npm install less --save-dev && npm remove sass --save-dev`);
                break;
            case 'SASS':
                configObj.css.from = 'sass/main.scss';
                configObj.css.preprocessor = 'sass';
                configObj.css.to = 'css/main.css';
                configObj.ignore.directories.push('sass');
                FS.rmSync(Path.join(ROOT, 'app', 'less'), { recursive: true });
                // Make sure the SASS package is installed.
                runCmd(`cd ${ROOT} && npm install sass --save-dev && npm remove less --save-dev`);
                break;
            default:
                configObj.css = {};
                FS.rmSync(Path.join(ROOT, 'app', 'less'), { recursive: true });
                FS.rmSync(Path.join(ROOT, 'app', 'sass'), { recursive: true });
                runCmd(`cd ${ROOT} && npm remove sass --save-dev && npm remove less --save-dev`);
                break;
        }

        // Delete the config base file and save the new config.
        FS.unlinkSync(configBase);
        writeFile(configLive, JSON.stringify(configObj));
    };

    /**
     * Check if a semantic version number is newer than the previous.
     * {@link https://stackoverflow.com/a/52059759/3193156|Source}
     *
     * @param {String} oldVer The old semantic version number.
     * @param {String} newVer The current semantic version number.
     * @return {Boolean} True if the new version is newer than the old; false otherwise.
     */
    const isNewVersion = function (oldVer, newVer) {
        oldVer = oldVer.replace(/[^0-9.]/g, '').trim();
        newVer = newVer.replace(/[^0-9.]/g, '').trim();
        const oldParts = oldVer.split('.');
        const newParts = newVer.split('.');
        for (let i = 0; i < newParts.length; i++) {
            // eslint-disable-next-line no-bitwise
            const a = ~~newParts[i]; // parse int
            // eslint-disable-next-line no-bitwise
            const b = ~~oldParts[i]; // parse int
            if (a > b) return true;
            if (a < b) return false;
        }
        return false;
    };

    /**
     * Load the config file into the application.
     */
    const loadConfig = function () {
        // Load the config file and record the runtime options.
        const options = getFile(Path.join('private', 'config.json'));
        const objKeys = Object.keys(options);
        objKeys.forEach((key) => {
            CONFIG[key] = options[key];
        });

        // Build the compile list.
        if (CONFIG.compile) {
            const compilerKeys = {};
            Object.keys(CONFIG.compile).forEach((key) => {
                compilerKeys[`.${CONFIG.compile[key]}`] = key;
                COMPILE_LIST = COMPILE_LIST.concat(`.${CONFIG.compile[key]}`);
            });
            COMPILE_LIST._keys = compilerKeys;
        }

        // Load additional compilers as need.
        const compilers = {};
        Object.keys(COMPILE_LIST._keys).forEach((key) => {
            if (!compilers[COMPILE_LIST._keys[key]]) {
                let compilerModule = {};
                const name = COMPILE_LIST._keys[key];
                const compilerPath = Path.join(ROOT, 'private', 'compilers', `${name}.js`);
                if (FS.existsSync(compilerPath)) {
                    // Attempt to load the compilers and use TAB's defaults if anything is missing.
                    compilerModule = reacquire(compilerPath);
                    if (typeof compilerModule.compile !== 'function') {
                        compilerModule.compile = (data) => defaultCompile(data);
                    }
                    if (typeof compilerModule.doDefaultCompile !== 'function') {
                        compilerModule.compile = () => 'before';
                    }
                    if (typeof compilerModule.fileExtension !== 'function') {
                        compilerModule.compile = () => '.html';
                    }
                } else {
                    // Just use TAB's compiler.
                    compilerModule = {
                        compile: (data) => defaultCompile(data),
                        doDefaultCompile: () => 'default',
                        fileExtension: () => '.html'
                    };
                }
                compilers[COMPILE_LIST._keys[key]] = compilerModule;
            }
        });
        COMPILE_LIST._compilers = compilers;

        // Build the ignore lists.
        if (CONFIG.ignore) {
            if (CONFIG.ignore.directories) {
                CONFIG.ignore.directories.forEach((value, index) => {
                    CONFIG.ignore.directories[index] = `app/${value}/`;
                });
            }
            if (CONFIG.ignore.files) {
                CONFIG.ignore.files.forEach((value, index) => {
                    CONFIG.ignore.files[index] = `app/${value}`;
                });
            }
        }
    };

    /**
     * Traverse the functions directory and register all functions that were found.
     */
    const loadFunctions = function loadFunctions() {
        const files = getDirFiles(Path.join('private', 'functions'));
        files.forEach((file) => {
            if (Path.extname(file) === '.js') {
                const funcs = reacquire(file);
                const objKeys = Object.keys(funcs);
                let route = file.replace(Path.join(ROOT, '/private/functions/'), '');
                route = route.replace(Path.basename(file), '');
                objKeys.forEach((key) => {
                    FUNCS[`${route + key}`] = funcs[key];
                });
            }
        });
    };

    /**
     * Traverse the globals directory and register all globals that were found.
     */
    const loadGlobals = function loadGlobals() {
        const globals = getDirFiles(Path.join('private', 'globals'));
        globals.forEach((file) => {
            if (Path.extname(file) === '.js') {
                const globs = reacquire(file);
                const objKeys = Object.keys(globs);
                let route = file.replace(Path.join(ROOT, '/private/globals/'), '');
                route = route.replace(Path.basename(file), '');
                objKeys.forEach((key) => {
                    GLOBS[`${route + key}`] = globs[key];
                    GLOBS_REGEX[`${route + key}`] = new RegExp(`\\\${[gG]:${key}}`, 'gi');
                });
            }
        });
    };

    /**
     * Create common regular expressions we will need to use often.
     */
    const loadRegularExpressions = function () {
        // Create regex for finding functions.
        REGEX.functions = {
            getDeclarations: new RegExp('\\${[fF]:(.+?)(?:\\(([^]+?)\\)|)}', 'gi'),
            getParts: new RegExp('^([gGvV]):(.*?)$', 'gi')
        };
        // Create regex for template sections.
        REGEX.templates = {
            getEnd: new RegExp('\\${[sS]:end}', 'i'),
            getStart: new RegExp('\\${[sS]:start}', 'i'),
            key: new RegExp('[\\\\/]{0,1}private[\\\\/]{0,1}templates[\\\\/]{0,1}', 'i')
        };
        // Create regex for finding variables.
        REGEX.variables = {
            getDeclarations: new RegExp('\\$(.+?) {1,}= {1,}`([^]*?)`;', 'gi'),
            getVariables: new RegExp('\\${([vV]):(.+?)}', 'gi')
        };
        // Create regex for checking unsafe shell commands.
        REGEX.unsafeCommands = [];
        const avoid = ['`', "'", '"', '\\|', '\\*', '\\?', '~', '<', '>', '\\^', '\\(', '\\)', '\\[', '\\]', '\\{', '\\}', '\\$', '\\\n', '\\\r', 'pwd', 'whoami', 'rm ', 'unlink ', 'cp ', '-r', '-rf'];
        avoid.forEach((cmd) => {
            REGEX.unsafeCommands.push(new RegExp(cmd, 'gi'));
        });
    };

    /**
     * Load and combine all the template files into the application.
     */
    const loadTemplates = function loadTemplates() {
        // Load all template files.
        const files = getDirFiles(Path.join('private', 'templates'));
        files.forEach((file) => {
            let key = file.replace(ROOT, '');
            key = key.replace(REGEX.templates.key, '');
            key = key.replace(Path.extname(key), '');
            const data = getFile(file);
            // Check if this template is sectioned.
            const section = data.search(REGEX.templates.getStart);
            if (section > -1) {
                // Template has sections, break it apart.
                const start = data.substring(0, section).replace(REGEX.templates.getStart, '');
                TEMPS[key] = start.trim();
                TEMPS_REGEX[key] = new RegExp(`\\\${[tT]:${key}}`, 'gi');
                // Attempt to locate the end of the section.
                let counter = 5; // There should only be one but just in case find that last one.
                let end = data.substring(data.search(REGEX.templates.getEnd));
                while (end.search(REGEX.templates.getEnd) > -1 && counter > 0) {
                    end = end.substring(end.search(REGEX.templates.getEnd));
                    end = end.replace(REGEX.templates.getEnd, '');
                    counter -= 1;
                }
                TEMPS[`_${key}`] = end.trim();
                TEMPS_REGEX[`_${key}`] = new RegExp(`\\\${/${key}}`, 'gi');
            } else {
                // Template has no sections just save it.
                TEMPS[key] = data.trim();
                TEMPS_REGEX[key] = new RegExp(`\\\${[tT]:${key}}`, 'gi');
            }
        });
        // Check if templates request other templates and combine them now.
        const templateRegex = new RegExp('\\${[tT]:(.+?)}', 'i');
        const objKeys = Object.keys(TEMPS);
        objKeys.forEach((key) => {
            let value = TEMPS[key];
            let match = value.match(templateRegex);
            /*
             * Templates can refer to even more templates, keep processing every
             * template file until no more references are found; limit to 10 recursions.
             */
            let limit = 10;
            while (match != null && limit > 0) {
                if (!TEMPS[match[1]]) {
                    break;
                }
                value = value.replace(match[0], TEMPS[match[1]]);
                match = value.match(templateRegex);
                limit -= 1;
            }
            TEMPS[key] = value;
        });
    };

    /**
     * Attempt to convert all paths to absolute paths for security; uses ROOT as the base.
     *
     * @param {String} unknownPath The path to check.
     * @returns The corrected normalized absolute path if possible, otherwise just normalized.
     */
    const makePathAbsolute = function (unknownPath) {
        unknownPath = unknownPath.replace(/\.\.\/|\.\//g, '');
        if (unknownPath.indexOf(ROOT) === -1 && unknownPath.indexOf(TMP_DIR) === -1) {
            return Path.normalize(Path.join(ROOT, unknownPath));
        }
        return Path.normalize(unknownPath);
    };

    /**
     * Replace function calls with their results.
     *
     * @param {String} data The current file being worked on.
     * @param {Object} variables An object holding local (file) variables.
     * @return {String} The modified file data.
     */
    const replaceFunctions = function replaceFunctions(data, variables) {
        // Locate every function call in the data and process each one.
        const matches = data.matchAll(REGEX.functions.getDeclarations);
        for (const match of matches) {
            // 0 = match string, 1 = function name, 2 = value; if any.
            let args = [];
            // If this function has parameters we need to process them.
            if (match[2]) {
                args = match[2].split(',');
                // eslint-disable-next-line no-loop-func
                args.forEach((value, index) => {
                    // Parameters should be the name of a local or global variable.
                    const parts = value.matchAll(REGEX.functions.getParts);
                    for (const part of parts) {
                        // 0 = match string, 1 = type, 2 = name; key.
                        const key = part[2];
                        let result;
                        switch (part[1].toUpperCase()) {
                            case 'G':
                                if (GLOBS[key]) {
                                    result = GLOBS[key];
                                }
                                break;
                            case 'V':
                                if (variables[key]) {
                                    result = variables[key];
                                }
                                break;
                            default:
                                result = '';
                        }
                        // Record the arguments value.
                        args[index] = result;
                    }
                });
            }
            // Attempt to get the function.
            const func = FUNCS[match[1]];
            let replacement = '[?F]';
            if (func && typeof func === 'function') {
                // Replace the function call with the functions returned result.
                replacement = func(args);
            }
            data = data.replace(match[0], replacement);
        }
        return data;
    };

    /**
     * Replace template parts in the file being processed.
     *
     * @param {String} data The current file being worked on.
     * @return {String} The modified file data.
     */
    const replaceTemplates = function replaceTemplates(data) {
        const objKeys = Object.keys(TEMPS);
        objKeys.forEach((template) => {
            data = data.replace(TEMPS_REGEX[template], TEMPS[template]);
        });
        return data;
    };

    /**
     * Replace global variable parts in the file being processed.
     *
     * @param {String} data The current file being worked on.
     * @return {String} The modified file data.
     */
    const replaceGlobals = function replaceGlobals(data) {
        const objKeys = Object.keys(GLOBS);
        objKeys.forEach((glob) => {
            data = data.replace(GLOBS_REGEX[glob], GLOBS[glob]);
        });
        return data;
    };

    /**
     * Replace local variable parts in the file being processed.
     *
     * @param {String} data The current file being worked on.
     * @param {Object} variables An object holding local (file) variables.
     * @return {String} The modified file data.
     */
    const replaceVariables = function replaceVariables(data, variables) {
        const matches = data.matchAll(REGEX.variables.getVariables);
        for (const match of matches) {
            // 0 = match string, 1 = type, 2 = value; key.
            const key = match[2];
            let value = '[?V]';
            if (variables[key]) {
                value = variables[key];
            } else if (GLOBS[key]) {
                value = GLOBS[key];
            }
            data = data.replace(match[0], value);
        }
        return data;
    };

    /**
     * Main entry point of the compiler. Runs the requested command.
     *
     * @param {Object} opts The command, with or without options, to run.
     */
    const run = function run(opts) {
        // Run the specified command.
        switch (opts.cmds[0].toUpperCase()) {
            case 'BUILD':
            case 'COMPILE':
                loadConfig();
                loadFunctions();
                loadGlobals();
                loadTemplates();
                garbageCollection().then(() => {
                    compileCSS();
                    compileApp();
                    garbageCollection();
                });
                break;
            case 'INIT':
            case 'INSTALL':
            case 'INITIALIZE':
                initializeNewProject(opts);
                break;
            case 'SERVE':
            case 'WATCH':
                loadConfig();
                loadFunctions();
                loadGlobals();
                loadTemplates();
                compileCSS();
                compileApp();
                startServer(opts.port);
                watchForChanges();
                garbageCollection();
                break;
            case '-H':
            case '-HELP':
            case '--HELP':
                // eslint-disable-next-line no-case-declarations
                const man = getFile(Path.join(TMP_DIR, 'man.txt'));
                console.log(man);
                break;
            case '-V':
            case '-VERSION':
            case '--VERSION':
            case 'VERSION':
                // eslint-disable-next-line no-case-declarations
                const pkg = getFile(Path.join(TMP_DIR, 'package.json'));
                console.log(`v${pkg.version}`);
                break;
            default:
                console.log('Command not recognized, use --help to display available commands.');
        }
    };

    /**
     * Attempts to run a command in the OS's terminal.
     *
     * @param {String} cmd The command to run.
     * @return {void} Used only as a short circuit.
     */
    const runCmd = function (cmd) {
        // Do not run an obviously unsafe command!
        const avoid = REGEX.unsafeCommands;
        for (let i = 0; i < avoid.length; i++) {
            if (avoid[i].test(cmd)) {
                return;
            }
        }
        // Attempt to run the command.
        try {
            CmdLine.execSync(
                cmd,
                { stdio: 'pipe' }
            ).toString().trim();
        } catch (err) {
            console.log(err.message);
        }
    };

    /**
     * Run the command the user provided.
     *
     * NOTE: Slower computers can run into race conditions if TAB's temp files
     * have not been installed yet or copy commands are taking to long. This will
     * force a wait by sleeping a bit before trying to run the command the user
     * provided.
     *
     * @param {Object} opts The command, with or without options, to run.
     */
    const runSync = function (opts) {
        // Change root if the option is present.
        if (opts.root) {
            setRoot(opts.root);
        }

        // Protect against empty command by defaulting to showing the manual page.
        if (!opts.cmds || opts.cmds.length < 1) {
            opts.cmds = ['MAN'];
        }

        // Update tmp directory by making sure it exists and is using the latest version.
        updateTmpDir();

        // Avoid race conditions by delaying the call to run the actual command.
        sleep(250)
            .then(() => {
                run(opts);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    /**
     * Change the root directory for this application.
     *
     * @param {String} root The root directory for this application.
     */
    const setRoot = function (root) {
        if (root) {
            if (FS.existsSync(root)) {
                ROOT = Path.resolve(root);
            }
        }
    };

    /**
     * Check if a file path or name is in the do not compile list from the config settings.
     *
     * @param {String} file The root relative path to the file to compile.
     * @return {Boolean} True if the file should NOT be compiled, false if its safe to compile.
     */
    const skipCompile = function skipCompile(file) {
        if (CONFIG.ignore) {
            if (CONFIG.ignore.directories) {
                const ignore = CONFIG.ignore.directories;
                for (let i = 0; i < ignore.length; i++) {
                    if (file.includes(ignore[i])) {
                        if (file.substring(0, file.length) === file) {
                            return true;
                        }
                    }
                }
            }
            if (CONFIG.ignore.files) {
                const ignore = CONFIG.ignore.files;
                for (let i = 0; i < ignore.length; i++) {
                    if (file.includes(ignore[i])) {
                        if (file.substring(0, file.length) === file) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    /**
     * Use a Promise to Sleep (wait) before running some code.
     *
     * @param {Integer} ms How long to sleep for in milliseconds.
     * @returns A Promise that with call your then() code once resolved.
     */
    const sleep = function (ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    /**
     * Start the Node Simple Server (NSS) for live reloading.
     *
     * @param {Integer} port The port number to use for the live server; default is 5500.
     */
    const startServer = function (port) {
        const options = {
            root: Path.normalize(Path.join(ROOT, 'public')),
            dirListing: true,
            port: port || 5500
        };
        LIVE_SERVER = new Server(options);
        LIVE_SERVER.start();
    };

    /**
     * Locate all local variable declarations in the file being processed.
     *
     * @param {String} data The current file being worked on.
     * @return {Array} An array of the modified data [0] and a object of all local
     *                 variables found [1].
     */
    const stripVariables = function stripVariables(data) {
        const variables = {};
        const matches = data.matchAll(REGEX.variables.getDeclarations);
        for (const match of matches) {
            data = data.replace(match[0], '');
            variables[match[1]] = match[2];
        }
        return [data, variables];
    };

    /**
     * Throttle a function from being called to often.
     * @{link https://stackoverflow.com/a/27078401/3193156|Source}
     *
     * @param {Function} callback The function to throttle calls to.
     * @param {Integer} limit How many milliseconds must pass before a call to the
     *                        function is allowed again.
     * @return {Function} The original function wrapped in a throttling function.
     */
    const throttle = function (callback, limit) {
        let waiting = false;
        return function () {
            if (!waiting) {
                // eslint-disable-next-line prefer-rest-params
                callback.apply(this, arguments);
                waiting = true;
                setTimeout(() => {
                    waiting = false;
                }, limit);
            }
        };
    };

    /**
     * Uses chokidar to watch for and respond to file changes.
     */
    const watchForChanges = function () {
        // Chokidar options.
        const options = {
            cwd: ROOT,
            events: {
                all: throttle(liveReloadPage.bind(this), 200)
            },
            ignoreInitial: true,
            ignorePermissionErrors: true,
            persistent: true
        };

        // Register all directories and files we need to watch for changes.
        LIVE_SERVER.watch(Path.join(ROOT, 'private'), options);

        // If a CSS preprocessor exists register that as well and update the options.
        if (CONFIG.css) {
            if (CONFIG.css.preprocessor) {
                const cssOptions = Object.create(options);
                cssOptions.events = {
                    all: throttle(liveReloadStyles.bind(this), 200)
                };
                const css = Path.join(ROOT, 'app', CONFIG.css.preprocessor);
                LIVE_SERVER.watch(css, cssOptions);
                options.ignored = `${Path.normalize(`${css}/`)}*`;
            }
        }

        // Now register the app directory that may include the ignore option now.
        LIVE_SERVER.watch(Path.join(ROOT, 'app'), options);
    };

    /**
     * Function that will automatically be called when style related files change.
     * This will handle recompiling them as necessary.
     *
     * @param {String} type The type of event that triggered this call.
     * @param {String} path The path to the file or directory that this event occurred to.
     * @param {Object} stats The file or directory stats object.
     */
    const liveReloadStyles = function (type, path, stats) {
        switch (type) {
            case 'add':
            case 'addDir':
            case 'change':
            case 'unlink':
            case 'unlinkDir':
                compileCSS();
                LIVE_SERVER.reloadStyles();
                break;
            default:
        }
    };

    /**
     * Function that will automatically be called when files or directories being watched change.
     * This will handle recompiling them as necessary.
     *
     * @param {String} type The type of event that triggered this call.
     * @param {String} path The path to the file or directory that this event occurred to.
     * @param {Object} stats The file or directory stats object.
     * @return {null} Used as a short circuit.
     */
    const liveReloadPage = function (type, path, stats) {
        switch (type) {
            // Do nothing for these events.
            case 'error':
            case 'raw':
            case 'ready':
                return;
            default:
        }

        // Strip the ROOT out of the path to make checks easier.
        path = path.replace(ROOT, '');

        // Reload the config file if it changed.
        if (Path.basename(path) === 'config.json') {
            CONFIG = {};
            loadConfig();
        }

        // Reload all globals if one global file changed; they could rely on one another.
        if (path.substring(0, 7) === 'globals') {
            GLOBS = {};
            GLOBS_REGEX = {};
            loadGlobals();
        }

        switch (path.substring(0, 3)) {
            // Was the change in an app file?
            case 'app':
                // Yes, recompile only that file if it was not deleted and is an actual file.
                if (type !== 'unlink' && type !== 'unlinkDir') {
                    compile(path);
                } else if (type === 'unlinkDir') {
                    // It was actually a directory being deleted so handle that.
                    const pubPath = Path.join(ROOT, path.replace('app', 'public'));
                    FS.rmSync(pubPath, { recursive: true });
                } else {
                    // This may be a special case: .md to .html file for example.
                    const appFile = Path.join(ROOT, path);
                    const ext = Path.extname(path);
                    if (COMPILE_LIST._keys[ext]) {
                        const extCompiler = COMPILE_LIST._compilers[COMPILE_LIST._keys[ext]];
                        const outputExt = extCompiler.fileExtension();
                        // Unlink this file from public if its alternative extension exists.
                        if (ext !== outputExt) {
                            path = path.replace('app', 'public');
                            path = path.replace(ext, outputExt);
                            const pubFile = Path.join(ROOT, path);
                            if (FS.existsSync(pubFile)) {
                                FS.unlinkSync(pubFile);
                            }
                            const index = WHITELIST.indexOf(pubFile);
                            if (index > -1) {
                                WHITELIST.splice(index, 1);
                            }
                        }
                    }
                    // Unlink this file in the public directory if it exists.
                    if (FS.existsSync(appFile)) {
                        FS.unlinkSync(appFile);
                    }
                    const index = WHITELIST.indexOf(appFile);
                    if (index > -1) {
                        WHITELIST.splice(index, 1);
                    }
                }
                break;
            // No, this was a different file that could rely on other files, recompile everything.
            default:
                FUNCS = {};
                TEMPS = {};
                TEMPS_REGEX = {};
                WHITELIST = [];
                loadFunctions();
                loadTemplates();
                compileApp();
        }

        // Live reload all frontend pages and garbage collect directories and files as needed.
        LIVE_SERVER.reloadPages();
        garbageCollection();
    };

    /**
     * TAB is designed to be installed globally so we need to copy the template
     * files to the OS's temp directory or we will get permission errors
     * attempting to access them.
     *
     * TODO: What is someone locally installs this? Is so this is a waste and
     * should be skipped. Account for this in a future update.
     */
    const updateTmpDir = function () {
        const pkg = require('./package.json');
        const tmpDirPkg = Path.join(TMP_DIR, 'package.json');
        let tmpVersion = '0.0.0';

        // If the tmp directory package.json exists get the version number from it.
        if (FS.existsSync(tmpDirPkg)) {
            const tmpPkg = require(tmpDirPkg);
            tmpVersion = tmpPkg.version;
        }

        // Are the tmp version files outdated (older version)?
        if (isNewVersion(tmpVersion, pkg.version)) {
            // Yes. Delete them and copy over the new version of atab.
            if (FS.existsSync(TMP_DIR)) {
                FS.rmSync(TMP_DIR, { recursive: true });
            }
            FS.mkdirSync(TMP_DIR);
            FS.readdirSync(__dirname).forEach((item) => {
                const dest = Path.join(TMP_DIR, item);
                const file = Path.join(__dirname, item);
                if (FS.statSync(file).isDirectory()) {
                    if (Path.basename(file) !== 'node_modules') {
                        copyDir(file, dest);
                    }
                } else if (file[0] !== '.') {
                    FS.copyFile(file, dest, FS.constants.COPYFILE_FICLONE, (error, data) => {
                        if (error !== null) {
                            console.log(`ERROR: Could not copy ${file.replace(ROOT, '')} to the project directory. (${error.code})`);
                        }
                    });
                }
            });
        }
    };

    /**
     * Write data out to the specified file; will create directories as needed.
     *
     * @param {String} file The absolute path to the file to write the data to.
     * @param {String} data The files data (content).
     */
    const writeFile = function writeFile(file, data) {
        FS.mkdirSync(Path.parse(file).dir, { recursive: true });
        FS.writeFileSync(file, data.trim(), { encoding: 'utf-8', flag: 'w' });
    };

    // Initialize the application.
    loadRegularExpressions();

    // Change root if TAB was instantiated with a path.
    if (rootDir) {
        setRoot(rootDir);
    }

    // Clean up TAB when the user stops the script.
    ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType) => {
        process.on(eventType, () => {
            // We need to make sure to stop the Node Simple Server if it's running.
            if (LIVE_SERVER) {
                LIVE_SERVER.stop();
            }
            // Register with the process what we did otherwise the script will hang.
            process.emit('cleanup');
        });
    });

    // Publicly available methods.
    return {
        getRoot,
        run: runSync,
        setRoot
    };

});

module.exports = Tab;
