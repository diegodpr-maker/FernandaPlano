// Run after npm run build. Install Chromium with npx playwright install chromium,
// or set CHROMIUM_PATH to an existing executable. No real user data is used.
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { server } from '../server.mjs';
const sections=['hoje','plano','temas','questoes','caderno','desempenho','biblioteca','editais','config'];
const results=[];let browser;
const screenshotDir=process.env.DESIGN_SCREENSHOTS;
async function accessibility(page,label){
 const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 assert.deepEqual(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],label);
}
async function layout(page,label){
 const metrics=await page.evaluate(()=>{
  const buttons=[...document.querySelectorAll('button')];
  const tabs=[...document.querySelectorAll('.tab')].map(el=>el.getBoundingClientRect());
  return {overflow:document.documentElement.scrollWidth>innerWidth,
   smallButtons:buttons.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<44||r.height<44)}).map(el=>el.textContent),
   overlappingTabs:tabs.some((r,i)=>i&&r.left<tabs[i-1].right-1)};
 });
 assert.equal(metrics.overflow,false,label+' página sem transbordamento');
 assert.equal(metrics.overlappingTabs,false,label+' abas sem sobreposição');
 assert.deepEqual(metrics.smallButtons,[],label+' botões de pelo menos 44×44');
}
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true});
 if(screenshotDir)await fs.mkdir(screenshotDir,{recursive:true});
 for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,serviceWorkers:'block'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('#tab-hoje').waitFor();
  await page.waitForFunction(()=>!!localStorage.getItem('fr_plano_v1'));
  for(const section of sections){
   await page.locator(`#tab-${section}`).click();const label=`${width}/${theme}/${section}`;
   await layout(page,label);if(width===390)await accessibility(page,label);
   if(screenshotDir&&[390,1440].includes(width)&&section==='hoje')await page.screenshot({path:`${screenshotDir}/${width}-${theme}-hoje.png`,fullPage:true});
   results.push(label);
  }
  if(width===390){
   // Exercise saved state as well as first-use screens.
   await page.evaluate(()=>{
    const data=JSON.parse(localStorage.getItem('fr_plano_v1'));
    data.S.topics.slice(0,3).forEach(t=>{t.ck={aula:'2026-10-20',resumo:'2026-10-21',card:'2026-10-22'};t.rev={stage:1,last:'2026-10-22',next:'2026-10-29',n:2}});
    data.LOGS=data.S.topics.slice(0,5).map((t,i)=>({id:'demo-'+i,tp:t.id,a:t.a,d:'2026-11-07',dim:'G',t:20,c:12+i}));
    data.S.sims=[{id:'demo-sim',d:'2026-11-06',n:'Simulado de teste',sc:{CM:[20,15],CG:[20,12],GO:[20,16],PE:[20,18],MP:[20,13]}}];
    localStorage.setItem('fr_plano_v1',JSON.stringify(data));
   });
   await page.reload();await page.locator('#tab-hoje').waitFor();
   for(const section of sections){await page.locator(`#tab-${section}`).click();const label=`${width}/${theme}/${section}/populado`;await layout(page,label);await accessibility(page,label);results.push(label)}
   // Roving tab index and horizontal visibility.
   await page.locator('#tab-hoje').focus();await page.keyboard.press('End');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'tab-config');
   assert.equal(await page.locator('.tab[tabindex="0"]').count(),1);
   assert.ok(await page.locator('#tab-config').evaluate(el=>{const r=el.getBoundingClientRect(),nav=el.parentElement.getBoundingClientRect();return r.left>=nav.left-1&&r.right<=nav.right+1}));
   await page.keyboard.press('Home');
   await page.locator('[data-act="logq"]').first().click();
   const dialog=page.getByRole('dialog',{name:'Registrar questões'});await dialog.waitFor();
   assert.equal(await page.locator('main').evaluate(el=>el.inert),true);
   await accessibility(page,`${theme}/dialog`);results.push(`${theme}/dialog`);
   await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.act),'mclose');
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.q),'area');
   await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.act),'logq');
   assert.equal(await page.locator('main').evaluate(el=>el.inert),false);
   await page.locator('[data-act="ck"]').first().focus();await page.keyboard.press('Space');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.act),'ck');
   await page.locator('[data-act="topic"]').first().focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[],`${width}/${theme}: erros no navegador`);
  await context.close();console.log(`OK ${width}px / ${theme}`);
 }
 console.log(`OK ${results.length} estados verificados; teclado, foco, contraste, dimensões de toque e layout.`);
}finally{
 await browser?.close();await new Promise(resolve=>server.close(resolve));
}
