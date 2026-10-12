(function(){
 const menu=document.querySelector('[data-menu]'); const nav=document.querySelector('[data-nav]');
 if(menu&&nav){menu.addEventListener('click',()=>{const active=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(active));menu.textContent=active?'✕':'☰';});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';}));}
 const cases=[
  {title:'Дноуглубление и расчистка водоёма',desc:'Работы по удалению донных отложений и восстановлению технологических параметров водоёма. Технология уточняется после обследования объекта.',url:'services/dredging.html',subject:'Дноуглубление или расчистка водоёма'},
  {title:'Работы на слабых грунтах и заболоченных участках',desc:'Рассматриваем доступ специальной техники и способы выполнения работ там, где обычный экскаватор не может безопасно работать.',url:'services/amphibious.html',subject:'Работы на слабых грунтах'},
  {title:'Работы со шламом и шламонакопителями',desc:'Предварительно оцениваем состав материала, условия доступа, технологию извлечения и требования к дальнейшему обращению со шламом.',url:'services/sludge.html',subject:'Работы со шламом и шламонакопителями'},
  {title:'Свайные и шпунтовые работы с воды',desc:'Подбор технологической схемы для устройства свай или шпунтового ограждения в условиях ограниченного доступа к объекту.',url:'services/piling.html',subject:'Свайные и шпунтовые работы с воды'}
 ];
 const cards=document.querySelectorAll('[data-problem]');const title=document.querySelector('[data-answer-title]'),desc=document.querySelector('[data-answer-desc]'),link=document.querySelector('[data-answer-link]');
 function choose(i){if(!title)return;cards.forEach((c,j)=>{c.classList.toggle('is-active',j===i);c.setAttribute('aria-pressed',String(j===i));});const obj=cases[i];title.textContent=obj.title;desc.textContent=obj.desc;link.href=obj.url;link.dataset.subject=obj.subject;link.textContent=obj.url.indexOf('.html')>-1?'Подробнее об услуге ↗':'Описать задачу ↗';}
 if(cards.length){cards.forEach((el,i)=>el.addEventListener('click',()=>choose(i)));choose(0);}
 document.querySelectorAll('[data-subject]').forEach(el=>el.addEventListener('click',()=>{const subject=el.dataset.subject;const select=document.querySelector('#subject');if(select&&subject){const opt=[...select.options].find(x=>x.textContent===subject);if(opt)select.value=opt.value;else{const other=[...select.options].find(x=>x.value==='other');if(other)select.value='other';}const msg=document.querySelector('#details');if(msg&&!msg.value)msg.value='Тема: '+subject+'\n';}}));
 const requestedTopic=new URLSearchParams(window.location.search).get('topic');
 if(requestedTopic){const select=document.querySelector('#subject');if(select){const option=[...select.options].find(o=>o.textContent===requestedTopic);if(option)select.value=option.value;const details=document.querySelector('#details');if(details&&!details.value)details.value='Тема: '+requestedTopic+'\n';}}
 const form=document.querySelector('[data-demo-form]');
 if(form){form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const dataText=[
 'Запрос на предварительную оценку объекта',
 'Тип работ: '+(data.get('subject')||'Не определён'),
 'Регион: '+(data.get('region')||'Не указан'),
 'Организация: '+(data.get('company')||'Не указана'),
 'Контакт: '+(data.get('contact')||'Не указан'),
 'Описание: '+(data.get('details')||'Будет предоставлено дополнительно')
 ].join('\n');const result=document.querySelector('[data-result]');const out=document.querySelector('[data-result-text]');if(result&&out){out.textContent=dataText;result.classList.add('is-visible');result.scrollIntoView({behavior:'smooth',block:'nearest'});} });
 const copy=document.querySelector('[data-copy]');if(copy){copy.addEventListener('click',async()=>{const textContent=document.querySelector('[data-result-text]')?.textContent||'';try{await navigator.clipboard.writeText(textContent);copy.textContent='✓ Текст скопирован';setTimeout(()=>copy.textContent='Скопировать запрос',2300)}catch(e){const range=document.createRange(),node=document.querySelector('[data-result-text]');range.selectNodeContents(node);window.getSelection().removeAllRanges();window.getSelection().addRange(range);copy.textContent='Выделите текст и скопируйте';}});}}
})();
