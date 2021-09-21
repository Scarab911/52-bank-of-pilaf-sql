const Operation = {}

Operation.create = async (connection, name) => {
    const sql = 'INSERT INTO `operations` (\
                    `id`, `operation_name`) \
                VALUES (NULL, "' + name + '")';
    const [rows] = await connection.execute(sql);
}
module.exports = Operation;