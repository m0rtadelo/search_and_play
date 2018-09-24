module.exports = {
    list: [
        {
            name: 'GranTorrent',
            searchUrl: 'https://grantorrent.net/?s=',
            searchSelector: 'div.contenedor-home',
            downSelector: 'table.demo',
            container: 'container1'
        },
        {
            name: 'EliteTorrent',
            searchUrl: 'https://www.elitetorrent.biz/?x=15&y=13&s=',
            searchSelector: 'ul.miniboxs',
            downSelector: 'div.enlace_descarga',
            container: 'container2'
        }
    ]
}