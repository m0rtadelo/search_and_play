/**
 * author: m0rtadelo
 */

var request = require('request');
var fs = require('fs');
var props = require('./properties');
const rra = require('recursive-readdir-async')

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
    },
    /**
     * Plays a magnet link
     * @param {string} magnet link (magnet)
     */
    openMagnet(magnet) {
        if (isMagnetLink(magnet)) {
            openLink(magnet);
        } else {
            alert('Not a valid magnet link!');
        }
    },
    /**
     * Plays the specified torrent file
     * @param {string} file torrent filessystem path
     */
    openTorrent(file) {
        play(file);
    },
    showItems(path) {
        showItems(path);
    }
}

function showItems(path) {
    if (!!!path)
        path = props.localCatalog;
    let container = document.getElementById('container');
    container.innerHTML = path + '<br><br><div class="list-group">';
    rra.list(path, { ignoreFolders: true, recursive: true }).then((list) => {
        if (list.error) {
            logError(list.error.message);
            container.innerHTML += list.error.message;
        } else {
            list.forEach((item) => {
                if (item.isDirectory) {
                    container.innerHTML += '<a name="' + item.name + '" isDirectory=true class="list-group-item list-group-item-action" href="#"><i class="fas fa-folder"></i>&nbsp;' + ' ' + item.name + '</a>';
                } else {
                    container.innerHTML += '<a name="' + item.name + '" class="list-group-item list-group-item-action" href="#"><i class="fas fa-file-video"></i>&nbsp;' + ' ' + item.name + '</a>';
                }
            });
        }
        container.innerHTML += '</div>';
        container.querySelectorAll('a').forEach((elem) => {
            elem.addEventListener('click', (p) => {
                if (p.target.attributes['isDirectory'])
                    if (p.target.name == '..') {
                        showItems(folderUp(path));
                    } else {
                        showItems(path + "\\" + p.target.name);
                    }
                else {
                    console.log(path + '\\' + p.target.name);
                    play(path + '\\' + p.target.name);
                }
            });
        })
    });
}

function folderUp(path) {
    let folder = path.split('\\');
    folder[folder.length - 1] = '';
    let result = folder.join('\\');
    return result.substring(0, result.length - 1);
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
        let elements;
        if (iteration == 1) {
            document.getElementById(provider.container).innerHTML += list[0].outerHTML;
            elements = document.getElementById(provider.container).querySelectorAll('a');
            $('#myTab a[href="#profile"]').tab('show') // Select tab by name
        } else {
            document.getElementById('result').innerHTML = list[0].outerHTML;
            elements = document.getElementById('result').querySelectorAll('a');
            $('#myTab a[href="#download"]').tab('show') // Select tab by name
        }
        elements.forEach(element => {
            if (!!!element.getAttribute('provider'))
                element.setAttribute('provider', JSON.stringify(provider));
            element.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(e);
                var link = getHref(e.path);
                var prov = link.getAttribute('provider');
                if (!!prov)
                    provider = JSON.parse(prov);
                if(getDomain(link.href) != '') {
                    provider.domain = getDomain(link.href);
                }
                if (isTarget(link.href)) {
                    openLink(link.href, provider);
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
 * @param {string} url absolute/relative url or magnet link for torrent
 */
function openLink(url, provider) {
    console.log('open: ' + url);
    try {
        fs.unlinkSync(props.filename);
    } catch (e) { }
    if (isMagnetLink(url)) {
        play(url);
    } else {
        try {
            var steam = request(url).pipe(fs.createWriteStream(props.filename));
            steam.on('finish', function () {
                let path = require('path').resolve('.');
                play(path + '/' + props.filename);
            })                
        } catch (error) {
            if(getDomain(url) == '') {
                let uri = new URL(url);
                console.log(uri);
                const path = uri.pathname.substr(3);
                openLink(provider.domain + path);
            }
        }
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
    require('child_process').exec(props.roxFolder + ' "' + param + '"');
}

/**
 * Prints a string o the view
 * @param {string} message the string to be printed on the view
 */
function log(message) {
    toastr.info(message);
}

/**
 * Prints a error string o the view
 * @param {string} message the string to be printed on the view
 */
function logError(message) {
    toastr.error(message);
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

function getDomain(url) {
    let uri = new URL(url);
    console.log(uri);
    return uri.protocol == 'file:' ? '' : uri.protocol + '//' + uri.host;
}