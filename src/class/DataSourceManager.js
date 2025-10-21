"use strict";
import Collection from './Collection.js';
import DataSource from './DataSource.js';
import Utils from '../utils.js';

export default class DataSourceManager {
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
    _database;
    /**
     * @type {Collection<string, DataSource>}
     */
    cache;

    constructor(client, auth, data_sources, database) {
        this._client = client;
        this._auth = auth;
        this._database = database;
        this.cache = new Collection(data_sources);
    }

    /**
     * Fetch a data source from the Notion API by its ID.
     * Automatically normalizes the ID and wraps the result into a {@link DataSource}.
     *
     * @async
     * @param {string} id - The raw or formatted ID of the data source.
     * @returns {Promise<DataSource>}
     * A DataSource instance if found, otherwise `null`.
     */
    async fetch(id) {
        id = Utils.fixID(id);
        const existing = this.cache.get(id);
        if (existing) return existing;

        const RESPONSE = await fetch(`https://api.notion.com/v1/data_sources/${id}`,
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
        if (RESULT.object === "error") return null;
        
        return this._add(RESULT, this._database);
    }

    _add(data, parent) {
        const ID = data.id;
        let existing = this.cache.get(ID);

        if (existing) {
            Object.assign(existing, data);
            return existing;
        }

        const DATASOURCE = new DataSource(this._client, this._auth, data, parent);
        this.cache.set(ID, DATASOURCE);

        if (parent) {
            if (!parent.data_sources.cache.has(ID)) {
                parent.data_sources.cache.set(ID, DATASOURCE);
            }
            DATASOURCE.parent = parent;
        } else if (data.parent && data.parent.database_id) {
            const dbId = Utils.fixID(data.parent.database_id);
            const db = this._client.databases.cache.get(dbId);
            if (db) {
                DATASOURCE.parent = db;
                db.data_sources.cache.set(ID, DATASOURCE);
            }
        }

        return DATASOURCE;
    }
}