const { Client } = require('@notionhq/client');
const fs = require('fs');

class NotionClient {
    constructor(auth) {
        this.client = new Client({
            auth: auth
        });
    }

    async query(type, id) {
        if (type === 'database') {
            const database = await this.client.databases.retrieve({ database_id: id }).catch(err => {
                throw new Error("Invalid database Id or the database doesn't exist")
            });
            const pages = await this.#fetchAllPages(id);
            return new Database(this.client, database, pages);
        }
    }
    async #fetchAllPages(databaseId) {
        let hasMore = true;
        let cursor = undefined;
        const pages = new Map();

        while (hasMore) {
            const response = await this.client.databases.query({
                database_id: databaseId,
                start_cursor: cursor
            });
            response.results.forEach(page => {
                const PAGE = new Page(this.client, page);
                pages.set(PAGE.id, PAGE);
            });
            hasMore = response.has_more;
            cursor = response.next_cursor;
        }
        return pages;
    }
}

class Database {
    constructor(client, database, pages) {
        this.object = database.object;
        this.id = database.id;
        this.cover = database.cover;
        this.icon = database.icon;
        this.created_time = database.created_time;
        this.created_by = database.created_by;
        this.last_edited_by = database.last_edited_by;
        this.last_edited_time = database.last_edited_time;
        this.title = database.title;
        this.description = database.description;
        this.is_inline = database.is_inline;
        this.properties = database.properties;
        this.parent = database.parent;
        this.url = database.url;
        this.public_url = database.public_url;
        this.archived = database.archived;
        this.in_trash = database.in_trash;
        this.pages = new PageManager(pages);
    }
}
/*
class Cache {
     constructor(client, database) {
        this.cache = new Map();
        this.size = 0;
        this._loadPages(client, database); // Load pages when Pages instance is created
    }

    // Method to load all pages from the database and store them in cache
    async _loadPages(client, database) {
        let hasMore = true;
        let cursor = undefined;

        while (hasMore) {
            const response = await client.databases.query({
                database_id: database.id,
                start_cursor: cursor
            });
            response.results.forEach(page => {
                const PAGE = new Pages(client, database, page);
                this.cache = this.cache.set(PAGE.id, PAGE);
            })

            hasMore = response.has_more;
            cursor = response.next_cursor;
        }
        this.size = this.cache.size;
    }

    async create(properties, children = []) {
        try {
            const response = await this.client.pages.create({
                parent: { database_id: this.database.id },
                properties: properties,
                children: children
            });
            console.log('Page created:', response);
            return response;
        } catch (error) {
            console.error('Error creating page:', error);
        }
    }
    async get(pageId) {

    }
}*/
/*class Cache {
    #client;
    #databaseId;
    #pages;
    #cacheLoaded;
    #loadingPromise;
    constructor(client, databaseId) {
        this.#client = client;
        this.#databaseId = databaseId;
        this.#pages = new Map();
        this.#cacheLoaded = false;
        this.#loadingPromise = null;
    }

    get cache() {
        if (!this.#cacheLoaded) {
            if (!this.#loadingPromise) {
                this.#loadingPromise = this.#loadPages();
            }
            return this.#loadingPromise;
        } else {
            return this.#pages;
        }
    }

    async #loadPages() {
        let hasMore = true;
        let cursor = undefined;

        while (hasMore) {
            const response = await this.#client.databases.query({
                database_id: this.#databaseId,
                start_cursor: cursor
            });
            response.results.forEach(page => {
                const PAGE = new Page(this.#client, page);
                this.#pages.set(PAGE.id, PAGE);
            });
            hasMore = response.has_more;
            cursor = response.next_cursor;
        }
        this.#cacheLoaded = true;
        return this.cache;
    }
}*/

class PageManager {
    constructor(pages) {
        this.cache = new Collection(pages);
    }
}
class Collection {
    constructor(map) {
        this[''] = map;
        this.size = map.size;
    }

    // Method to add a new item to the collection
    set(key, value) {
        this[''].set(key, value);
    }

    // Method to retrieve an item by key
    get(key) {
        return this[''].get(key);
    }

    // Method to check if a key exists in the collection
    has(key) {
        return this[''].has(key);
    }

    // Method to remove an item by key
    delete(key) {
        return this[''].delete(key);
    }

    // Method to retrieve all keys in the collection
    keys() {
        return Array.from(this[''].keys());
    }

    // Method to retrieve all values in the collection
    values() {
        return Array.from(this[''].values());
    }

    // Method to filter items based on a callback
    filter(callback) {
        const results = [];
        for (const [key, value] of this[''].entries()) {
            if (callback(value, key)) {
                results.push([key, value]); // Store key-value pairs that match the condition
            }
        }
        return results; // Return array of matching key-value pairs
    }

    // Method to find a single item based on a callback
    find(callback) {
        for (const [key, value] of this[''].entries()) {
            if (callback(value, key)) {
                return value; // Return the first matching value
            }
        }
        return undefined; // Return undefined if no match found
    }

    // Method to get all entries as an array
    entries() {
        return Array.from(this[''].entries());
    }

    // Method to get the size of the collection
    size() {
        return this[''].size;
    }

    // Method to clear all items from the collection
    clear() {
        this[''].clear();
    }
}

class Page {
    constructor (client, page) {
        this.archived = page.archived;
        this.cover = page.archived;
        this.created_by = page.created_by;
        this.created_time = page.created_time;
        this.icon = page.icon;
        this.id = page.id;
        this.in_trash = page.in_trash;
        this.last_edited_by = page.last_edited_by;
        this.last_edited_time = page.last_edited_time;
        this.object = page.object;
        this.properties = page.properties;
        this.public_url = page.public_url;
        this.url = page.url;
    }
}

module.exports = NotionClient;