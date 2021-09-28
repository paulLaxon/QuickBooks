module.exports = function startScraper() {
  const browserObject = require('./browser');
  const scraperController = require('./page_controller');

  //Start the browser and create a browser instance
  let pageInstance = browserObject.startBrowser();
  console.log(pageInstance);
  // Pass the page instance to the scraper controller
  // scraperController(pageInstance)
}
