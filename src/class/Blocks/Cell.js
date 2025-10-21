import Colors from "../Notion/Colors.js";
import Block from "./Block.js";

export default class Cell extends Block {
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
            content: '',
            link: null
        }
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

    /**
     * @private
     */
    _toNotion() {
        return [
            {
                annotations: {
                    bold: false,
                    code: false,
                    color: Colors.Default,
                    italic: false,
                    strikethrough: false,
                    underline: false
                },
                href: this.text.link,
                plain_text: this.text.content,
                text: {
                    content: this.text.content,
                    link: this.text.link
                },
                type: 'text'
            }
        ];
    }
}