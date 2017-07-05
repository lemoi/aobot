class Lru {
    constructor(capacity) {
        this.capacity = capacity;
        this.elements = [];
    }

    set(key, value) {
        const index = this.find(key);
        if (index !== -1) {
            this.elements.splice(index, 1);
        }
        this.elements.push({ key, value });
        if (this.elements.length > this.capacity) {
            this.elements.shift();
        }
    }

    get(key) {
        const index = this.find(key);
        if (index !== -1) {
            const e = this.elements[index];
            this.elements.splice(index, 1);
            this.elements.push(e);
            return e.value;
        } else {
            return null;
        }
    }

    find(key) {
        let i = this.elements.length - 1;
        for (; i >= 0; i--) {
            if (this.elements[i].key === key) {
                break;
            }
        }
        return i;
    }
}

module.exports = Lru;
