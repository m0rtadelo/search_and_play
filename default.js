var providers = require('./providers')
var bis = require('./bussines');

document.getElementById("form").addEventListener('submit', (e) => {
    e.preventDefault();
    let search = document.getElementById('searchText').value;
    bis.log(`searching '${search}'...`);
    providers.list.forEach(provider => {
        bis.showUrl(provider.searchUrl + search, provider, 1);
    });
});