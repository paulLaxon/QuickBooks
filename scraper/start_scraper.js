const browserObject = require('./browser');
const scraperController = require('./page_controller');

//Start the browser and create a browser instance
console.log('Starting browser');
let browserInstance = browserObject.startBrowser();
// Pass the browser instance to the scraper controller
scraperController(browserInstance);
