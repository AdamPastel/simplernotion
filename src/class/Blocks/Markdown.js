import Utils from '../../utils.js';

export default class Markdown {
    constructor() {
        this.content = ''
    }

    /**
     * 
     * @param {string} markdown 
     * @returns 
     */
    setMarkdown(markdown) {
        this.content = markdown;
        return this;
    }

    /**
     * @private
     */
    _toNotion() {
        let insideCodeBlock = false;
        let codeBlockContent = [];
        let codeBlockLanguage = 'plain_text';
        const lines = this.content.split('\n');
        const blocks = [];
        
        lines.forEach(line => {
            if (line.startsWith('```')) {
                if (insideCodeBlock) {
                    blocks.push({
                        type: 'code',
                        code: {
                            rich_text: [{
                                type: 'text',
                                text: { content: codeBlockContent.join('\n') }
                            }],
                            language: codeBlockLanguage
                        }
                    });
                    codeBlockContent = [];
                    insideCodeBlock = false;
                } else {
                    insideCodeBlock = true;
                    codeBlockLanguage = line.slice(3).trim() || 'plain_text';
                }
            } else if (insideCodeBlock) {
                codeBlockContent.push(line);
            } else if (line.startsWith('# ')) {
                blocks.push({
                    type: 'heading_1',
                    heading_1: { rich_text: Utils.markdownToRichText(line.replace('# ', '')) }
                });
            } else if (line.startsWith('## ')) {
                blocks.push({
                    type: 'heading_2',
                    heading_2: { rich_text: Utils.markdownToRichText(line.replace('## ', '')) }
                });
            } else if (line.startsWith('### ')) {
                blocks.push({
                    type: 'heading_3',
                    heading_3: { rich_text: Utils.markdownToRichText(line.replace('### ', '')) }
                });
            } else if (line.startsWith('#> ')) {
                blocks.push({
                    type: 'heading_1',
                    heading_1: { rich_text: Utils.markdownToRichText(line.replace('#> ', '')), is_toggleable: true }
                });
            } else if (line.startsWith('##> ')) {
                blocks.push({
                    type: 'heading_2',
                    heading_2: { rich_text: Utils.markdownToRichText(line.replace('##> ', '')), is_toggleable: true }
                });
            } else if (line.startsWith('###> ')) {
                blocks.push({
                    type: 'heading_3',
                    heading_3: { rich_text: Utils.markdownToRichText(line.replace('###> ', '')), is_toggleable: true }
                });
            } else if (line.startsWith('- ')) {
                blocks.push({
                    type: 'bulleted_list_item',
                    bulleted_list_item: { rich_text: Utils.markdownToRichText(line.replace('- ', '')) }
                });
            } else if (line.startsWith('1. ')) {
                blocks.push({
                    type: 'numbered_list_item',
                    numbered_list_item: { rich_text: Utils.markdownToRichText(line.replace('1. ', '')) }
                });
            } else if (line.startsWith('> ')) {
                blocks.push({
                    type: 'quote',
                    quote: { rich_text: Utils.markdownToRichText(line.replace('> ', '')) }
                });
            } else if (line.startsWith('---')) {
                blocks.push({ type: 'divider' });
            } else {
                blocks.push({
                    type: 'paragraph',
                    paragraph: { rich_text: Utils.markdownToRichText(line) }
                });
            }
        });
        return blocks;
    }
}