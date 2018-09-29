var WebTorrent = require('webtorrent');

module.exports = {
    play: function (url, id) {
        var client = new WebTorrent();

        client.on('error', function (err) {
            console.error('ERROR: ' + err.message)
        });

        const data = client.add(url, {path:'.'}, (torrent) => {
            torrent.files.forEach((file) => {
                console.log(file);
                file.appendTo('#' + id);
            });
        });
        console.warn(data);
    }
}