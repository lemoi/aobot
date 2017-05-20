// # http://www.tuicool.com/articles/F7Zf63r
// # http://blog.csdn.net/linsanhua/article/details/16986701
// # http://www.tuicool.com/articles/BbmENr
openssl req -new -sha256 \
    -key ustack.key \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=UnitedStack/OU=Devops/CN=www.ustack.com" \
    -reqexts SAN \
    -config <(cat /etc/pki/tls/openssl.cnf \
        <(printf "[SAN]\nsubjectAltName=DNS:www.ustack.in,DNS:www.test.ustack.com")) \
    -out ustack.csr