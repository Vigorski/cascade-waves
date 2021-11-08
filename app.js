class CascadePrimer {
	constructor(container, options = {}) {
		const { columns, tileWidth, tileOffset, tileStrokeWidth } = options;

		this.svg = 'http://www.w3.org/2000/svg';
		this.columns = columns ?? 15;
		this.tileState = new Array();
		this.tileWidth = tileWidth ?? 1;
		this.tileOffset = tileOffset ?? this.tileWidth / 2;
		this.tileStrokeWidth = tileStrokeWidth ?? this.tileWidth / 20;
		this.baseSVG = this.createBaseSVG();
		this.allTiles = this.baseSVG.querySelectorAll('.cascade-primer__tile');

		this.init();
	}

	init() {}

	createBaseSVG() {
		// create baseSVG
		const baseSVG = document.createElementNS(this.svg, 'svg');
		baseSVG.setAttribute('width', '100%');
		// baseSVG.setAttribute('height', this.wrapperWidth);
		baseSVG.setAttribute('viewBox', `-${this.tileOffset} -${this.tileOffset} ${this.columns} ${this.columns}`);
		baseSVG.setAttribute('class', 'cascade-primer');

		// create tiles wrapper
		const tilesWrapper = document.createElementNS(this.svg, 'g');
		tilesWrapper.setAttribute('class', 'cascade-primer__tiles');

		// gennerate all tiles
		for (let y = 0; y < this.columns; y++) {
			for (let x = 0; x < this.columns; x++) {
				const newTile = this.createTile(x, y);
				tilesWrapper.appendChild(newTile);
			}
		}

		baseSVG.appendChild(tilesWrapper);
		container.appendChild(baseSVG);

		return baseSVG;
	}

	createTile(x, y) {
		const rectGroup = document.createElementNS(this.svg, 'g');
		rectGroup.setAttributeNS(null, 'transform', `translate(${x}, ${y})`);
		rectGroup.setAttribute('class', 'cascade-primer__tile');
		rectGroup.dataset.pos = [x, y];

		const rect = document.createElementNS(this.svg, 'rect');
		rect.setAttributeNS(null, 'width', this.tileWidth);
		rect.setAttributeNS(null, 'height', this.tileWidth);
		// make center of tile the starting coordinate points
		// ex: if tile width is 1, x should be -0.5
		rect.setAttributeNS(null, 'x', -this.tileOffset);
		rect.setAttributeNS(null, 'y', -this.tileOffset);
		rect.setAttributeNS(null, 'stroke-width', this.tileStrokeWidth);

		rectGroup.appendChild(rect);

		// update tileState with this tile
		this.setTileState(x, y, rect);

		//set events for tile
		rectGroup.addEventListener('click', (e) => {
			const center = { x: x, y: y };
			e.target.classList.add('active');
			//this.incrementWaveRadius(center);
			this.cycleThroughtTiles(center, 2.5);
		});

		rectGroup.addEventListener('animationend', (e) => {
			e.target.classList.remove('active');
		});

		return rectGroup;
	}

	setTileState(x, y, rect) {
		if (!this.tileState[y]) {
			this.tileState[y] = new Array();
		}

		this.tileState[y][x] = {
			x: x,
			y: y,
			element: rect,
		};
	}

	// c = center, r = radius
	incrementWaveRadius(center, incrementBy = 0.5, duration = 20) {
		let r = 0;
		let increment = setInterval(() => {
			r += incrementBy;
			this.cycleThroughtTiles(center, r);

			// if r grows half more than current columns, stop wave
			if(r > this.columns + (this.columns/2)) {
				clearInterval(increment);
			}
		}, duration);
	}

	cycleThroughtTiles(c, r) {
		const top = Math.floor(c.y - r);
		const bottom = Math.ceil(c.y + r);
		const left = Math.floor(c.x - r);
		const right = Math.ceil(c.x + r);

		for (let x = left; x <= right; x++) {
			for (let y = top; y <= bottom; y++) {
				const tilePos = { x: x, y: y };
				if (this.insideRadius(c, tilePos, r) && !!this.tileState[y] && !!this.tileState[y][x]) {
					this.tileState[y][x].element.classList.add('active');
				}
			}
		}
	}

	insideRadius(c, tile, r) {
		const dx = c.x - tile.x;
		const dy = c.y - tile.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		//console.log(distance)
		return distance <= r;
	}
}

const wrapper = document.getElementById('container');
const tileSpinner = new CascadePrimer(wrapper);

// console.log(tileSpinner);

//////////////////////////////////////////////////////////////////////////////////////

// boxCells.on('primed', function (e) {
// 	if (e.detail) {
// 		triggerPrimedBoxes(this);
// 	}
// });

// boxCells.on('webkitanimationend mozanimationend animationend', function () {
// 	$(this).removeClass('box--active');
// 	this.dispatchEvent(new CustomEvent('primed', { detail: false }));
// });

// boxCells.on('click', function () {
// 	this.dispatchEvent(new CustomEvent('primed', { detail: true }));
// 	$(this).addClass('box--active');
// });
