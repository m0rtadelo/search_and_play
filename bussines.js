/**
 * author: m0rtadelo
 */

var request = require('request');
var fs = require('fs');
var props = require('./properties');

module.exports = {
    /**
     * Renders the elements of the url based on the config provider object.
     * @param {string} url relative/absolute url to show in the view
     * @param {provider} provider provider config object
     * @param {number} iteration index of the deep iteration 
     */
    showUrl: function (url, provider, iteration) {
        showUrl(url, provider, iteration);
    },
    /**
    * Prints a string o the view
    * @param {string} message the string to be printed on the view
    */
    log: function (message) {
        log(message);
    }
}

/**
 * Renders the elements of the url based on the config provider object.
 * @param {string} url relative/absolute url to show in the view
 * @param {provider} provider provider config object
 * @param {number} iteration index of the deep iteration 
 */
function showUrl(url, provider, iteration) {
    request(url, function (error, response, body) {
        let parser = new DOMParser();
        let xml = parser.parseFromString(body, 'text/html');
        let selector = (iteration == 1 ? provider.searchSelector : provider.downSelector);
        let list = xml.querySelectorAll(selector);
        document.getElementById('container').innerHTML += list[0].outerHTML;
        let elements = document.getElementById('container').querySelectorAll('a');
        elements.forEach(element => {
            if (!!!element.getAttribute('provider'))
                element.setAttribute('provider', JSON.stringify(provider));
            element.addEventListener('click', (e) => {
                e.preventDefault();
                var link = getHref(e.path);
                var prov = link.getAttribute('provider');
                if (!!prov)
                    provider = JSON.parse(prov);
                if (isTarget(link.href)) {
                    openLink(link.href);
                } else {
                    log(`loading '${link.href}'...`);
                    iteration = iteration + 1;
                    showUrl(link.href, provider, iteration);
                }
            })
        })
    });
}

/**
 * Opens the torrent/magnet link with the video player for playback streaming
 * @param {string} url absolute url or magnet link for torrent
 */
function openLink(url) {
    try {
        fs.unlinkSync(props.filename);
    } catch (e) { }
    if (isMagnetLink(url)) {
        play(url);
    } else {
        var steam = request(url).pipe(fs.createWriteStream(props.filename));
        steam.on('finish', function () {
            let path = require('path').resolve('.');
            play(path + '/' + props.filename);
        })
    }
}

/**
 * Returns true if the link is a magnet link
 * @param {string} link url or magnet link
 */
function isMagnetLink(link) {
    return link.indexOf('magnet:') == 0;
}

/**
 * Returns true if the url is a torrent link
 * @param {string} url url or magnt link
 */
function isTorrent(url) {
    var parts = url.split('?')[0].split('.');
    if (parts[parts.length - 1] == 'torrent')
        return true;
    else
        return false;
}

/**
 * Executes the video player with param
 * @param {string} param parameters for video player
 */
function play(param) {
    require('child_process').exec(props.roxFolder + ' ' + param);
}

/**
 * Prints a string o the view
 * @param {string} message the string to be printed on the view
 */
function log(message) {
    document.getElementById('container').innerHTML = message;
}

/**
 * Returns true if the url is a torrent or magnet link
 * @param {string} url the url
 */
function isTarget(url) {
    return isMagnetLink(url) || isTorrent(url);
}

/**
 * Returns path item with href property
 * @param {object} path a element path
 */
function getHref(path) {
    for (var i = 0; i < path.length; i++) {
        if (!!path[i].href) {
            return path[i];
        }
    }
    return undefined;
}