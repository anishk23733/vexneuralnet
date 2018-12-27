const {
	app,
	BrowserWindow
} = require("electron");
const electron = require("electron");

function createWindow() {
	const {
		width,
		height
	} = electron.screen.getPrimaryDisplay().workAreaSize;
	// Create the browser window.
	win = new BrowserWindow({
		width,
		height,
		titleBarStyle: "hiddenInset",
		resizable: false
	});

	// and load the index.html of the app.
	win.loadFile("index.html");
	win.webContents.openDevTools();

	win.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});