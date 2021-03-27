const striptags = require('striptags');

module.exports = {
    cleanText(text) {
        return striptags(text).replace(/\&nbsp;/g, '').trim();
    }
}