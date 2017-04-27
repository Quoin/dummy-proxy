const app = require('./app');
const config = require('./config');
const debug = require('debug')('DummyProxy:server');

const port = process.env.PORT || config.port || 8081;

app.listen(port);
