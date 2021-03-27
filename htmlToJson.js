const fs = require('fs');
const path = require('path');
const readline = require('readline');
const FileHandler = require('./parser/FileHandler');
const NavigationHandler = require('./parser/NavigationHandler');

const parts = ['FP', 'FS', 'SS', 'TP', 'X1', 'X2', 'XP'];

const outputLocation = "../json";
const inputLocation = "./HTMLSource";
const fullFileName = "ALL.json";

/**
 * @type {Object<string, {questions: Object<number, object>, other: Object<string, object>}>}
 */
const full = {};

function write(queue, file, data) {
    queue.push(new Promise((resolve, reject) => {
        fs.writeFile(`${outputLocation}/${file}`, JSON.stringify(data, null, 4), err => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    }));
}

async function processLines(filePath, handler) {
    const stream = readline.createInterface({
        input: fs.createReadStream(filePath),
    });

    for await (const line of stream) {
        handler.processLine(line);
    }
}

/**
 * @param {string} filePath 
 * @param {string} part 
 * @param {NavigationHandler} nav 
 * @returns 
 */
async function parse(filePath, part, nav) {
    const file = new FileHandler();

    await processLines(filePath, file);

    if (file.context.hasQuestion) {
        const question = nav.getQuestion(file.context.question);

        if (question.section) {
            full[part].sections[question.section].questions[file.context.question] = {
                ...question,
                ...file.source,
            }
        } else {
            full[part].questions[file.context.question] = {
                ...question,
                ...file.source,
            }
        }

    } else {
        full[part].other[path.basename(filePath, '.html')] = file.source;
    }
}

(async () => {
    const parsingQueue = [];

    for (let part of parts) {
        const nav = new NavigationHandler(part);

        await processLines(`${inputLocation}/${part}.html`, nav);


        full[part] = {
            ...nav.source,
            other: {},
        };


        const dirName = `${inputLocation}/${part}/`,
            dir = fs.readdirSync(dirName);

        fs.mkdirSync(`${outputLocation}/${part}/`, { recursive: true });

        for (let fileName of dir) {
            parsingQueue.push(
                parse(
                    `${dirName}${fileName}`,
                    part,
                    nav
                )
            );
        }
    }

    await Promise.all(parsingQueue);

    const writingQueue = []

    for (let part of parts) {
        write(writingQueue, `${part}/${part}-${fullFileName}`, full[part]);

        for (let id in full[part].sections) {
            write(writingQueue, `${part}/${part}-Section-${id}.json`, full[part].sections[id]);

            for (let questionId in full[part].sections[id].questions) {
                write(writingQueue, `${part}/${part}-Question-${questionId}.json`, full[part].sections[id].questions[questionId]);
            }
        }

        for (let id in full[part].questions) {
            write(writingQueue, `${part}/${part}-Question-${id}.json`, full[part].questions[id]);
        }

        for (let fileName in full[part].other) {
            write(writingQueue, `${part}/${fileName}.json`, full[part].other[fileName]);
        }
    }

    write(writingQueue, fullFileName, full);

    await Promise.all(writingQueue);
})();