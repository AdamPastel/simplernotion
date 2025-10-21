import Colors from "../Notion/Colors.js";
import Block from "./Block.js";

export default class Callout extends Block {
    constructor() {
        super();
        this.type = "callout";
        this.title = null;
        this.color = Colors.Default;
        this.icon = null;
        this.content = [];
    }

    /**
     * @param {Array} content
     */
    setContent(content) {
        this.content = content;
        return this;
    }

    /**
     * 
     * @param {*} icon 
     * @returns 
     */
    setIcon(icon) {
        this.icon = icon;
        return this;
    }

    /**
     * @param {Colors | string} color
     */
    setColor(color) {
        //@ts-ignore
        if (!Object.values(Colors).includes(color)) {
            throw new TypeError(`Invalid color: ${color}. Must be one of ${Object.values(Colors).join(", ")}`);
        }
        //@ts-ignore
        this.color = color;
        return this;
    }
    
    /**
     * @param {string} title
     */
    setTitle(title) {
        this.title = title;
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
                        text: {
                            content: this.title,
                            link: null
                        },
                        plain_text: this.title,
                    },
                ],
                color: this.color,
                icon: this.icon ? { type: "emoji", emoji: this.icon } : undefined,
                children: this.content.flatMap(c => c._toNotion()),
            },
        };
    }
}