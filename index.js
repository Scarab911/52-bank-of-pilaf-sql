const Account = require('./Account');
const User = require('./User');
const db = require('./db');


const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const conn = await db.init({
        host: 'localhost',
        user: 'root',
        database: 'pilafs-bank',
    });

    // LOGIC BELOW
    // let createAccount = await Account.create();
    // console.log(createAccount);


    let createUser = await User.create();
    console.log(createUser);
}

app.init();

module.exports = app;