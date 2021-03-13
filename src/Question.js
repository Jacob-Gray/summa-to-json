const Context = require('./Context');

const ContextType = require('./data/ContextType'),
    Display = require('./data/Display'),
    Titled = require('./data/Titled'),
    Article = require('./data/Article');


class Question {
    constructor() {
        this.context = new Context;
        this.source = {}
    }

    /**
     * @param {string} line 
     */
    processLine(line) {
        this.context.beginLine(line);
        this.dispatch();
        this.context.endLine();
    }

    /**
     * @param {string[]} path 
     * @param {Function} generate 
     * @returns {Display}
     */
    getPageItem(path, generate) {
        let cursor = this.source;
        let finalKey;

        path.forEach((key, i) => {
            finalKey = key;
            if (i !== path.length - 1) {
                if (!cursor[key]) {
                    cursor[key] = {};
                }

                cursor = cursor[key];
            }
        });

        return cursor[finalKey] || (cursor[finalKey] = generate());
    }

    /**
     * 
     * @param {Context} context 
     * @param {Titled} titled 
     */
    handleHeaderParsing(context, titled) {
        if (context.line.startsWith('<H3')) {
            context.set('parsingOuterHeader');
        } else if (context.line === '</h3>') {
            context.set('parsingOuterHeader', false);
            context.set('hasParsedHeader');
        }

        if (context.is('parsingOuterHeader')) {
            titled.writeText('title', context.line);
        }
    }

    handleTitledLine() {
        const context = this.context,
            item = this.getPageItem([context.type], () => new Titled(context));

        this.handleHeaderParsing(context, item);

        if (context.is('hasParsedHeader')) {
            item.writeText('text', context.line);
        }
    }

    /**
     * @returns {Article}
     */
    getArticle() {
        return this.getPageItem([ContextType.Article, this.context.article], () => new Article(this.context));
    }

    handleArticleLine() {
        const context = this.context,
            article = this.getArticle();

        this.handleHeaderParsing(context, article);

        if (context.is('hasParsedHeader')) {
            article.writeText('text', context.line);
        }
    }

    /**
     * @param {'objections'|'replies'} key 
     */
    handleObjectionRelatedLine(key) {
        const context = this.context,
            article = this.getArticle(),
            objection = article.ensure(key, context.id, () => new Display(context));

        objection.writeText('text', context.line);
    }

    /**
     * @param {'counter'|'body'} key 
     */
    handleBodyRelatedLine(key) {
        const context = this.context,
            article = this.getArticle();

        article.writeText(key, context.line);
    }

    handleNavigationSkip() {
        this.context.set('skippingNavigation');

        if (this.context.line === '</p>') {
            this.context.set('skippingNavigation', false);
        }
    }

    dispatch() {
        const context = this.context;

        if (context.type == ContextType.INVALID
            || context.isDocumentationComment) {
            return;
        }

        if (
            (
                context.isFirstLineAfterTypeChange
                && (
                    context.type === ContextType.Outer
                    || context.type === ContextType.Article
                    || context.type === ContextType.EditorsNote
                    || context.type === ContextType.Prologue
                )
            )
            || context.is('skippingNavigation')) {
            return this.handleNavigationSkip();
        }

        switch (context.type) {
            case ContextType.Outer:
            case ContextType.Prologue:
            case ContextType.EditorsNote:
                this.handleTitledLine();
                break;
            case ContextType.Article:
                this.handleArticleLine();
                break;
            case ContextType.Objection:
                this.handleObjectionRelatedLine('objections');
                break;
            case ContextType.Reply:
                this.handleObjectionRelatedLine('replies');
                break;
            case ContextType.Counter:
                this.handleBodyRelatedLine('counter');
                break;
            case ContextType.Body:
                this.handleBodyRelatedLine('body');
                break;
        }
    }
}

module.exports = Question;