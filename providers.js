module.exports = {
    list: [
        {
            name: 'GranTorrent',
            searchUrl: 'https://grantorrent.net/?s=',
            searchSelector: 'div.contenedor-home',
            downSelector: 'table.demo'
        },
        {
            name: 'EliteTorrent',
            searchUrl: 'https://www.elitetorrent.one/?x=15&y=13&s=',
            searchSelector: 'ul.miniboxs',
            downSelector: 'div.enlace_descarga'
        },
        {
            name: 'Jacket',
            searchUrl: 'http://nas:9117/api/v2.0/indexers/all/results?apikey=euk502lw6vb8bvujdrrdtwh1ahqrkyva&Query=',
            isJson: true,
            filter: true,
        }
    ]
}