const { Client } = require('@notionhq/client');
const fs = require('fs');

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
    async create(properties, pageContent) {
        try {
            const RESPONSE = await this.#client.pages.create({
                parent: {
                    database_id: this.#database.id,
                },
                properties: convertProperties(this.#database.properties, properties),
            });
            RESPONSE.content = [];
            if (pageContent) {
                function parseMarkdownToBlocks(markdownText) {
                    try { markdownText = fs.readFileSync(pageContent, 'utf-8'); }
                    catch { markdownText = pageContent; }
                    let insideCodeBlock = false;
                    let codeBlockContent = [];
                    let codeBlockLanguage = 'plain_text';
                    const lines = markdownText.split('\n');
                    const blocks = [];
                
                    lines.forEach(line => {
                        if (line.startsWith('```')) {
                            if (insideCodeBlock) {
                                blocks.push({
                                    type: 'code',
                                    code: {
                                        rich_text: [{
                                            type: 'text',
                                            text: { content: codeBlockContent.join('\n') }
                                        }],
                                        language: codeBlockLanguage
                                    }
                                });
                                codeBlockContent = [];
                                insideCodeBlock = false;
                            } else {
                                insideCodeBlock = true;
                                codeBlockLanguage = line.slice(3).trim() || 'plain_text';
                            }
                        } else if (insideCodeBlock) {
                            codeBlockContent.push(line);
                        } else if (line.startsWith('# ')) {
                            blocks.push({
                                type: 'heading_1',
                                heading_1: { rich_text: markdownToRichText(line.replace('# ', '')) }
                            });
                        } else if (line.startsWith('## ')) {
                            blocks.push({
                                type: 'heading_2',
                                heading_2: { rich_text: markdownToRichText(line.replace('## ', '')) }
                            });
                        } else if (line.startsWith('### ')) {
                            blocks.push({
                                type: 'heading_3',
                                heading_3: { rich_text: markdownToRichText(line.replace('### ', '')) }
                            });
                        } else if (line.startsWith('- ')) {
                            blocks.push({
                                type: 'bulleted_list_item',
                                bulleted_list_item: { rich_text: markdownToRichText(line.replace('- ', '')) }
                            });
                        } else if (line.startsWith('1. ')) {
                            blocks.push({
                                type: 'numbered_list_item',
                                numbered_list_item: { rich_text: markdownToRichText(line.replace('1. ', '')) }
                            });
                        } else if (line.startsWith('> ')) {
                            blocks.push({
                                type: 'quote',
                                quote: { rich_text: markdownToRichText(line.replace('> ', '')) }
                            });
                        } else if (line.startsWith('---')) {
                            blocks.push({ type: 'divider' });
                        } else {
                            blocks.push({
                                type: 'paragraph',
                                paragraph: { rich_text: markdownToRichText(line) }
                            });
                        }
                    });
                    return blocks;
                }
                RESPONSE.content = parseMarkdownToBlocks("");
                await this.#client.blocks.children.append({
                    block_id: RESPONSE.id,
                    children: parseMarkdownToBlocks(""),
                });
            }
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
        this.content = page.content;
        this.cover = page.archived;
        this.created_by = page.created_by;
        this.created_time = page.created_time;
        this.icon = page.icon;
        this.id = page.id;
        this.in_trash = page.in_trash;
        this.last_edited_by = page.last_edited_by;
        this.last_edited_time = page.last_edited_time;
        this.object = page.object;
        this.parent = page.parent;
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
    async duplicate()  {
        try {
            const pageProperties = this.properties;
            const newPageProperties = {};
            for (const [key, value] of Object.entries(pageProperties)) {
                switch (value.type) {
                    case 'button':
                    case 'formula':
                    case 'created_by':
                    case 'created_time':
                    case 'last_edited_time':
                    case 'last_edited_by':
                    case 'unique_id':
                        break;
                    default: newPageProperties[key] = value; break;
                }
            }

            const newPage = await this.#client.pages.create({
                parent: this.parent,
                properties: newPageProperties
            });
            return newPage;
        } catch (error) {
            console.error("Error duplicating page:", error);
        }
    }
    async delete() {
        try {
            await this.#client.pages.delete({
                page_id: this.id,
            });
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    }
    async edit(markers, newContent) {
        try {
            const response = await this.#client.blocks.children.list({
                block_id: this.id,
            });
            console.log("Page content blocks:", response.results);
        } catch (error) {
            console.error("Error retrieving page content:", error);
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
                    "rich_text": markdownToRichText(properties[KEY])
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
                break;
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

function markdownToRichText(markdownText) {
    const richTextArray = [];
    const stylesStack = [];
    let currentText = '';
    let currentStyles = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
        color: 'default'
    };
    const patterns = [
        { marker: '**', style: 'bold' },
        { marker: '//', style: 'italic' },
        { marker: '__', style: 'underline' },
        { marker: '~~', style: 'strikethrough' },
        { marker: '`', style: 'code' }
    ];

    let i = 0;
    function applyCurrentText() {
        if (currentText) {
            richTextArray.push({
                type: 'text',
                text: { content: currentText },
                annotations: { ...currentStyles },
            });
            currentText = '';
        }
    }

    while (i < markdownText.length) {
        let matched = false;

        for (const { marker, style } of patterns) {
            if (markdownText.slice(i, i + marker.length) === marker) {
                applyCurrentText();

                if (stylesStack.length > 0 && stylesStack[stylesStack.length - 1] === style) {
                    // If the style is already active, we're closing it
                    stylesStack.pop();
                    currentStyles[style] = false;
                } else {
                    // Otherwise, we're opening a new style
                    stylesStack.push(style);
                    currentStyles[style] = true;
                }

                i += marker.length;
                matched = true;
                break;
            }
        }
        if (!matched && markdownText[i] === '[') {
            const closeBracket = markdownText.indexOf(']', i);
            const openParen = markdownText.indexOf('(', closeBracket);
            const closeParen = markdownText.indexOf(')', openParen);

            if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
                applyCurrentText();

                const linkText = markdownText.slice(i + 1, closeBracket);
                const url = markdownText.slice(openParen + 1, closeParen);

                richTextArray.push({
                    type: 'text',
                    text: {
                        content: linkText,
                        link: { url: url }
                    },
                    annotations: { ...currentStyles }
                });

                i = closeParen + 1;
                matched = true;
            }
        }
        if (!matched && markdownText[i] === '{') {
            const closeCurly = markdownText.indexOf('}', i);

            if (closeCurly !== -1) {
                applyCurrentText();
                const color = markdownText.slice(i + 1, closeCurly);
                if ((currentStyles.color !== 'default' && markdownText.slice(i, i + color.length + 2) == `{${color}}`) || color.includes('/')) {
                    stylesStack.pop();
                    currentStyles.color = 'default';
                    i += color.length + 2;
                } else {
                    stylesStack.push('color');
                    currentStyles.color = color;
                    i = closeCurly + 1;
                }
                matched = true;
            }
        }
        if (!matched) {
            currentText += markdownText[i];
            i++;
        }
    }
    applyCurrentText();
    return richTextArray;
}

module.exports = NotionClient;