const Validation = require('./Validations');

const Account = {};

/**
 * Vartotojo irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} userId Savininko ID.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.create = async (connection, userId) => {
    //VALIDATION:
    if (!Validation.IDisValid(userId)) {
        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }

    //LOGIC
    //sukuriam account
    const sql = 'INSERT INTO`accounts`\
                    (`id`, `balance`, `owners_id`)\
                VALUES\
                    (NULL, 0 , "' + userId + '")';

    const [rows] = await connection.execute(sql);

    return rows.affectedRows === 1 ? `Saskaita sukurta!` : `Saskaitos sukurti nepavyko!`
};

/**
 * Pinigu pridejimas i saskaita.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountId Saskaitos ID.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.AdditionByAccountId = async (connection, accountId, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {
        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }

    if (!Validation.isValidNumber(cash)) {
        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }

    //LOGIC
    //patikrinam ar egzistuoja toks saskaitos NR:
    if (! await Account.IsAccountExists(connection, accountId)) {
        return
    }
    //pridedam pinigus i nurodyta saskaita
    let sql2 = 'UPDATE `accounts`\
                 SET `balance` = `balance` +"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    [rows] = await connection.execute(sql2);
    // console.log(`${cash} pinigu buvo sekmingai prideti i saskaita`);
    // return true;
    if (!!rows.affectedRows) {
        console.log(`${cash} pinigu buvo sekmingai prideti i saskaita`);
    } else {
        console.log(`pinigu prideti nepavyko!`);
    }

    return !!rows.affectedRows;
}

/**
 * Pinigu pasalinimas is saskaitos.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountId Saskaitos ID.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.withdrawalFromAccountByID = async (connection, accountId, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {
        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }

    if (!Validation.isValidNumber(cash)) {
        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }

    //LOGIC
    //Patikrinam ar pakanka lesu:
    if (! await Account.IsEnoughtMoney(connection, accountId, cash)) {
        return
    }

    //Jei lesu pakanka atlieka pinigu isemima
    const sql2 = 'UPDATE `accounts`\
                  SET `balance` = `balance` -"'+ cash + '"\
                  WHERE `id` ='+ accountId;

    [rows] = await connection.execute(sql2);

    if (!!rows.affectedRows) {
        console.log(`${cash} pinigu buvo sekmingai nuskaityti is saskaitos`);
    } else {
        console.log(`pinigu nuskaityti nepavyko!`);
    }

    return !!rows.affectedRows;
}

/**
 * Pridedam pinigu i norodyta saskaita pagal jos ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.depositCashToAccount = async (connection, accountID, cash) => {
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
                    `balance`,\
                    `accounts`.`id`as accountId\
                FROM `accounts`\
                LEFT JOIN `users`\
                    ON `accounts`.`owners_id` = `users`.`id`\
                WHERE `accounts`.`id` =' + accountID;
    const [rows] = await connection.execute(sql);

    const { firstname, lastname } = rows[0];
    await Account.AdditionByAccountId(connection, accountID, cash)

    return `I ${firstname} ${lastname} saskaita sekmingai prideta ${cash} pinigu.`;
}

/**
 * Isgryninam pinigu is norodytos vartotojo saskaitos numerio pagal jo ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.cashOutMoney = async (connection, accountID, cash) => {
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

    const { firstname, lastname } = rows[0];
    await Account.withdrawalFromAccountByID(connection, accountID, cash)

    return `Is ${firstname} ${lastname} saskaitos sekmingai isimta ${cash} pinigu.`;
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
    //1 patikrinam ar egzistuoja acc
    if (! await Account.IsAccountExists(connection, withdrawFromId)) {
        return
    }

    if (! await Account.IsAccountExists(connection, transferToId)) {
        return
    }

    //2 patikrinam ar uztenka lesu
    if (! await Account.IsEnoughtMoney(connection, withdrawFromId, cash)) {
        return
    }
    //3vykdom iskaityma is saskaitos ir ivedima i saskaita
    await Account.withdrawalFromAccountByID(connection, withdrawFromId, cash);

    const addition = await Account.AdditionByAccountId(connection, transferToId, cash);
    console.log(`Pavedimas atliktas sekmingai!`);
    return addition
}
//PAGALBINIAI METODAI
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
    // console.log(`Saskaita numeris - ${accountId} uzdaryta(pasalinta)!`)
    // return true
    if (!!rows.affectedRows) {
        console.log(`Saskaita numeris - ${accountId} uzdaryta(pasalinta)!`);
    } else {
        console.log(`Saskaitos pasalinti nepavyko!`);
    }

    return !!rows.affectedRows;
}
/**
 * Tikrinam ar saskaitoje pakanka lesu.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID  Saskaitos ID.
 * @param {number} cash  Pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.IsEnoughtMoney = async (connection, accountId, cash) => {
    //Patikrinam ar pakanka lesu:
    const sql = 'SELECT `balance`\
                 FROM `accounts`\
                 WHERE `id` =' + accountId;
    let [rows] = await connection.execute(sql);

    if (rows[0].balance < cash) {
        console.log(`Nepakanka lesu saskaitoje!`);
        return false
    }
    return true;
}
/**
 * Tikrinam ar saskaita egzistuoja.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID  Saskaitos ID.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.IsAccountExists = async (connection, accountId) => {
    //patikrinam ar egzistuoja toks saskaitos NR:
    let sql = 'SELECT `id`\
                FROM `accounts`\
                WHERE `id`=' + accountId;
    let [rows] = await connection.execute(sql);

    if (rows.length === 0) {
        console.log(`Klaida nurodant saskaitos numeri!`);
        return false;
    }
    return true;
}



module.exports = Account;