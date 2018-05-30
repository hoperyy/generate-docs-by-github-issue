# How To Use

```
const path = require('path');
const generate = require('generate-docs-by-github-issue');

generate({
    targetDir: path.join(__dirname, 'docs'),
    username: 'xxx',
    repo: 'xxx',
    beforeSort(issues) {
        issues.forEach(issue => {
            issue.title = issue.title.replace(/\//g, '-');
        });
    }
    afterSort(issues) {
        issues.forEach(issue => {
            console.log(issue.title);
        })   
    }
});
```

# License

MIT