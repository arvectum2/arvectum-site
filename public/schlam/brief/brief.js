(()=>{'use strict';
const form=document.getElementById('objectForm'),out=document.getElementById('resultText'),pdf=document.getElementById('downloadPdf'),txt=document.getElementById('downloadText'),cp=document.getElementById('copy'),state=document.getElementById('liveStatus');
const menu=document.querySelector('.mobile-menu'),links=document.querySelector('.links');menu?.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.textContent=open?'×':'☰';menu.setAttribute('aria-expanded',String(open))});
const fmt=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2});
const value=(data,key)=>String(data.get(key)||'').trim();
const clean=(s)=>s.replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,1200);
let current='';
function make(){if(!form.reportValidity())return;const data=new FormData(form),name=key=>clean(value(data,key)),num=key=>{const s=value(data,key);if(!s)return null;const n=Number(s);return Number.isFinite(n)&&n>0?n:null};
const l=num('length'),w=num('width'),d=num('depth'),actual=num('volume'),geom=l&&w&&d?l*w*d:null;
const task=name('task');const questions=['Подтвердить границы объекта, допустимые сроки и требования к результату.','Получить планы, фото, геодезию/батиметрию и сведения об основаниях.','Проверить доступ и логистику техники, ограничения эксплуатации и безопасность.','Установить состав, статус и маршрут обращения с извлечённым материалом.','Выбрать технологическую схему только после инженерной проверки.'];
if(task.includes('шлам'))questions.unshift('Провести проверку состава осадка и требований к обезвоживанию/обращению.');
if(task.includes('шпунт'))questions.unshift('Запросить проект, геотехнику, линию шпунта, доступ плавсредств и допустимые вибрации.');
if(task.includes('грунтах'))questions.unshift('Оценить несущую способность, удельное давление, устойчивость и маршрут движения машины.');
const rows=['ТЕХНИЧЕСКИЙ ЗАПРОС / ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА','Дата: '+new Date().toLocaleDateString('ru-RU'),'Организация: '+(name('company')||'не указана'),'Регион: '+name('region'),'Объект: '+name('object'),'Задача: '+task,'Описание: '+(name('details')||'для уточнения'),'Желаемый срок: '+(name('deadline')||'не указан'),'','1. ИСХОДНАЯ ГЕОМЕТРИЯ',
'Длина: '+(l?fmt.format(l)+' м':'нет данных'),'Ширина: '+(w?fmt.format(w)+' м':'нет данных'),'Средняя толщина слоя: '+(d?fmt.format(d)+' м':'нет данных'),'Известный объём (по данным заявителя): '+(actual?fmt.format(actual)+' м³':'нет данных'),
'Условный объём прямоугольной призмы: '+(geom?fmt.format(geom)+' м³':'не рассчитывается — недостаточно данных'),
'Примечание: условная геометрия НЕ является проектным или сметным объёмом.','','2. ОГРАНИЧЕНИЯ',
'Доступ: '+name('access'),'Вода: '+name('water'),'Основание: '+name('ground'),'Эксплуатация: '+name('operation'),'Извлечённый материал: '+name('material'),'','3. ВОПРОСЫ ДЛЯ ИНЖЕНЕРНОЙ ПРОВЕРКИ',...questions.map((q,i)=>(i+1)+'. '+q),'','4. СТАТУС','Документ составлен автоматически на основе ответов посетителя. Нет технического заключения, обоснованной технологии, окончательной сметы или обещания выполнить работы.'];
current=rows.join('\n');out.textContent=current;[pdf,txt,cp].forEach(b=>b.disabled=false);state.textContent='Бриф сформирован. Можно сохранить как PDF или TXT.';out.closest('.preview').scrollIntoView({behavior:'smooth',block:'start'});}
form.addEventListener('submit',e=>{e.preventDefault();make()});
form.addEventListener('reset',()=>{current='';out.textContent='Заполните форму и нажмите «Сформировать инженерный бриф».';[pdf,txt,cp].forEach(b=>b.disabled=true);state.textContent=''});
pdf.addEventListener('click',()=>{if(current)window.print()});
txt.addEventListener('click',()=>{if(!current)return;const blob=new Blob([current],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='technicheskiy-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)});
cp.addEventListener('click',async()=>{if(!current)return;try{await navigator.clipboard.writeText(current);state.textContent='Текст скопирован.'}catch{state.textContent='Копирование недоступно: используйте TXT.'}});
})();