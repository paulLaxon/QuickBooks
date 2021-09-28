const puppeteer = require('puppeteer');

async function startBrowser(){
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await puppeteer.launch({
        headless: false,
        args: ["--disable-setuid-sandbox"],
        'ignoreHTTPSErrors': true
    });

    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    await page.waitForSelector('#twotabsearchtextbox');
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }
  return page;
}

module.exports = {
  startBrowser
};