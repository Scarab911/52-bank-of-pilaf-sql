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

    createUser = await User.create(conn, 'Ponas', 'Šėtonas');
    console.log(createUser);

    createUser = await User.create(conn, 'Aiškeregė', 'Baba');
    console.log(createUser);

    createUser = await User.create(conn, 'Nelabasis', 'Jautis');
    console.log(createUser);

    createUser = await User.create(conn, 'Bulma', 'Brif');
    console.log(createUser);
    //kuriam nauja saskaita
    let createAccount = await Account.create(conn, 1000, 5);
    console.log(createAccount);

    //idedama pinigu i saskaita
    let addMoney = await Account.addMoneyToAccountByID(conn, 3, 565);
    console.log(addMoney);
    //isimam pinigu is saskaitos
    let removeMoney = await Account.removeMoneyFromAccountByID(conn, 3, 65);
    console.log(removeMoney);

    //vartotojas pagal id ideda pinigu i saskaita
    let userAddsMoney = await Account.addMoneyToAccountIdByUserId(conn, 4, 200);
    console.log(userAddsMoney);
    //pinigu isgryninimas
    let cashOut = await Account.cashOutMoneyFromUserAccountById(conn, 4, 20);
    console.log(cashOut);
    //pinigu pervedimas is vienos saskaitos i kita
    let moneyTransfer = await Account.moneyTransferByAccountId(conn, 3, 1, 165);
    console.log(moneyTransfer);
}

app.init();

module.exports = app;