module.exports = {
    apps: [
        {
            name: "stay-home",
            script: "node ./bin/www",
            watch: true,
            env: {
                "NODE_ENV": "development"
            },
            env_production: {
                "NODE_ENV": "production",
            }
        }
    ]
}