const requestAnimationFrame =
	window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
// const cancelAnimationFrame =
// 	window.cancelAnimationFrame || window.mozCancelAnimationFrame;

class CascadeWaves {
	constructor(container, options = {}) {
		const { columns, tileWidth, tileOffset, tileStrokeWidth } = options;

		this.svg = 'http://www.w3.org/2000/svg';
		this.columns = columns ?? 25;
		this.tileState = new Array();
		this.tileWidth = tileWidth ?? 1;
		this.tileOffset = tileOffset ?? this.tileWidth / 2;
		this.tileStrokeWidth = tileStrokeWidth ?? this.tileWidth / this.columns;
		this.baseSVG = this.createBaseSVG();
		this.allTiles = this.baseSVG.querySelectorAll('.cascade-waves__tile');

		const throt = this.throttle(this.tileBulge, 20);

		this.baseSVG.addEventListener('mousemove', (e) => {
			throt(e); // 2.5k calls per one swipe
			// this.tileBulge(e); //10k calls per one swipe
		});
	}

	// c = center, r = radius
	tileBulge(e, r = 3.5) {
		const baseSVGRect = this.baseSVG.getBoundingClientRect();
		const baseLeft = Math.floor(baseSVGRect.left);
		const baseTop = Math.floor(baseSVGRect.top);
		const rebasedTileWidth = baseSVGRect.width / this.columns;
		const TOP_LIMIT = 1;
		// plus 1 so tiles which are on radius edge do not hit scale 1
		const fadeSteps = TOP_LIMIT / (r + 1);

		// divide by num of cols to get same coordinate system as baseSVG
		// -0.5 is the offset of the rect element, so we need it here to recenter the cursor in the middle of the circle
		const x = (e.clientX - baseLeft) / rebasedTileWidth - 0.5;
		const y = (e.clientY - baseTop) / rebasedTileWidth - 0.5;
		const c = { x: x, y: y };

		for (let x = 0; x <= this.columns; x++) {
			for (let y = 0; y <= this.columns; y++) {
				const tilePos = { x: x, y: y };
				// check if tile exists, else skip to next tile
				if (this.tileState[y] === undefined || this.tileState[y][x] === undefined) continue;

				const tileElement = this.tileState[y][x].element;
				const tileParent = tileElement.parentElement;

				if (this.insideRadius(c, tilePos, r)) {
					const adjacent = x - c.x;
					const oposite = y - c.y;
					const distance = Math.sqrt(adjacent * adjacent + oposite * oposite);
					const pullInRate = Math.round((fadeSteps * distance + Number.EPSILON) * 100) / 100;
					const pushOffRate = (Math.round((fadeSteps / distance + Number.EPSILON) * 100) / 100) * 5;

					tileParent.classList.add('hovered');
					tileElement.setAttribute('style', `transform: translate(${(x - c.x) * pushOffRate}px, ${(y - c.y) * pushOffRate}px) scale(${pullInRate})`);
					tileElement.setAttribute('fill', '#ac1bfa');
				} else if (tileParent.classList.contains('hovered')) {
					tileParent.classList.remove('hovered');
					tileElement.setAttribute('style', `transform: scale(1)`);
					tileElement.setAttribute('fill', '#433e42');
				}
			}
		}
	}

	createBaseSVG() {
		// create baseSVG
		const baseSVG = document.createElementNS(this.svg, 'svg');
		baseSVG.setAttribute('width', '100%');
		baseSVG.setAttribute('viewBox', `-${this.tileOffset} -${this.tileOffset} ${this.columns} ${this.columns}`);
		baseSVG.setAttribute('class', 'cascade-waves');

		// create root grid parent group
		// this is used to trigger correct events and acts as an accurate coordinate system
		const rootGrid = document.createElementNS(this.svg, 'g')
		rootGrid.setAttribute('class', 'cascase-waves__root-grid')

		// create tiles wrapper
		const tilesWrapper = document.createElementNS(this.svg, 'g');
		tilesWrapper.setAttribute('class', 'cascade-waves__tiles');

		// gennerate all tiles
		for (let y = 0; y < this.columns; y++) {
			for (let x = 0; x < this.columns; x++) {
				rootGrid.appendChild(this.createRootTile(x, y));
				tilesWrapper.appendChild(this.createTile(x, y));
			}
		}

		baseSVG.appendChild(tilesWrapper);
		baseSVG.appendChild(rootGrid);
		container.appendChild(baseSVG);

		return baseSVG;
	}

