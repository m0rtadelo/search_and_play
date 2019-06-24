const view = require('./view');
const providers = require('./providers');
const rra = require('recursive-readdir-async');

function main() {
    view.renderTabs(providers.list);
    activateTabs();
};

function activateTabs() {
    providers.list.forEach(provider => {
        if (provider.type === 'folder') {
            activateFolderTab(provider);
        }
    })
}

function activateFolderTab(provider) {
    console.log('ACtivating tab: ' + provider.name);
    rra.list(provider.path, item => {
        console.log(item);
    }).catch(err => {
        console.error(err);
    });
}
// Start main process
main();