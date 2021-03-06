let SHAPES = new Map([
	["i", {"height": 1, "width": 4, "matrix": [[1,1,1,1]]}],
	["j", {"height": 2, "width": 3, "matrix": [[1,1,1], [0,0,1]]}],
	["l", {"height": 2, "width": 3, "matrix": [[1,1,1], [1,0,0]]}],
	["z", {"height": 2, "width": 3, "matrix": [[1,1,0], [0,1,1]]}],
	["s", {"height": 2, "width": 3, "matrix": [[0,1,1], [1,1,0]]}],
	["t", {"height": 2, "width": 3, "matrix": [[1,1,1], [0,1,0]]}],
	["o", {"height": 2, "width": 2, "matrix": [[1,1], [1,1]]}]
])

class Field {
	constructor(element) {
		this.wrapper = element

		this.field
		this.size = {
			x: 10,
			y: 20,
		}
		this.cell
		this.fieldFigure

		this.figure
		this.previewFigure

		this.timer = {
			id:null,
			interval: 800,
		}
		this.promisedeferredraw = null
		this.inpending = false

		this.score = {
			count: 0,
			element: null,
			countBest: null,
			elementBest: null,
			name: "scoreTetrisByBoombarashk"
		}

		this._init(element)
	}


	_init(element) {
		this.score.countBest = window.localStorage[this.score.name] ?  +window.localStorage[this.score.name] : 0

		this.fieldFigure = new FieldFigure(this.size)
		
		this.figure = this.previewFigure = new Figure()

		element.insertAdjacentHTML('afterbegin', `<div class='app-inner'>
			<div class="app-title">Tetris</div>
			<div class="app-field">
				<div class="app-field-link app-text">play</div>
			</div>
			<div class="app-panel">
				<div class="app-field-preview">
				<div class="app-text">future figure</div>
				${this.previewFigure.elementHTML}
			</div>
			<div class="app-text app-text-label">score</div>
			<div class="app-text app-text-value" id="score">${this.score.count}</div>
			<div class="app-handles">
				<div class="app-text">handles</div>
				<div class="app-handle">
					<div class="app-handle-button-wrapper">
						<div class="app-handle-button app-handle-button-rotate"></div>
					</div>
					<div class="app-handle-button app-handle-button-left arrow-left"></div>
					<div class="app-handle-button app-handle-button-bottom arrow-down"></div>
					<div class="app-handle-button app-handle-button-right arrow-right"></div>
				</div>
			</div>
			<div class="app-history">
				<div class="app-text app-text-label">best score</div>
				<div class="app-text app-text-value" id="bestscore">${this.score.countBest}</div>
			</div>
		</div>`);

		this.field = element.querySelector(".app-field")
		let width = this.field.clientWidth;
		this.cell = Math.round(width / this.size.x)

		this.wrapper.addEventListener("click", event => {
			if (event.target.className.includes("app-field-link")) {
				event.target.hidden = true
				this.start()
			}

			if (this.figure.element !== undefined /*&& !this.inpending*/) {
				let changeEvent
				if (event.target.className.includes("app-handle-button-left")){
					changeEvent = "LEFT"
				}
				if (event.target.className.includes("app-handle-button-right")){
					changeEvent = "RIGHT"
				}
				if (event.target.className.includes("app-handle-button-rotate")){
					changeEvent = "ROTATE"
				}
				if (event.target.className.includes("app-handle-button-bottom")){
					changeEvent = "BOTTOM"
				}
				if (changeEvent !== undefined) {
					if (this.timer.id)  {
						clearInterval(this.timer.id)
					}

					new Promise( resolve => {
						let deferredraw = setInterval(()=>{
							if (!this.inpending) {
								clearInterval(deferredraw);
								resolve();
							}
						}, 100);
					})
					.then(()=>{

						switch(changeEvent) {
							case "LEFT": 
								this.shiftFigure(-1);
								break;

							case "RIGHT": 
								this.shiftFigure(1);
								break;

							case "ROTATE":
								if (this.compareMatrix({angle: this.figure.params.rotate + 90})) {
									this.inpending = true;

									this.rotateFigure();
								}
								break;

							default:
								let {y, height} = this.figure.params;
								let y1 = this.size.y - height;

								while (y <= y1){
									let compareResult = this.compareMatrix({y: y});

									if (!compareResult) break;

									y += 1
								}

								this.figure.params.y += y - 1

								this.redrawFigure();
								this.redrawField();
						}

						if (changeEvent !== "BOTTOM") {
							this.fallFigure()
						}
					})				
				}
			}
		});

		this.score.element = document.getElementById("score");
		this.score.elementBest = document.getElementById("bestscore")

		document.onkeydown = e => {
			e = e || window.event
			if (e.keyCode == 32) {
				if (this.timer.id)  {
					clearInterval(this.timer.id)
				}/* else {
					
					if (this.figure.element) {
						this.fallFigure()
					}
				}*/
			}
			/*
			if (e.key == "ArrowUp") {
				this.rotateFigure()
			}
			if (e.key == "ArrowLeft") {
				this.shiftFigure(-1)
			}
			if (e.key == "ArrowRight") {
				this.shiftFigure(1)
			}
			if (e.key == "ArrowDown") {
				//move down
			}*/
		}
			//@todo pause/start on space
			// <, > event keydown	
	}

