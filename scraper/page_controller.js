const pageScraper = require('./page_scraper');
async function scrapeAll(pageInstance){
    let page;
    try{
        page = await pageInstance;
        await pageScraper.scraper(page);

    }
    catch(err){
        console.log("Could not resolve the page instance => ", err);
    }
}

module.exports = (pageInstance) => scrapeAll(pageInstance)