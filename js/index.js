const shell = require('electron').shell;
document.getElementById("#credits").addEventListener("click", (e) => {
    e.preventDefault();
    shell.openExternal(this.href);
})