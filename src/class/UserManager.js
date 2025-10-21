import User from './User.js';
import Utils from '../utils.js';
import Collection from './Collection.js';

export default class UserManager {
    /**
     * @private
     */
    _client;
    /**
     * @private
     */
    _auth;
    constructor(client, auth) {
        this._client = client;
        this._auth = auth;
    }

    /**
     * @async
     * 
     * @returns a Collection of notion user
     */
    async list() {
        let hasMore = true;
        let cursor = undefined;
        const USERS = new Collection();

        while (hasMore) {
            const RESPONSE = await this._client.users.list({
                start_cursor: cursor
            });
            RESPONSE.results.forEach(user => {
                const USER = new User(user);
                USERS.set(USER.id, USER);
            });
            hasMore = RESPONSE.has_more;
            cursor = RESPONSE.next_cursor;
        }
        return USERS;
    }

    async fetch(id) {
        const RESPONSE = await fetch(`https://api.notion.com/v1/users/${Utils.fixID(id)}`,
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
        return RESULT.object == "error" ? null : new User(RESULT);
    }
}