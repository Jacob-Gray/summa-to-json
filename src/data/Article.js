const ContextType = require("./ContextType");
const Display = require("./Display");
const Titled = require("./Titled");

class Article extends Titled {
    constructor(context) {
        super(context, ContextType.Article);

        /**
         * @type {Object.<number, Display>}
         */
        this.objections = {};
        /**
         * @type {Object.<number, Display>}
         */
        this.replies = {};
        /**
         * Counter point text
         * @type {string[]}
         */
        this.counter = [];
        /**
         * Body of argument text
         * @type {string[]}
         */
        this.body = [];
    }

    /**
     * @param {'text'|'body'|'counter'} prop 
     * @param {string} text 
     */
    writeText(prop, text) {
        super.writeText(prop, text);
    }
}

module.exports = Article;