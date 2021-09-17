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

Account.addMoneyToAccountByID = async (connection, accountId, cash) => {

    let sql = 'UPDATE `accounts`\
                 SET `balance` = `balance` +"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    const [rows] = await connection.execute(sql);

    return `${cash} pinigu buvo sekmingai prideti i saskaita`;
}
Account.removeMoneyFromAccountByID = async (connection, accountId, cash) => {

    let sql = 'UPDATE `accounts`\
                 SET `balance` = `balance` -"'+ cash + '"\
                  WHERE `accounts`.`id` ='+ accountId;

    const [rows] = await connection.execute(sql);

    return `${cash} pinigu buvo sekmingai isimti/pervesti`;
}


module.exports = Account;