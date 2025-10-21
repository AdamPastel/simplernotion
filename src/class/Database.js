"use strict";
import DataSourceManager from './DataSourceManager.js';

export default class Database {
    constructor(client, auth, database, data_sources) {
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
        this.parent = database.parent;
        this.url = database.url;
        this.public_url = database.public_url;
        this.archived = database.archived;
        this.in_trash = database.in_trash;
        this.data_sources = new DataSourceManager(client, auth, data_sources, database);
    }
}