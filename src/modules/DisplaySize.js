import { BaseModule } from './BaseModule';

export class DisplaySize extends BaseModule {
	onCreate = () => {
		// Create the container to hold the size display
		this.display = document.createElement('div');

		// Apply styles
		Object.assign(this.display.style, this.options.displayStyles);

		// Attach it
		this.overlay.appendChild(this.display);
	};

	onDestroy = () => {};

	onUpdate = () => {
		if (!this.display || !this.img) {
			return;
		}

		const size = this.getCurrentSize();
		this.display.innerHTML = size.join(' &times; ');

		// Get the bounding box of the editor
		const editorBounds = this.overlay.getBoundingClientRect();
		const imgBounds = this.img.getBoundingClientRect();
		const dispRect = this.display.getBoundingClientRect();

		// Default positions
		let right = 'auto', bottom = 'auto', left = 'auto';

		if (size[0] > 120 && size[1] > 30) {
			// position on top of image
			right = '4px';
			bottom = '4px';
		} else if (this.img.style.float === 'right') {
			// position off bottom left
			right = 'auto';
			bottom = `-${dispRect.height + 4}px`;
			left = `-${dispRect.width + 4}px`;
		} else {
			// position off bottom right
			right = `-${dispRect.width + 4}px`;
			bottom = `-${dispRect.height + 4}px`;
		}

		// Ensure the display stays within the editor bounds
		if (imgBounds.left + dispRect.width > editorBounds.right) {
			right = '0px';
			left = 'auto';
		}

		if (imgBounds.bottom + dispRect.height > editorBounds.bottom) {
			bottom = '0px';
		}

		Object.assign(this.display.style, { right, bottom, left });
	};

	getCurrentSize = () => [
		this.img.width,
		Math.round((this.img.width / this.img.naturalWidth) * this.img.naturalHeight),
	];
}
