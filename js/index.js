const repoDetails = {
    github_api_url: "https://api.github.com/repos",
    username: "mohanen",
    repo_name: "cheatsheets",
}
const repo_url = repoDetails.github_api_url + "/" + repoDetails.username + "/" + repoDetails.repo_name;
const repo_content_url = repo_url + "/contents";

var vueFolder = new Vue({
    el: '#folders',
    data: { githubFolders: [], enabled: true }
})

var vueFile = new Vue({
    el: '#file',
    data: { md: "", enabled: false },
})

function updateHome() {
    axios
        .get(repo_content_url)
        .then(response => {
            vueFolder.githubFolders = [];
            response.data.forEach((folder, index) => {
                if (folder.type != "dir") {
                    return
                }
                var cur_idx = vueFolder.githubFolders.push(folder) - 1;
                axios
                    .get(folder.url)
                    .then(response => {
                        //console.log(vueFolder.githubFolders[cur_idx])
                        vueFolder.githubFolders[cur_idx].files = [];
                        response.data.forEach((file, file_index) => {
                            if (file.type == "file")
                                vueFolder.githubFolders[cur_idx].files.push(file)
                        })
                        vueFolder.$forceUpdate();
                    })
            });
        })
}

function openMd(mdFileUrl) {
    vueFolder.enabled = false;
    vueFile.enabled = true;

    axios
        .get(mdFileUrl)
        .then(response => {
            vueFile.md = response.data;
            //console.log(response.data);
            vueFile.$forceUpdate();
        })
}

function home() {
    vueFolder.enabled = true;
    vueFile.enabled = false;
    vueFile.md = "";
    updateHome();
}


// helper functions
const hf = {
    toSentenceCase: function (text) {
        var result = text.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    },
    toHeaderCase: text => (hf.toSentenceCase(text).toUpperCase()),
    toMdFileCase: text => (hf.toSentenceCase(text).slice(0, -".md".length)),
    /**
     * ASCII to Unicode (decode Base64 to original data)
     * @param {string} b64
     * @return {string}
    */
    base64ToUnicode: function (b64) {
        return decodeURIComponent(escape(atob(b64)));
    }
}

home();

