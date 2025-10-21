export default class User {
    constructor (user) {
        this.avatar_url = user.avatar_url;
        this.id = user.id;
        this.name = user.name;
        this.type = user.type;
        if (user.person) this.person = user.person;
    }
}