	start(){
		let previewWrapper = this.wrapper.querySelector(".app-field-preview")
		this.figure = this.previewFigure
		this.figure.element  = this.field.insertBefore(previewWrapper.children[1], null)

		this.figure.element.style.position = "absolute"
		this.figure.params.x = Math.floor(Math.random() * (this.size.x - this.figure.params.width + 1) )
		this.figure.params.y = 0
		Array.from(this.figure.element.querySelectorAll(".app-figure-cell")).forEach( cell => {
			cell.style.width = this.cell
			cell.style.height = this.cell
		})
		this.redrawFigure()

		if ( this.compareMatrix({x: this.figure.params.x, y:0}) || this.score.count === 0) {//todo check need this.score.count === 0
			this.fallFigure()
		} else {
			this.stop();

		}

		this.previewFigure = new Figure()
		previewWrapper.insertAdjacentHTML('beforeend', this.previewFigure.elementHTML)
	}

	stop(){
		this.field.insertAdjacentHTML("afterbegin", "<div class='app-text app-field-info'>game over</div>");
		this.figure.element = undefined
		
		if (this.score.count > this.score.countBest) {
			this.score.countBest = this.score.count;
			window.localStorage[this.score.name] = this.score.countBest;
			this.score.elementBest.innerText = this.score.countBest;
			this.score.element.innerText = this.score.count = 0
		}
	}

	redrawFigure(){
		let figureElement = this.figure.element
		figureElement.style.width = this.cell * this.figure.params.width
		figureElement.style.top = `${this.figure.params.y * this.cell}px`
		figureElement.style.left = `${this.figure.params.x * this.cell}px`
	}
	
	redrawField(){
		this.renderMatrixField_n_addCells()

		this.countScore()

		// new Promise
/*		this.timer.deferredraw = setInterval(() => {
				
			if (!this.figure.element || !this.field.contains(this.figure.element)){
				
				//if (this.timer.id) clearInterval(this.timer.id)
				if (this.timer.deferredraw) {
					clearInterval(this.timer.deferredraw);
}
					let line = this.checkMatrix();

					while (line >= 0) {
						let voidline = this.fieldFigure.matrix.splice(line,1).map(bit => !bit);
						this.fieldFigure.matrix.unshift(voidline)
						this.clearLine(line)
						line = this.checkMatrix()
						this.countScore(500)
					}

					this.start();
				}
			
		}, 200)*/

		//todo CHANGE
		new Promise((resolve, reject) => {
			let deferredraw = setInterval(() => {
				if (!this.figure.element || !this.field.contains(this.figure.element)){// todo check need if
					if (!this.inpending) {
						clearInterval(deferredraw);
						resolve();
					}
				}
			}, 200);
		}).then(() => {
			let line = this.checkMatrix();
			while (line >= 0) {
				let voidline = this.fieldFigure.matrix.splice(line,1).map(bit => !bit);
				this.fieldFigure.matrix.unshift(voidline);
				this.clearLine(line);

				line = this.checkMatrix();

				this.countScore(500);
			}
			/* then */this.start();
		});
	}
	
