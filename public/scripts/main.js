class Person {
    constructor (name) {
        this.name = name;
    }
    hello(){
        if (typeof this.name === 'string') {
            return 'Hello, I am ' + this.name + '!';
        } else {
            return 'Hello!';
        }
    }
}

var person = new Person('Christopher');
document.write(person.hello());

console.log('Console says hi from main.js');