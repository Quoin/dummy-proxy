const app = require('express')();
const debug = require('debug')('DummyProxy:app');
const proxy = require('express-http-proxy');
const url = require('url');

const config = require('./config');

function addConfig(app, pathConfig) {
    debug(`Adding ${pathConfig.path} => ${pathConfig.remote}`);

    const proxyPath = url.parse(pathConfig.remote).path;

    app.use(pathConfig.path, proxy(pathConfig.remote, {
        proxyReqPathResolver(req) {
            const reqPath = url.parse(req.url).path;
            return [proxyPath, reqPath].join('/');
        }
    }));
}

app.get('/', (req, res) => {
    res.send(
        ['<ul>'].concat(
            config.paths.map((pathConfig) => {
                return `<li><a href="${pathConfig.path}">${pathConfig.path}</a></li>`;
            })
        ).concat(['</ul>']).join('')
    );
});
config.paths.forEach(addConfig.bind(null, app));

module.exports = app;
