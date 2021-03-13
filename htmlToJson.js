const fs = require('fs');
const path = require('path');
const readline = require('readline');
const FileHandler = require('./parser/FileHandler');

const parts = ['FP', 'FS', 'SS', 'TP', 'X1', 'X2', 'XP'];

const outputLocation = "./JSONOutput";
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

/**
 * @param {string} filePath 
 * @param {string} part 
 * @returns 
 */
function parse(filePath, part) {
    return new Promise((resolve, reject) => {
        const stream = readline.createInterface({
            input: fs.createReadStream(filePath),
        });
        const file = new FileHandler();

        stream.on('line', line => {
            file.processLine(line);
        });

        stream.on('close', () => {
            if (file.context.hasQuestion) {
                full[part].questions[file.context.question] = file.source;
            } else {
                full[part].other[path.basename(filePath, '.html')] = file.source;
            }

            resolve();
        });
    });
}

(async () => {
    const parsingQueue = [];

    for (let part of parts) {
        full[part] = {
            questions: {},
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
                )
            );
        }
    }

    await Promise.all(parsingQueue);

    const writingQueue = []

    for (let part of parts) {
        write(writingQueue, `${part}/${part}-${fullFileName}`, full[part]);

        for (let id in full[part].questions) {
            write(writingQueue, `${part}/${part}-${id}.json`, full[part].questions[id]);
        }

        for (let fileName in full[part].other) {
            write(writingQueue, `${part}/${fileName}.json`, full[part].other[fileName]);
        }
    }

    write(writingQueue, fullFileName, full);

    await Promise.all(writingQueue);
})();