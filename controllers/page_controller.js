const puppeteer = require('puppeteer');
AMAZON_BOOKS_URL = 'https://www.amazon.ca/gp/browse.html?node=916520&ref_=nav_em__bo_0_2_9_2'
const Page = require('../models/page');
let browser;
let pages;
let page;

module.exports.pageOptions = async (req, res) => {
  const option = req.body.pageOption;
  if (option == 'Open Amazon') {
    browser = await openBrowser();
    pages = await browser.pages();
    page = pages[0];
    await page.goto(AMAZON_BOOKS_URL);
    await page.setViewport({width:1650, height:1050});
  } else if (option == 'Close Browser') {
    await closeBrowser();
  } else if (option == 'Get Book Info') {
    console.log(`browser 2 = ${browser}`);
    pages = await browser.pages();
    page = pages[0];
    let bookInfo = await scrapePage(page);
    console.log(`book info: ${JSON.stringify(bookInfo)}`);
    res.render('orders/new', { bookInfo });;
  }
}

insertBookInfo = async (bookInfo) => {
  console.log(bookInfo);
}

gotoUrl = async () => {
    await page.goto(this.url);
}

openBrowser = async () => {
  try {
    console.log("Opening the browser......");
    const browser = await puppeteer.launch({
        headless: false, 
        args: ['--disable-setuid-sandbox'],
        'ignoreHTTPSErrors': true
    });

    return browser;
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }

}

closeBrowser = async () => {
  try {
  } catch (err) {
    console.log("Could not close the browser instance => : ", err);
  } finally {
    console.log("Closing the browser......");
    await browser.close();
  }
}

scrapePage = async (page) => {
  bookInfo = {};
  console.log('getting book info');
  await page.waitForSelector('h1#title');

  const productSelector = '#detailBullets_feature_div > ul.detail-bullet-list > li'
  await page.waitForSelector(productSelector);
  await page.$$eval(productSelector, details => details.map(detail => detail.innerText));
  // bookInfo['genre'] = findGenre(page);
  bookInfo['title'] = await findTitle(page);
  bookInfo['author'] = await findAuthor(page);
  bookInfo['description'] = await findDescription(page);
  bookInfo['price'] = await findPrice(page);
  bookInfo['image'] = await findImage(page);
  await getDetails(page, bookInfo);

  return bookInfo;
}

async function findGenre(page) {
    // const breadcrumbs = await page.evaluate(() => Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_feature_div > ul > li'), element => element.textContent));
    // breadcrumbs.at(-1)
    'fiction'
}

async function findTitle(page) {
  return await page.$eval('span#productTitle', el => el.innerText);
}

async function findImage(page) {
  return await page.$eval('#img-canvas > img[src]', img => img.getAttribute('src'));
}

async function findAuthor(page) {
  return await page.$eval('span.author', el => el.innerText);
}

async function findPrice(page) {
  return await page.$eval('.a-color-price', el => el.innerText);
}

async function findDescription(page) {
  await page.waitForSelector('iframe#bookDesc_iframe');
  const elHandle = await page.$('iframe#bookDesc_iframe');
  const frame = await elHandle.contentFrame();
  await frame.waitForSelector('#iframeContent');

  return await frame.$eval('#iframeContent', el => el.innerText);
}

async function getDetails(page, bookInfo) {
  console.log('getting book details...');
  const productSelector = '#detailBullets_feature_div > ul.detail-bullet-list > li'
  await page.waitForSelector(productSelector);
  const productDetails = await page.$$eval(productSelector, details => details.map(detail => detail.innerText));

  for (let detail of productDetails) {
    let pair = detail.replace(/[\u200e\u200f]/g, '').split(':');
    pair[0] = pair[0].trim().toLowerCase();
    pair[1] = pair[1].trim();
    if (pair[0] == 'item weight') {
      pair[0] = 'weight';
    } else if (pair[0] == 'isbn-13') {
      pair[0] = 'isbn';
      pair[1] = pair[1].replaceAll(/\D/g, '');
    } else if (pair[0] == 'isbn-10') {
      continue;
    } else if (pair[1].includes('pages')) {
      bookInfo['pages'] = pair[1].replace(' pages', '');
      pair[1] = pair[0];
      pair[0] = 'type';
    }
    bookInfo[pair[0]] = pair[1];
  }
}
