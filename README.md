# Dummy proxy

## Setup

    git clone https://github.com/Quoin/dummy-proxy.git
    cd dummy-proxy
    npm install

Create `.quoin-dummy-proxyrc` file and put in something like:

    {
      "port": 8081,
      "paths": [{
        "path": "/somePath",
        "remote": "http://somehost/sub/path"
      }]
    }

## Server

Start the server with:

    DEBUG=DummyProxy:* npm start

You can also change the port on the command line:

    PORT=8081 npm start

Default port is `8081`.

## Browser

Then just get your browser to that port
[http://localhost:8081](http://localhost:8081). It will list all the different
paths configured and you can just click on them.
