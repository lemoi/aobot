# Aobot

The aim of creating this project is to improve the experience when you develop with some repositories related with backend service.

Features should included:

1. The repository depended with `fis` can run in the local environment.
2. It is easy enough to configure when debugging or testing in the mobile phone.


> openssl genrsa -out privatekey.pem 1024
> openssl req -new -key privatekey.pem -out certrequest
> openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

privatekey.pem: 私钥

certrequest.csr: CSR证书签名

certificate.pem: 证书文件

