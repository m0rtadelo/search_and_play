const myTab = document.getElementById('myTab');
const myTabContent = document.getElementById('myTabContent');
let defaultSet;

function addTab(provider) {
    if (provider.type === 'folder' && !defaultSet){
        myTab.innerHTML += `<li class="nav-item"><a class="nav-link active" id="${provider.name}-tab" data-toggle="tab" href="#${provider.name}" role="tab" aria-controls="${provider.name}"aria-selected="false">${provider.name}</a></li>`;
        myTabContent.innerHTML += `<div class="tab-pane fade show active" id="${provider.name}" role="tabpanel" aria-labelledby="${provider.name}-tab"><div class="container" id="${provider.name}container"></div></div>`;
        defaultSet = true;
    } else {
        myTab.innerHTML += `<li class="nav-item"><a class="nav-link" id="${provider.name}-tab" data-toggle="tab" href="#${provider.name}" role="tab" aria-controls="${provider.name}"aria-selected="false">${provider.name}</a></li>`;
        myTabContent.innerHTML += `<div class="tab-pane fade" id="${provider.name}" role="tabpanel" aria-labelledby="${provider.name}-tab"><div class="container" id="${provider.name}container"></div></div>`;
    }
}

function addDownloadTab() {
    myTab.innerHTML += `<li class="nav-item"><a class="nav-link" id="result-tab" data-toggle="tab" href="#download" role="tab" aria-controls="result" aria-selected="false">Download</a></li>`;
    myTabContent.innerHTML += `<div class="tab-pane fade" id="download" role="tabpanel" aria-labelledby="result-tab"><div class="container" id="result"></div></div>`;
}
function renderTabs(providers) {
    myTab.innerHTML = '';
    myTabContent.innerHTML = '';
    defaultSet = false;
    providers.forEach(provider => {
        addTab(provider);
    })
    addDownloadTab();
    // add 'onClick' tab event listener
    $('#myTab a').on('click', function (e) {
        e.preventDefault()
        $(this).tab('show')
    })
}
module.exports = {
    renderTabs: renderTabs
}