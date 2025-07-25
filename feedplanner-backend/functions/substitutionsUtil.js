/* eslint-disable no-unreachable */
/* eslint-disable max-len */
/* eslint-disable no-const-assign */
/* eslint-disable no-constant-condition */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
const fetch = require("node-fetch");
const apiKey = "AIzaSyDHkg0Q0FrJpacC_5qm5ZFTOrycr66MYos";
async function retryWithBackoff(fn, retries = 3, delay = 500) {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (error) {
            if (attempt >= retries) {
                throw new Error(error);
            }
            const backoff = delay * Math.pow(2, attempt);
            logger.warn(`Retry #${attempt+1} failed, backing off ${backoff} ms`);
            await new Promise((res) => setTimeout(res, backoff));
            attempt ++;
        }
    }
}

module.exports = {
    retryWithBackoff,
};
