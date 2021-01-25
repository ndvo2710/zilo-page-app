const mongoose = require('mongoose');
const connectDB = require('../config/connectDB');
const browserObject = require('./browser');
const scraperController = require('./pageController');

module.exports = async function scrapAndFetchMongo(url) {

    try {
        // await (connectDB)();
        await scraperController(browserObject, url);
        // await mongoose.disconnect();
    } catch (err) {
        console.log('Error. Uncomment to see error ');
        // console.log('Error: ', err);
    } finally {
        console.log('Job Done!');
    }

};