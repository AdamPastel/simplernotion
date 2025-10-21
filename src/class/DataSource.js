"use strict";
import PageManager from './PageManager.js';

/**
 * Represents a Notion Database source and provides access to its pages.
 * This class encapsulates the database metadata and initializes a PageManager
 * to interact with child pages.
 */
export default class DataSource {
    constructor(client, auth, datasource, parent) {
        this.object = datasource.object;
        this.id = datasource.id;
        this.cover = datasource.cover;
        this.icon = datasource.icon;
        this.created_time = datasource.created_time;
        this.created_by = datasource.created_by;
        this.last_edited_by = datasource.last_edited_by;
        this.last_edited_time = datasource.last_edited_time;
        this.title = datasource.title;
        this.description = datasource.description;
        this.is_inline = datasource.is_inline;
        this.properties = datasource.properties;
        this.parent = parent;
        this.url = datasource.url;
        this.public_url = datasource.public_url;
        this.archived = datasource.archived;
        this.in_trash = datasource.in_trash;
        this.pages = new PageManager(client, auth, this);
    }
}