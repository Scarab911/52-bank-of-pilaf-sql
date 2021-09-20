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
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.isValidNumber(cash)) {

        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }
    //LOGIC
    //patikrinam ar egzistuoja toks saskaitos NR:
    let sql = 'SELECT `id`\
                FROM accounts';

    let [rows] = await connection.execute(sql);

    if (accountId > rows.length) {
        console.log(`Klaida nurodant saskaitos numeri!`);
        return false;
    }
    //pridedam pinigus i nurodyta saskaita
    let sql2 = 'UPDATE `accounts`\
                 SET `balance` = `balance` +"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    [rows] = await connection.execute(sql2);
    console.log(`${cash} pinigu buvo sekmingai prideti i saskaita`);
    return true;
}

/**
 * Pinigu pasalinimas is saskaitos.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountId Saskaitos ID.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.removeMoneyFromAccountByID = async (connection, accountId, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.isValidNumber(cash)) {

        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }
    //LOGIC
    //Patikrinam ar pakanka lesu:
    const sql = 'SELECT \
                    `balance`\
                FROM `accounts`\
                WHERE `accounts`.`id` =' + accountId;

    let [rows] = await connection.execute(sql);

    if (rows.some(row => row.balance < cash)) {
        console.log(`Nepakanka lesu saskaitoje!`);
        return false
    }
    //Jei lesu pakanka atlieka pinigu isemima
    const sql2 = 'UPDATE `accounts`\
                 SET `balance` = `balance` -"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    [rows] = await connection.execute(sql2);
    console.log(`${cash} pinigu buvo sekmingai nuskaityti is saskaitos`);

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
    //VALIDATION
    if (!Validation.IDisValid(accountID)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.isValidNumber(cash)) {

        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }
    //LOGIC
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

    return `I ${firstName} ${lastName} saskaita sekmingai prideta ${cash} pinigu.`;
}

/**
 * Isgryninam pinigu is norodytos vartotojo saskaitos numerio pagal jo ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.cashOutMoneyFromUserAccountById = async (connection, accountID, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountID)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.isValidNumber(cash)) {

        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }
    //LOGIC
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

    return `Is ${firstName} ${lastName} saskaitos sekmingai isimta ${cash} pinigu.`;
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
    //VALIDATION
    if (!Validation.IDisValid(withdrawFromId)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.IDisValid(transferToId)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.isValidNumber(cash)) {

        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }
    //LOGIC
    const removal = await Account.removeMoneyFromAccountByID(connection, withdrawFromId, cash);

    if (!removal) {
        console.log(`Pinigu pervesti negalima!`);
        return false

    }
    const addition = await Account.addMoneyToAccountByID(connection, transferToId, cash);
    if (!addition) {
        console.log(`Pinigu pervesti nepavyko, grazinta i pradine saskaita!`);
        await Account.addMoneyToAccountByID(connection, withdrawFromId, cash);
        return false
    }
    return addition
}

/**
 * Pasalinam nurodyta saskaita is sistemos pagal ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.deleteAccountById = async (connection, accountId) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {

        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    //LOGIC
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