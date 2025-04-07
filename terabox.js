const playwright = require('playwright'); // Need this for headless browser

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url || !url.includes('terabox.com')) {
    return res.status(400).json({ status: 'error', message: 'Invalid TeraBox URL' });
  }

  try {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });

    // Wait for window.preload variable (optional tweak)
    const downloadLink = await page.evaluate(() => {
      try {
        return window.preload?.share?.download_url || null;
      } catch {
        return null;
      }
    });

    await browser.close();

    if (downloadLink) {
      return res.json({
        status: 'success',
        download_url: downloadLink
      });
    } else {
      return res.status(404).json({ status: 'error', message: 'Download link not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
