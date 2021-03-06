const Validation = require('./Validations');
const Account = require('./Account');
const Logg = require('./Log');

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
    const sql = 'INSERT INTO `users`\
                    (`id`, `firstname`, `lastname`, `is_active`)\
                VALUES\
                    (NULL, "' + userFirstname + '", "' + userLastname + '","TRUE")';

    const [rows] = await connection.execute(sql);

    //susirandam user ID:
    const userId = rows.insertId

    //irasom i logus userio sukurima:
    await Logg.create(connection, 4, null, userId, null, 'SUCCESS');

    //paduotam ID i account.create=> kad automatiskai sukurtu jam saskaita
    const response = `Naujas vartotojas ${userFirstname} ${userLastname} ir ${await Account.create(connection, userId)}!`;

    return response;
};

/**
 * Vartotojo irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} userId Vartotojo ID kuri norime pasalinti.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
User.delete = async (connection, userId) => {
    //VALIDATION
    if (!Validation.IDisValid(userId)) {
        return `ID turi buti teigiamas sveikasis skaicius!`;
    }
    //tikrinam ar egzistuoja vartotojas sistemoje
    if (!(await User.getUserById(connection, userId)).id) {
        await Logg.create(connection, 7, null, userId, null, 'FAILURE');
        return `Vartotojas neegzistuoja pasalinti negalima!`
    }

    //surandam savininka ir jo visus account pagal duota id
    const sql = 'SELECT \
                    `firstname`,\
                    `lastname`,\
                    `accounts`.`balance`,\
                    `accounts`.`id`as accountId\
                FROM `users`\
                LEFT JOIN `accounts`\
                    ON `accounts`.`user_id` = `users`.`id`\
                WHERE `users`.`id` =' + userId;

    let [rows] = await connection.execute(sql);
    const { firstname, lastname } = rows[0];
    //patikrinam ar vartotojo saskaitose yra pinigu:

    // const suma = rows.reduce((total, row) => total + row.balance, 0); //patikra sumuojant su REDUCE
    //patikra su metodu SOME:

    if (rows.some(row => row.balance !== 0)) {
        await Logg.create(connection, 7, null, userId, null, 'FAILURE');
        return `Paskyros istrinti negalima, saskaitose yra pinigu!`
    }

    //trinam saskaitas:
    for (let { accountId } of rows) {
        await Account.deleteAccountById(connection, accountId)
    }

    // //pasalinam(trinam) vartotoja:
    // let sql2 = 'DELETE\
    //             FROM `users`\
    //             WHERE `users`.`id` =' + userId;

    //darom vartotoja nebeaktyviu:
    let sql2 = 'UPDATE `users`\
                 SET `is_active` = "FALSE"\
                  WHERE `users`.`id` =' + userId;
    [rows] = await connection.execute(sql2);

    //irasom i logus userio pasalinima:
    await Logg.create(connection, 7, null, userId, null, 'SUCCESS');

    return `Vartotojas ${firstname} ${lastname} sekmingai pasalintas is sistemos!`
}

User.getUserById = async (connection, userId) => {

    const sql = 'SELECT *\
                 FROM `users`\
                 WHERE `id`='+ userId;

    const [rows] = await connection.execute(sql);

    if (rows.lenght === 0) {
        console.log(`Vartotojas nerastas!`);
        return {}
    }
    return rows[0];
}
module.exports = User;