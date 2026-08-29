const process = require('node:process');
process.loadEnvFile('.env');

const { httpServer } = require('./app');
const { initSchedulers } = require('./utils/scheduler');

const port = process.env.PORT;

httpServer.listen(port, () => {
    initSchedulers();
    console.log(`server runnion on port ${port}🦄`)
})