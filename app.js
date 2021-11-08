const requestAnimationFrame =
	window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
// const cancelAnimationFrame =
// 	window.cancelAnimationFrame || window.mozCancelAnimationFrame;

class CascadeWaves {
	constructor(container, options = {}) {
		const { columns, tileWidth, tileOffset, tileStrokeWidth } = options;

		this.svg = 'http://www.w3.org/2000/svg';
		this.columns = columns ?? 40;
		this.tileState = new Array();
		this.tileWidth = tileWidth ?? 1;
		this.tileOffset = tileOffset ?? this.tileWidth / 2;
		this.tileStrokeWidth = tileStrokeWidth ?? this.tileWidth / 20;
		this.baseSVG = this.createBaseSVG();
		this.allTiles = this.baseSVG.querySelectorAll('.cascade-waves__tile');

		this.init();
	}

	init() {}

	createBaseSVG() {
		// create baseSVG
		const baseSVG = document.createElementNS(this.svg, 'svg');
		baseSVG.setAttribute('width', '100%');
		// baseSVG.setAttribute('height', this.wrapperWidth);
		baseSVG.setAttribute('viewBox', `-${this.tileOffset} -${this.tileOffset} ${this.columns} ${this.columns}`);
		baseSVG.setAttribute('class', 'cascade-waves');

		// create tiles wrapper
		const tilesWrapper = document.createElementNS(this.svg, 'g');
		tilesWrapper.setAttribute('class', 'cascade-waves__tiles');

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
		rectGroup.setAttribute('class', 'cascade-waves__tile');
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
		rect.addEventListener('click', () => {
			const center = { x: x, y: y };
			const increment = this.incrementWaveRadius(center);
			requestAnimationFrame(() => increment());

			//this.cycleThroughtTiles(center, 6.5);
		});

		rect.addEventListener('animationend', (e) => {
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

	incrementWaveRadius(c, incrementBy = 0.5) {
		const _this = this;
		let waveRadius = 0;

		return function increment(center = c) {
			waveRadius += incrementBy;
			_this.cycleThroughtTiles(center, waveRadius);

			// if r grows half more than current columns, stop wave iteration
			if(waveRadius > _this.columns + (_this.columns/2)) return;
			
			requestAnimationFrame(() => increment());
		};
	}

	cycleThroughtTiles(c, r) {
		//////////////////////////////////////
		// First version - select all tiles inside circle
		//////////////////////////////////////
		// const top = Math.ceil(c.y - r);
		// 	const bottom = Math.floor(c.y + r);
		// 	const left = Math.floor(c.x - r);
		// 	const right = Math.ceil(c.x + r);

		// 	for (let x = left; x <= right; x++) {
		// 		for (let y = top; y <= bottom; y++) {
		// 			const tilePos = { x: x, y: y };
		// 			if (this.insideRadius(c, tilePos, r) && !!this.tileState[y] && !!this.tileState[y][x]) {
		// 				this.tileState[y][x].element.classList.add('active');
		// 			}
		// 		}
		// 	}

		//////////////////////////////////////
		// Second version - select only outline of circle (missing tiles)
		//////////////////////////////////////
		// const top = Math.ceil(c.y - r);
		// const bottom = Math.floor(c.y + r);

		// for (let y = top; y <= bottom; y++) {
		// 	const dy = y - c.y;
		// 	const dx = Math.floor(Math.sqrt(r*r - dy*dy));
		// 	const left = c.x - dx;
		// 	const right = c.x + dx;

		// 	if (!!this.tileState[y] && !!this.tileState[y][left]) {
		// 		this.tileState[y][left].element.classList.add('active');
		// 	}

		// 	if (!!this.tileState[y] && !!this.tileState[y][right]) {
		// 		this.tileState[y][right].element.classList.add('active');
		// 	}
		// }

		//////////////////////////////////////
		// Thrid version - select 8 tiles at a time at the outline of circle
		//////////////////////////////////////
		const maxIterations = Math.floor(r * Math.sqrt(0.5));

		for (let y = 0; y <= maxIterations; y++) {
			const x = Math.floor(Math.sqrt(r * r - y * y));

			this.activateTile(c.y + y, c.x - x);
			this.activateTile(c.y + y, c.x + x);
			this.activateTile(c.y - y, c.x - x);
			this.activateTile(c.y - y, c.x + x);
			this.activateTile(c.y + x, c.x - y);
			this.activateTile(c.y + x, c.x + y);
			this.activateTile(c.y - x, c.x - y);
			this.activateTile(c.y - x, c.x + y);
		}
	}

	activateTile(y, x) {
		if (!!this.tileState[y] && !!this.tileState[y][x]) {
			this.tileState[y][x].element.classList.add('active');
		}
	}

	insideRadius(c, tile, r) {
		const dx = c.x - tile.x;
		const dy = c.y - tile.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance <= r;
	}
}

const wrapper = document.getElementById('container');
const tileSpinner = new CascadeWaves(wrapper);
