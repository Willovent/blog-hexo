const db = require("./old.json");
const { writeFileSync } = require("fs");
console.log(db.length);

db.forEach(article => {
  let file = `---
title: "${article.Title}"
date: '${new Date(article.PublicationDate).toISOString()}'
lang: fr
---
${article.MarkDownContent}
 `;
  writeFileSync(
    `./source/_posts/${article.Url.toLowerCase()}.md`,
    Buffer.from(file)
  );
});
