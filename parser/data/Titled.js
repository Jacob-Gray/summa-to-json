const Context = require("../Context");
const Display = require("./Display");

class Titled extends Display {
    /**
     * 
     * @param {Context} context 
     * @param {string} type 
     */
    constructor(context, type) {
        super(context, type);

        /**
         * Title of this display.
         * @type {string[]}
         */
        this.title = [];
    }
}

module.exports = Titled;