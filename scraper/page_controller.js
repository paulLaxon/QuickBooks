const pageScraper = require('./page_scraper');
async function scrapeAll(browserInstance){
    let browser;
    try {
        browser = await browserInstance;
        await pageScraper.scraper(browser);
    }
    catch(err){
        console.log("Could not resolve the page instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)