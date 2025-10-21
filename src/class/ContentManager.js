"use strict";
import Collection from './Collection.js';

export default class ContentManager {
    /**
     * @private
     */
    _client;
    /**
     * @private
     */
    _auth;
    /**
     * @private
     */
    _page;
    /**
     * @private
     */
    _loading;
    constructor(client, auth, page) {
        this._client = client;
        this._auth = auth;
        this._page = page;
        this.cache = new Collection();

        this._loading = false;
        this.#init();
    }

    async #init() {
        if (this._loading) return;
        this._loading = true;

        for await (const raw of this.#fetchContent(this._page.id)) {
            if (raw.has_children) {
                raw.children = [];
                for await (const raw_child of this.#fetchContent(raw.id)) {
                    if (raw_child.has_children && raw_child.type == "column") {
                        raw_child.children = [];
                        for await (const column_content of this.#fetchContent(raw_child.id)) {
                            raw_child.children.push(column_content)
                        }
                    }
                    raw.children.push(raw_child)
                }
            }
            this.cache.set(raw.id, raw);

            if (this.cache.size % 100 === 0) {
                await new Promise(r => setImmediate(r));
            }
        }
        this._loading = false;
    }
    
    async *#fetchContent(parent) {
        let hasMore = true;
        let cursor = undefined;

        while (hasMore) {
            const RESPONSE = await fetch(`https://api.notion.com/v1/blocks/${parent}/children?page_size=100`,
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

            for (const blocks of RESULT.results) {
                yield blocks;
            }

            hasMore = RESULT.has_more;
            cursor = RESULT.next_cursor;
        }
    }
}