const Validation = require('./Validations');

const Account = {};

/**
 * Vartotojo irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} balance Saskaitos likutis, pagal default 0.
 * @param {userId} userLastname Savininko ID.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.create = async (connection, balance, userId) => {
    //VALIDATION:
    if (!Validation.isValidNumber(balance)) {

        return `Parametras turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.IDisValid(userId)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    //LOGIC
    //sukuriam account
    const sql = 'INSERT INTO`accounts`\
                (`id`, `balance`, `owners_id`)\
             VALUES\
                (NULL, "' + balance + '", "' + userId + '")';

    const [rows] = await connection.execute(sql);

    return `Saskaita sukurta`
};

/**
 * Pinigu pridejimas i saskaita.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountId Saskaitos ID.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.addMoneyToAccountByID = async (connection, accountId, cash) => {

    let sql = 'UPDATE `accounts`\
                 SET `balance` = `balance` +"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    const [rows] = await connection.execute(sql);

    return `${cash} pinigu buvo sekmingai prideti i saskaita`;
}

/**
 * Pinigu pasalinimas is saskaitos.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountId Saskaitos ID.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.removeMoneyFromAccountByID = async (connection, accountId, cash) => {
    const sql = 'SELECT \
                    `balance`\
                FROM `accounts`\
                WHERE `accounts`.`id` =' + accountId;

    let [rows] = await connection.execute(sql);

    if (rows.some(row => row.balance < cash)) {
        console.log(`Nepakanka lesu saskaitoje!`);
        return false
    }

    const sql2 = 'UPDATE `accounts`\
                 SET `balance` = `balance` -"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    [rows] = await connection.execute(sql2);
    console.log(`${cash} pinigu buvo sekmingai isimti/pervesti`);

    return true;
}

/**
 * Pridedam pinigu i norodyta vartotojo saskaita pagal jo ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.addMoneyToAccountIdByUserId = async (connection, accountID, cash) => {
    //surandam account ir savininko varda
    const sql = 'SELECT \
                    `firstname`,\
                    `lastname`,\
                    `accounts`.`balance`,\
                    `accounts`.`id`as accountId\
                FROM `users`\
                LEFT JOIN `accounts`\
                    ON `accounts`.`owners_id` = `users`.`id`\
                WHERE `users`.`id` =' + accountID;

    const [rows] = await connection.execute(sql);

    const firstName = rows[0].firstname;
    const lastName = rows[0].lastname;
    await Account.addMoneyToAccountByID(connection, accountID, cash)

    return `${firstName} ${lastName} sekmingai pridejo ${cash} pinigu i savo saskaita.`;
}

/**
 * Isgryninam pinigu is norodytos vartotojo saskaitos numerio pagal jo ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.cashOutMoneyFromUserAccountById = async (connection, accountID, cash) => {
    //surandam account ir savininko varda
    const sql = 'SELECT \
                    `firstname`,\
                    `lastname`,\
                    `accounts`.`balance`,\
                    `accounts`.`id`as accountId\
                FROM `users`\
                LEFT JOIN `accounts`\
                    ON `accounts`.`owners_id` = `users`.`id`\
                WHERE `users`.`id` =' + accountID;

    const [rows] = await connection.execute(sql);

    const firstName = rows[0].firstname;
    const lastName = rows[0].lastname;
    await Account.removeMoneyFromAccountByID(connection, accountID, cash)

    return `${firstName} ${lastName} sekmingai issigrynino ${cash} pinigu is savo saskaitos.`;
}
/**
 * Atliekam pinigu pervedima is norodytos saskaitos NR(ID) ik kita nurodyta saskaitos NR(ID).
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} withdrawFromId saskaitos numeris is kurio siunciama.
 * @param {number} transferToId saskaitos numeris i kuri siunciama.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.moneyTransferByAccountId = async (connection, withdrawFromId, transferToId, cash) => {

    const removal = await Account.removeMoneyFromAccountByID(connection, withdrawFromId, cash);

    if (!removal) {
        console.log(`Pinigu pervesti negalima!`);
        return false

    }
    const addition = await Account.addMoneyToAccountByID(connection, transferToId, cash);
    return addition
}

/**
 * Pasalinam nurodyta saskaita is sistemos pagal ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.deleteAccountById = async (connection, accountId) => {
    const sql = 'SELECT \
                    `balance`\
                FROM `accounts`\
                WHERE `accounts`.`id` =' + accountId;

    let [rows] = await connection.execute(sql);
    const balance = rows[0].balance;

    if (balance !== 0) {
        console.log(`Saskaitos ${accountId} istrinti negalima, joje yra ${balance} pinigu!`);
        return false;
    } else {
        const sql2 = 'DELETE\
                        FROM `accounts`\
                        WHERE `accounts`.`id` ='+ accountId;
        [rows] = await connection.execute(sql2);
    }
    console.log(`Saskaita numeris - ${accountId} uzdaryta(pasalinta)!`)
    return true
}

module.exports = Account;