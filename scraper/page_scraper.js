// https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer
url: 'https://www.amazon.ca/Farleigh-Field-Novel-World-War/dp/1503941353/?_encoding=UTF8&pd_rd_w=FZz9m&pf_rd_p=21241dd6-c9a3-4efa-a724-444c20c4e65a&pf_rd_r=6S1XP78FG6S978HYTF0D&pd_rd_r=1148436e-11e8-4d8a-ac04-0a801b76fe99&pd_rd_wg=8ZDdZ&ref_=pd_gw_bmx_gp_tjexgvqn',
module.exports = async function scraper(page) {
  bookInfo = {};

  await page.waitForSelector('h1#title');

  const productSelector = '#detailBullets_feature_div > ul.detail-bullet-list > li'
  await page.waitForSelector(productSelector);
  const productDetails = await page.$$eval(productSelector, details => details.map(detail => detail.innerText));
  bookInfo['genre'] = findGenre(page);
  bookInfo['title'] = findTitle(page);
  bookInfo['author'] = findAuthor(page);
  bookInfo['description'] = findDescription(page);
  bookInfo['price'] = findPrice(page);
  bookInfo['image'] = findImage(page);
  getDetails(page, bookInfo);

  bookInfo
}

async function findGenre(page) {
    // const breadcrumbs = await page.evaluate(() => Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_feature_div > ul > li'), element => element.textContent));
    // breadcrumbs.at(-1)
    'fiction'
}

async function findTitle(page) {
  await page.$eval('span#productTitle', el => el.innerText)
}

async function findImage(page) {
  await page.$eval('#img-canvas > img[src]', img => img.getAttribute('src'))
}

async function findAuthor(page) {
  await page.$eval('a.contributorNameID', el => el.innerText)
}

async function findPrice(page) {
  await page.$eval('.a-color-price', el => el.innerText)
}

async function findDescription(page) {
  await page.waitForSelector('iframe#bookDesc_iframe');
  const elHandle = await page.$('iframe#bookDesc_iframe');
  const frame = await elHandle.contentFrame();
  await frame.waitForSelector('#iframeContent > p');

  await frame.$eval('#iframeContent > p', el => el.innerText)
}

async function getDetails(page, bookInfo) {
  const productSelector = '#detailBullets_feature_div > ul.detail-bullet-list > li'
  await page.waitForSelector(productSelector);

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
