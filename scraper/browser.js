const puppeteer = require('puppeteer');

async function startBrowser(url){
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
        headless: false,
        args: [
          `--window-size=${options.width},${options.height}`, 
          "--disable-setuid-sandbox",
        ],
        'ignoreHTTPSErrors': true
    });

  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }

  return browser;
}

module.exports = {
  startBrowser
};