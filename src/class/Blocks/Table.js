import Block from "./Block.js";
import Cell from "./Cell.js";
import Row from "./Row.js";

export default class Table extends Block {
    constructor() {
        super()
        this.type = "table";
        this.rows = [];
        this.has_column_header = false;
        this.has_row_header = false;
        this.width = 3;
    }

    /**
     * 
     * @param {Boolean} boolean 
     * @returns 
     */
    setColumnHeader(boolean = true) {
        this.has_column_header = boolean;
        return this;
    }

    /**
     * 
     * @param {Boolean} boolean 
     * @returns 
     */
    setRowHeader(boolean = true) {
        this.has_row_header = boolean;
        return this;
    }

    /**
     * 
     * @param {Number} width 
     */
    setWidth(width) {
        if (width <= 0) throw new Error('Table width cannot be inferior or equals to zero')
        this.width = width;
        return this;
    }

    /**
     * @param {Array<Row>} rows - A list of rows
     * @example
     * // Add two rows to the table
     *  new Table()
     *      .setRows([
     *          new Row()
     *              .setContent("Row 1"),
     *          new Row()
     *              .setContent("Row 2")
     *      ])
     */
    setRows(rows) {
        rows.forEach((row, i) => {
            // @ts-ignore
            rows[i] = this._checkRow(row);
        })
        this.rows = rows;
        return this;
    }

    /**
     * @param {Row} row - A row
     * @example
     * // Add two rows to the table
     *  new Table()
     *      .addRow(
     *          new Row()
     *              .setContent("Row 1")
     *      )
     *      .addRow(
     *          new Row()
     *              .setContent("Row 2")
     *      )
     */
    addRow(row) {
        this._checkRow(row);
        this.rows.push(row);
        return this;
    }

    /**
     * @param {Row} row
     * @private
     */
    _checkRow(row) {
        const CELLS_NUMBER = row.cells.length;
        if (row instanceof Row) {
            if (CELLS_NUMBER > this.width) {
                return row.cells.slice(0, this.width);
            } else if (CELLS_NUMBER < this.width) {
                for (let i = 0; i < (this.width - CELLS_NUMBER); i++) {
                    row.cells.push(new Cell);
                }
            }
        } else throw new Error(`Object is not of type Row, got ${typeof row} instead.`);
        return row;
    }

    /**
     * @private
     */
    _toNotion() {
        return [
            {
                object: "block",
                type: this.type,
                table: {
                    has_column_header: this.has_column_header,
                    has_row_header: this.has_row_header,
                    table_width: this.width,
                    children: this.rows.flatMap(row => row._toNotion())
                }
            }
        ];
    }
}