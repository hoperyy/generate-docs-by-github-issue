const request = require('request');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

function writeFileSync(filePath, content) {
    fse.ensureFileSync(filePath);
    const fd = fs.openSync(filePath, 'w+');
    fs.writeFileSync(filePath, content);
    fs.close(fd);
}

function run({ targetDir, username, repo, preWriting }) {
    if (!username || !repo) {
        console.log('username and repo required');
        return;
    }

    if (!targetDir) {
        console.log('targetDir required (absolute path)');
        return;
    }

    const options = {
        url: `https://api.github.com/repos/${username}/${repo}/issues`,
        headers: {
            'User-Agent': 'request'
        }
    };

    _request()
        .then(sortedIssues => {
            // fse.removeSync(this.targetDir);
            sortedIssues.forEach(createMarkdownByIssueItem);
        })
        .catch(err => {
            throw Error(err);
        });

    function createMarkdownByIssueItem(issueItem) {
        if (preWriting) {
            preWriting(issueItem);
        }
        
        const title = issueItem.title;
        const targetMarkdown = path.join(targetDir, title) + '.md';

        let content = issueItem.body;

        content = `[issue](${issueItem.html_url})\n\n` + content;

        writeFileSync(targetMarkdown, content);
    }

    function _request() {
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!response || response.statusCode !== 200) {
                    reject('response code not 200');
                    return;
                }

                // sort by title
                const sortedIssues = sortByTitle(JSON.parse(body));

                resolve(sortedIssues);
                // console.log('body:', sortedIssues); // Print the HTML for the Google homepage.
            });
        });
    }

    function sortByTitle(issues) {
        const result = [];

        const titleMap = {}; // key: title, value: issueItem

        issues.forEach(issueItem => {
            if (!titleMap[issueItem.title]) {
                titleMap[issueItem.title] = issueItem;
            }
        });

        // sortedTitle
        const sortedTitle = issues.map(issueItem => issueItem.title).sort();

        sortedTitle.forEach(title => {
            result.push(titleMap[title]);
        });

        return result;
    }
}

module.exports = run;
