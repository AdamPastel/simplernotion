const { Client } = require('@notionhq/client');
const fs = require('fs');

class NotionClient {
    constructor(auth) {
        this.client = new Client({
            auth: auth
        });
        return this.client;
    }

    createPages = function(properties, content) {
        /* 
         * {
         *      database_id: "",
         *      
         *
         *
         *        
         *
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * 
         * }
        */
    }
}

module.exports = NotionClient;