const ContextType = require("./data/ContextType");

/**
 * @instance
 * @property {number} type
 */
class Context {
    /**
     * Mapping from the labels within documentation comments to a defined ContextType
     */
    static Mapping = {
        'Out.': ContextType.Outer,
        'Thes.': ContextType.Article,
        'Obj.': ContextType.Objection,
        'OTC': ContextType.Counter,
        'Body': ContextType.Body,
        'R.O.': ContextType.Reply,
        'Prologue': ContextType.Prologue,
        'Ed. Note': ContextType.EditorsNote,
        'Editor\'s Note': ContextType.EditorsNote,
    };
    /**
     * A list of all known documentation comment labels. Only really helpful for debug purposes.
     */
    static Known = [];
    /**
     * Regex used to match and group data from documentation comemnts.
     */
    static Regex = /<!--Aquin\.: SMT (XP App\. \d|[A-Za-z]{2}|) *Q*\[*(\d*)\]* *A*\[*(\d*)\]* *([^\d]+) (\d*) *Para\. (\d)/;

    constructor() {
        /**
         * The current context type, based off of documentation comments.
         */
        this.type = ContextType.INVALID;

        /**
         * Stores temporary data, is reset every time the ContextType changes
         */
        this.data = {};

        /**
         * Current ID of the context. This represents the number associated with a Article, Objection, or Objection reply. In certain contexts it will not be set.
         * @type {number}
         */
        this.id = null;

        /**
         * Id of the part this context related to, if applicable.
         */
        this.part = '';

        /**
         * Id of the question this context related to, if applicable.
         * @type {number}
         */
        this.question = null;

        /**
         * Id of the article this context related to, if applicable.
         * @type {number}
         */
        this.article = null;

        /**
         * Current line of HTML file without any cleaning done.
         */
        this.line = '';

        /**
         * Current line number of HTML file.
         */
        this.lineNumber = -1;

        /**
         * Boolean indicating if the current line holds a documentation comment from which metadata is pulled.
         */
        this.isDocumentationComment = false;

        /**
         * Boolean indicating if the current line is directly after a documentation comment.
         */
        this.isFirstLineAfterTypeChange = false;

        /**
         * Boolean indicating if this context has already processed an outer type.
         * 
         * A few of the files have Outer ContextTypes randomly appearing in the page, so we do a check to only allow oner per page, then convert the rest to Article ContextTypes
         */
        this.hasHadOuter = false;

        /**
         * Boolean indicating if this context has had a question ID set.
         */
        this.hasQuestion = false;
    }

    get(key) {
        return this.data[key];
    }

    is(key) {
        return !!this.get(key);
    }

    set(key, value = true) {
        this.data[key] = value;
    }

    clear() {
        this.data = [];
    }

    setType(type) {
        if (type === this.type) {
            return;
        }

        if (type === ContextType.Outer) {
            if (this.hasHadOuter) {
                // A few of the files have multiple outer elements, for no apparant reason. 
                // Because of this, we convert the outer context to the regularly used article type
                type = ContextType.Article
            }

            this.hasHadOuter = true;
        }

        this.type = type;
        this.clear();

        this.set('typeChangeLine', this.lineNumber);
    }

    setLine(line) {
        this.line = line;
        this.lineNumber++;
    }

    setQuestion(question) {
        if (!this.question
            && this.question !== question
            && !this.hasQuestion) {
            this.question = question;
            this.hasQuestion = true;
        }
    }

    translateType(type) {
        return Context.Mapping[type] || ContextType.INVALID;
    }

    parseDocumentationCommentIfPossible() {
        let documentationComment = Context.Regex.exec(this.line);
        let x = documentationComment;

        if (!documentationComment) {
            return false;
        }

        const [match, part, question, article, type, id] = documentationComment;

        if (!Context.Known.includes(type)) {
            Context.Known.push(type);
        }

        return {
            type: this.translateType(type),
            part: part,
            question: +question || null,
            article: +article || null,
            id: +id || null,
        };
    }

    beginLine(line) {
        this.setLine(line);

        // <hr> is only used at the end of a section, always preceeding a documentation comment or the end of the file.
        // We do this check here to stop the footer text from being inserted into the last objection reply, as there is no documentation comment after it.
        if (line === '<hr>') {
            this.setType(ContextType.INVALID);
        }

        if (this.type) {
            this.isFirstLineAfterTypeChange = this.lineNumber - this.get('typeChangeLine') === 1;
        }

        let documentationComment = this.parseDocumentationCommentIfPossible();

        if (documentationComment) {
            const { part, type, id, question, article } = documentationComment;

            this.isDocumentationComment = true;

            this.setType(type);
            this.setQuestion(question);

            this.id = id;
            this.article = article;
            this.part = part;
        }
    }

    endLine() {
        this.isDocumentationComment = false;
        this.isFirstLineAfterTypeChange = false;
    }
}

module.exports = Context;