import Block from "./Block.js";

export default class Columns  extends Block {
    constructor() {
        super();
        this.type = "column";
        this.content = [];
    }

    /**
     * @param {Array<Block>} content - A list of various blocks
     * @example
     * // Add a paragraph to the column content
     *  new Columns()
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
    _toNotion() {
        return [{
            object: "block",
            type: this.type,
            column: {
                children: this.content.flatMap(block => block._toNotion())
            },
        }];
    }
}