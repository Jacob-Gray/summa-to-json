const fs = require('fs');
const readline = require('readline');
const Question = require('./src/Question');

const parts = ['FP', 'FS', 'SS', 'TP', 'X1', 'X2', 'XP'];

const outputLocation = "./JSONOutput";
const inputLocation = "./HTMLSource";
const fullFileName = "ALL.json";

const full = {};

function write(file, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${outputLocation}/${file}`, JSON.stringify(data, null, 4), err => {
            if (err) {
                reject(err);
            }

            resolve();
        });
    });
}


function parse(filePath, fileName, part) {
    return new Promise((resolve, reject) => {
        const stream = readline.createInterface({
            input: fs.createReadStream(filePath),
        });
        const question = new Question();

        stream.on('line', line => {
            question.processLine(line);
        });

        stream.on('close', () => {
            full[part][fileName] = question.source;
            resolve();
        });
    });
}

(async () => {
    const queue = [];

    for (let part of parts) {
        full[part] = {};

        const dirName = `${inputLocation}/${part}/`,
            dir = fs.readdirSync(dirName);

        fs.mkdirSync(`${outputLocation}/${part}/`, { recursive: true });

        for (let fileName of dir) {
            queue.push(
                parse(
                    `${dirName}${fileName}`,
                    fileName.replace('.html', ''),
                    part,
                )
            );
        }

    }

    await Promise.all(queue);

    for (let part of parts) {
        await write(`${part}/${part}-${fullFileName}`, full[part]);

        for (let fileName in full[part]) {
            await write(`${part}/${fileName}.json`, full[part][fileName]);
        }
    }

    await write(fullFileName, full);
})();