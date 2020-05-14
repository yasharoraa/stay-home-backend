var admin = require('firebase-admin');
var sendNotification = function (token, status, order, url,slug) {

    var params = {
        status: status.toString(),
        order: order.toString(),
        slug: slug.toString(),
        message: getTitle(status)
    }

    if(url!=null){
        params['image'] = url;
    }

    var message = {
        data: params,
        token: token
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}

function getTitle(status){
    if(status === 300){
        return 'Order cancelled by user';
    }else if(status === 101){
        return 'You have received a new order'
    }else if(status === 201){
        return 'Order accepted by seller';
    }else if(status === 301){
        return 'Order cancelled by seller';
    }else if(status === 202){
        return 'Order out for delivery';
    }else if(status === 204){
        return 'Order delivered'
    }else{
        return '';
    }
}

module.exports = sendNotification;