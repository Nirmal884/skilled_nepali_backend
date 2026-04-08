const process = require('node:process');
process.loadEnvFile('.env');

const app = require('./app')

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server runnion on port ${port}🦄`)
})