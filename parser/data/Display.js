const striptags = require('striptags');
const Context = require('../Context');

class Display {
    /**
     * @param {string} type 
     * @param {Context} context 
     */
    constructor(context, type = null) {
        if (context.question) {
            this.question = context.question;
        }

        this.type = type || context.type;
        this.part = context.part;

        /**
         * @type {string[]}
         */
        this.text = [];
    }

    /**
     * 
     * @param {string} prop 
     * @param {int} id 
     * @param {Function} generate 
     * @returns {Display}
     */
    ensure(prop, id, generate) {
        return this[prop][id] ? this[prop][id] : this[prop][id] = generate(id);
    }

    /**
     * @param {'text'} prop 
     * @param {string} text 
     */
    writeText(prop, text) {
        if (!Array.isArray(this[prop])) {
            throw new Error('Specified prop must be an array.');
        }

        const cleaned = this.cleanText(text);

        if (cleaned.length) {
            if (text.startsWith('<P') || !this[prop].length) {
                this[prop].push(cleaned);

            } else {
                this[prop][this[prop].length - 1] += ' ' + cleaned;
            }
        }
    }

    cleanText(text) {
        return striptags(text).replace(/\&nbsp;/g, '').trim();
    }
}

module.exports = Display;