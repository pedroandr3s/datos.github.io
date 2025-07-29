-- mysql -h localhost -u root -p mysql
-- reemplazar el texto "CLAVE" con la clave respectiva del usuario (claves seguras: https://1password.com/password-generator)

CREATE USER 'smartbee.admin'@'localhost' IDENTIFIED BY 'CLAVE';
GRANT ALL PRIVILEGES ON smartbee.* TO 'smartbee.admin'@'localhost';

CREATE USER 'smartbee.store'@'localhost' IDENTIFIED BY 'CLAVE';
GRANT SELECT, INSERT ON smartbee.* TO 'smartbee.store'@'localhost';

CREATE USER 'smartbee.app'@'localhost' IDENTIFIED BY 'CLAVE';
GRANT SELECT, INSERT, UPDATE, DELETE ON smartbee.* TO 'smartbee.app'@'localhost';

FLUSH PRIVILEGES;
