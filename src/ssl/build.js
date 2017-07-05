const forge = require('node-forge');
const pki = forge.pki;
const fs = require('fs');
const config = require('./config');
const attrsFomat = require('./attrs-format');

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

genRootCA();
genServerKeyPair();
