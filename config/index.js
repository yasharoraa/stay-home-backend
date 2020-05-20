console.log(`node env from config.js ${process.env.NODE_ENV}`);
if(process.env.NODE_ENV === "production"){
    module.exports = {
        'secret' : process.env.SECRET,
        'ssecret' : process.env.SSECRET,
        'mongoUrl' : process.env.MONGO_URL,
        'spaces_key' : process.env.SPACES_KEY,
        'spaces_secret' : process.env.SPACES_SECRET,
        'text_local_key' : process.env.TEXT_LOCAL_KEY
    }
}else{
    module.exports = {
        'secret' : '300E52B82C92E38AF01C309B2A240BD42D4A8BA14680A76128D4EED397B7793A',
        'ssecret' : 'DCC581D2F7E9492BD3E8C2A7D8EAA81297D3DCFEFD7B598E7292718395B37C6D',
        'mongoUrl' : 'mongodb://devyash:samsung@localhost/development',
        'spaces_key' : 'ZLP4VWVZHOMTQU6CYMGA',
        'spaces_secret' : 'HPBo4e66zofGPsTI/2SaiUy0S27biaR3GDC/TbwA5Qs',
        'text_local_key' : '7v/P/3ek5BQ-8RsxmyzdeoogOE7tkPyrbM120Typxp'
    }
}

