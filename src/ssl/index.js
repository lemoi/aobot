const forge = require('node-forge');
const pki = forge.pki;
const fs = require('fs');
const path = require('path');
const config = require('./config');

function attrsFomat(attrs) {
    const result = [];
    for (var i in attrs) {
        result.push({
            name: i,
            value: attrs[i]
        })
    }
    return result;
}

function genRootCA() {
    const keys = pki.rsa.generateKeyPair(config.key_length);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = (new Date()).getTime() + '';

    const dateRange = config.rca_date_range;

    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() + dateRange[0]);
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + dateRange[1]);

    const attrs = attrsFomat(config.attrs);

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([{
        name: 'basicConstraints',
        critical: true,
        cA: true
    }, {
        name: 'keyUsage',
        critical: true,
        keyCertSign: true
    }, {
        name: 'subjectKeyIdentifier'
    }]);

    // sign cert
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const certPem = pki.certificateToPem(cert);
    const keyPem = pki.privateKeyToPem(keys.privateKey);

    fs.writeFileSync(config.output.root.cert, certPem);
    fs.writeFileSync(config.output.root.key, keyPem);
}


function genServerKeyPair() {
    const keys = pki.rsa.generateKeyPair(config.key_length);
    fs.writeFileSync(config.output.server.private, pki.privateKeyToPem(keys.privateKey));
    fs.writeFileSync(config.output.server.public, pki.publicKeyToPem(keys.publicKey));
}

let caCert, caKey, publicKey, privateKey;

function genServerCA(host) {
    
    if (!caCert) {
        try {
            caCert = forge.pki.certificateFromPem(fs.readFileSync(config.output.root.cert));
            caKey = forge.pki.privateKeyFromPem(fs.readFileSync(config.output.root.key));
            publicKey = forge.pki.publicKeyFromPem(fs.readFileSync(config.output.server.public));
            privateKey = forge.pki.privateKeyFromPem(fs.readFileSync(config.output.server.private));
        } catch (e) {
            throw new Error('The root files does not exist. ');
        }
    }

    const cert = pki.createCertificate();
    cert.publicKey = publicKey;

    const dateRange = config.ca_date_range;

    cert.serialNumber = (new Date()).getTime() + '';
    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() + dateRange[0]);
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + dateRange[1]);

    cert.setIssuer(caCert.subject.attributes);
    const attrs = attrsFomat(Object.assign({}, config.attrs, {
        'commonName': host
    }));

    cert.setSubject(attrs);

    cert.setExtensions([{
        name: 'basicConstraints',
        critical: true,
        cA: false
    },
    {
        name: 'keyUsage',
        critical: true,
        digitalSignature: true,
        contentCommitment: true,
        keyEncipherment: true,
        dataEncipherment: true,
        keyAgreement: true,
        keyCertSign: true,
        cRLSign: true,
        encipherOnly: true,
        decipherOnly: true
    },
    {
        name: 'subjectAltName',
        altNames: [{
          type: 2,
          value: host
        }]
    },
    {
        name: 'subjectKeyIdentifier'
    },
    {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
    },
    {
        name:'authorityKeyIdentifier'
    }]);

    cert.sign(caKey, forge.md.sha256.create());

    return {
        key: privateKey,
        cert: cert
    };
}

module.exports.genRootCA = genRootCA;
module.exports.genServerKeyPair = genServerKeyPair;

module.exports.genServerCA = genServerCA;
