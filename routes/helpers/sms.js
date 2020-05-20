var request = require('request');
var msg = 'Dear user, your OTP for stay-home registration is ';
var apikey = require('../../config').text_local_key;
var sender = 'STYHME';


module.exports = function (number, otp) {
    var data = 'apikey=' + apikey + '&sender=' + sender + '&numbers=' + number + '&message=' + rawurlencode(msg + otp.toString() +".");
    var options = {
        method: "GET",
        url: 'https://api.textlocal.in/send?' + data
    };
    return new Promise((resolve, reject) => {
        try {
            request(options, (error, response, body) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                resolve(body);
            });
        } catch (e) {
            reject(e)
            console.log(e);
        }
    });
    function rawurlencode(str) {
        str = (str + "")
        return encodeURIComponent(str)
            .replace(/!/g, "%21")
            .replace(/'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/\*/g, "%2A")
            .replace(/~/g, "%7E");
    };

}

