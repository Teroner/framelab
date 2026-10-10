import { workflows } from './workflows.js';
const form = document.querySelector('#brief-form');
const fields = ['problem', 'audience', 'action', 'features', 'materials'];
const status = document.querySelector('#form-status');
const output = document.querySelector('#output');
const storageKey = 'framelab.briefdesk.v3';
let drafts = {};
let activeKind = 'Сайт';
const storageStatus = document.querySelector('#storage-status');
function configure() {
 const flow=workflows[form.elements.kind.value] || workflows['Сайт'];
 fields.forEach((key,i)=> { document.querySelector(`[data-label="${key}"]`).textContent=flow.labels[i]; form.elements[key].placeholder=flow.hints[i]; });
 document.querySelector('#workflow-steps').replaceChildren(...flow.stages.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 document.querySelector('#acceptance').textContent=flow.acceptance;
 document.querySelector('#telegram').href=`https://t.me/Lumi_FrameLab_bot?start=${flow.telegramKey || flow.key}`;
}
const email = document.querySelector('#email');
const mailbox = 'mukarov.almuz@gmail.com';
// Long mailto links are cut by some mail apps; beyond this size the client pastes the copied brief.
function mailLink(text, kind) {
  const subject = encodeURIComponent(`Бриф FrameLab: ${kind}`);
  const body = encodeURIComponent(text);
  return body.length <= 7000 ? `mailto:${mailbox}?subject=${subject}&body=${body}`
    : `mailto:${mailbox}?subject=${subject}&body=${encodeURIComponent('Бриф длинный — вставьте сюда скопированный текст или приложите скачанный файл .md.')}`;
}
function invalidate() {
 if(!document.querySelector('#complete').hidden) {
 email.href=`mailto:${mailbox}`;
 document.querySelector('#copy').disabled=true; document.querySelector('#download').disabled=true;
 status.textContent='Ответы изменились. Соберите бриф заново перед передачей.';
 }
}

function values() {
  const data = Object.fromEntries(new FormData(form).entries());
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value).trim()]));
}
function updateProgress() {
  const data = values();
  document.querySelector('#progress').textContent = `${fields.filter(key => data[key]).length} / 5 ключевых ответов`;
  try { localStorage.setItem(storageKey, JSON.stringify({kind:activeKind,drafts:{...drafts,[activeKind]:data}})); storageStatus.textContent='Черновик сохранён в этом браузере.'; } catch { storageStatus.textContent='Сохранение недоступно. Скачайте бриф перед закрытием страницы.'; }
}
function briefText(data) {
  const flow=workflows[data.kind] || workflows['Сайт'];
  return `# Бриф: ${data.kind}\n\nКонтакт: ${data.name || 'Не указан'}\n\n` + fields.map((key,i)=>`## ${flow.labels[i]}\n${data[key]}`).join('\n\n') + `\n\n## Этапы\n${flow.stages.map((text,i)=>`${i+1}. ${text}`).join('\n')}\n\n## Критерий готовности\n${flow.acceptance}\n\n## Ограничения\nБюджет: ${data.budget || 'Нужно уточнить'}\nЖелаемая дата: ${data.deadline || 'Нужно уточнить'}\n\nОбъём, цену и срок подтверждает исполнитель. Бриф не является договором. Ничего не отправлено автоматически.`;
}
function restoreKind(kind) {
  activeKind = workflows[kind] ? kind : 'Сайт';
  form.reset(); form.elements.kind.value=activeKind;
  const data=drafts[activeKind] || {};
  for(const key of [...fields,'name','budget','deadline']) if(typeof data[key]==='string') form.elements[key].value=data[key];
  document.querySelector('#complete').hidden=true; document.querySelector('#empty').hidden=false;
  output.textContent=''; status.textContent=''; configure(); updateProgress();
}
let initialKind='Сайт';
try {
 const saved=JSON.parse(localStorage.getItem(storageKey) || '{}');
 if(saved.drafts && typeof saved.drafts==='object' && !Array.isArray(saved.drafts)) {drafts=saved.drafts;initialKind=saved.kind;}
 else {const old=JSON.parse(localStorage.getItem('framelab.briefdesk.v2') || '{}');if(workflows[old.kind]){drafts[old.kind]=old;initialKind=old.kind;}}
} catch {}
const selected=new URLSearchParams(location.search).get('service');
restoreKind(Object.keys(workflows).find(k=>workflows[k].key===selected) || initialKind);
form.addEventListener('input', event => {if(event.target===form.elements.kind)return; drafts[activeKind]=values(); updateProgress(); invalidate();});
form.elements.kind.addEventListener('change',()=>restoreKind(form.elements.kind.value));
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = values();
  const missing = fields.find(key => !data[key]);
  if (missing) { status.textContent = 'Заполните пять ключевых ответов, чтобы собрать бриф.'; form.elements.namedItem(missing).focus(); return; }
  output.textContent = briefText(data);
  email.href = mailLink(output.textContent, data.kind);
  document.querySelector('#copy').disabled=false; document.querySelector('#download').disabled=false;
  document.querySelector('#empty').hidden = true;
  document.querySelector('#complete').hidden = false;
  status.textContent = 'Бриф собран. Проверьте факты справа.';
});
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(output.textContent); status.textContent = 'Бриф скопирован.'; }
  catch { status.textContent = 'Копирование недоступно. Выделите текст брифа вручную.'; }
});
document.querySelector('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([output.textContent], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'framelab-brief.md'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Файл подготовлен. Проверьте загрузки браузера.';
});
document.querySelector('#clear').addEventListener('click', () => {
  if (!window.confirm('Очистить черновик брифа в этом браузере?')) return;
  delete drafts[activeKind]; restoreKind(activeKind); status.textContent='Черновик выбранной услуги очищен.';
});
