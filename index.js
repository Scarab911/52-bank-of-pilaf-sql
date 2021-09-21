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

    //kuriam nauja saskaita
    console.log('');
    let createAccount = await Account.create(conn, 5);
    console.log(createAccount);

    //idedama pinigu i saskaita
    console.log('');
    await Account.AdditionByAccountId(conn, 3, 565);

    console.log('');
    await Account.AdditionByAccountId(conn, 6, 1000);

    //isimam pinigu is saskaitos
    console.log('');
    await Account.withdrawalFromAccountByID(conn, 3, 65);


    //vartotojas pagal id ideda pinigu i saskaita
    console.log('');
    let userAddsMoney = await Account.depositCashToAccount(conn, 4, 200);
    console.log(userAddsMoney);

    //pinigu isgryninimas
    console.log('');
    let cashOut = await Account.cashOutMoney(conn, 4, 20);
    console.log(cashOut);

    //pinigu pervedimas is vienos saskaitos i kita
    console.log('');
    await Account.moneyTransferByAccountId(conn, 5, 3, 325);

    // //susiranda useri pagal id
    // await User.getUserById(conn, 3);

    // //trinam saskaita
    // console.log('');
    // let removeAccount = await Account.deleteAccountById(conn, 2);
    // console.log(removeAccount);

    //trinam vartotoja
    console.log('');
    let removeUser = await User.delete(conn, 2);
    console.log(removeUser);

    console.log('');
    removeUser = await User.delete(conn, 5);
    console.log(removeUser);

    console.log('');
    await Account.moneyTransferByAccountId(conn, 3, 5, 15);
}

app.init();

module.exports = app;