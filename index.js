const request = require('request');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const co = require('co');

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

    co(function*() {
        let allIssues = [];
        let pageNum = 1;
        let onePageIssues = yield _request(`?page=1`);
        while (onePageIssues.length) {
            allIssues = allIssues.concat(onePageIssues);
            pageNum++;
            onePageIssues = yield _request(`?page=${pageNum}`);
        }

        const sortedIssues = sortByTitle(allIssues);

        sortedIssues.forEach(createMarkdownByIssueItem);
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

    function _request(params) {
        return done => {
            request({
                url: `https://api.github.com/repos/${username}/${repo}/issues${params}`,
                    headers: {
                        'User-Agent': 'request'
                    }
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (!response || response.statusCode !== 200) {
                        reject('response code not 200');
                        return;
                    }

                    // sort by title
                    // const sortedIssues = sortByTitle(JSON.parse(body));

                    done(null, JSON.parse(body));
                });
        }
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
