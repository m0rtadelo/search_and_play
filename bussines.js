/**
 * author: m0rtadelo
 */
var providers = require('./providers')
var request = require('request');
var fs = require('fs');
var props = require('./properties');
const rra = require('recursive-readdir-async')
var net = require('net');
var URL2 = require('url');
var search;
// var socket = require('socket.io')(http);//.connect('http://localhost:8080', { 'forceNew': true });
module.exports = {
    setSearch: function(value){search = value},
    /**
     * Renders the elements of the url based on the config provider object.
     * @param {string} url relative/absolute url to show in the view
     * @param {provider} provider provider config object
     * @param {number} iteration index of the deep iteration 
     */
    showUrl: function (url, provider, iteration) {
        console.log('('+provider.name+') query started: ' + url);
        document.getElementById(provider.name+'container').innerHTML = `Searching...<div class="spinner-grow" role="status">
        <span class="sr-only">Loading...</span>
      </div>`;
        if(provider.isJson)
            getJson(url, provider);
        else
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

function getJson(url, provider) {
    let link;
    request(url, function (error, response, body) {
        if(error){
            console.error('('+provider.name+') request error: ' + url)
            console.error(error);
            toastr.error('('+provider.name+') request error!');
        } else {
            console.log('('+provider.name+') query finished!');   
            toastr.success('('+provider.name+') query finished!');         
        }        
        let container = document.getElementById(provider.name + 'container');
        container.innerHTML='';
        let results = JSON.parse(body).Results;
        results.sort(function(a,b){
            return b.Seeders - a.Seeders;
        })
        results.forEach(item => {
            if(item.Seeders>0 || item.Peers>0){
                if(provider.filter && item.Title.toString().toUpperCase().includes(search.toString().toUpperCase())){
                    link = item.Link ? item.Link : item.MagnetUri;
                    container.innerHTML += 
                    `<div class="list-group" style="font-size:10pt" name="${link}"><a name="${link}" class="list-group-item list-group-item-action" href="#"><span class="badge badge-success" name="${link}">${item.Seeders} / ${item.Peers}</span>&nbsp;${item.Title}&nbsp;&nbsp;<small class="text-muted" name="${link}">[${(item.Size/1024/1024/1024).toFixed(2)} Gb]</small></a></div>`;
                }
            }
        });
        container.querySelectorAll('a').forEach((elem) => {
            elem.addEventListener('click', function(p) {
                openLink(p.target.name, provider);
            });
        });
        // console.log(results);
    });
}

function addTab(tabs, content, name) {
    tabs.innerHTML +=  `<li class="nav-item">
    <a class="nav-link" id="${name}-tab" data-toggle="tab" href="#${name}" role="tab" aria-controls="${name}"
        aria-selected="false">${name}</a>
</li>`
    content.innerHTML += `<div class="tab-pane fade" id="${name}" role="tabpanel" aria-labelledby="${name}-tab">
    <div class="container" id="${name}container"></div>
</div>`
}

function createTabs() {
    const myTab = document.getElementById('myTab');
    const myTabContent = document.getElementById('myTabContent');
    myTab.innerHTML = `<li class="nav-item">
    <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home"
        aria-selected="true">Local</a>
</li>`;
    myTabContent.innerHTML = `<div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
    <div class="container" id="container"></div>
</div>` ;
    providers.list.forEach(provider => {
        addTab(myTab, myTabContent, provider.name);
    })

    myTab.innerHTML += ` <li class="nav-item">
    <a class="nav-link" id="result-tab" data-toggle="tab" href="#download" role="tab" aria-controls="result"
        aria-selected="false">Download</a>
</li>`
    myTabContent.innerHTML += `<div class="tab-pane fade" id="download" role="tabpanel" aria-labelledby="result-tab">
    <div class="container" id="result"></div>
</div>`
    $('#myTab a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    })
    
}
function showItems(path) {
    createTabs()
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
        if(error){
            console.error('('+provider.name+') request error: ' + url)
            console.error(error);
            toastr.error('('+provider.name+') request error!');
        } else {
            console.log('('+provider.name+') query finished!');
            toastr.success('('+provider.name+') query finished!');            
        }  
        let parser = new DOMParser();
        let xml = parser.parseFromString(body, 'text/html');
        let selector = (iteration == 1 ? provider.searchSelector : provider.downSelector);
        let list = xml.querySelectorAll(selector);
        let elements;
        if (iteration == 1) {
            document.getElementById(provider.name+'container').innerHTML = '';
            document.getElementById(provider.name+'container').innerHTML += list[0].outerHTML;
            elements = document.getElementById(provider.name+'container').querySelectorAll('a');
            // $('#myTab a[href="#profile"]').tab('show') // Select tab by name
        } else {
            document.getElementById('result').innerHTML = list[0].outerHTML;
            elements = document.getElementById('result').querySelectorAll('a');
            $('#myTab a[href="#download"]').tab('show') // Select tab by name
        }
        elements.forEach(element => {
            if(!provider.isJson){
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
            }
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
        document.getElementById('myModal').setAttribute('url', url);
        $('#myModal').modal('show')
    } else {
        try {
            if(provider && provider.isJson){
                var client = new net.Socket();
                var h = URL2.parse(url, true);
                client.connect(h.port, h.hostname, function() {
                    var data = 'GET '+h.path+ " HTTP/1.1\r\n"
                    data += "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3\r\n"
                    data += "Connection: keep-alive\r\n"
                    data += "Host: "+h.host+"\r\n"
                    data += "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36\r\n"
                    data += "Accept-Encoding: gzip, deflate\r\n"
                    data += "Accept-Language: ca-ES,ca;q=0.9,es-ES;q=0.8,es;q=0.7\r\n"
                    data += "\r\n"
                    client.write(data);
                })
                client.on('data', function(data) {
                    const lines = data.toString().split('\n');
                    lines.forEach(line => {
                        if(line.indexOf('Location:') == 0) {
                            url = line.substr(10);
                        }
                    });
                    client.destroy(); // kill client after server's response
                });
                client.on('close', function() {
                    if (isMagnetLink(url)) {
                        // play(url);
                        document.getElementById('myModal').setAttribute('url', url);
                        $('#myModal').modal('show')                
                    } else {
                        var steam = request(url).pipe(fs.createWriteStream(props.filename));
                        steam.on('finish', function () {
                            let path = require('path').resolve('.');
                            // play(path + '/' + props.filename);
                            document.getElementById('myModal').setAttribute('url', path + '/' + props.filename);
                            $('#myModal').modal('show')                    
                        })      
                    }          
                });
            } else {
                var steam = request(url).pipe(fs.createWriteStream(props.filename));
                steam.on('finish', function () {
                    let path = require('path').resolve('.');
                    document.getElementById('myModal').setAttribute('url', path + '/' + props.filename);
                    $('#myModal').modal('show')         
                    // play(path + '/' + props.filename);
                })      
            }
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
    return uri.protocol == 'file:' ? '' : uri.protocol + '//' + uri.host;
}