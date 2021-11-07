/* eslint-disable */
const Chai = require('chai');
const FS = require('fs');
const Path = require('path');
const Tab = require('../atab');

const expect = Chai.expect;
const testRoot = Path.join( __dirname, 'dev' );
process.env.testRoot = testRoot;

// Get a new instance of Tab and initialize (install) a new site.
const tab = new Tab();
const options = {
    css: 'LESS',
    cmds: ['init'],
    port: null,
    root: testRoot
};
tab.run(options);

// Auto load and run every test in the scripts directory.
const files = FS.readdirSync( Path.join( __dirname, './scripts' ) );
files.forEach( (file) => {
    file = Path.join( __dirname, './scripts', file );
    const baseName = Path.basename(file);
    if ( baseName.includes('test.js') ) {
        require(file);
    }
});

// Clean up the test run.
describe('Cleaning up test files should:', () => {

    it('remove the test installation successfully.', () => {
        FS.rmdirSync(testRoot, { recursive: true });

        let pass = false;
        if ( ! FS.existsSync(testRoot) ) {
            pass = true;
        }
        expect(pass).to.eql(true);
    });

    it('reset the `dev` directory and `.gitkeep` file successfully.', () => {
        const gitkeep = Path.join( testRoot, '.gitkeep' );
        FS.mkdirSync(testRoot);
        FS.closeSync( FS.openSync( gitkeep, 'w') );

        let pass = false;
        if ( FS.existsSync(testRoot) && FS.existsSync(gitkeep) ) {
            pass = true;
        }
        expect(pass).to.eql(true);
    });

});