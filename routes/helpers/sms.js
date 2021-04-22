var request = require('request');
var reg_msg_prefix = 'Dear user, your OTP for StayHome registration is ';
var reset_msg_prefix = 'Dear user, your OTP to reset your StayHome account password is ';
var reg_msg_suffix = ' is your OTP for StayHome account registration. OTP valid for 5 minutes.'
var reset_msg_suffix = ' is the OTP to reset your StayHome account password. OTP valid for 10 minutes.'
var apikey = require('../../config').text_local_key;
var sender = 'STYHME';


module.exports = function (number, otp, type) {
    var data = 'apikey=' + apikey + '&sender=' + sender + '&numbers=' + number + '&message=' +
        rawurlencode(otp.toString() + (type === 1 ? reset_msg_suffix : reg_msg_suffix));

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

