const rc = require('@quoin/node-rc');

const packageJson = require('./package.json');

const baseConfig = {
    port: 8081,
    paths: [{
        path: '/quoin',
        remote: 'https://www.quoininc.com'
    }]
};

module.exports = rc(packageJson.name, baseConfig, {
    packageVersion: packageJson.version
});
