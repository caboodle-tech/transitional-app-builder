/* eslint-disable */
const Chai = require('chai');
const FS = require('fs');
const Path = require('path');

const expect = Chai.expect;
const testRoot = process.env.testRoot;

describe('When initializing a new instance of TAB:', () => {
    
    it('it should create the `app` directory.', () => {
        const dir = Path.join( testRoot, 'app' );

        let pass = false;
        if ( FS.existsSync(dir) ) {
            pass = true;
        }
        expect(pass).to.eql(true);
    });

    it('it should create the `private` directory.', () => {
        const dir = Path.join( testRoot, 'private' );

        let pass = false;
        if ( FS.existsSync(dir) ) {
            pass = true;
        }
        expect(pass).to.eql(true);
    });

    it('it should create the `public` directory.', () => {
        const dir = Path.join( testRoot, 'public' );

        let pass = false;
        if ( FS.existsSync(dir) ) {
            pass = true;
        }
        expect(pass).to.eql(true);
    });

});