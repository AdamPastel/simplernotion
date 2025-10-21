"use strict";
import Utils from '../utils.js';
import ContentManager from './ContentManager.js';

export default class Page {
    /**
     * @private
     */
    _client;
    /**
     * @private
     */
    _auth;
    constructor (client, auth, page, data_source) {
        this._client = client;
        this._auth = auth;
        this.icon = null;
        this.cover = null;
        this.properties = {};
        if (page) {
            this.archived = page.archived;
            this.content = new ContentManager(client, this._auth, page);
            this.cover = page.cover;
            this.created_by = page.created_by;
            this.created_time = page.created_time;
            this.icon = page.icon;
            this.id = page.id;
            this.in_trash = page.in_trash;
            this.last_edited_by = page.last_edited_by;
            this.last_edited_time = page.last_edited_time;
            this.object = page.object;
            this.parent = {
                'data_source': data_source
            }
            this.properties = page.properties;
            this.public_url = page.public_url;
            this.url = page.url;
        }
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
            await this._client.pages.update({
                page_id: this.id,
                parent: {
                    database_id: databaseId
                },
            });

            const RESPONSE = await this._client.pages.update({
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
            const RESPONSE = await this._client.pages.update({
                page_id: this.id,
                properties: Utils.convertProperties(this.properties, properties),
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

            const newPage = await this._client.pages.create({
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
            await this._client.pages.delete({
                page_id: this.id,
            });
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    }
    async getBlocks() {
        const RESPONSE = await fetch(`https://api.notion.com/v1/blocks/${this.id}/children?page_size=100`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this._auth}`,
                    "Notion-Version": "2025-09-03",
                    "Content-Type": "application/json",
                }
            }
        );
        const RESULT = await RESPONSE.json();
        await RESULT.results.forEach(async (block) => {
            if (block?.type === 'column_list') {
                const RESPONSE = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${this._auth}`,
                            "Notion-Version": "2025-09-03",
                            "Content-Type": "application/json",
                        }
                    }
                );
                const RESULT = await RESPONSE.json();
                block.column_list = RESULT;
            }
        })
        
    }
    async edit(markers, newContent) {
        try {
            const response = await this._client.blocks.children.list({
                block_id: this.id,
            });
            console.log("Page content blocks:", response.results);
        } catch (error) {
            console.error("Error retrieving page content:", error);
        }
    }
}