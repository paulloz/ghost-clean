'use strict';

const fs = require('fs');
const path = require('path');

const GhostAdminAPI = require('@tryghost/admin-api');
const GhostContentAPI = require('@tryghost/content-api');

const Image = require('./image');
const { Authors, Posts, Settings } = require('./content');

class Ghost {
    constructor() {
        this._imagesPath = path.resolve(process.cwd(), 'content', 'images')
        const configFilePath = path.resolve(process.cwd(), 'config.production.json');
        if (fs.existsSync(configFilePath)) {
            const config = require(configFilePath);
            this._url = config.url;
            if (config.path && config.path.contentPath) {
                this._imagesPath = path.resolve(config.path.contentPath, 'images');
            }
        } else {
            console.error(`Error: no such file or directory, ${configFilePath}.`);
            console.error(`Error: this is not a Ghost installation directory.`);
            process.exit(1);
        }
    }

    get admin() {
        if (!this._adminAPI) {
            this._adminAPI = new GhostAdminAPI({
                url: this._url, version: 'v3',
                key: process.env.GHOST_ADMIN_KEY
            });
        }
        return this._adminAPI;
    }

    get content() {
        if (!this._contentAPI) {
            this._contentAPI = new GhostContentAPI({
                url: this._url, version: 'v3',
                key: process.env.GHOST_CONTENT_KEY
            });
        }
        return this._contentAPI;
    }

    get images() {
        const list = (directory) => {
            let images = [];
            fs.readdirSync(directory).map(entry => {
                const fullPath = path.resolve(directory, entry);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    images = images.concat(list(fullPath));
                } else {
                    images.push(new Image(fullPath, stat.size));
                }
            });
            return images;
        };
        return list(this._imagesPath);
    }

    get authors() {
        if (!this._authors) {
            this._authors = new Authors(this.content);
        }
        return this._authors;
    }

    get posts() {
        if (!this._posts) {
            this._posts = new Posts(this.admin);
        }
        return this._posts;
    }

    get settings() {
        if (!this._settings) {
            this._settings = new Settings(this.content);
        }
        return this._settings;
    }
}

module.exports = Ghost;
