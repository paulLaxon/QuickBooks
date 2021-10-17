const OrderItem = require('../models/order_item');
const Book = require('../models/book');

const puppeteer = require('puppeteer');
const createOrderItem = require('../public/javascript/create_order_item');

AMAZON_BOOKS_URL = 'https://www.amazon.ca/gp/browse.html?node=916520&ref_=nav_em__bo_0_2_9_2'
let browser;
let pages;
let page;
let orderItems = [];

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
    pages = await browser.pages();
    page = pages[0];
    const orderItem = await scrapePage(page);
    orderItems.push(orderItem);
    const orderCost = totalCost(orderItems);
    console.log(`new order items: ${orderItems}`);
    res.render('orders/new', { orderItems, orderCost });
  }
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
  let orderItem = new OrderItem();
  let book = new Book();

  await page.waitForSelector('h1#title');

  const productSelector = '#detailBullets_feature_div > ul.detail-bullet-list > li'
  await page.waitForSelector(productSelector);
  await page.$$eval(productSelector, details => details.map(detail => detail.innerText));
  // item['genre'] = findGenre(page);
  book['title'] = await findTitle(page);
  book['author'] = await findAuthor(page);
  book['description'] = await findDescription(page);
  const price = await findPrice(page);
  orderItem['price'] = price;
  book['image'] = await findImage(page);
  await getDetails(page, book);
  orderItem['book'] = book;
  return orderItem;
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
  let author = await page.$eval('span.author', el => el.innerText);
  author = author.replace('  (Author)', '');
  return author;
}

async function findPrice(page) {
  let price = await page.$eval('.a-color-price', el => el.innerText);
  return parseFloat(price.replace('$', ''));
}

async function findDescription(page) {
  await page.waitForSelector('iframe#bookDesc_iframe');
  const elHandle = await page.$('iframe#bookDesc_iframe');
  const frame = await elHandle.contentFrame();
  await frame.waitForSelector('#iframeContent');

  return await frame.$eval('#iframeContent', el => el.innerText);
}

async function getDetails(page, book) {
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
      book['pages'] = pair[1].replace(' pages', '');
      pair[1] = pair[0];
      pair[0] = 'type';
    }
    book[pair[0]] = pair[1];
  }
}

function totalCost(items) {
  let cost = 0;
  for (let item of items) {
    cost += item.price * item.quantity;
  }
  return cost;
}
