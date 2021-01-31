'use strict';

const fs = require('fs');

class Image {
    constructor(path, size) {
        this.path = path;
        this.fileName = path.substring(path.lastIndexOf('/') + 1);
        this.size = size;
    }

    delete() {
        try {
            fs.unlinkSync(this.path);
        } catch (e) {
            console.error(e.message ? e.message : e);
            return false;
        }
        return true;
    }

    get sizeMB() {
        return this.size / (1024 * 1024);
    }
}

module.exports = Image;
