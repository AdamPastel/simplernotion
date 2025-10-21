import Block from "./Block.js";
import ListStyle from "./ListStyle.js";

export default class List extends Block {
    constructor() {
        super();
        this.style = ListStyle.Round;
        this.list_items = [];
    }

    /**
     * @param {Array<Block>} itemsList - A list of various blocks
     * @example
     * // Add a paragraph to the page content
     *  new List()
     *      .setItems([
     *          new ListItem()
     *              .setText("A list item")
     *      ])
     */
    setItems(itemsList) {
        this.list_items = itemsList;
        return this;
    }

    addItem(item) {
        this.list_items.push(item);
        return this;
    }

    setStyle(style) {
        this.style = style;
        return this;
    }

    /**
     * @private
     */
    _toNotion() {
        return this.list_items.map(item => item._toNotion(this.style || ListStyle.Round));
    }
}