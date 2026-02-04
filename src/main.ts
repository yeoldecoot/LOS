import { Application } from "pixi.js";

(async () => {
	// Create a new application
	const app = new Application();

	// Initialize the application
	await app.init({
		background: "#FFFFFF",
		resizeTo: window,
		backgroundAlpha: 0,
		antialias: true,
		autoDensity: true,
		resolution: window.devicePixelRatio,
	});

	

	//define hierarchy
	document.body.appendChild(app.canvas);
})();
