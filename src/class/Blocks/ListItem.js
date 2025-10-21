import Colors from "../Notion/Colors.js";
import ListStyle from "./ListStyle.js";

export default class ListItem {
    constructor() {
        this.annotations = {
            bold: false,
            code: false,
            color: Colors.Default,
            italic: false,
            strikethrough: false,
            underline: false
        };
        this.checked = null;
        this.text = {
            content: null,
            link: null
        }
    }

    /**
     * @param {Boolean} bool
     */
    setChecked(bool = true) {
        this.checked = bool;
        return this;
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
    _toNotion(style) {
        if (style === ListStyle.Checkbox) {
            return {
                object: "block",
                type: style,
                [style]: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: this.text.content
                            },
                            annotations: this.annotations,
                            plain_text: this.text.content,
                            href: this.text.link
                        }
                    ],
                    checked: !!this.checked,
                },
            };
        } else {
            if (this.checked !== null) {
                console.warn(`simplernotion: setChecked() method is only allowed when List style is Checkbox`);
            }
        }

        return {
            object: "block",
            type: style,
            [style]: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: this.text.content
                        },
                        annotations: this.annotations,
                        plain_text: this.text.content,
                        href: this.text.link
                    }
                ],
                color: this.annotations.color,
            },
        };
    }
}