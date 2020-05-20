module.exports = function(req,res,next){
    if(process.env.NODE_ENV === "production"){
        if(req.headers.lot_pot === process.env.CLIENT && req.headers.kit_mit === process.env.CLIENT_SECRET){            
            next();
        }else{
           res.sendStatus(403);
        }
    }else{
        next();
    }
}