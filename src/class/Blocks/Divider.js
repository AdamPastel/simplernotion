export default class Divider {
    constructor() {
        this.type = "divider";
    }

    /**
     * @private
     */
    _toNotion() {
        return {
            object: "block",
            type: this.type,
            divider: {},
        };
    }
}