const cron = require('node-cron');
var mongoose = require('mongoose');
var Order = mongoose.model('Order');

const scheduler = cron.schedule("0 */3 * * *", function () {
    console.log("Cron job Executed");
    Order.updateMany({ "createdAt": { $lt: new Date(Date.now() - 24*60*60*1000) }, "status": 101 },
        { "status": 302 },function(err, docs){
            if (err){ 
                console.log(err) 
            } 
            else{ 
                console.log("Updated Docs : ", docs); 
            } 
        });
});

module.exports = scheduler;