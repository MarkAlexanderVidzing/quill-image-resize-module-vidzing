import { BaseModule } from './BaseModule';

export class Resize extends BaseModule {
	onCreate = () => {
		// Track resize handles
		this.boxes = [];

		// Add 4 resize handles
		this.addBox('nwse-resize'); // Top left
		this.addBox('nesw-resize'); // Top right
		this.addBox('nwse-resize'); // Bottom right
		this.addBox('nesw-resize'); // Bottom left

		this.positionBoxes();
	};

	onDestroy = () => {
		// Reset drag handle cursors
		this.setCursor('');
	};

	positionBoxes = () => {
		const handleXOffset = `${-parseFloat(this.options.handleStyles.width) / 2}px`;
		const handleYOffset = `${-parseFloat(this.options.handleStyles.height) / 2}px`;

		// Set the top and left for each drag handle
		[
			{ left: handleXOffset, top: handleYOffset },        // Top left
			{ right: handleXOffset, top: handleYOffset },       // Top right
			{ right: handleXOffset, bottom: handleYOffset },    // Bottom right
			{ left: handleXOffset, bottom: handleYOffset },     // Bottom left
		].forEach((pos, idx) => {
			Object.assign(this.boxes[idx].style, pos);
		});
	};

	addBox = (cursor) => {
		// Create div element for resize handle
		const box = document.createElement('div');

		// Start with the specified styles
		Object.assign(box.style, this.options.handleStyles);
		box.style.cursor = cursor;

		// Set the width/height to use 'px'
		box.style.width = `${this.options.handleStyles.width}px`;
		box.style.height = `${this.options.handleStyles.height}px`;

		// Listen for mousedown on each box
		box.addEventListener('touchstart', this.handleMousedown, { passive: true });
		box.addEventListener('mousedown', this.handleMousedown, false);

		// Add drag handle to document
		this.overlay.appendChild(box);

		// Keep track of drag handle
		this.boxes.push(box);
	};

	handleMousedown = (evt) => {
		// Note which box
		this.dragBox = evt.target;

		// Note starting mousedown position
		this.dragStartX = evt.touches ? evt.touches[0].clientX : evt.clientX;

		// Store the width before the drag
		this.preDragWidth = this.img.width || this.img.naturalWidth;

		// Set the proper cursor everywhere
		this.setCursor(this.dragBox.style.cursor);

		// Listen for movement and mouseup
		document.addEventListener('touchmove', this.handleDrag, { passive: true });
		document.addEventListener('touchend', this.handleMouseup, { passive: true });
		document.addEventListener('mousemove', this.handleDrag, false);
		document.addEventListener('mouseup', this.handleMouseup, false);
	};

	handleMouseup = () => {
		// Reset cursor everywhere
		this.setCursor('');

		// Ensure minimum dimensions are respected after drag ends
		const minWidth = 50;
		const minHeight = 50;

		if (this.img.width < minWidth) {
			this.img.width = minWidth;
		}
		if (this.img.height < minHeight) {
			this.img.height = minHeight;
		}

		// Stop listening for movement and mouseup
		document.removeEventListener('touchmove', this.handleDrag);
		document.removeEventListener('touchend', this.handleMouseup);
		document.removeEventListener('mousemove', this.handleDrag);
		document.removeEventListener('mouseup', this.handleMouseup);

		// Reposition the overlay and resize handles
		this.positionBoxes();
		this.repositionOverlay();
	};

	handleDrag = (evt) => {
		if (!this.img) {
			// Image not set yet
			return;
		}

		// Update image size
		const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
		const deltaX = clientX - this.dragStartX;
		let newWidth;

		if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
			// Left-side resize handler; dragging right shrinks image
			newWidth = Math.round(this.preDragWidth - deltaX);
		} else {
			// Right-side resize handler; dragging right enlarges image
			newWidth = Math.round(this.preDragWidth + deltaX);
		}

		const minWidth = 50; // Set a minimum width of 50px
		const maxWidth = this.overlay.offsetWidth; // Maximum width based on container
		this.img.width = Math.max(minWidth, Math.min(maxWidth, newWidth));

		// Constrain height if necessary
		const aspectRatio = this.img.naturalWidth / this.img.naturalHeight;
		let newHeight = Math.round(newWidth / aspectRatio);
		const minHeight = 50; // Set a minimum height of 50px
		this.img.height = Math.max(minHeight, newHeight);

		this.requestUpdate();
	};

	repositionOverlay = () => {
		if (!this.overlay || !this.img) {
			return;
		}

		// position the overlay over the image
		const parent = this.quill.root.parentNode;
		const imgRect = this.img.getBoundingClientRect();
		const containerRect = parent.getBoundingClientRect();

		Object.assign(this.overlay.style, {
			left: `${imgRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
			top: `${imgRect.top - containerRect.top + parent.scrollTop}px`,
			width: `${imgRect.width}px`,
			height: `${imgRect.height}px`,
		});
	};

	setCursor = (value) => {
		[
			document.body,
			this.img,
		].forEach((el) => {
			el.style.cursor = value;   // eslint-disable-line no-param-reassign
		});
	};
}