	fallFigure(){
		this.timer.id = setInterval(() => {

			if (!this.inpending) {
				if ( this.compareMatrix( {y: 1})) {

					this.figure.params.y += 1
					this.redrawFigure();
					this.inpending = false;
				} else {
					if (this.timer.id) clearInterval(this.timer.id)
					this.redrawField()
				}
			}
		}, this.timer.interval)
	}

	rotateFigure() {
		if (this.figure.params.key === "o") return;

		this.figure.element.hidden = true

		let angle = this.figure.params.rotate + 90
		this.figure.params.rotate = angle < 360 ? angle : 0
		let matrix = this.figure.matrix.get(this.figure.params.rotate) 
		let oldHtml = this.figure.element.innerHTML

		this.figure.params.height = matrix.length
		this.figure.params.width = matrix[0].length
		//let matrix = this.figure.setParamsFigure(this.figure.params.rotate)

		this.figure.elementHTML = this.figure.renderCells(matrix, this.cell)
		this.figure.element.innerHTML = this.figure.elementHTML
		

		new Promise(resolve => {
			if (oldHtml !== this.figure.element.innerHTML ) {
				this.inpending = false;this.figure.element.hidden = false
				resolve();
			}
		});

	}

	shiftFigure(dx){
		if (dx < 0) {
			if (this.figure.params.x > 0) 
				this.figure.params.x -= 1
		} else {
			if (this.figure.params.x + this.figure.params.width < this.size.x)
				this.figure.params.x += 1
		}
	}
	
	
	
	renderMatrixField_n_addCells(){
		let {width, height, x, y, rotate} = this.figure.params
		let matrix = this.figure.matrix.get(rotate) 

		for (let y1 = 0; y1 < matrix.length; y1++ ) {
			for (let x1 = 0; x1 < matrix[0].length; x1++) {
				let cellX = x1 + x
				let cellY = y1 + y

				if (matrix[y1][x1] /*&& !this.field.querySelector(`#x${cellX}y${cellY}`)*/) {
					this.fieldFigure.matrix[cellY][cellX] = matrix[y1][x1]
					let cellHTML = this.fieldFigure.renderCell(true, this.cell, "app-figure-cell--abs")
					this.field.insertAdjacentHTML('beforeend', cellHTML)
					let cell = this.field.children[this.field.children.length - 1]
					cell.style.left = `${cellX * this.cell}px`
					cell.style.top = `${cellY * this.cell}px`
					cell.setAttribute("data-coord-x", cellX)					
					cell.setAttribute("data-coord-y", cellY)					
				}
			}
		}
		this.figure.destroy()
	}

	compareMatrix(newParams){

		let angle = newParams.angle ? newParams.angle : this.figure.params.rotate
		let matrix = this.figure.matrix.get(angle/* === undefined ? 0 : angle*/) 
		let height = matrix.length
		let width = matrix[0].length
		let {x, y} = this.figure.params

		if (y > this.size.y - height || x > this.size.x - width ) {
			return false
		}

		let dx = x + (newParams.x || 0)
		let dy = y + (newParams.y || 0)

		do {
			try {
			for (let y1 = height-1; y1 >= 0; y1--) {
				for (let x1 = 0; x1 < width; x1++ ) {

					let cellX = x1 + x;					
					let cellY = y1 + y;

					if (cellY >= this.size.y || cellX >= this.size.x || this.fieldFigure.matrix[cellY][cellX] && matrix[y1][x1]) {
						return false
					}
				}
			}
			} catch(e) { 
				console.error(e);
				return false
			}
			y += 1;
		}while(y <= dy)

		return true
	}

