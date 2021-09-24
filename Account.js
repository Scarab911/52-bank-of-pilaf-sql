const Validation = require('./Validations');
const Logg = require('./Log');

const Account = {};

/**
 * Saskaitos sukurimas.
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
    //sukuriam account, pries tai tikrinam ar acc egzistuoja, aktyvus:
    const sql = 'SELECT `is_active`\
                 FROM `users`\
                 WHERE `id`='+ userId;
    let [rows] = await connection.execute(sql);

    if (rows[0].is_active !== 'TRUE') {
        return `Vartotojas nerastas(neaktyvus) `
    }

    const sql2 = 'INSERT INTO`accounts`\
                    (`id`, `balance`, `user_id`, `is_active`)\
                VALUES\
                    (NULL, 0 , "' + userId + '", "TRUE")';
    [rows] = await connection.execute(sql2);

    //surandam koks sukurto accounto id
    const accountId = rows.insertId;
    //irasom operacija i logus:
    await Logg.create(connection, 5, accountId, userId, null);

    //grazinam rezultata:
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
    //patikrinam ar egzistuoja/aktyvus toks saskaitos NR:
    if (! await Account.isActiveAccount(connection, accountId)) {
        return `Saskaita neegzistuoja`
    }

    //pridedam pinigus i nurodyta saskaita
    let sql2 = 'UPDATE `accounts`\
                 SET `balance` = `balance` +"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    [rows] = await connection.execute(sql2);

    //irasom pinigu pridejima i saskata, i logus:
    await Logg.create(connection, 1, accountId, null, cash);

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
Account.withdrawalFromAccountById = async (connection, accountId, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {
        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }

    if (!Validation.isValidNumber(cash)) {
        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }

    //LOGIC
    //patikrinam ar egzistuoja/aktyvus toks saskaitos NR:
    if (! await Account.isActiveAccount(connection, accountId)) {
        return
    }

    //Patikrinam ar pakanka lesu:
    if (! await Account.IsEnoughtMoney(connection, accountId, cash)) {
        return
    }

    //Jei lesu pakanka atlieka pinigu isemima
    const sql2 = 'UPDATE `accounts`\
                  SET `balance` = `balance` -"'+ cash + '"\
                  WHERE `id` ='+ accountId;

    [rows] = await connection.execute(sql2);

    //irasom pinigu pridejima i saskata, i logus:
    await Logg.create(connection, 2, accountId, null, cash);

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
Account.depositCashToAccount = async (connection, accountId, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {
        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }

    if (!Validation.isValidNumber(cash)) {
        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }

    //LOGIC
    //patikrinam ar egzistuoja/aktyvus toks saskaitos NR:
    if (! await Account.isActiveAccount(connection, accountId)) {
        return
    }
    //surandam account ir savininko varda
    const sql = 'SELECT \
                    `firstname`,\
                    `lastname`,\
                    `balance`,\
                    `accounts`.`id`as accountId\
                FROM `accounts`\
                LEFT JOIN `users`\
                    ON `accounts`.`user_id` = `users`.`id`\
                WHERE `accounts`.`id` =' + accountId;
    const [rows] = await connection.execute(sql);

    const { firstname, lastname } = rows[0];
    await Account.AdditionByAccountId(connection, accountId, cash)

    return `I ${firstname} ${lastname} saskaita sekmingai prideta ${cash} pinigu.`;
}

/**
 * Isgryninam pinigu is norodytos vartotojo saskaitos numerio pagal jo ID.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID vartotojo saskaitos NR.
 * @param {number} cash pinigu suma.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.cashOutMoney = async (connection, accountId, cash) => {
    //VALIDATION
    if (!Validation.IDisValid(accountId)) {
        return `Parametras ID turi buti teigiamas sveikasi skaicius!`;
    }
    if (!Validation.isValidNumber(cash)) {
        return `Parametras turi buti teigiamas sveikasis skaicius!`;
    }

    //LOGIC
    //patikrinam ar egzistuoja/aktyvus toks saskaitos NR:
    if (! await Account.isActiveAccount(connection, accountId)) {
        return
    }

    //surandam account ir savininko varda
    const sql = 'SELECT \
                    `firstname`,\
                    `lastname`,\
                    `accounts`.`balance`,\
                    `accounts`.`id`as accountId\
                FROM `users`\
                LEFT JOIN `accounts`\
                    ON `accounts`.`user_id` = `users`.`id`\
                WHERE `users`.`id` =' + accountId;
    const [rows] = await connection.execute(sql);

    const { firstname, lastname } = rows[0];
    await Account.withdrawalFromAccountById(connection, accountId, cash)

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
    //1 patikrinam ar egzistuoja/aktyvios saskaitos
    if (! await Account.isActiveAccount(connection, withdrawFromId)) {
        return
    }

    if (! await Account.isActiveAccount(connection, transferToId)) {
        return
    }

    //2 patikrinam ar uztenka lesu
    if (! await Account.IsEnoughtMoney(connection, withdrawFromId, cash)) {
        return
    }
    //3 vykdom isskaityma is saskaitos ir ivedima i saskaita
    await Account.withdrawalFromAccountById(connection, withdrawFromId, cash);

    const addition = await Account.AdditionByAccountId(connection, transferToId, cash);
    console.log(`Pavedimas atliktas sekmingai!`);
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
    //patikrinam ar egzistuoja/aktyvus toks saskaitos NR:
    if (! await Account.isActiveAccount(connection, accountId)) {
        return
    }
    //tikrinam ar saskaitoj yra lesu
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
        const sql2 = 'UPDATE `accounts`\
                     SET `is_active` = "FALSE" \
                     WHERE `accounts`.`id` =' + accountId;
        [rows] = await connection.execute(sql2);
    }
    //irasom i logus account pasalinima:
    await Logg.create(connection, 6, accountId, null, null);

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
 * Tikrinam ar saskaita egzistuoja kai naudojam visiska pasalinima is sistemos.
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

/**
 * Tikrinam ar saskaita AKTYVI, kai naudojam active/notActive.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} accountID  Saskaitos ID.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Account.isActiveAccount = async (connection, accountId) => {
    const sql = 'SELECT `is_active`\
                 FROM `accounts`\
                 WHERE `id`='+ accountId;
    let [rows] = await connection.execute(sql);

    // if (rows[0].is_active !== 'TRUE') {
    //     console.log(`Saskaita neegzistuoja arba neaktyvi!`);
    //     return false;
    // }
    // return true;
    //panaudojam ternary, jeigu atsakymas true arba false pagal default, tai uztenka vienos dalies
    return rows[0].is_active !== 'TRUE' ? false : true;
}
module.exports = Account;