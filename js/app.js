import TileLand from "./tileLand.js";

function onRangeChange(ele, obj, property) {
  ele.addEventListener('input', e => {
    const indicator = e.target.nextElementSibling;
    const val = Number(e.target.value);
    obj[property] = val;
    indicator.innerText = val;
		toggleHover(true);
  });
}


function onBoardChange(ele, obj, property) {
	ele.addEventListener('change', e => {
		const val = Number(e.target.value);
		if(property === 'tileWidth' && e.target.checked === false) {
			obj[property] = 1;
		} else {
			obj[property] = val;
			toggleHover(false);
		}
		
		obj.resetBoard();
  });
}

function toggleHover(state) {
	engageHover.checked = state
	initTileLand.hoverEngaged = state;
	initTileLand.hoverUpdate(state);
}

function removeSuperWave() {
	initTileLand.tileWidth = 1;
	tileWidth.checked = false;
	initTileLand.resetBoard();
}

const options = {
	columns: 20,
	tileWidth: 1,
	tileStrokeWidth: 0.05,
	waveIncrement: 0.6,
	// hover options
  hoverEngaged: false,
	hoverRadius: 3.6,
	pushoffExpInitial: 0.1,
	pushoffExpDecay: 0.6,
	scaleExpInitial: 1,
	scaleExpDecay: 0.4,
};

const container = document.getElementById('container');
const initTileLand = new TileLand(container, options);

// Board settings
const boardColumns = document.getElementById('boardColumns');
onBoardChange(boardColumns, initTileLand, 'columns');


// Hover Events
// #TODO turn on/off hover
const engageHover = document.getElementById('engageHover');
const hoverRadius = document.getElementById('hoverRadius');
const dislocateStart = document.getElementById('dislocateStart');
const dislocateDecay = document.getElementById('dislocateDecay');
const tileSizeStart = document.getElementById('tileSizeStart');
const tileSizeDecay = document.getElementById('tileSizeDecay');

onRangeChange(hoverRadius, initTileLand, 'hoverRadius');
onRangeChange(dislocateStart, initTileLand, 'pushoffExpInitial');
onRangeChange(dislocateDecay, initTileLand, 'pushoffExpDecay');
onRangeChange(tileSizeStart, initTileLand, 'scaleExpInitial');
onRangeChange(tileSizeDecay, initTileLand, 'scaleExpDecay');

engageHover.addEventListener('change', e => {
	const checked = e.target.checked;
  initTileLand.hoverEngaged = checked;
	initTileLand.hoverUpdate(checked);
	if (tileWidth.checked === true) {
		removeSuperWave();
	}
});

// Wave settings
const waveSpeed = document.getElementById('waveSpeed');
const tileWidth = document.getElementById('tileWidth');

onRangeChange(waveSpeed, initTileLand, 'waveIncrement');
onBoardChange(tileWidth, initTileLand, 'tileWidth');

// reset settings
const reset = document.getElementById('reset');
reset.addEventListener('click', e => {
	initTileLand.columns = 20;
  initTileLand.hoverEngaged = false;
	initTileLand.hoverRadius = 3.6;
	initTileLand.pushoffExpInitial = 0.1;
	initTileLand.pushoffExpDecay = 0.6;
	initTileLand.scaleExpInitial = 1;
	initTileLand.scaleExpDecay = 0.4;
	initTileLand.waveIncrement = 0.6;
	initTileLand.tileWidth = 1;

	boardColumns.value = 20;
	engageHover.checked = false;
	hoverRadius.value = 3.6;
	dislocateStart.value = 0.1;
	dislocateDecay.value = 0.6;
	tileSizeStart.value = 1;
	tileSizeDecay.value = 0.4;
	waveSpeed.value = 0.6;
	tileWidth.checked = false;

	initTileLand.resetBoard();
	removeSuperWave();
	toggleHover(false);
});