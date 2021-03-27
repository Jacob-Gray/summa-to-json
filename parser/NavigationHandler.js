// At this point, I don't really care about this parser that much anymore, so this code is gonna be fairly garbage.
// I have the data that I need, and the next time I'll use deno because I forgot how painful vanilla JS is.

const { cleanText } = require('./Utils');

class NavigationHandler {
    constructor(part) {
        this.part = part;
        this.source = {
            title: null,
            questions: {},
            sections: {},
        };
        this.isHeading = false;
        this.isQuestions = false;
        this.currentSection = 0;
        this.currentQuestion = 0;
    }

    getQuestion(id) {
        if (this.source.questions[id]) {
            return this.source.questions[id];
        }

        for (let section in this.source.sections) {
            if (this.source.sections[section].questions[id]) {
                return this.source.sections[section].questions[id];
            }
        }

        throw new Error('attempting to find question that doesn\'t exist');
    }

    getContext(line) {
        if (line.startsWith('<H3')) {
            this.isHeading = true;
            this.isQuestions = false;
        } else if (line.startsWith('</h3')) {
            this.isHeading = false;
        }

        if (line === '<P>Question<br>') {
            this.isQuestions = true;
        }

        if (this.isQuestions && line.startsWith('<br>&nbsp;&nbsp;')) {
            this.currentQuestion++;
        }

        if (this.isQuestions && line == '<hr>') {
            this.isQuestions = false;
        }
    }

    processLine(line) {
        this.getContext(line);

        const cleaned = cleanText(line).replace(/^\d+\. /, '');

        if (cleaned.length) {
            if (this.isHeading) {
                if (this.source.title) {
                    this.source.sections[++this.currentSection] = {
                        id: this.currentSection,
                        title: cleaned,
                        part: this.part,
                        questions: {},
                    }
                } else {
                    this.source.title = cleaned.replace(/ \(.+\)/, '');
                }
            } else if (this.isQuestions && this.currentQuestion !== 0 && line !== '<P>Question<br>') {
                if (this.currentSection === 0) {
                    if (this.source.questions[this.currentQuestion]) {
                        this.source.questions[this.currentQuestion].title += ` ${cleaned}`
                    } else {
                        this.source.questions[this.currentQuestion] = {
                            id: this.currentQuestion,
                            part: this.part,
                            title: cleaned,
                        }
                    }
                } else {
                    if (this.source.sections[this.currentSection].questions[this.currentQuestion]) {
                        this.source.sections[this.currentSection].questions[this.currentQuestion].title += ` ${cleaned}`;
                    } else {
                        this.source.sections[this.currentSection].questions[this.currentQuestion] = {
                            id: this.currentQuestion,
                            part: this.part,
                            title: cleaned,
                            section: this.currentSection,
                        }
                    }
                }
            }
        }
    }
}

module.exports = NavigationHandler;