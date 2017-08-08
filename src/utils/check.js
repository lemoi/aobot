/*
    fileds : {
        key: {
            type: number | string | ....,
            required: true | false
        }
    }
*/

function type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

module.exports = function (name, obj, fields) {
    for (let key in fields) {
        if (!obj.hasOwnProperty(key)) {
            if (fields[key].required === true) {
                throw Error(name + ' -> ' + key + ' not found. ');
            }
        } else {
            if (type(obj[key]) !== fields[key].type) {
                throw Error(name + ' -> ' + key + ' should be type ' + fields[key].type + '. ');
            }
        }
    }
    for (let key in obj) {
        if (!fields.hasOwnProperty(key)) {
            throw Error('unrecongnized property [' + name + ' -> ' + key + ']. ');            
        }
    }
}
