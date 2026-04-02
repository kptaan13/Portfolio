const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Users\\kptaa\\.cache\\puppeteer\\chrome\\win64-146.0.7680.153\\chrome-win64\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ],
    timeout: 60000
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  const base = 'C:/Users/kptaa/Rnadom ideas/portfolio';

  async function screenshot(htmlFile, pngFile) {
    const filePath = 'file:///' + path.join(base, htmlFile).replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(base, pngFile),
      clip: { x: 0, y: 0, width: 1200, height: 630 }
    });
    console.log(pngFile + ' generated');
  }

  await screenshot('og.html', 'og.png');
  await screenshot('og-blog.html', 'og-blog.png');
  await browser.close();
})();
