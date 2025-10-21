import Colors from "../Notion/Colors.js";
import Block from "./Block.js";

export default class Quote extends Block {
    constructor() {
        super();
        this.annotations = {
            bold: false,
            code: false,
            color: Colors.Default,
            italic: false,
            strikethrough: false,
            underline: false
        }
        this.text = {
            content: null,
            link: null
        }
        // this.size = QuoteSize.Default;
    }
    
    /**
     * @param {string} text 
     * @param {string} link 
     */
    setText(text, link = null) {
        this.text.content = text;
        this.text.link = link;
        return this;
    }
    /**
     * @param {Boolean} bool
     */
    setBold(bool = true) {
        this.annotations.bold = bool;
        return this;
    }
    /**
     * @param {Boolean} bool
     */
    setCode(bool = true) {
        this.annotations.code = bool;
        return this;
    }
    /**
     * @param {Colors | string} color
     */
    setColor(color) {
        // @ts-ignore
        if (!Object.values(Colors).includes(color)) {
            throw new TypeError(`Invalid color: ${color}. Must be one of ${Object.values(Colors).join(", ")}`);
        }
        // @ts-ignore
        this.annotations.color = color;
        return this;
    }
    /**
     * @param {Boolean} bool
     */
    setItalic(bool = true) {
        this.annotations.italic = bool;
        return this;
    }
    /**
     * @param {Boolean} bool
     */
    setStrikethrough(bool = true) {
        this.annotations.strikethrough = bool;
        return this;
    }
    /**
     * @param {Boolean} bool
     */
    setUnderline(bool = true) {
        this.annotations.underline = bool;
        return this;
    }

    /*
    **
     * @param {QuoteSiz | string} size
     *
    setSize(size) {
        if (!Object.values(QuoteSize).includes(size)) {
            throw new TypeError(`Invalid size: ${size}. Must be one of ${Object.values(QuoteSize).join(", ")}`);
        }
        this.size = size;
        return this;
    }*/

    /**
     * @private
     */
    _toNotion() {
        return [{
            object: "block",
            type: "quote",
            quote: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: this.text.content },
                        annotations: this.annotations,
                        plain_text: this.text.content,
                        href: this.text.link
                    },
                ],
                color: this.annotations.color,
                // size: this.size
            },
        }];
    }
}