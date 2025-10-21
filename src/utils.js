"use strict";
export default class Utils {
    constructor() {}
    /**
     * 
     */
    static convertProperties(databaseProperties, properties) {
        let notionProperties = {};

        for (const KEY in properties) {
            if (!databaseProperties[KEY]?.type) throw new TypeError(`Database property ${KEY} doesn't exist, check your database.`);
            switch (databaseProperties[KEY].type) {
                case "title":
                    notionProperties[KEY] = {
                        "title": [
                            {
                                "type": "text",
                                "text": {
                                    "content": properties[KEY]
                                }
                            }
                        ]
                    };
                    break;
                case "rich_text":
                    notionProperties[KEY] = {
                        "rich_text": this.markdownToRichText(properties[KEY])
                    };
                    break;
                case "number":
                    if (typeof(properties[KEY]) !== 'number') {
                        console.error(KEY + ': Specified value is of type ' + typeof(properties[KEY]) + ', not number');
                        break;
                    } else {
                        notionProperties[KEY] = {
                            "number": properties[KEY]
                        };
                        break;
                    }
                    break;
                case "select":
                    notionProperties[KEY] = {
                        "select": {
                            "name": properties[KEY][0]
                        }
                    };
                    break;
                case "multi_select":
                    const t = properties[KEY].map(item => ({
                        "name": item
                    }))
                    notionProperties[KEY] = {
                        "multi_select": properties[KEY].map(item => ({
                            "name": item
                        }))
                    };
                    break;
                case "status":
                    notionProperties[KEY] = {
                        "status": {
                            "name": properties[KEY][0]
                        }
                    };
                    break;
                case "date":
                    notionProperties[KEY] = {
                        "date": {
                            "start": properties[KEY].start,
                            "end": properties[KEY].end || null,
                            "time_zone": properties[KEY].time_zone || null
                        }
                    };
                    break;
                case "people":
                    properties[KEY].filter(person => person.type == "bot").length > 0 ? console.error(KEY + ': Bot user cannot be added to people properties') : undefined;
                    notionProperties[KEY] = {
                        "people": properties[KEY].filter(person => person.type !== "bot").map(person => ({
                            "object": "user",
                            "id": person.id
                        }))
                    };
                    break;
                case "files":
                    notionProperties[KEY] = {
                        "files": properties[KEY].map(file => ({
                            "name": file.name,
                            "type": "external",
                            "external": {
                                "url": file.url
                            }
                        }))
                    };
                    break;
                case "checkbox":
                    notionProperties[KEY] = {
                        "checkbox": properties[KEY]
                    };
                    break;
                case "url":
                    notionProperties[KEY] = {
                        "url": properties[KEY]
                    };
                    break;
                case "email":
                    notionProperties[KEY] = {
                        "email": properties[KEY]
                    };
                    break;
                case "phone_number":
                    notionProperties[KEY] = {
                        "phone_number": properties[KEY]
                    };
                    break;
                default:
                    throw new Error(`Unknown property type: ${databaseProperties[KEY].type}`);
            }
        }
        return notionProperties;
    }

    static markdownToRichText(markdownText) {
        const richTextArray = [];
        const stylesStack = [];
        let currentText = '';
        let currentStyles = {
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            code: false,
            color: 'default'
        };
        const patterns = [
            { marker: '**', style: 'bold' },
            { marker: '//', style: 'italic' },
            { marker: '__', style: 'underline' },
            { marker: '~~', style: 'strikethrough' },
            { marker: '`', style: 'code' }
        ];

        let i = 0;
        function applyCurrentText() {
            if (currentText) {
                richTextArray.push({
                    type: 'text',
                    text: { content: currentText },
                    annotations: { ...currentStyles },
                });
                currentText = '';
            }
        }

        while (i < markdownText.length) {
            let matched = false;

            for (const { marker, style } of patterns) {
                if (markdownText.slice(i, i + marker.length) === marker) {
                    applyCurrentText();

                    if (stylesStack.length > 0 && stylesStack[stylesStack.length - 1] === style) {
                        // If the style is already active, we're closing it
                        stylesStack.pop();
                        currentStyles[style] = false;
                    } else {
                        // Otherwise, we're opening a new style
                        stylesStack.push(style);
                        currentStyles[style] = true;
                    }

                    i += marker.length;
                    matched = true;
                    break;
                }
            }
            if (!matched && markdownText[i] === '[') {
                const closeBracket = markdownText.indexOf(']', i);
                const openParen = markdownText.indexOf('(', closeBracket);
                const closeParen = markdownText.indexOf(')', openParen);

                if (closeBracket !== -1 && openParen === closeBracket + 1 && closeParen !== -1) {
                    applyCurrentText();

                    const linkText = markdownText.slice(i + 1, closeBracket);
                    const url = markdownText.slice(openParen + 1, closeParen);

                    richTextArray.push({
                        type: 'text',
                        text: {
                            content: linkText,
                            link: { url: url }
                        },
                        annotations: { ...currentStyles }
                    });

                    i = closeParen + 1;
                    matched = true;
                }
            }
            if (!matched && markdownText[i] === '{') {
                const closeCurly = markdownText.indexOf('}', i);

                if (closeCurly !== -1) {
                    applyCurrentText();
                    const color = markdownText.slice(i + 1, closeCurly);
                    if ((currentStyles.color !== 'default' && markdownText.slice(i, i + color.length + 2) == `{${color}}`) || color.includes('/')) {
                        stylesStack.pop();
                        currentStyles.color = 'default';
                        i += color.length + 2;
                    } else {
                        stylesStack.push('color');
                        currentStyles.color = color;
                        i = closeCurly + 1;
                    }
                    matched = true;
                }
            }
            if (!matched) {
                currentText += markdownText[i];
                i++;
            }
        }
        applyCurrentText();
        return richTextArray;
    }

    static fixID(id) {
        if (id.includes('-') && id.length > 35) return id;
        return id.slice(0, 8) + "-" + id.slice(8, 12) + "-" + id.slice(12, 16) + "-" + id.slice(16, 20) + "-" + id.slice(20);
    }
}