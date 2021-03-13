const Display = require("./Display");

class ObjectionRelated extends Display {
    constructor(context, type) {
        super(context, type);

        if (context.id) {
            this.id = context.id;
        }

        /**
         * Id of article
         */
        this.article = context.article;
    }
}

module.exports = ObjectionRelated;