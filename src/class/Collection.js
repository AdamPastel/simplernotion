/**
 * @template Key,Value
 * @extends {Map<Key,Value>}
 */
export default class Collection extends Map {
    constructor(map) {
        super(map);
    }
    
    /**
     * @param {(value: Value, key: Key) => boolean} callback
     * @returns {[Key, Value][]}
     */
    filter(callback) {
        const RESULTS = [];
        for (const [KEY, VALUE] of this.entries()) {
            if (callback(VALUE, KEY)) {
                RESULTS.push([KEY, VALUE]);
            }
        }
        // @ts-ignore
        return RESULTS;
    }
}