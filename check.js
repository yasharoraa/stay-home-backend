module.exports = function(req,res,next){
    if(process.env.NODE_ENV === "production"){
        if(req.headers.client === process.env.CLIENT && req.headers.secret === process.env.CLIENT_SECRET){
            console.log("credentials write");
            
            next();
        }else{
           res.sendStatus(403);
        }
    }else{
        next();
    }
}