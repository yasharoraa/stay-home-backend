[{
    "name": "dev",
    "script": "node ./bin/www",
    "instances": "3" //number of instances to start
},
{
    "name": "production",
    "script": "NODE_ENV=production node ./bin/www",
    "instances": "max" //to calculate your number of CPU cores available and run based on the core count
}]