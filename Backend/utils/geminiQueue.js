const PQueue = require('p-queue').default;
const queue = new PQueue({ concurrency: 1 }); // FIFO, 1 job at a time
module.exports = queue; 