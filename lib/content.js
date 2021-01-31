'use strict';

class Content {
    constructor(api, fields) {
        this._api = api;
        this._fields = fields;
        this._fetch = false;
    }

    browse() {
        return this._api.browse();
    }

    async fetch() {
        this._content = await this.browse();
        this._fetch = true;
    }

    async uses(image) {
        if (!this._fetch) { await this.fetch(); }
        for (const field of this._fields) {
            if (this._content[field] && this._content[field].includes(image.fileName)) {
                return true;
            }
        }
        return false;
    }
}

class PaginatedContent extends Content {
    browse(page = 1) {
        return this._api.browse({limit: 100, page: page});
    }

    async fetch() {
        this._content = [];
        for (let i = 1; ; ++i) {
            const response = await this.browse(i);
            this._content = this._content.concat(response);
            if (response.meta.pagination.pages <= i) {
                break;
            }
        }
        this._fetch = true;
    }

    async uses(image) {
        if (!this._fetch) { await this.fetch(); }
        for (const entry of this._content) {
            for (const field of this._fields) {
                if (entry[field] && entry[field].includes(image.fileName)) {
                    return true;
                }
            }
        }
        return false;
    }
}

class HTMLPaginatedContent extends PaginatedContent {
    browse(page = 1) {
        return this._api.browse({limit: 100, page: page, formats: 'html'});
    }
}

class Authors extends PaginatedContent {
    constructor(api) {
        super(api.authors, ['profile_image', 'cover_image'])
    }
}

class Pages extends HTMLPaginatedContent {
    constructor(api) {
        super(api.pages, ['html', 'feature_image', 'og_image', 'twitter_image']);
    }
}

class Posts extends HTMLPaginatedContent {
    constructor(api) {
        super(api.posts, ['html', 'feature_image', 'og_image', 'twitter_image']);
    }
}

class Settings extends Content {
    constructor(api) {
        super(api.settings, ['logo', 'icon', 'cover_image', 'og_image', 'twitter_image']);
    }
}

class Tags extends PaginatedContent {
    constructor(api) {
        super(api.tags, ['feature_image'])
    }
}

module.exports = { Authors, Pages, Posts, Settings, Tags }
