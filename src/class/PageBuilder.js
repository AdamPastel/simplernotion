"use strict";
import Utils from '../utils.js';
import Block from './Blocks/Block.js';
import Icons from './Notion/Icons.js';

export default class PageBuilder {
    constructor () {
        this.icon = null;
        this.cover = null;
        this.title = null;
        this.properties = {};
        this.content = [];
    }

    /**
     * @param {Icons | string} icon - The icon of the page
     * @example
     * // Set the icon of the page to the speficied emoji or Notion's icon
     *  new PageBuilder()
     *      .setIcon("👋")
     * // Or
     *  new PageBuilder()
     *      .setIcon(Icons.Green_arrow_in_rectangle)
     */
    setIcon(icon) {
        // @ts-ignore
        this.icon = Object.values(Icons).includes(icon) ? { "type": "external", "external": { "url": icon } } : icon;
        return this;
    }
    
    /**
     * @param {string} cover_url - The cover of the page
     * @example
     * // Set the Cover of the page to the speficied image URL
     *  new PageBuilder()
     *      .setCover("https://website.com/a-beautiful-cover.png")
     */
    setCover(cover_url) {
        this.cover = cover_url;
        return this;
    }
    
    /**
     * @param {string} title - The title of the page
     * @example
     * // Set the Title of the page to the speficied value
     *  new PageBuilder()
     *      .setTitle("A brand new page!")
     */
    setTitle(title) {
        this.title = title; 
        return this;
    }

    /**
     * @param {Object} properties - An object containing the properties and their values
     * @example
     * // Set the Description and Number properties to the specified values
     *  new PageBuilder()
     *      .setProperties({
     *          Description: "The answer to the universe",
     *          Number: 42
     *      })
     */
    setProperties(properties) {
        this.properties = properties;
        return this;
    }

    /**
     * @param {Array<Block>} content - A list of various blocks
     * @example
     * // Add a paragraph to the page content
     *  new PageBuilder()
     *      .setContent([
     *          new Paragraph()
     *              .setText("Hello world!")
     *      ])
     */
    setContent(content) {
        this.content = content;
        return this;
    }

    /**
     * @private
     */
    _toNotion(source) {
        let titleKey;
        for (var key in source.properties) {
            if (source.properties.hasOwnProperty(key) && source.properties[key].type === "title") titleKey = key;
        }
        return {
            parent: {
                type: 'data_source_id',
                data_source_id: source?.id
            },
            properties: Object.assign({ [titleKey]: { title: [{ type: "text", text: { content: this.title } }] } }, Utils.convertProperties(source.properties, this.properties)),
            cover: this.cover ? { type: "external", external: { url: this.cover } } : undefined,
            icon: this.icon instanceof Object ? this.icon : (this.icon ? { type: "emoji", emoji: this.icon } : undefined),
            children: this.content.flatMap(c => c._toNotion()),
        };
    }
}