	createTile(x, y) {
		const rectGroup = document.createElementNS(this.svg, 'g');
		rectGroup.setAttributeNS(null, 'transform', `translate(${x}, ${y})`);
		rectGroup.setAttribute('class', 'cascade-waves__tile');
		rectGroup.setAttribute('id', `gTile-${y}${x}`);
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

		return rectGroup;
	}

	createRootTile(x, y) {
		const rect = document.createElementNS(this.svg, 'rect');
		rect.setAttributeNS(null, 'x', x);
		rect.setAttributeNS(null, 'y', y);
		rect.setAttributeNS(null, 'width', this.tileWidth);
		rect.setAttributeNS(null, 'height', this.tileWidth);
		// make center of tile the starting coordinate points
		// ex: if tile width is 1, x should be -0.5
		rect.setAttributeNS(null, 'transform', `translate(${-this.tileOffset}, ${-this.tileOffset})`);
		rect.setAttribute('class', 'cascade-waves__root-tile');
		rect.dataset.pos = [x, y];

		//set events for tile
		rect.addEventListener('click', () => {
			// initiate animation with requestAnimationFrame once here
			// inside this function the requestAnimationFrame must again be called recursively
			const c = { x: x, y: y };
			const increment = this.incrementWaveRadius(c);
			requestAnimationFrame(() => increment());

			// this.cycleThroughtTiles(center, 6.5);
		});

		// rect.addEventListener('animationend', (e) => {
		// 	e.target.classList.remove('active');
		// });

		return rect;
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

	// incrementing by half a tile seems the most pleasing
	incrementWaveRadius(c, incrementBy = 0.5) {
		const _this = this;
		let waveRadius = 0;

		return function increment(center = c) {
			waveRadius += incrementBy;
			_this.cycleThroughtTiles(center, waveRadius);

			// if r grows half more than current columns, stop wave iteration
			if (waveRadius > _this.columns + _this.columns / 2) return;

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

		// Here we draw 8 tiles at a time
		// so we only need 45deg of the entire circle
		// maxIteration = x = y of triangle or its the number of times we need to draw x8 tiles to make  a full circle
		const cosinus = Math.cos(this.toRadians(45));
		const maxIterations = Math.floor(r * cosinus);

		for (let y = 0; y <= maxIterations; y++) {
			const x = Math.floor(Math.sqrt(r * r - y * y));
			// draw 4 on horizontal axis
			this.activateTile(c.y + y, c.x - x);
			this.activateTile(c.y + y, c.x + x);
			this.activateTile(c.y - y, c.x - x);
			this.activateTile(c.y - y, c.x + x);
			// draw 4 on vertical axis
			this.activateTile(c.y + x, c.x - y);
			this.activateTile(c.y + x, c.x + y);
			this.activateTile(c.y - x, c.x - y);
			this.activateTile(c.y - x, c.x + y);
		}
	}

	activateTile(y, x) {
		if (!!this.tileState[y] && !!this.tileState[y][x]) {
			this.tileState[y][x].element.classList.add('active');
			// currently animation is set to .4s so remove it manually here.
			// Must remove class like this because intersecting waves cause a glitch and class remains
			setTimeout(() => this.tileState[y][x].element.classList.remove('active'), 400);
		}
	}

	insideRadius(c, tile, r) {
		const dx = c.x - tile.x;
		const dy = c.y - tile.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance <= r;
	}

	toRadians(angle) {
		return angle * (Math.PI / 180);
	}

	throttle(callback, limit) {
		let wait = false;
		const _this = this;

		return function (e) {
			if (!wait) {
				callback.call(_this, e);
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		};
	}
}

const options = {
	columns: 20,
	tileWidth: 1,
};

const wrapper = document.getElementById('container');
const tileSpinner = new CascadeWaves(wrapper, options);
