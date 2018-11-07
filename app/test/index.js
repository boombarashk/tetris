const assert = require('chai').assert;
const should = require('chai').should();

let app = document.children[0].querySelector('body').appendChild(document.createElement("div"));
app.setAttribute("class", "app");
const Field = require('../assets/tetris').Field;

describe("FIRST TEST", () => {
    let field = new Field(app)
//  console.log(field)
    it('should be true', () => {

        assert.equal(1, 1);


    });
});