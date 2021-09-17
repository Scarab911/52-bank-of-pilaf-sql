class Validation {

    static isValidName(name) {
        if (name === undefined ||
            typeof name !== 'string' ||
            name.length < 2 ||
            !Validation.isUpperCase(name[0])) {
            return false;
        }
        return true;
    }

    static isValidFirstName(firstName) {
        return Validation.isValidName(firstName)
    }


    static isValidLastName(lastName) {
        return Validation.isValidName(lastName)
    }

    static isValidNumber = (param) => {

        if (typeof param !== 'number' ||
            !isFinite(param) ||
            param < 1 ||
            param % 1 !== 0) {
            return false
        }
        return true
    }
    static isValidYear = (param) => {

        if (typeof param !== 'number' ||
            !isFinite(param) ||
            param < 1 ||
            param > 2021 ||
            param % 1 !== 0 ||
            param.toString(10).length !== 4) {
            return false
        }
        return true
    }
    static IDisValid = (id) => {
        return Validation.isValidNumber(id);
    }

    static isValidEmail(email) {
        if (typeof email !== 'string' ||
            email.length < 6 ||
            email.indexOf('@') === -1 || //reiskia @ stringe nerasta(-1)
            email[0] === '@' ||         // pirma string reiksme yra@
            email.slice(-4).indexOf('@') > -1 || //paima 4 pskutinius email simbolius ir iesko @
            Validation.countSimbols(email, '@') > 1) { //tikrina kiek stringe yra atitinkamu simboliu!
            return false;
        }
        return true;
    }

    static isValidMessage(msg) {
        if (typeof msg !== 'string' ||
            msg === '') {
            return false;
        }
        return true;
    }

    static isUpperCase(letter) {
        // if (letter === letter.toUpperCase()) {
        //     return true;
        // } else {
        //     return false;
        // }

        return letter === letter.toUpperCase();
    }

    static countSimbols(text, letter) {
        let count = 0;

        for (const t of text) {
            if (t === letter) {
                count++;
            }
        }

        return count;
    }

    static isText = (param) => {

        if (typeof param !== 'string' ||
            param === '') {
            return false
        }
        return true
    }
}

module.exports = Validation;