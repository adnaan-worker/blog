const bcrypt = require('bcryptjs');

const password = '123456';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log(hashedPassword);
