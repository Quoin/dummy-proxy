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
            let reqPath = url.parse(req.url).path;
            if (reqPath === '/') {
                return proxyPath;
            }
            debug(`proxyReqPathResolver(): proxyPath=${proxyPath}; reqPath=${reqPath}`);
            return [proxyPath, reqPath].join('/');
        },

        proxyReqOptDecorator(proxyReqOpts, srcReq) {
            const headers = proxyReqOpts.headers;

            // X-Forwarded-Path
            //      We want to keep the original because that's what the browser
            //      will use.
            if (!headers['x-forwarded-path']) {
                headers['x-forwarded-path'] = pathConfig.path;
            }

            // X-Forwarded-For
            let remoteAddress = srcReq.connection.remoteAddress;
            if (remoteAddress.match(/:/)) {
                remoteAddress = `[${remoteAddress}]`;
            }
            if (headers['x-forwarded-for']) {
                headers['x-forwarded-for'] = headers['x-forwarded-for'].split(/,\s*/).concat(remoteAddress).join(', ');
            } else {
                headers['x-forwarded-for'] = remoteAddress;
            }

            // X-Forwarded-Host
            if (!headers['x-forwarded-host']) {
                headers['x-forwarded-host'] = srcReq.headers.host;
            }

            // X-Forwarded-Proto
            if (!headers['x-forwarded-proto']) {
                headers['x-forwarded-proto'] = srcReq.protocol;
            }

            // Forwarded
            if (!headers['forwarded']) {
                headers['forwarded'] = [
                    `path=${headers['x-forwarded-path']}`,
                    `for=${headers['x-forwarded-for']}`,
                    `host=${headers['x-forwarded-host']}`,
                    `proto=${headers['x-forwarded-proto']}`
                ].join('; ');
            } else {
                headers['forwarded'] = headers['forwarded'].split(/;\s*/).concat([`for=${remoteAddress}`]).join('; ');
            }

            return proxyReqOpts;
        }
    }));
}

app.enable('trust proxy');
app.get('/', (req, res) => {
    res.send(
        ['<ul>'].concat(
            config.paths.map((pathConfig) => {
                return `<li><a href="${pathConfig.path}">${pathConfig.path}</a></li>`;
            })
        ).concat(['</ul>']).join('')
    );
});

app.get('/_foo', (req, res) => {
    res.status(200).send(req.headers);
});

config.paths.forEach(addConfig.bind(null, app));

module.exports = app;
