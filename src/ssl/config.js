const path = require('path');

module.exports = {
    ca_date_range: [-1, 1], // server ca
    rca_date_range: [-5, 20], // root ca
    output: {
        root: {
            cert: path.join(__dirname, '/root/rootCA.crt'),
            key: path.join(__dirname, '/root/rootCA.key.pem')
        },
        server: {
            private: path.join(__dirname, '/server/private.key.pem'),
            public: path.join(__dirname, '/server/public.key.pem')
        }
    },
    key_length: 2048,
    attrs: {
        'commonName': 'Aobot Proxy Root Certificate',
        'countryName': 'CN',
        'stateOrProvinceName': 'Beijing',
        'localityName': 'Beijing',
        'organizationName': 'Aobot Proxy',
        'organizationalUnitName': 'http://aobot.com/ssl'
    },
    ca_download_url: 'http://aobot.com/ssl'
};
