"use strict";
import Utils from '../utils.js';
import fs from 'fs';
import Collection from './Collection.js';
import Page from './Page.js';

export default class PageManager {
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
    _data_source;
    /**
     * @private
     */
    _loading;
    constructor(client, auth, data_source) {
        this._client = client;
        this._auth = auth;
        this._data_source = data_source;
        /**
         * @type {Collection<string, Page>}
         */
        this.cache = new Collection();

        this._loading = false;
        this.#init();
    }

    /**
     * @async
     */
    async #init() {
        if (this._loading) return;
        this._loading = true;

        for await (const raw of this.#fetchAllPages()) {
            const page = new Page(this._client, this._auth, raw, this._data_source);
            this.cache.set(page.id, page);

            if (this.cache.size % 100 === 0) {
                await new Promise(r => setImmediate(r));
            }
        }

        this._loading = false;
    }
    
    /**
     * @async
     */
    async *#fetchAllPages() {
        let hasMore = true;
        let cursor = undefined;

        while (hasMore) {
            console.log(this._data_source)
            const res = await fetch(`https://api.notion.com/v1/data_sources/${this._data_source.id}/query`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this._auth}`,
                        "Notion-Version": "2025-09-03",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        start_cursor: cursor,
                        page_size: 25,
                    })
                }
            );
            const data = await res.json();

            for (const page of data.results) {
                yield page;
            }

            hasMore = data.has_more;
            cursor = data.next_cursor;
        }
    }

    /**
     * Fetch a page from the Notion API by its ID.
     * Automatically normalizes the ID and wraps the result into a {@link Page}.
     *
     * @async
     * @param {string} id - The raw or formatted ID of the page.
     * @returns {Promise<Page|null>}
     * A Page instance if found, otherwise `null`.
     */
    async fetch(id) {
        id = Utils.fixID(id);
        if (this.cache.has(id)) return this.cache.get(id);

        const RESPONSE = await fetch(`https://api.notion.com/v1/pages/${id}`,
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
        if (!RESULT) return null;

        const page = new Page(this._client, this._auth, RESULT, this._data_source);
        this.cache.set(page.id, page);
        return page;
    }

    async create({ pages }) {
        for (const page of pages) {
            const payload = typeof page._toNotion === "function" ? page._toNotion(this._data_source) : page;
            await this._client.pages.create(payload);
        }
        

        /*try {
            const RESPONSE = await this._client.pages.create({
                parent: {
                    data_source_id: this._data_source.id,
                },
                properties: Utils.convertProperties(this._data_source.properties, properties),
            });
            RESPONSE.content = [];
            if (pageContent) {
                //#region 
                /*function parseMarkdownToBlocks(markdownText) {
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
                                heading_1: { rich_text: Utils.markdownToRichText(line.replace('# ', '')) }
                            });
                        } else if (line.startsWith('## ')) {
                            blocks.push({
                                type: 'heading_2',
                                heading_2: { rich_text: Utils.markdownToRichText(line.replace('## ', '')) }
                            });
                        } else if (line.startsWith('### ')) {
                            blocks.push({
                                type: 'heading_3',
                                heading_3: { rich_text: Utils.markdownToRichText(line.replace('### ', '')) }
                            });
                        } else if (line.startsWith('- ')) {
                            blocks.push({
                                type: 'bulleted_list_item',
                                bulleted_list_item: { rich_text: Utils.markdownToRichText(line.replace('- ', '')) }
                            });
                        } else if (line.startsWith('1. ')) {
                            blocks.push({
                                type: 'numbered_list_item',
                                numbered_list_item: { rich_text: Utils.markdownToRichText(line.replace('1. ', '')) }
                            });
                        } else if (line.startsWith('> ')) {
                            blocks.push({
                                type: 'quote',
                                quote: { rich_text: Utils.markdownToRichText(line.replace('> ', '')) }
                            });
                        } else if (line.startsWith('---')) {
                            blocks.push({ type: 'divider' });
                        } else {
                            blocks.push({
                                type: 'paragraph',
                                paragraph: { rich_text: Utils.markdownToRichText(line) }
                            });
                        }
                    });
                    return blocks;
                }
               //#endregion
                RESPONSE.content = this.parseMarkdownToBlocks(pageContent);
                console.log(RESPONSE.content)
                await this._client.blocks.children.append({
                    block_id: RESPONSE.id,
                    children: this.parseMarkdownToBlocks(pageContent),
                });
            }
            return new Page(this._client, RESPONSE);
        } catch (error) {
            console.error('Error creating page:', error);
        }*/
    }

    /**
     * @private
     */
    _parseMarkdownToBlocks(markdownText) {
        // try { markdownText = fs.readFileSync(pageContent, 'utf-8'); }
        // catch { markdownText = pageContent; }
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
                    heading_1: { rich_text: Utils.markdownToRichText(line.replace('# ', '')) }
                });
            } else if (line.startsWith('## ')) {
                blocks.push({
                    type: 'heading_2',
                    heading_2: { rich_text: Utils.markdownToRichText(line.replace('## ', '')) }
                });
            } else if (line.startsWith('### ')) {
                blocks.push({
                    type: 'heading_3',
                    heading_3: { rich_text: Utils.markdownToRichText(line.replace('### ', '')) }
                });
            } else if (line.startsWith('- ')) {
                blocks.push({
                    type: 'bulleted_list_item',
                    bulleted_list_item: { rich_text: Utils.markdownToRichText(line.replace('- ', '')) }
                });
            } else if (line.startsWith('1. ')) {
                blocks.push({
                    type: 'numbered_list_item',
                    numbered_list_item: { rich_text: Utils.markdownToRichText(line.replace('1. ', '')) }
                });
            } else if (line.startsWith('> ')) {
                blocks.push({
                    type: 'quote',
                    quote: { rich_text: Utils.markdownToRichText(line.replace('> ', '')) }
                });
            } else if (line.startsWith('---')) {
                blocks.push({ type: 'divider' });
            } else {
                blocks.push({
                    type: 'paragraph',
                    paragraph: { rich_text: Utils.markdownToRichText(line) }
                });
            }
        });
        return blocks;
    }
}