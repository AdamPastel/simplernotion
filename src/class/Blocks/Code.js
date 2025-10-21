import Languages from "../Notion/Languages.js";
import Block from "./Block.js";

export default class Code extends Block {
    constructor() {
        super();
        this.caption = [];
        this.text = {
            content: null
        }
        this.language = Languages.JavaScript;
    }

    /**
     * @param {Array} caption 
     */
    setCaption(caption) {
        this.caption = caption;
        return this;
    }

    /**
     * @param {string} text 
     */
    setText(text) {
        this.text.content = text;
        return this;
    }

    /**
     * @param {Languages | string} language 
     */
    setLanguage(language) {
        //@ts-ignore
        if (!Object.values(Languages).includes(language)) {
            throw new TypeError(`Invalid language: ${language}. Must be one of ${Object.values(Languages).join(", ")}`);
        }
        //@ts-ignore
        this.language = language;
        return this;
    }
    
    /**
     * @private
     */
    _toNotion() {
        return {
            object: "block",
            type: "code",
            code: {
                caption: this.caption,
                language: this.language,
                rich_text: [
                    {
                        type: "text",
                        text: { content: this.text.content },
                        plain_text: this.text.content
                    },
                ],
            },
        }
    }
}