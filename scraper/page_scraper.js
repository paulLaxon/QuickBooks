// https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer
const scraperObject = {
  url: 'https://www.amazon.ca/Farleigh-Field-Novel-World-War/dp/1503941353/?_encoding=UTF8&pd_rd_w=FZz9m&pf_rd_p=21241dd6-c9a3-4efa-a724-444c20c4e65a&pf_rd_r=6S1XP78FG6S978HYTF0D&pd_rd_r=1148436e-11e8-4d8a-ac04-0a801b76fe99&pd_rd_wg=8ZDdZ&ref_=pd_gw_bmx_gp_tjexgvqn',
  async scraper(browser){
    let page = await browser.newPage();
    await page.goto(this.url);
    
    await page.waitForSelector('#twotabsearchtextbox');
    await page.focus('#twotabsearchtextbox');
    await page.waitForSelector('h1#title');

    // const breadcrumbs = await page.evaluate(() => Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_feature_div > ul > li'), element => element.textContent));
    // const genre = breadcrumbs.at(-1);
    const genre = 'fiction';
    const image = await page.$eval('#img-canvas > img[src]', img => img.getAttribute('src'));
    const title = await page.$eval('span#productTitle', el => el.innerText);
    const author = await page.$eval('a.contributorNameID', el => el.innerText);
    const price = await page.$eval('.a-color-price', el => el.innerText);

    await page.waitForSelector('iframe#bookDesc_iframe');
    const elHandle = await page.$('iframe#bookDesc_iframe');
    const frame = await elHandle.contentFrame();
    await frame.waitForSelector('#iframeContent > p');
    const description = await frame.$eval('#iframeContent > p', el => el.innerText);

    const productSelector = '#detailBullets_feature_div > ul.detail-bullet-list > li'
    await page.waitForSelector(productSelector);
    const productDetails = await page.$$eval(productSelector, details => details.map(detail => detail.innerText));
    bookInfo = {};
    bookInfo['genre'] = genre;
    bookInfo['title'] = title;
    bookInfo['author'] = author;
    bookInfo['description'] = description;
    bookInfo['price'] = price;
    bookInfo['image'] = image;

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
    
    console.log(bookInfo);
  }
}

module.exports = scraperObject;