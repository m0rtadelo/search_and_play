var providers = require('./providers')
var bis = require('./bussines');
const prompt = require('electron-prompt');
const { dialog } = require('electron').remote

document.getElementById("form").addEventListener('submit', (e) => {
    e.preventDefault();
    let search = document.getElementById('searchText').value;
    bis.log(`searching '${search}'...`);
    document.getElementById("container1").innerHTML = "";
    document.getElementById("container2").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("searchText").value = "";
    providers.list.forEach(provider => {
        bis.showUrl(provider.searchUrl + search, provider, 1);
    });
});

document.getElementById('openTorrent').addEventListener('click', (e) => {
    e.preventDefault();
    dialog.showOpenDialog(this, function (names) {
        if (!!names) {
            bis.openTorrent(names[0]);
        }
    });
});

document.getElementById('openMagnet').addEventListener('click', (e) => {
    e.preventDefault();
    prompt({
        title: 'Enter magnet',
        label: 'magnet link:',
        value: 'magnet:',
        type: 'input'
    })
        .then((r) => {
            if (r === null) {
                console.log('user cancelled');
            } else {
                bis.openMagnet(r);
            }
        })
        .catch(console.error);
});

function log(message) {
    bis.log(message);
}
bis.showItems();

async function aload(title) {
    const TorrentSearchApi = require('torrent-search-api');
    TorrentSearchApi.enablePublicProviders();
    console.log(TorrentSearchApi.getActiveProviders());
    const torrents = await TorrentSearchApi.search(title, 'Movies', 200);
    console.log(torrents);
};

// aload();