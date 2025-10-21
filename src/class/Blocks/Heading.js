import Colors from "../Notion/Colors.js";
import Block from "./Block.js";
import HeadingType from "./HeadingType.js";

export default class Heading extends Block {
    constructor() {
        super();
        this.annotations = {
            bold: false,
            code: false,
            color: Colors.Default,
            italic: false,
            strikethrough: false,
            underline: false
        };
        this.is_toggleable = false;
        this.type = HeadingType.Big;
        this.text = {
            content: null,
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
     * @param {HeadingType | string} type
     */
    setType(type) {
        // @ts-ignore
        if (!Object.values(HeadingType).includes(type)) {
            throw new TypeError(`Invalid heading type: ${type}. Must be one of ${Object.values(HeadingType).join(", ")}`);
        }
        // @ts-ignore
        this.type = type;
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
     * @param {Boolean} bool
     */
    setToggleable(bool = true) {
        this.is_toggleable = bool;
        return this;
    }

    /**
     * @private
     */
    _toNotion() {
        return {
            object: "block",
            type: this.type,
            [this.type]: {
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
                is_toggleable: this.is_toggleable
            },
        }
    }
}