const getScreenshot = require('./print');
const url2 = require('url');

module.exports = async function (req, res) {
    const { pathname = '/', query = {} } = req.url;
    const { type = 'png' } = query; // png or jpeg
    let url = pathname.slice(1);
    if (!url.startsWith('http')) {
        url = 'https://' + url; // add protocol if missing
    }
    const file = await getScreenshot(url, type);
    res.statusCode = 200;
    res.setHeader('Content-Type', `image/${type}`);
    res.end(file);
};