	countScore(score = 50) {
		this.score.count += score
		this.score.element.innerText = this.score.count
	}

	checkMatrix() {
		for (let y = 0; y < this.size.y; y++) {

			let line = this.fieldFigure.matrix[y].filter(bit => bit)

			if (line.length == this.size.x) return y
		}
		return -1
	}

	clearLine(line) {
		Array.from(this.field.querySelectorAll(`[data-coord-y = '${line}']`)).forEach(cell => cell.remove())

		for (let y = +line - 1; y>0; y--){
			let y1 = y + 1;
			Array.from(this.field.querySelectorAll(`[data-coord-y = '${y}']`)).forEach(cell => {
				cell.dataset.coordY = y1;
				cell.style.top = `${y1 * this.cell}px`
			})
		}
	}
}

class BaseFigure {
	constructor() {
		this.matrix
	}

	renderCell(isfill, cellSize, additionalClass = "") {
		//let additionalClass //-fourth, -third, -half
		return `<div class="app-figure-cell ${isfill ? "app-figure-cell--fill" : ""} ${additionalClass}" 
					${cellSize ? "style=\"width:"+ cellSize +"px; height:"+ cellSize +"px;\"" : ""}></div>`
	}

	destroy(){
		this.element.remove()
	}
}

class Figure extends BaseFigure{
	constructor() {
		super()
		this.BASE_CLASS = "app-figure"
		this.params = {
			key: null,
			x: 0,
			y: 0,
			rotate: 0,
			width: null,
			height: null
		}
		this.shape
		this.matrix = new Map()
		this.elementHTML
		this.randomShape()
	}

	randomShape() {
		let collectionKeys = Array.from(SHAPES.keys())
		let randomKey = collectionKeys[Math.floor(Math.random() * collectionKeys.length )]
		this.shape = SHAPES.get(randomKey)
		this.params.key = randomKey
		this.renderMatrix()
		this.renderFigure()
	}

	renderMatrix() {
		//horizontal default orientation:
		this.matrix.set(0, this.shape.matrix)
		//horizontal mirror:
		this.matrix.set(180, this.shape.matrix.slice().reverse().map(a => a.slice().reverse()))
		//vertical mirror: 
		let perpendicularLevel1 = []
		for (let x = this.shape.width - 1; x >= 0; x-- ) {
			let perpendicularLevel2 = []
			for (let y = 0; y < this.shape.height; y++){
				perpendicularLevel2.push( this.shape.matrix[y][x] )
			}
			perpendicularLevel1.push(perpendicularLevel2)
		}
		this.matrix.set(270, perpendicularLevel1)	
		//vertical default: 	
		this.matrix.set(90, perpendicularLevel1.slice().reverse().map(a => a.slice().reverse()))		
	}

	setParamsFigure() {	
		let matrix = this.matrix.get(this.params.rotate) 
		this.params.height = matrix.length
		this.params.width = matrix[0].length
		return matrix

	}

	renderFigure(){
		let matrix = this.setParamsFigure()//todo
		this.elementHTML = `<div class="${this.BASE_CLASS} ${this.BASE_CLASS}-${this.params.key} ${this.BASE_CLASS}--width-${this.params.width}">
			${this.renderCells(matrix)}
		</div>`

	}

	renderCells(matrix, cellSize = null) {
		let cells = []
		for (let i = 0; i < matrix.length; i++){
			for (let j = 0; j < matrix[i].length; j++ ) {
				cells.push( this.renderCell( matrix[i][j], cellSize ))
			}
		}
		return cells.join("")
	}

}

class FieldFigure extends BaseFigure {
	constructor(size) {
		super()
		this.matrix = Array.apply(null, Array(size.y)).map(() => new Array(size.x).fill(0))
	}
}


let field = new Field(document.querySelector(".app"));