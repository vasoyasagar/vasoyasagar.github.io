import{g as m,k as d,s as f}from"./main-SY1GX-J1.js";import"./modulepreload-polyfill-B5Qt9EMX.js";import"./mdxeditor-CaK79E-L.js";async function k(){if(await m("migrated_to_react"))return!1;const s=(await d()).filter(t=>String(t).startsWith("doc:"));let c=!1;for(const t of s){const n=await m(t);!n||!n.content||n.content.includes("<")&&n.content.includes(">")&&/<[a-z][\s\S]*>/i.test(n.content)&&(n.content=p(n.content),await f(t,n),c=!0)}return await f("migrated_to_react",!0),c}function p(o){const a=document.createElement("div");a.innerHTML=o;let s="";const c=t=>{var u;if(t.nodeType===Node.TEXT_NODE)return t.textContent||"";if(t.nodeType!==Node.ELEMENT_NODE)return"";const n=t.tagName.toLowerCase(),e=Array.from(t.childNodes).map(c).join("");switch(n){case"h1":return`# ${e.trim()}

`;case"h2":return`## ${e.trim()}

`;case"h3":return`### ${e.trim()}

`;case"p":return`${e.trim()}

`;case"br":return`
`;case"strong":case"b":return`**${e}**`;case"em":case"i":return`*${e}*`;case"code":return((u=t.parentElement)==null?void 0:u.tagName)==="PRE"?e:`\`${e}\``;case"pre":{const r=t.querySelector("code");return`\`\`\`
${(r?r.textContent:t.textContent).trim()}
\`\`\`

`}case"blockquote":return e.split(`
`).filter(Boolean).map(r=>`> ${r}`).join(`
`)+`

`;case"a":{const r=t.getAttribute("href")||"";return`[${e}](${r})`}case"mark":return`==${e}==`;case"s":case"del":return`~~${e}~~`;case"ul":return e+`
`;case"ol":return e+`
`;case"li":{const r=t.parentElement;if((r==null?void 0:r.tagName)==="OL")return`${Array.from(r.children).indexOf(t)+1}. ${e.trim()}
`;const i=t.querySelector('input[type="checkbox"]');if(i){const l=i.checked||i.hasAttribute("checked"),h=e.replace(/^\s*/,"").replace(/^[\[\]x ]+/,"");return`- [${l?"x":" "}] ${h.trim()}
`}return`- ${e.trim()}
`}case"hr":return`---

`;case"table":return g(t)+`

`;case"img":{const r=t.getAttribute("src")||"";return`![${t.getAttribute("alt")||""}](${r})`}case"div":return e+`
`;default:return e}};return s=Array.from(a.childNodes).map(c).join(""),s.replace(/\n{3,}/g,`

`).trim()+`
`}function g(o){const a=[];if(o.querySelectorAll("tr").forEach(c=>{const t=[];c.querySelectorAll("th, td").forEach(n=>{t.push(n.textContent.trim().replace(/\|/g,"\\|"))}),a.push(t)}),!a.length)return"";const s=[];s.push("| "+a[0].join(" | ")+" |"),s.push("| "+a[0].map(()=>"---").join(" | ")+" |");for(let c=1;c<a.length;c++)s.push("| "+a[c].join(" | ")+" |");return s.join(`
`)}export{p as htmlToMarkdown,k as migrateLegacyData};
