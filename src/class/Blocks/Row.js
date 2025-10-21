import Block from "./Block.js";
import Cell from "./Cell.js";

export default class Row extends Block {
    constructor() {
        super();
        this.cells = [];
    }

    /**
     * 
     * @param {Cell} cell 
     * @returns 
     */
    addCell(cell) {
        if (cell instanceof Cell) {
            this.cells.push(cell);
        } else throw new Error(`Object is not of type Cell, got ${typeof cell} instead.`);
        return this;
    }

    /**
     * 
     * @param {Array<Cell>} cells 
     * @returns 
     */
    setCells(cells) {
        this.cells = cells;
        return this;
    }

    /**
     * @private
     */
    _toNotion() {
        return [
            {
                type: 'table_row',
                table_row: {
                    cells: this.cells.map(cell => cell._toNotion())
                }
            }
        ];
    }
}