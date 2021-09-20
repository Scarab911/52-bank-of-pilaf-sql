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
    let createAccount = await Account.create(conn, 1000, 5);
    console.log(createAccount);

    //idedama pinigu i saskaita
    console.log('');
    await Account.addMoneyToAccountByID(conn, 3, 565);


    //isimam pinigu is saskaitos
    console.log('');
    await Account.removeMoneyFromAccountByID(conn, 3, 65);


    //vartotojas pagal id ideda pinigu i saskaita
    console.log('');
    let userAddsMoney = await Account.addMoneyToAccountIdByUserId(conn, 4, 200);
    console.log(userAddsMoney);

    //pinigu isgryninimas
    console.log('');
    let cashOut = await Account.cashOutMoneyFromUserAccountById(conn, 4, 20);
    console.log(cashOut);

    //pinigu pervedimas is vienos saskaitos i kita
    console.log('');
    await Account.moneyTransferByAccountId(conn, 6, 78, 325);


    // //trinam accounta
    // console.log('');
    // let removeAccount = await Account.deleteAccountById(conn, 2);
    // console.log(removeAccount);

    //trinam vartotoja
    console.log('');
    let removeUser = await User.delete(conn, 2);
    console.log(removeUser);

    console.log('');
    removeUser = await User.delete(conn, 4);
    console.log(removeUser);

}

app.init();

module.exports = app;