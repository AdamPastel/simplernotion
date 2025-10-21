import base from '@notionhq/client';
import Collection from '../Collection.js';
import UserManager from '../UserManager.js';
import Database from '../Database.js';
import DataSource from '../DataSource.js';
import Utils from '../../utils.js';

export default class Client {
    /**
     * @private
     */
    _client;
    /**
     * @private
     */
    _auth;
    /**
     * Creates a new Notion instance bound to a specific authentication token.
     * 
     * This constructor initializes a low-level Notion client and sets up
     * user and workspace management utilities.  
     * 
     * The instance acts as a central controller for all Notion API operations,
     * providing an authenticated gateway to interact with pages, databases,
     * users, and other Notion resources.
     * 
     * @constructor
     * @param {string} auth - The Notion integration token used for authentication.
     * @property {Object} workspace - Represents workspace-related data and utilities.
     * @property {UserManager} users - Manager responsible for handling user-related actions and queries.
     * 
     * @example
     * const notion = new Notion("secret_api_token");
     * const userList = await notion.users.list(); 
     */
    constructor(auth) {
        /**
         * @private
         */
        this._client = new base.Client({
            auth: auth
        });
        /**
         * @private
         */
        this._auth = auth;
        this.workspace = {};
        this.users = new UserManager(this._client, this._auth);
    }
    
    /**
     * Query a database or data_source.
     * 
     * @template {"database" | "data_source"} Type
     * @param {Type} type - The type of object to query.
     * @param {string} id - The ID of the object to query.
     * @returns {Promise<Type extends "database" ? Database : DataSource>}
     * 
     * Object containing managers to interact with the result.
     */
    async query(type, id) {
        id = Utils.fixID(id);
        if (type === 'database') {
            const DATABASE = await this._client.databases.retrieve({ database_id: id }).catch(err => {
                throw new Error("Invalid database Id or the database doesn't exist");
            });

            /** @type {Collection<string, DataSource>} */
            const DATASOURCES = new Collection();
            const OBJ_DATABASE = new Database(this._client, this._auth, DATABASE, DATASOURCES);
            // @ts-ignore
            for await (const SOURCE of DATABASE.data_sources) {
                const RESPONSE = await fetch(`https://api.notion.com/v1/data_sources/${SOURCE.id}`,
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
                OBJ_DATABASE.data_sources._add(RESULT, OBJ_DATABASE);
            }
            // @ts-ignore
            return OBJ_DATABASE;
        }
        if (type === 'data_source') {
            const DATASOURCE = await this._client.dataSources.retrieve({ data_source_id: id }).catch(err => {
                throw new Error(`Invalid datasource Id "${id}" or the datasource doesn't exist.`);
            });
            // @ts-ignore
            return new DataSource(this._client, this._auth, DATASOURCE);
        }
    }
}