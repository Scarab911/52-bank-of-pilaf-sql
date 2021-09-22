const helpers = {};

helpers.Capitalize = async (str) => {
    return str[0].toUpperCase() + str.slice(1);
};

helpers.formatDate = async (date) => {
    const d = new Date(date);
    const dformat = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
    return dformat;
}
helpers.formatTime = async (time) => {
    const d = new Date(time);
    const dformat = [d.getHours(), d.getMinutes() + 1, d.getSeconds()].join(':');
    return dformat;
}
module.exports = helpers;