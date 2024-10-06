import { Client } from '@notionhq/client';

class NotionClient {
    constructor(auth) {
        this.client = new Client({
            auth: auth
        });
        this.users = new UserManager(this.client);
    }

    async query(type, id) {
        if (type === 'database') {
            const DATABASE = await this.client.databases.retrieve({ database_id: id }).catch(err => {
                throw new Error("Invalid database Id or the database doesn't exist");
            });
            const PAGES = await this.#fetchAllPages(id);
            return new Database(this.client, DATABASE, PAGES);
        }
    }
    async #fetchAllPages(databaseId) {
        let hasMore = true;
        let cursor = undefined;
        const PAGES = new Map();

        while (hasMore) {
            const RESPONSE = await this.client.databases.query({
                database_id: databaseId,
                start_cursor: cursor
            });
            RESPONSE.results.forEach(page => {
                const PAGE = new Page(this.client, page);
                PAGES.set(PAGE.id, PAGE);
            });
            hasMore = RESPONSE.has_more;
            cursor = RESPONSE.next_cursor;
        }
        return PAGES;
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
        this.pages = new PageManager(client, database, pages);
    }
}

class PageManager {
    #client;
    #database;
    constructor(client, database, pages) {
        this.#client = client;
        this.#database = database;
        this.cache = new Collection(pages);
    }
    async create(properties) {
        try {
            const RESPONSE = await this.#client.pages.create({
                parent: {
                    database_id: this.#database.id,
                },
                properties: convertProperties(this.#database.properties, properties),
            });
            return new Page(this.#client, RESPONSE);
        } catch (error) {
            console.error('Error creating page:', error);
        }
    }
}

class Page {
    #client;
    constructor (client, page) {
        this.#client = client;
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
    /*async move(databaseId, properties) {
        !properties ? console.error("Missing properties, they will be empty in your new database") : null;
        // try {
            let keyTitle = null;
            for (const key in properties) {
                if (properties[key].id === "title") {
                    keyTitle = key;
                    break;
                }
            }
            await this.#client.pages.update({
                page_id: this.id,
                parent: {
                    database_id: databaseId
                },
            });

            const RESPONSE = await this.#client.pages.update({
                page_id: this.id,
                properties: {}
            });
            console.log(`Page ${this.id} moved to database ${databaseId}`);
            // return RESPONSE;
        // } catch (error) {
            // console.error('Error moving the page:', error);
        // }
    }*/
    async update(properties) {
        try {
            const RESPONSE = await this.#client.pages.update({
                page_id: this.id,
                properties: convertProperties(this.properties, properties),
            });
            this.properties = RESPONSE.properties;
        } catch (error) {
            console.error('Error updating page:', error);
        }
    }
}

class UserManager {
    #client;
    constructor(client) {
        this.#client = client;
    }
    async list() {
        let hasMore = true;
        let cursor = undefined;
        const USERS = new Map();

        while (hasMore) {
            const RESPONSE = await this.#client.users.list({
                start_cursor: cursor
            });
            RESPONSE.results.forEach(user => {
                const USER = new User(user);
                USERS.set(USER.id, USER);
            });
            hasMore = RESPONSE.has_more;
            cursor = RESPONSE.next_cursor;
        }
        return new Collection(USERS);
    }
}

class User {
    constructor (user) {
        this.id = user.id;
        this.type = user.type;
        this.avatar_url = user.avatar_url;
        this.name = user.name;
        this.person = user.person;
    }
}

class Collection extends Map {
    constructor(map) {
        super(map);
    }
    filter(callback) {
        const RESULTS = [];
        for (const [KEY, VALUE] of this.entries()) {
            if (callback(VALUE, KEY)) {
                RESULTS.push([KEY, VALUE]);
            }
        }
        return RESULTS;
    }
}

function convertProperties(databaseProperties, properties) {
    let notionProperties = {};

    for (const KEY in properties) {
        switch (databaseProperties[KEY].type) {
            case "title":
                notionProperties[KEY] = {
                    "title": [
                        {
                            "type": "text",
                            "text": {
                                "content": properties[KEY]
                            }
                        }
                    ]
                };
                break;
            case "rich_text":
                notionProperties[KEY] = {
                    "rich_text": properties[KEY].map(textItem => ({
                        "type": "text",
                        "text": {
                            "content": textItem
                        }
                    }))
                };
                break;
            case "number":
                if (typeof(properties[KEY]) !== 'number') {
                    console.error(KEY + ': Specified value is of type ' + typeof(properties[KEY]) + ', not number');
                    break;
                } else {
                    notionProperties[KEY] = {
                        "number": properties[KEY]
                    };
                    break;
                }
            case "select":
                notionProperties[KEY] = {
                    "select": {
                        "name": properties[KEY][0]
                    }
                };
                break;
            case "multi_select":
                const t = properties[KEY].map(item => ({
                    "name": item
                }))
                notionProperties[KEY] = {
                    "multi_select": properties[KEY].map(item => ({
                        "name": item
                    }))
                };
                break;
            case "status":
                notionProperties[KEY] = {
                    "status": {
                        "name": properties[KEY][0]
                    }
                };
                break;
            case "date":
                notionProperties[KEY] = {
                    "date": {
                        "start": properties[KEY].start,
                        "end": properties[KEY].end || null,
                        "time_zone": properties[KEY].time_zone || null
                    }
                };
                break;
            case "people":
                properties[KEY].filter(person => person.type == "bot").length > 0 ? console.error(KEY + ': Bot user cannot be added to people properties') : undefined;
                notionProperties[KEY] = {
                    "people": properties[KEY].filter(person => person.type !== "bot").map(person => ({
                        "object": "user",
                        "id": person.id
                    }))
                };
                break;
            case "files":
                notionProperties[KEY] = {
                    "files": properties[KEY].map(file => ({
                        "name": file.name,
                        "type": "external",
                        "external": {
                            "url": file.url
                        }
                    }))
                };
                break;
            case "checkbox":
                notionProperties[KEY] = {
                    "checkbox": properties[KEY]
                };
                break;
            case "url":
                notionProperties[KEY] = {
                    "url": properties[KEY]
                };
                break;
            case "email":
                notionProperties[KEY] = {
                    "email": properties[KEY]
                };
                break;
            case "phone_number":
                notionProperties[KEY] = {
                    "phone_number": properties[KEY]
                };
                break;
            default:
                throw new Error(`Unknown property type: ${databaseProperties[KEY].type}`);
        }
    }
    return notionProperties;
}

export default NotionClient;