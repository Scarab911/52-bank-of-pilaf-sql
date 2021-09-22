const helpers = require('./helpers');
const Log = {}

Log.create = async (connection, operation_id, accountId, userId) => {
    sql = 'INSERT INTO `logs`\
     (\
        `id`, `operation_id`, \
        `account_id`, \
        `owner_id`, \
        `date`\
        ) VALUES \
        (NULL, "'+ operation_id + '", "' + accountId + '", "' + userId + '", current_timestamp())';
    const [rows] = await connection.execute(sql);
    return `Log created`
}
Log.listAll = async (connection) => {
    sql = 'SELECT *\
     FROM `logs`\
     LEFT JOIN `users`\
     ON `users`.`id` = `logs`.`owner_id`\
     LEFT JOIN `operations`\
     ON `operations`.`id` = `logs`.`operation_id`';
    const [rows] = await connection.execute(sql);
    let count = 0;
    let listOfLogs = [];
    for (let { operation_name, lastname, firstname, date, time, account_id } of rows) {
        listOfLogs.push(`${++count}. Operation - "${operation_name}", user - ${firstname} ${lastname}, account number - ${account_id}\noperation date - ${await helpers.formatDate(date)} ${time}. Success!`);
    }
    const response = listOfLogs.join('\n');
    return await response;
}
module.exports = Log;
