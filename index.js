const Account = require('./Account');
const User = require('./User');
const db = require('./db');
const Operation = require('./Operation');
const Logg = require('./Log');



const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const conn = await db.init({
        host: 'localhost',
        user: 'root',
        database: 'pilafs-bank',
    });

    // LOGIC BELOW
    //kuriam vartotoja:
    let createUser = await User.create(conn, 'Džinas', 'Vežlys');
    console.log(createUser);
    console.log('');
    createUser = await User.create(conn, 'Ponas', 'Šėtonas');
    console.log(createUser);
    console.log('');
    createUser = await User.create(conn, 'Aiškeregė', 'Baba');
    console.log(createUser);
    console.log('');
    createUser = await User.create(conn, 'Nelabasis', 'Jautis');
    console.log(createUser);
    console.log('');
    createUser = await User.create(conn, 'Bulma', 'Brif');
    console.log(createUser);
    //-----------------------------

    //kuriam nauja saskaita
    console.log('');
    let createAccount = await Account.create(conn, 1);
    console.log(createAccount);

    //idedama pinigu i saskaita
    console.log('');
    await Account.AdditionByAccountId(conn, 1, 565);

    console.log('');
    await Account.AdditionByAccountId(conn, 6, 1000);

    //isimam pinigu is saskaitos
    console.log('');
    await Account.withdrawalFromAccountById(conn, 1, 565);


    //vartotojas pagal id ideda pinigu i saskaita
    console.log('');
    let userAddsMoney = await Account.depositCashToAccount(conn, 1, 200);
    console.log(userAddsMoney);

    //pinigu isgryninimas
    console.log('');
    let cashOut = await Account.cashOutMoney(conn, 1, 20);
    console.log(cashOut);

    //pinigu pervedimas is vienos saskaitos i kita
    console.log('');
    await Account.moneyTransferByAccountId(conn, 1, 2, 180);

    // //trinam vartotoja
    console.log('');
    let removeUser = await User.delete(conn, 1);
    console.log(removeUser);

    console.log('');
    createAccount = await Account.create(conn, 2);
    console.log(createAccount);

    console.log('');
    removeUser = await User.delete(conn, 5);
    console.log(removeUser);

    console.log('');
    await Account.moneyTransferByAccountId(conn, 3, 5, 15);

    console.log('');
    const blbla = await Account.AdditionByAccountId(conn, 1, 565);
    console.log(blbla);

    //Kuriam LOg'us
    let listAllLogs = await Logg.listAll(conn);
    console.log(listAllLogs);
}

app.init();

module.exports = app;