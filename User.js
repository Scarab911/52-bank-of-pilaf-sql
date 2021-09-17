const Validation = require('./Validations');
const Account = require('./Account');

const User = {};

User.create = async () => {
    const response = `Naujas vartotojas ir ${await Account.create()} `;
    return response;
};

module.exports = User;