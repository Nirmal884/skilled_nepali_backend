const process = require('node:process');
process.loadEnvFile('.env');

const app = require('./app');
const { initSchedulers } = require('./utils/scheduler');

const port = process.env.PORT;

app.listen(port, () => {
    initSchedulers();
    console.log(`server runnion on port ${port}🦄`)
})