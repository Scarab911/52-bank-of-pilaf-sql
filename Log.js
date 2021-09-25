const helpers = require('./helpers');
const Logg = {}

/**
 * Log irasymas i duombaze.
 * @param {Object} connection Objektas, su kuriuo kvieciame duombazes manipuliavimo metodus.
 * @param {number} operation_id Atliktos operacijos pavadinimas, jei neduodam irasom null.
 * @param {number} accountId Saskaitos ID, jei neduodam irasom null.
 * @param {number} userId Vartotojo ID, jei neduodam irasom null.
 * @param {number} amount Pinigu suma atliekant operaciaj,jei neduodam irasom null.
 * @returns {Promise<string>} Tekstinis pranesimas pranesanti apie atlikta operacija, irasyma i duomenu baze.
 */
Logg.create = async (connection, operation_id, accountId, userId, amount) => {
    sql = 'INSERT INTO `logs`\
     (\
        `id`, `operation_id`, \
        `account_id`, \
        `user_id`, \
        `amount`, \
        `date`\
        ) VALUES \
        (NULL, "'+ operation_id + '", "' + accountId + '", "' + userId + '", "' + amount + '", current_timestamp())';
    await connection.execute(sql);
    return `Log created`
}
Logg.listAll = async (connection) => {

    //KETURIU LENTELIU APJUNGIMAS:
    sql = 'SELECT `logs`.`operation_id`,\
                  `logs`.`account_id`,\
                  `operations`.`operation_name`,\
                  `users`.`firstname`,\
                  `users`.`lastname`,\
                  `date`,\
                  `time`\
            FROM `users`\
            LEFT JOIN `accounts`\
                ON `users`.`id`=`accounts`.`user_id`\
            LEFT JOIN `logs`\
                ON `accounts`.`id` = `logs`.`account_id`\
            LEFT JOIN `operations`\
                ON `operations`.`id` = `logs`.`operation_id`';

    const [list] = await connection.execute(sql);
    console.log(list[6]);
    let count = 0;
    let listOfLogs = [];
    for (let { operation_name, lastname, firstname, date, time, account_id } of list) {
        listOfLogs.push(`${++count}. Operation - "${operation_name}", user - ${firstname} ${lastname}, account number - ${account_id} \noperation date - ${await helpers.formatDate(date)} ${time}. Success!`);
    }
    const response = listOfLogs.join('\n');
    return await response;
}
module.exports = Logg;
