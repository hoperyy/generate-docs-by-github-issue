# How To Use

```
const path = require('path');
const generate = require('generate-docs-by-github-issue');

generate({
    targetDir: path.join(__dirname, 'docs'),
    username: 'xxx',
    repo: 'xxx',
    preWriting(issueItem) {
        issueItem.title = issueItem.title.replace(/\//g, '-');
    }
});
```

# License

MIT