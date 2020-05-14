console.log(`node env from config.js ${process.env.NODE_ENV}`);
if(process.env.NODE_ENV === "production"){
    module.exports = {
        'secret' : process.env.SECRET,
        'ssecret' : process.env.SSECRET,
        'mongoUrl' : process.env.MONGO_URL,
    }
}else{
    module.exports = {
        'secret' : '300E52B82C92E38AF01C309B2A240BD42D4A8BA14680A76128D4EED397B7793A',
        'ssecret' : 'DCC581D2F7E9492BD3E8C2A7D8EAA81297D3DCFEFD7B598E7292718395B37C6D',
        'mongoUrl' : 'mongodb://devyash:samsung@localhost/development',
    }
}

