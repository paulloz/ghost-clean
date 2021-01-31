'use strict';

const readline = require('readline');

const Ghost = require('./src/ghost');

const confirm = async function(message) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    return await new Promise((resolve, reject) => {
        const listener = function(str, key) {
            process.stdin.removeListener('keypress', listener);
            process.stdin.setRawMode(false);
            process.stdout.write('\n');
            resolve(str.toLowerCase() == 'y');
        };
        process.stdin.on('keypress', listener);
        process.stdout.write(message);
    });
};

const run = async function() {
    const ghost = new Ghost();

    let unused = [];

    for (const image of ghost.images) {
        const isUsedInPost = await ghost.posts.uses(image);
        const isUsedInAuthors = await ghost.authors.uses(image);
        const isUsedInSettings = await ghost.settings.uses(image);
        // TODO: pages and tags
        if (!isUsedInPost && !isUsedInAuthors && !isUsedInSettings) {
            unused.push(image);
        }
    }

    if (unused.length > 0) {
        const space = unused.reduce((n, img) => n + img.sizeMB, 0).toFixed(2);
        console.log(`${unused.length} file${unused.length > 1 ? 's' : ''} (${space}MB) can be safely removed. Please make a quick backup before proceeding.`);
        if (await confirm('Go ahead? [y/N] ')) {
            for (const image of unused) {
                image.delete();
            }
            console.log(`Done. ${unused.length} file${unused.length > 1 ? 's' : ''} (${space}MB) were removed. `)
        } else {
            console.log('Abort.');
        }
    } else {
        console.log('Nothing to clean.');
    }

    console.log('Shutting down...');
    process.exit();
};

module.exports = { run };
