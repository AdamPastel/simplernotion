import Block from "./Block.js";
import Columns from "./Columns.js";

export default class ColumnsList extends Block {
    constructor() {
        super();
        this.columns = [];
    }

    /**
     * 
     * @param {Array<Columns>} columns 
     * @returns 
     */
    setColumns(columns) {
        this.columns = columns;
        return this;
    }

    /**
     * @private
     */
    _toNotion() {
        return [
            {
                object: "block",
                type: "column_list",
                column_list: {
                    children: this.columns.flatMap(col => col._toNotion())
                },
            },
        ];
    }
}