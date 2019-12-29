MathJax = {
    loader: {
        load: ['input/asciimath']
    },
    asciimath: {
        delimiters: [['$', '$']]
    }
};

const repoDetails = {
    github_api_url: "https://api.github.com/repos",
    username: "mohanen",
    repo_name: "cheatsheets",
}
const repo_url = repoDetails.github_api_url + "/" + repoDetails.username + "/" + repoDetails.repo_name;
const repo_content_url = repo_url + "/contents";

var mdit = window.markdownit({
    html: false,        // Enable HTML tags in source
    breaks: false,        // Convert '\n' in paragraphs into <br>
    linkify: true,        // Autoconvert URL-like text to links
    typographer: true,
    quotes: '“”‘’',
    highlight: function (/*str, lang*/) { return ''; }
});

var vueFolder = new Vue({
    el: '#folders',
    data: { githubFolders: [], enabled: true }
})

var vueFile = new Vue({
    el: '#file',
    data: { md: "", enabled: false },
    updated: function () {
        this.$nextTick(function () {
            // Code that will run only after the entire view has been re-rendered
            MathJax && MathJax.typeset &&  MathJax.typeset()
        })
    }
})

function updateHome() {
    axios
        .get(repo_content_url)
        .then(response => {
            response.data.forEach((folder, index) => {
                if (folder.type != "dir") {
                    return
                }
                var cur_idx = vueFolder.githubFolders.push(folder) - 1;
                axios
                    .get(folder.url)
                    .then(response => {
                        console.log(vueFolder.githubFolders[cur_idx])
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
            console.log(response.data);
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
}

home();