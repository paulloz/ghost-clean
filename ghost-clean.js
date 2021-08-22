'use strict';

const readline = require('readline');

const Ghost = require('./lib/ghost');

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

const run = async function(args) {
    const ghost = new Ghost();

    let unused = [];

    for (const image of ghost.images) {
        const isUsedInAuthors = await ghost.authors.uses(image);
        const isUsedInPages = await ghost.pages.uses(image);
        const isUsedInPosts = await ghost.posts.uses(image);
        const isUsedInSettings = await ghost.settings.uses(image);
        const isUsedInTags = await ghost.tags.uses(image);
        if (!isUsedInAuthors && !isUsedInPages && !isUsedInPosts && !isUsedInSettings && !isUsedInTags) {
            unused.push(image);
        }
    }

    if (unused.length > 0) {
        const space = unused.reduce((n, img) => n + img.sizeMB, 0).toFixed(2);
        console.log(`${unused.length} file${unused.length > 1 ? 's' : ''} (${space}MB) can be safely removed. ` +
                    `Please make a quick backup before proceeding.`);
        if (await confirm('Go ahead? [y/N] ')) {
            let removed = 0;
            let sizeSaved = 0;
            for (const image of unused) {
                if (args.verbose) {
                    console.log(`Removing: ${image.path}`);
                }
                if (!!!args.dry_run) {
                    if (image.delete()) {
                        ++removed;
                        sizeSaved += image.sizeMB;
                    }
                }
            }
            console.log(`Done. ${removed > 0 ? removed : 'No'} file${removed > 1 ? 's' : ''} ` +
                        `(${sizeSaved.toFixed(2)}MB) ${removed === 1 ? 'was' : 'were'} removed.`);
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
