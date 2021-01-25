const mongoose = require('mongoose');
const getDsDate = require('../utils/getDsDate');
const zillowModel = require('../models/zillow.model.js');


// autoScroll source: https://github.com/chenxiaochun/blog/issues/38;
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 10);
        });
    });
}


const scraperObject = {
    ds: getDsDate(),
    async scraper(browser, url) {

        let newPage = await browser.newPage();
        await newPage.goto(url, { waitUntil: "domcontentloaded", timeout: 300000 });
        await newPage.waitForSelector('.ds-home-details-chip');

        // await autoScroll(newPage);
        // await new Promise(resolve => setTimeout(resolve, 5000));


        const priceHomeDetails = await newPage.evaluate(() => {
            return document.querySelector('.ds-summary-row-content').textContent
        });
        let homeDetails = await newPage.evaluate(() => {
            return document.querySelector('.ds-bed-bath-living-area-header').textContent
        });
        const price = priceHomeDetails.replace(homeDetails, '').replace(/\$|,/g, '').trim();

        const address = await newPage.evaluate(() => {
            return document.querySelector('.ds-price-change-address-row').textContent
        });
        const status = await newPage.evaluate(() => {
            return document.querySelector('.ds-status-details').textContent
        });
        let monthlyMortgage = await newPage.evaluate(() => {
            return document.querySelector('.ds-mortgage-row').textContent
        });

        homeDetails = homeDetails.replace('bd', 'bd | ').replace('ba', 'ba | ');
        monthlyMortgage = monthlyMortgage.replace(
            'Est. payment:', ''
        ).replace(
            '/moGet pre-qualified', ''
        ).replace(/\$|,/g, '').trim();

        console.log('price: ', price)
        console.log('homeDetails: ', homeDetails);
        console.log('address: ', address);
        console.log('status: ', status);
        console.log('monthlyMortgage: ', monthlyMortgage);
        await newPage.close();

        return {
            price: parseInt(price),
            homeDetails,
            address,
            status,
            monthlyMortgage
        };
    }

}

module.exports = scraperObject;