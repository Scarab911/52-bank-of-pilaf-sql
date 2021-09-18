const Validation = require('./Validations');
const Account = require('./Account');

const User = {};
/**
 * Vartotojo irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {string} userFirstname Autoriaus vardas.
 * @param {string} userLastname Autoriaus pavarde.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
User.create = async (connection, userFirstname, userLastname) => {
    //VALIDATION:
    if (!Validation.isValidFirstName(userFirstname)) {

        return `Vardas negali buti tuscias arba is mazosios raides!`;
    }
    if (!Validation.isValidLastName(userLastname)) {

        return `Pavarde negali buti tuscia arba is mazosios raides!`;
    }
    //LOGIC
    //pridedam useri
    const sql = 'INSERT INTO`users`\
                (`id`, `firstname`, `lastname`)\
             VALUES\
                (NULL, "' + userFirstname + '", "' + userLastname + '")';

    const [rows] = await connection.execute(sql);

    //susirandam user ID
    const userId = rows.insertId
    //paduotam ID i account.create=>

    // return  buvo sekmingai irasytas!`;
    const response = `Naujas vartotojas ${userFirstname} ${userLastname} ir ${await Account.create(connection, 0, userId)
        } !`;
    return response;
};

User.delete = async (connection, userId) => {
    return `Viso gero vartotojau!`
}
module.exports = User;