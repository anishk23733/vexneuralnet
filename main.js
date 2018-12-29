const { app, BrowserWindow } = require("electron");
const electron = require("electron");
const path = require("path");
const Menu = require("electron").Menu;

// MAC
// electron-packager . --overwrite --platform=darwin --arch=x64 --icon=assets/icons/mac/icon.icns --prune=true --out=release-builds

// WINDOWS
// electron-packager . GaelScout --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/windows/icon.ico --prune=true --out=release-builds --version-string.CompanyName=GaelForceRobotics --version-string.FileDescription=0.1 --version-string.ProductName="GaelScout"

function createWindow() {
	const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
	// Create the browser window.
	win = new BrowserWindow({
		width,
		height,
		titleBarStyle: "hiddenInset",
		resizable: false,
		icon: path.join(__dirname, "assets/icons/icon_256x256.png")
	});

	// and load the index.html of the app.
	win.loadFile("index.html");
	// win.webContents.openDevTools();

	win.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

function createMenu() {
	const application = {
		label: "Application",
		submenu: [
			{
				label: "About Application",
				selector: "orderFrontStandardAboutPanel:"
			},
			{
				type: "separator"
			},
			{
				label: "Quit",
				accelerator: "Command+Q",
				click: () => {
					app.quit();
				}
			}
		]
	};

	const edit = {
		label: "Edit",
		submenu: [
			{
				label: "Undo",
				accelerator: "CmdOrCtrl+Z",
				selector: "undo:"
			},
			{
				label: "Redo",
				accelerator: "Shift+CmdOrCtrl+Z",
				selector: "redo:"
			},
			{
				type: "separator"
			},
			{
				label: "Cut",
				accelerator: "CmdOrCtrl+X",
				selector: "cut:"
			},
			{
				label: "Copy",
				accelerator: "CmdOrCtrl+C",
				selector: "copy:"
			},
			{
				label: "Paste",
				accelerator: "CmdOrCtrl+V",
				selector: "paste:"
			},
			{
				label: "Select All",
				accelerator: "CmdOrCtrl+A",
				selector: "selectAll:"
			}
		]
	};

	const template = [application, edit];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on("ready", () => {
	createWindow();
	createMenu();
});

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
