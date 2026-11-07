
import './caderno.js';
import { renderView, renderNavigation, renderDialog } from './renderer.jsx';
/* ============ DADOS-BASE ============ */
const AREAS={
  CM:{n:'Clínica Médica',s:'CM'}, CG:{n:'Cirurgia Geral',s:'CG'}, GO:{n:'Ginecologia e Obstetrícia',s:'GO'},
  PE:{n:'Pediatria',s:'PE'}, MP:{n:'Medicina Preventiva e Social',s:'MP'}
};
const AK=Object.keys(AREAS);
const DIMS={G:'Geral (sem separar)',D:'Diagnóstico',T:'Tratamento',F:'Quadro clínico / fisiopatologia',P:'Prevenção / seguimento'};
const DK=['D','T','F','P'];
const LADDER=[7,21,45,90,150,210];
/* inc: 3 alta, 2 média, 1 baixa (estimativa pelos temas citados nos editais e pelo padrão das bancas). E = tema citado na matriz do Enamed. I = costuma vir com imagem. */
const SEED={
CM:[
['Hipertensão arterial sistêmica',3,'E'],['Diabetes mellitus e complicações',3,'E'],
['Síndromes febris, pneumonia e síndromes gripais',3,'E'],['Arritmias, síncope e parada cardiorrespiratória',3,'EI'],
['Dor torácica e síndromes coronarianas agudas',3,'I'],['Insuficiência cardíaca',3,''],['Doenças da tireoide',3,'E'],
['Asma e DPOC',3,''],['Doenças infecciosas com exantema e arboviroses (dengue, chikungunya)',3,'E'],
['HIV/aids, tuberculose e infecções oportunistas',3,''],['Sepse e choque',3,''],
['Artrites e doenças reumatológicas',2,'E'],['Transtornos mentais e urgências psiquiátricas',2,'E'],
['Distúrbios hidroeletrolíticos, ácido-base e doença renal',2,''],['Anemias e distúrbios da coagulação',2,''],
['Hepatites, cirrose, DRGE e úlcera péptica',2,''],['AVC, cefaleias e epilepsia no adulto',2,'I'],
['Tromboembolismo venoso e embolia pulmonar',2,'I'],['Oftalmologia básica (olho vermelho)',1,'E'],['Dermatologia básica',1,'I']],
CG:[
['Atendimento inicial ao trauma (xABCDE) e choque',3,'E'],['Trauma torácico e abdominal',3,'EI'],
['Abdome agudo inflamatório (apendicite, colecistite, diverticulite, pancreatite)',3,'EI'],
['Pré, per e pós-operatório e avaliação de risco cirúrgico',3,'E'],['Doenças biliares benignas e litíase',3,'E'],
['Tumores do aparelho digestivo (esôfago, estômago, cólon, pâncreas)',3,'E'],
['Doenças urológicas benignas e tumores urológicos',3,'E'],
['Abdome agudo obstrutivo, perfurativo e vascular',2,'I'],['Hérnias da parede abdominal',2,''],
['Doenças anorretais',2,''],['Hemorragia digestiva alta e baixa',2,''],['Cirurgia pediátrica',2,'E'],
['Queimaduras',2,''],['Cirurgia vascular (AOCP, aneurismas, TVP)',2,''],
['Doenças esofágicas (DRGE, acalasia)',1,''],['Tireoide cirúrgica e cabeça e pescoço',1,''],
['Infecção de sítio cirúrgico, feridas e cicatrização',1,''],['Resposta metabólica ao trauma e nutrição cirúrgica',1,'']],
GO:[
['Pré-natal: consultas, exames e rastreamentos',3,'E'],['Síndromes hipertensivas na gestação',3,'E'],
['Assistência ao parto: mecanismo, partograma e analgesia',3,'E'],['Diabetes gestacional e doenças clínicas na gestação',3,''],
['Hemorragias da primeira metade (aborto, ectópica, mola)',3,'I'],
['Hemorragias da segunda metade e hemorragia pós-parto',3,''],
['Infecções na gestação (HIV, hepatites virais, sífilis, TORCH)',3,'E'],['Contracepção',3,'E'],
['Rastreamento do câncer de colo uterino e HPV',3,'E'],['Vulvovaginites e ISTs',3,'E'],
['Sangramento uterino anormal (PALM-COEIN)',3,'E'],['Amenorreia, SOP e hiperprolactinemia',3,'E'],
['Câncer de mama e doenças benignas da mama',3,'I'],
['Trabalho de parto prematuro, rotura de membranas e pós-termo',2,''],
['Endometriose, miomatose e dor pélvica',2,'I'],['Climatério e menopausa',2,''],
['Puerpério e lactação',2,''],['Vitalidade fetal, restrição de crescimento e gemelaridade',2,'I'],
['Câncer de endométrio e de ovário',2,''],['Infertilidade e ciclo menstrual',1,'']],
PE:[
['Crescimento e desenvolvimento',3,'E'],['Imunizações',3,'E'],['Aleitamento materno e nutrição infantil',3,'E'],
['Recém-nascido: reanimação, icterícia e triagem neonatal',3,'E'],['Infecções neonatais (sepse, TORCH)',3,'E'],
['Doenças respiratórias obstrutivas (bronquiolite, asma, crupe)',3,'E'],
['Diarreia aguda, desidratação e distúrbios hidroeletrolíticos',3,''],['Exantemas e doenças infecciosas da infância',3,'E'],
['Pneumonias e infecções de vias aéreas superiores',2,''],['Epilepsia, convulsão febril e neurologia pediátrica',2,'E'],
['Violência, maus-tratos e prevenção de acidentes',2,'E'],['Erros inatos do metabolismo e doenças genéticas',2,'E'],
['ITU, síndromes nefrítica e nefrótica',2,''],['Cardiopatias congênitas e febre reumática',2,'I'],
['Endocrinologia pediátrica (DM1, puberdade, baixa estatura)',2,''],['Emergências e intoxicações pediátricas',2,''],
['Prematuridade e displasia broncopulmonar',2,''],['Hematologia pediátrica',1,''],
['Gastroenterologia pediátrica (refluxo, celíaca, constipação)',1,''],['Adolescência',1,'']],
MP:[
['Ética médica e bioética',3,'E'],['Níveis de prevenção e promoção da saúde',3,'E'],
['Atenção primária e Estratégia Saúde da Família',3,'E'],['História, princípios e legislação do SUS',3,'E'],
['Indicadores de saúde e medidas de frequência',3,''],['Estudos epidemiológicos: tipos e vieses',3,'E'],
['Testes diagnósticos: sensibilidade, especificidade e valores preditivos',3,'E'],
['Epidemias, endemias, pandemias e vigilância epidemiológica',3,'E'],
['Medicina baseada em evidências: risco relativo, NNT e interpretação de estudos',3,''],
['Saúde do trabalhador',2,'E'],['Doenças de notificação compulsória',2,''],
['Saúde mental, álcool, tabaco e outras drogas',2,'E'],['Rastreamento e check-up',2,''],
['Determinantes sociais, PNAB e financiamento do SUS',2,''],['Atenção ao idoso e cuidados paliativos',1,''],
['Bioestatística básica',1,'']]
};
function seedTopics(){
  const out=[];
  AK.forEach(a=>SEED[a].forEach((r,i)=>out.push({id:a+String(i+1).padStart(2,'0'),a,n:r[0],inc:r[1],e:r[2].includes('E'),img:r[2].includes('I'),ck:{aula:null,resumo:null,card:null},rev:null,note:''})));
  return out;
}

/* ============ DATAS ============ */
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const diffDays=(a,b)=>Math.round((parse(a)-parse(b))/86400000);
const today=()=>iso(new Date());
const fmt=s=>{if(!s)return '';const d=parse(s);return pad(d.getDate())+'/'+pad(d.getMonth()+1)};
const fmtY=s=>{if(!s)return '';const d=parse(s);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()};
const mondayOf=s=>{const d=parse(s);const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return iso(d)};

/* ============ ESTADO ============ */
let S=null;        // estado principal
let LOGS=[];       // registros de questões
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function newState(){
  const topics=seedTopics();
  const start=mondayOf(addDays(today(),(new Date().getDay()===1)?0:7)); // próxima segunda (ou hoje, se for segunda)
  return {v:4,start,exam:EXAM_PADRAO,meta:75,hw:3,hf:5,topics,plan:genPlan(topics,planDims(start,EXAM_PADRAO)),sims:[],imgs:[],logMonths:[],wt:{},caderno:[],cadCfg:{intervalosCaderno:[1,3,7,14,30,60,90]}};
}
const EXAM_PADRAO='2027-09-12'; // estimativa: ENAMED/ENARE 2026 foram em 13/09/2026
/* Semanas do plano: `ew` = semana da prova de referência; `tot` = até 31/12 do ano da prova (intensivão final). */
function planDims(start,exam){
  const ex=exam||EXAM_PADRAO;
  const ew=Math.max(16,Math.ceil(diffDays(ex,start)/7));
  const fim=ex.slice(0,4)+'-12-31';
  const tot=Math.max(ew+4,Math.ceil(diffDays(fim,start)/7));
  return {ew,tot};
}
/* Estrutura (com os números padrão: 44 semanas até a prova e 60 até o fim do ano):
   Fase 1  primeira passada: 3 temas por semana, com uma semana de revisão a cada 5;
   Fase 2  aprofundamento: temas de maior incidência, uma lista por semana;
   Fase 3  simulados e a semana da prova;
   Fase 4  intensivão: uma área por semana, só revisão e questões, com simulado de tempos em tempos. */
function genPlan(topics,d){
  d=d||{ew:44,tot:60};
  const groups={3:[],2:[],1:[]};
  [3,2,1].forEach(inc=>{
    const b={};AK.forEach(a=>b[a]=topics.filter(t=>t.inc===inc&&t.a===a).map(t=>t.id));
    let left=true;
    while(left){left=false;AK.forEach(a=>{if(b[a].length){groups[inc].push(b[a].shift());left=true}})}
  });
  const order=[...groups[3],...groups[2],...groups[1]];
  const pre=d.ew-1; // semanas antes da semana da prova
  // Cada semana de revisão lista os temas estudados desde a revisão anterior.
  const build=(n,every)=>{const p=[];let k=0,acc=[];
    for(let i=0;i<order.length;i+=n){const ids=order.slice(i,i+n);p.push({k:'new',t:ids,r:[]});acc=acc.concat(ids);k++;
      if(k%every===0&&i+n<order.length){p.push({k:'rev',t:[],r:acc});acc=[]}}
    p.push({k:'rev',t:[],r:acc});return p};
  let plan=build(3,5);
  for(const [n,ev] of [[3,5],[4,5],[5,6],[6,6],[8,6]]){plan=build(n,ev);if(plan.length<=pre-4)break}
  const rem=Math.max(0,pre-plan.length);
  const simN=Math.floor(rem/2),deepN=rem-simN;
  const alta=groups[3];
  for(let j=0;j<deepN;j++)plan.push({k:'deep',t:[],r:alta.slice(j*6,j*6+6)});
  for(let j=0;j<simN;j++)plan.push({k:'sim',t:[],r:[],q:simN>1?60+Math.round(j*40/(simN-1)):100});
  plan.push({k:'prova',t:[],r:[]});
  // Intensivão final: uma área por semana (todas as áreas em rodízio) e simulado a cada 6 semanas.
  const n=Math.max(0,d.tot-plan.length);
  const porArea={};AK.forEach(a=>{porArea[a]=topics.filter(t=>t.a===a).sort((x,y)=>y.inc-x.inc).map(t=>t.id)});
  let ai=0;
  for(let j=0;j<n;j++){
    if((j+1)%6===0||j===n-1)plan.push({k:'sim',t:[],r:[],q:100});
    else{const a=AK[ai++%AK.length];plan.push({k:'int',a,t:[],r:porArea[a]})}
  }
  return plan;
}
/* Quem abriu uma versão anterior do plano recebe a estrutura nova. Marcações de temas, questões e imagens ficam. */
function migratePlan(){
  if((S.v||1)<4||!Array.isArray(S.plan)||!S.plan.every(w=>Array.isArray(w.r))){
    S.plan=genPlan(S.topics,planDims(S.start,S.exam));S.wt={};S.v=4;touch('state');
  }
}
/* Resumo das fases para o topo da aba Plano. */
function planResumo(){
  const f={};
  S.plan.forEach((w,i)=>{const p=phaseOf(i);if(!f[p])f[p]=[i,i];f[p][1]=i});
  return '<div class="small" style="margin-bottom:10px">'+Object.keys(f).map(p=>`<div><b>${PH[p]}</b>: semanas ${f[p][0]+1} a ${f[p][1]+1} (${fmt(weekStart(f[p][0]))} a ${fmt(addDays(weekStart(f[p][1]),6))})</div>`).join('')+'</div>';
}
// Rotina da semana de temas novos: 2 tarefas por tema (estudar e fixar) distribuídas pelos dias.
function newWeekRows(w,hw,hf){
  const ts=w.t.map(id=>T(id)).filter(Boolean);
  const tasks=[];
  ts.forEach(t=>{tasks.push(`${esc(t.n)}: aula e resumo à mão`);tasks.push(`${esc(t.n)}: card ou ficha e 15 a 20 questões`)});
  const days=[['Seg',hw,1],['Ter',hw,2],['Qua',hw,1],['Qui',hw,2],['Sex',hw,1],['Sáb',hf,3]];
  const rows=[];let i=0;
  days.forEach(([d,h,cap])=>{
    const items=[];while(items.length<cap&&i<tasks.length)items.push(tasks[i++]);
    if(d==='Sáb')items.push('Revisões vencidas e caderno de erros');
    rows.push([d,h,items.join('<br>')||'Revisões vencidas e caderno de erros']);
  });
  rows.push(['Dom',hf,'Opcional: revisões atrasadas, mapa mental ou descanso']);
  return rows;
}
function phaseOf(i){const k=S.plan[i].k;const pi=S.plan.findIndex(x=>x.k==='prova');if(pi>=0&&i>pi)return 4;return k==='deep'?2:(k==='sim'||k==='prova')?3:1}
const PH={1:'Fase 1 · Primeira passada',2:'Fase 2 · Aprofundamento',3:'Fase 3 · Simulados e prova',4:'Fase 4 · Intensivão final'};
const T=id=>S.topics.find(t=>t.id===id);
const weekStart=i=>addDays(S.start,i*7);
function curWeek(){const d=diffDays(today(),S.start);return Math.min(S.plan.length-1,Math.max(0,Math.floor(d/7)))}

/* ============ PERSISTÊNCIA ============ */
let MODE='local',COL=null;
const dirty=new Set();let saving=false,saveTimer=null;
function setSave(st){const el=document.getElementById('saveState');if(!el)return;
  el.className='save'+(st==='err'?' err':'');
  el.textContent=st==='pend'?'Salvando…':st==='err'?'Não foi possível salvar. Tente de novo':(MODE==='cloud'?'Salvo na sua conta':'Salvo neste aparelho');}
function touch(...keys){keys.forEach(k=>dirty.add(k));clearTimeout(saveTimer);setSave('pend');saveTimer=setTimeout(flush,500)}
function logKey(d){return 'logs_'+d.slice(0,7)}
async function flush(){
  if(saving){saveTimer=setTimeout(flush,300);return}
  saving=true;
  try{
    if(MODE==='cloud'){
      for(const k of [...dirty]){
        dirty.delete(k);
        if(k==='state')await COL.doc('state').set(S);
        else if(k.startsWith('logs_')){const m=k.slice(5);await COL.doc(k).set({items:LOGS.filter(l=>l.d.slice(0,7)===m)})}
      }
    }else{
      dirty.clear();
      localStorage.setItem('fr_plano_v1',JSON.stringify({S,LOGS}));
    }
    setSave('ok');
  }catch(e){console.error(e);setSave('err');dirty.add('state')}
  saving=false;
  if(dirty.size&&!saveTimer)saveTimer=setTimeout(flush,800);
}
const saveAll=()=>{S.logMonths=[...new Set(LOGS.map(l=>l.d.slice(0,7)))].sort();touch('state')};
function saveLogs(d){const m=logKey(d);if(!S.logMonths.includes(m.slice(5))){S.logMonths.push(m.slice(5));S.logMonths.sort()}touch('state',m)}

/* imagens */
const IMGC=new Map();
let idb=null;
function idbOpen(){return new Promise((res,rej)=>{if(idb)return res(idb);const r=indexedDB.open('fr_plano_img',1);r.onupgradeneeded=()=>r.result.createObjectStore('i');r.onsuccess=()=>{idb=r.result;res(idb)};r.onerror=()=>rej(r.error)})}
async function idbOp(mode,fn){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction('i',mode);const rq=fn(tx.objectStore('i'));tx.oncomplete=()=>res(rq?.result);tx.onerror=()=>rej(tx.error)})}
async function putImg(id,data){IMGC.set(id,data);if(MODE==='cloud')await COL.doc('img_'+id).set({d:data});else await idbOp('readwrite',s=>s.put(data,id))}
async function getImg(id){
  if(IMGC.has(id))return IMGC.get(id);
  try{
    let d=null;
    if(MODE==='cloud'){const s=await COL.doc('img_'+id).get();d=s.exists?s.data().d:null}
    else d=await idbOp('readonly',s=>s.get(id));
    if(d)IMGC.set(id,d);return d;
  }catch(e){return null}
}
async function delImg(id){IMGC.delete(id);try{if(MODE==='cloud')await COL.doc('img_'+id).delete();else await idbOp('readwrite',s=>s.delete(id))}catch(e){}}

async function loadAll(){
  const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
  let cloudOk=false,warn='';
  try{
    if(window.claude&&window.claude.use){
      const [db,user]=await withTimeout(Promise.all([window.claude.use('db'),window.claude.use('user')]),10000);
      const id=user?await user.id():null;
      if(db&&id){
        COL=db.collection('data/users/'+id);MODE='cloud';
        const snap=await withTimeout(COL.doc('state').get(),10000);
        if(snap.exists){
          S=snap.data();
          const res=await withTimeout(Promise.all((S.logMonths||[]).map(m=>COL.doc('logs_'+m).get())),10000);
          LOGS=res.flatMap(r=>r.exists?(r.data().items||[]):[]);
        }
        cloudOk=true;
      }
    }
  }catch(e){console.error(e);warn='Não consegui falar com a sua conta agora. Estou usando o armazenamento deste aparelho, que não aparece em outros aparelhos.';MODE='local';COL=null}
  if(!cloudOk){
    MODE='local';
    try{const raw=localStorage.getItem('fr_plano_v1');if(raw){const o=JSON.parse(raw);S=o.S;LOGS=o.LOGS||[]}}catch(e){}
    if(!warn&&!(window.claude&&window.claude.use))warn='';
  }
  if(!S){S=newState();LOGS=[];touch('state')}
  S.wt=S.wt||{};S.sims=S.sims||[];S.imgs=S.imgs||[];S.logMonths=S.logMonths||[];S.exam=S.exam||EXAM_PADRAO;S.caderno=S.caderno||[];S.cadCfg=S.cadCfg||{intervalosCaderno:[1,3,7,14,30,60,90]};migratePlan();
  return warn;
}

/* ============ CÁLCULOS ============ */
function agg(fn){let t=0,c=0;for(const l of LOGS)if(fn(l)){t+=l.t;c+=l.c}return{t,c,p:t?c/t:null}}
function areaOfTopic(id){return T(id)?.a}
function areaAgg(a){
  let t=0,c=0;
  for(const l of LOGS){if(logArea(l)===a){t+=l.t;c+=l.c}}
  for(const s of S.sims){const v=s.sc[a];if(v){t+=v[0];c+=v[1]}}
  return{t,c,p:t?c/t:null};
}
function areaDim(a,dm){return agg(l=>logArea(l)===a&&l.dim===dm)}
function topicAgg(id){return agg(l=>l.tp===id)}
function topicDim(id,dm){return agg(l=>l.tp===id&&l.dim===dm)}
function status(p,n,min=8){
  if(p==null||n<min)return 'na';
  const m=S.meta/100;return p>=m?'ok':p>=m-0.15?'mid':'low';
}
const pc=p=>p==null?'–':Math.round(p*100)+'%';
const STL={ok:'Bem',mid:'Atenção',low:'Reforçar',na:'Poucos dados'};
function chipP(a,min){const st=status(a.p,a.t,min);return `<span class="chip ${st==='na'?'':st}" title="${a.c}/${a.t} questões">${pc(a.p)}${a.t?` · ${a.t}q`:''}</span>`}
const doneCount=t=>['aula','resumo','card'].filter(k=>t.ck[k]).length;
const isDone=t=>doneCount(t)===3;

/* revisão espaçada */
function applySession(t,d,total,correct){
  let msg='';
  if(!t.rev){t.rev={stage:0,last:d,next:addDays(d,LADDER[0]),n:0};}
  const r=t.rev;
  if(total<5){return `Poucas questões (${total}) para ajustar o intervalo. Faça pelo menos 5 para o plano reagir. Próxima revisão: ${fmtY(r.next)}.`}
  const a=correct/total;const old=r.stage;
  if(a>=0.95&&total>=10)r.stage=Math.min(LADDER.length-1,r.stage+2);
  else if(a>=0.85)r.stage=Math.min(LADDER.length-1,r.stage+1);
  else if(a>=0.70){/* mantém */}
  else if(a>=0.50)r.stage=Math.max(0,r.stage-1);
  else r.stage=0;
  r.last=d;r.n=(r.n||0)+1;
  r.next=a<0.5?addDays(d,3):addDays(d,LADDER[r.stage]);
  const gap=a<0.5?3:LADDER[r.stage];
  if(a>=0.85)msg=`${pc(a)}: bom desempenho. Intervalo espaçado: próxima revisão em ${gap} dias (${fmtY(r.next)}).`;
  else if(a>=0.70)msg=`${pc(a)}: razoável. Mantive o intervalo em ${gap} dias (${fmtY(r.next)}).`;
  else if(a>=0.50)msg=`${pc(a)}: abaixo do ideal. Encurtei para ${gap} dias (${fmtY(r.next)}).`;
  else msg=`${pc(a)}: tema fraco. Revisão em 3 dias (${fmtY(r.next)}) e vale rever o resumo antes de refazer questões.`;
  return msg;
}
function dueList(){const td=today();return S.topics.filter(t=>t.rev&&t.rev.next<=td).sort((a,b)=>a.rev.next.localeCompare(b.rev.next))}
function upcoming(days){const td=today(),lim=addDays(td,days);return S.topics.filter(t=>t.rev&&t.rev.next>td&&t.rev.next<=lim).sort((a,b)=>a.rev.next.localeCompare(b.rev.next))}

function weakTopics(n=6){
  return S.topics.map(t=>({t,g:topicAgg(t.id)})).filter(x=>x.g.t>=5).sort((a,b)=>a.g.p-b.g.p).slice(0,n);
}

function insights(){
  const out=[];const m=S.meta/100;
  AK.forEach(a=>{
    const g=areaAgg(a);if(g.t<15)return;
    const ds=DK.map(d=>({d,g:areaDim(a,d)})).filter(x=>x.g.t>=8);
    if(ds.length>=2){
      ds.sort((x,y)=>y.g.p-x.g.p);const best=ds[0],worst=ds[ds.length-1];
      if(best.g.p-worst.g.p>=0.15)out.push({a,txt:`<b>${AREAS[a].n}:</b> você vai bem em ${DIMS[best.d].toLowerCase()} (${pc(best.g.p)}), mas ${DIMS[worst.d].toLowerCase()} está em ${pc(worst.g.p)}. Concentre as próximas questões nesse tipo de pergunta.`,sev:2});
    }
    if(g.p<m-0.15)out.push({a,txt:`<b>${AREAS[a].n}</b> está em ${pc(g.p)}, bem abaixo da meta de ${S.meta}%. Priorize esta área nas semanas de revisão.`,sev:3});
    else if(g.p>=m&&g.t>=40)out.push({a,txt:`<b>${AREAS[a].n}</b> está em ${pc(g.p)}, acima da meta. Dá para espaçar mais as revisões e investir o tempo em outras áreas.`,sev:0});
  });
  const wk=weakTopics(3).filter(x=>x.g.p<m);
  if(wk.length)out.push({a:null,txt:`Temas que mais puxam a nota para baixo: ${wk.map(x=>`<b>${esc(x.t.n)}</b> (${pc(x.g.p)})`).join('; ')}.`,sev:3});
  const od=dueList().filter(t=>diffDays(today(),t.rev.next)>7).length;
  if(od>=5)out.push({a:null,txt:`Há ${od} revisões com mais de uma semana de atraso. Vale zerar isso antes de abrir temas novos.`,sev:3});
  return out.sort((a,b)=>b.sev-a.sev);
}

/* ============ UI BÁSICA ============ */
let VIEW='hoje',WK=null,TF={a:'',q:'',s:''},LIBF={a:'',t:'',tag:''};
const TABS=[['hoje','Hoje'],['plano','Plano'],['temas','Temas'],['questoes','Questões'],['caderno','Caderno de Erros'],['desempenho','Desempenho'],['biblioteca','Biblioteca'],['editais','Editais'],['config','Ajustes']];
function renderTabs(){renderNavigation(TABS, VIEW)}
let toastT=null;
function toast(msg,ms=4200){const el=document.getElementById('toast');el.textContent=msg;el.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>el.style.display='none',ms)}
function openModal(html,wide){renderDialog(`<div class="modal-bg" data-act="mbg"><div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${html}</div></div>`) }
function closeModal(){renderDialog('')}
function ask(msg,okLabel,cb){
  openModal(`<h3>${esc(msg)}</h3><div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" id="askok">${esc(okLabel)}</button></div>`);
  document.getElementById('askok').onclick=()=>{closeModal();cb()};
}
function render(){
  renderTabs();
  const m=document.getElementById('main');
  const fn={hoje:vHoje,plano:vPlano,temas:vTemas,questoes:vQuestoes,caderno:vCaderno,desempenho:vDesempenho,biblioteca:vBiblioteca,editais:vEditais,config:vConfig}[VIEW];
  renderView(fn());
  if(VIEW==='biblioteca')hydrateImgs();
}
function areaChip(a){return `<span class="chip area a-${a}">${AREAS[a].s}</span>`}
function incChip(t){return `<span class="inc ${t.inc===3?'h':''}" title="Incidência estimada em provas">${t.inc===3?'alta':t.inc===2?'média':'baixa'}</span>`+(t.e?' <span class="inc" title="Tema citado na matriz do Enamed">Enamed</span>':'')+(t.img?' <span class="inc" title="Costuma vir com imagem (ECG, exame de imagem, foto)">imagem</span>':'')}
function ckBtn(t,k,label){return `<button class="ck" aria-pressed="${!!t.ck[k]}" data-act="ck" data-id="${t.id}" data-k="${k}" title="${t.ck[k]?'Feito em '+fmtY(t.ck[k]):''}"><i></i>${label}</button>`}
function topicBlock(t){
  const g=topicAgg(t.id);
  return `<div class="trow"><div class="grow"><div class="nm" data-act="topic" data-id="${t.id}">${areaChip(t.a)} ${esc(t.n)}</div><div class="small muted" style="margin-top:3px">${incChip(t)}</div></div>
  <div>${g.t?chipP(g,5):'<span class="chip">sem questões</span>'}</div>
  <div class="checks" style="grid-column:1/-1">${ckBtn(t,'aula','Assisti a aula')}${ckBtn(t,'resumo','Resumo à mão')}${ckBtn(t,'card','Card / ficha')}<button class="btn sm" data-act="logq" data-id="${t.id}">Registrar questões</button>${t.rev?`<span class="small muted" style="align-self:center">revisão: ${fmt(t.rev.next)}</span>`:''}</div></div>`;
}

/* ============ HOJE ============ */
function vHoje(){
  const wi=curWeek(),w=S.plan[wi],td=today();
  const started=diffDays(td,S.start)>=0;
  const done=S.topics.filter(isDone).length;
  const tot=agg(()=>true);
  const due=dueList();
  const head=started?`Semana ${wi+1} de ${S.plan.length} · ${PH[phaseOf(wi)]} · prova de referência em ${fmtY(S.exam)} (${diffDays(S.exam,td)} dias${S.exam===EXAM_PADRAO?", estimada":""})`:`O plano começa em ${fmtY(S.start)} (segunda). Dá para adiantar o que quiser.`;
  let h=`${backupBanner()}<div><h2>Olá, Fernanda</h2><div class="muted">${head}</div><div class="row" style="margin-top:10px"><button class="btn pri" data-act="logq" data-id="" style="min-height:48px;font-size:16px">Registrar questões</button></div></div>
  <div class="tiles">
   <div class="tile"><div class="v">${done}/${S.topics.length}</div><div class="l">temas com aula, resumo e card</div></div>
   <div class="tile"><div class="v">${tot.t}</div><div class="l">questões feitas</div></div>
   <div class="tile"><div class="v">${pc(tot.p)}</div><div class="l">acerto geral (meta ${S.meta}%)</div></div>
   <div class="tile"><div class="v" style="color:${due.length?'var(--low)':'var(--ok)'}">${due.length}</div><div class="l">revisões para hoje</div></div>
   <div class="tile"><div class="v" style="color:${cadDue()?'var(--low)':'var(--ok)'}">${cadDue()}</div><div class="l">revisões do Caderno de Erros</div></div>
  </div>`;
  h+=`<div class="card"><h3>Revisões de hoje</h3>`;
  if(!due.length){const up=upcoming(7);h+=`<div class="muted">Nenhuma revisão vencida. ${up.length?`Nos próximos 7 dias: ${up.slice(0,4).map(t=>esc(t.n)+' ('+fmt(t.rev.next)+')').join('; ')}${up.length>4?'…':''}.`:'As revisões aparecem aqui 7 dias depois que você concluir aula, resumo e card de um tema.'}</div>`}
  else{
    h+=`<div class="small muted" style="margin-bottom:6px">Faça questões do tema e registre o resultado: o intervalo da próxima revisão se ajusta sozinho. Se só releu o resumo, use Fácil, Ok ou Difícil.</div>`;
    due.slice(0,12).forEach(t=>{const late=diffDays(td,t.rev.next);
      h+=`<div class="trow"><div class="grow"><div class="nm" data-act="topic" data-id="${t.id}">${areaChip(t.a)} ${esc(t.n)}</div><div class="small muted">${late>0?`atrasada ${late} dia${late>1?'s':''}`:'vence hoje'} · ${t.rev.n||0} revisão(ões) feitas</div></div>
      <div class="row"><button class="btn sm pri" data-act="logq" data-id="${t.id}">Registrar questões</button></div>
      <div class="row" style="grid-column:1/-1"><span class="small muted">Só reli:</span><button class="btn sm" data-act="quickrev" data-id="${t.id}" data-r="1">Fácil</button><button class="btn sm" data-act="quickrev" data-id="${t.id}" data-r="0">Ok</button><button class="btn sm" data-act="quickrev" data-id="${t.id}" data-r="-1">Difícil</button></div></div>`});
    if(due.length>12)h+=`<div class="small muted" style="margin-top:6px">Mostrando 12 das ${due.length}. As mais atrasadas vêm primeiro.</div>`;
  }
  h+=`</div>`;
  h+=`<div class="card"><div class="row sp"><h3>Esta semana</h3><button class="btn sm" data-act="gowk" data-i="${wi}">Abrir semana</button></div>`;
  if(w.k==='new')h+=w.t.map(id=>topicBlock(T(id))).join('');
  else h+=weekExtra(wi);
  h+=`</div>`;
  return h;
}

/* ============ PLANO ============ */
function weekTitle(i){const w=S.plan[i];
  if(w.k==='new')return w.t.map(id=>T(id)?.n).filter(Boolean).join(' · ');
  if(w.k==='rev')return 'Semana de revisão e fôlego';
  if(w.k==='deep')return 'Aprofundamento nos temas de maior incidência';
  if(w.k==='prova')return 'Semana da prova de referência: revisão leve e descanso';
  if(w.k==='int')return `Intensivão: ${AREAS[w.a].n}`;
  return `Simulado completo · ${w.q} questões`;
}
function weekPct(i){
  const w=S.plan[i];
  if(w.k==='new'){const ts=w.t.map(T).filter(Boolean);const n=ts.length*3;const d=ts.reduce((s,t)=>s+doneCount(t),0);return n?d/n:0}
  const keys=weekTaskKeys(i);const d=keys.filter(k=>S.wt[i+':'+k[0]]).length;return keys.length?d/keys.length:0;
}
function weekTaskKeys(i){const w=S.plan[i];
  if(w.k==='rev')return [['rv','Zerar as revisões vencidas'],['sm','Simulado misto de 30 questões'],['ce','Reler o caderno de erros'],['wk','Refazer resumo ou card dos 2 temas mais fracos']];
  if(w.k==='deep')return [['rv','Zerar as revisões vencidas'],['q1','20 questões em cada tema da lista'],['ce','Reler o caderno de erros'],['mm','Montar ou revisar um mapa mental de um tema fraco']];
  if(w.k==='sim')return [['sm',`Fazer o simulado de ${w.q} questões em bloco cronometrado`],['rg','Registrar o resultado em Questões, aba Simulados'],['co','Corrigir e anotar cada erro no caderno de erros'],['rv','Zerar as revisões vencidas']];
  if(w.k==='int')return [['rv','Zerar as revisões vencidas'],['qa','150 questões mistas da área, corrigidas na hora'],['ce','Rever o caderno de erros da área'],['fc','Reler fichas e resumos dos temas mais fracos'],['sa','Simulado da área (30 questões) no domingo']];
  if(w.k==='prova')return [['fc','Reler fichas e o caderno de erros'],['lg','Conferir local, horário e documentos da prova'],['sn','Dormir bem e não estudar conteúdo novo']];
  return [['ce','Reler o caderno de erros da semana']];
}
function topicRow(t){
  const g=topicAgg(t.id);
  return `<div class="row" style="margin-top:6px"><span class="grow"><a href="#" data-act="topic" data-id="${t.id}" style="color:inherit">${areaChip(t.a)} ${esc(t.n)}</a> ${g.t?chipP(g,5):'<span class="chip">sem questões</span>'}</span><button class="btn sm" data-act="logq" data-id="${t.id}">Registrar questões</button></div>`;
}
function weekExtra(i){
  const w=S.plan[i];let h='';
  if(w.k==='deep'||w.k==='int'||(w.k==='rev'&&(w.r||[]).length)){
    const lista=(w.r||[]).map(T).filter(Boolean);
    h+=`<div class="ins"><b>${w.k==='int'?'Temas desta área, dos mais cobrados para os menos cobrados':w.k==='rev'?'Temas das semanas anteriores para revisar':'Temas de alta incidência para reforçar'}</b>${lista.map(topicRow).join('')||'<div class="muted small">Nenhum tema nesta lista.</div>'}</div>`;
    const wk=weakTopics(30).filter(x=>(w.k!=='int'||x.t.a===w.a)&&!lista.includes(x.t)).slice(0,5);
    if(wk.length)h+=`<div class="ins"><b>Pontos fracos pelo seu desempenho</b>${wk.map(x=>topicRow(x.t)).join('')}</div>`;
    else if(!lista.length)h+=`<div class="muted small">Registre questões para esta lista se montar sozinha.</div>`;
  }
  const keys=weekTaskKeys(i);
  h+=keys.map(([k,l])=>`<div class="ins"><button class="ck" aria-pressed="${!!S.wt[i+':'+k]}" data-act="wt" data-i="${i}" data-k="${k}"><i></i>${esc(l)}</button></div>`).join('');
  return h;
}
function dayTable(i){
  const w=S.plan[i],hw=S.hw,hf=S.hf;let rows;
  const ts=(w.r||[]).map(T).filter(Boolean);
  const DIAS=['Seg','Ter','Qua','Qui','Sex','Sáb'];
  const hd=d=>d==='Sáb'?hf:hw;
  if(w.k==='new'){
    rows=newWeekRows(w,hw,hf);
  }else if(w.k==='rev'){
    const per=Math.max(1,Math.ceil(ts.length/4));
    const dia=j=>{const g=ts.slice(j*per,(j+1)*per);return g.length?`Revisão: ${g.map(t=>esc(t.n)).join('; ')}. Questões de cada tema e releitura da ficha.`:'Revisões vencidas (questões)'};
    rows=[['Seg',hw,dia(0)],['Ter',hw,dia(1)],['Qua',hw,dia(2)],['Qui',hw,dia(3)],['Sex',hw,'Caderno de erros e revisões vencidas'],['Sáb',hf,'Simulado misto de 30 questões, corrigido na hora'],['Dom',hf,'Opcional: folga ou mapa mental']];
  }else if(w.k==='deep'){
    rows=DIAS.map((d,j)=>[d,hd(d),ts[j]?`${esc(ts[j].n)}: reler resumo e ficha e 20 questões`:'Revisões vencidas e caderno de erros']);
    rows.push(['Dom',hf,'Questões mistas por área (50) ou descanso']);
  }else if(w.k==='int'){
    const per=Math.max(1,Math.ceil(ts.length/6));
    rows=DIAS.map((d,j)=>{const g=ts.slice(j*per,(j+1)*per);
      return [d,hd(d),g.length?`Revisão relâmpago: ${g.map(t=>esc(t.n)).join('; ')}. Questões de cada tema e releitura da ficha.`:'Revisões vencidas e caderno de erros']});
    rows.push(['Dom',hf,'Simulado da área: 30 questões, corrigido na hora']);
  }else if(w.k==='prova'){
    rows=[['Seg',hw,'Fichas e resumos dos temas de maior incidência'],['Ter',hw,'Caderno de erros'],['Qua',hw,'20 a 30 questões leves, só para manter o ritmo'],['Qui',hw,'Descanso ou revisão bem leve'],['Sex',hw,'Conferir a logística e dormir bem'],['Sáb',hf,'Sem estudo novo'],['Dom',hf,'Dia da prova de referência']];
  }else{
    rows=[['Seg',hw,'Questões por área (30)'],['Ter',hw,'Questões por área (30)'],['Qua',hw,'Revisões vencidas'],['Qui',hw,'Questões por área (30)'],['Sex',hw,'Caderno de erros'],['Sáb',hf,`Simulado de ${w.q} questões, cronometrado`],['Dom',hf,'Correção comentada e anotação dos erros']];
  }
  const tot=rows.reduce((s,r)=>s+(r[0]==='Dom'&&w.k!=='sim'?0:r[1]),0);
  return `<div class="scroll-x"><table><thead><tr><th>Dia</th><th class="num">Horas</th><th>O que fazer</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td class="num">${r[1]}h</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div><div class="small muted" style="margin-top:6px">Cerca de ${tot} horas contando o domingo como opcional (${hw}h nos dias de rodízio e ${hf}h nos dias livres, ajustável em Ajustes).</div>`;
}
function vPlano(){
  const wi=WK==null?curWeek():WK,w=S.plan[wi];
  const s=weekStart(wi),e=addDays(s,6);
  let h=`<div class="card"><div class="row sp"><div class="row"><button class="btn" data-act="wk" data-d="-1" ${wi===0?'disabled':''}>←</button><button class="btn" data-act="wk" data-d="1" ${wi===S.plan.length-1?'disabled':''}>→</button><button class="btn sm" data-act="wk" data-d="cur">Semana atual</button></div><span class="chip">${PH[phaseOf(wi)]}</span></div>
  <h2 style="margin-top:12px">Semana ${wi+1} · ${fmt(s)} a ${fmt(e)}</h2><div class="muted" style="margin-bottom:8px">${esc(weekTitle(wi))}</div>`;
  if(w.k==='new')h+=w.t.map(id=>topicBlock(T(id))).join('');
  else h+=weekExtra(wi);
  if(w.k==='new')h+=weekExtra(wi);
  h+=`</div><div class="card"><h3>Rotina sugerida da semana</h3>${dayTable(wi)}</div>`;
  const rv=dueList().length;
  h+=`<div class="card"><div class="row sp"><h3>Visão das ${S.plan.length} semanas</h3><span class="small muted">${rv} revisão(ões) vencida(s) agora</span></div>
  ${planResumo()}<div class="small muted" style="margin-bottom:6px">Toque em uma semana para abri-la.</div>`;
  S.plan.forEach((p,i)=>{
    const pct=Math.round(weekPct(i)*100);
    h+=`<div class="week-item ${i===curWeek()?'cur':''}" data-act="gowk" data-i="${i}"><b>S${i+1}</b><div><div>${esc(weekTitle(i))}</div><div class="small muted">${fmt(weekStart(i))} · ${PH[phaseOf(i)]}</div></div><span class="chip ${pct===100?'ok':''}">${pct}%</span></div>`;
  });
  return h+`</div>`;
}

/* ============ TEMAS ============ */
function vTemas(){
  let list=S.topics.filter(t=>(!TF.a||t.a===TF.a)&&(!TF.q||t.n.toLowerCase().includes(TF.q.toLowerCase())));
  if(TF.s==='todo')list=list.filter(t=>!isDone(t));
  if(TF.s==='done')list=list.filter(isDone);
  if(TF.s==='fraco')list=list.filter(t=>{const g=topicAgg(t.id);return status(g.p,g.t,5)==='low'});
  let h=`<div class="card"><div class="grid2"><label class="f">Buscar<input type="text" id="tq" value="${esc(TF.q)}" placeholder="Digite o tema"></label>
  <label class="f">Área<select id="ta"><option value="">Todas</option>${AK.map(a=>`<option value="${a}" ${TF.a===a?'selected':''}>${AREAS[a].n}</option>`).join('')}</select></label>
  <label class="f">Situação<select id="ts"><option value="">Todos</option><option value="todo" ${TF.s==='todo'?'selected':''}>Falta concluir</option><option value="done" ${TF.s==='done'?'selected':''}>Concluídos</option><option value="fraco" ${TF.s==='fraco'?'selected':''}>Desempenho fraco</option></select></label></div>
  <div class="row" style="margin-top:10px"><button class="btn sm" data-act="newtopic">Adicionar tema próprio</button><span class="small muted">${list.length} tema(s)</span></div></div>`;
  AK.forEach(a=>{
    const ls=list.filter(t=>t.a===a);if(!ls.length)return;
    const g=areaAgg(a);
    h+=`<div class="card"><div class="row sp"><h3>${AREAS[a].n}</h3>${chipP(g,10)}</div>${ls.map(topicBlock).join('')}</div>`;
  });
  return h;
}
function topicModal(id){
  const t=T(id);const g=topicAgg(id);
  const wi=S.plan.findIndex(w=>w.t.includes(id));
  const imgs=S.imgs.filter(m=>m.topic===id);
  let h=`<div class="row sp"><h3>${esc(t.n)}</h3><button class="btn sm" data-act="mclose">Fechar</button></div>
  <div class="row" style="margin:6px 0">${areaChip(t.a)} ${incChip(t)} ${g.t?chipP(g,5):''}</div>
  <div class="checks">${ckBtn(t,'aula','Assisti a aula')}${ckBtn(t,'resumo','Resumo à mão')}${ckBtn(t,'card','Card / ficha')}</div>`;
  h+=`<h3 style="margin-top:16px">Por tipo de pergunta</h3>`;
  const rows=DK.map(d=>{const x=topicDim(id,d);return `<div class="ldim"><span>${DIMS[d]}</span><div class="bar ${x.t>=3?status(x.p,x.t,3):''}"><b style="width:${x.p==null?0:Math.round(x.p*100)}%"></b></div><span class="small">${x.t?`${pc(x.p)} · ${x.c}/${x.t}`:'sem dados'}</span></div>`}).join('');
  h+=rows;
  h+=`<div class="row" style="margin-top:8px"><button class="btn pri sm" data-act="logq" data-id="${id}">Registrar questões</button>${t.rev?`<span class="small muted">Próxima revisão: ${fmtY(t.rev.next)} (etapa ${t.rev.stage+1} de ${LADDER.length})</span>`:'<span class="small muted">A revisão começa quando aula, resumo e card estiverem marcados.</span>'}</div>`;
  const hist=LOGS.filter(l=>l.tp===id).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,8);
  if(hist.length)h+=`<div class="small muted" style="margin-top:10px">Últimos registros: ${hist.map(l=>`${fmt(l.d)} ${l.dim==='G'?'geral':DIMS[l.dim].split(' ')[0].toLowerCase()} ${l.c}/${l.t}`).join(' · ')}</div>`;
  h+=`<label class="f" style="margin-top:14px">Anotações<textarea id="tnote">${esc(t.note)}</textarea></label>`;
  h+=`<div class="row" style="margin-top:10px"><label class="f" style="flex:1 1 200px">Semana do plano
    <select id="tweek"><option value="-1" ${wi<0?'selected':''}>Fora do plano</option>${S.plan.map((w,i)=>w.k==='new'?`<option value="${i}" ${wi===i?'selected':''}>S${i+1} · ${fmt(weekStart(i))}</option>`:'').join('')}</select></label>
    <button class="btn" data-act="savetopic" data-id="${id}" style="align-self:end">Salvar</button></div>`;
  h+=`<h3 style="margin-top:16px">Imagens deste tema (${imgs.length})</h3><div class="row"><button class="btn sm" data-act="addimg" data-id="${id}">Anexar imagem</button><span class="small muted">Mapas mentais, fichas, fotos de resumos.</span></div>`;
  if(imgs.length)h+=`<div class="pgrid" style="margin-top:8px">${imgs.map(m=>thumbHtml(m)).join('')}</div>`;
  h+=`<div class="row" style="margin-top:16px;justify-content:space-between"><button class="btn sm dng" data-act="deltopic" data-id="${id}">${t.custom?'Excluir tema':'Tirar do plano'}</button></div>`;
  openModal(h,true);
  hydrateImgs();
}
function newTopicModal(){
  openModal(`<h3>Novo tema</h3><div class="grid2" style="margin-top:10px"><label class="f">Área<select id="nta">${AK.map(a=>`<option value="${a}">${AREAS[a].n}</option>`).join('')}</select></label>
  <label class="f">Incidência<select id="nti"><option value="3">Alta</option><option value="2" selected>Média</option><option value="1">Baixa</option></select></label></div>
  <label class="f" style="margin-top:10px">Nome do tema<input type="text" id="ntn"></label>
  <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" data-act="savenewtopic">Adicionar</button></div>`);
}

/* ============ QUESTÕES ============ */
let QTAB='reg';
function topicOptions(sel){return AK.map(a=>`<optgroup label="${AREAS[a].n}">${S.topics.filter(t=>t.a===a).map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${esc(t.n)}</option>`).join('')}</optgroup>`).join('')}
function vQuestoes(){
  let h=`<div class="row"><button class="btn ${QTAB==='reg'?'pri':''}" data-act="qtab" data-k="reg">Registrar questões</button><button class="btn ${QTAB==='sim'?'pri':''}" data-act="qtab" data-k="sim">Simulados</button></div>`;
  if(QTAB==='reg'){
    h+=`<div class="card"><h3>Novo registro</h3>${logForm(null)}</div>`;
    const rec=[...LOGS].sort((a,b)=>b.d.localeCompare(a.d)||b.id.localeCompare(a.id)).slice(0,25);
    h+=`<div class="card"><h3>Últimos registros</h3>${rec.length?`<div class="scroll-x"><table><thead><tr><th>Data</th><th>Tema</th><th>Tipo</th><th class="num">Acertos</th><th class="num">%</th><th></th></tr></thead><tbody>${rec.map(l=>{const t=T(l.tp);return `<tr><td>${fmt(l.d)}</td><td>${t?esc(t.n):(l.a&&AREAS[l.a]?esc(AREAS[l.a].n)+' (área toda)':'(tema removido)')}</td><td>${l.dim==='G'?'Geral':DIMS[l.dim].split(' ')[0]}</td><td class="num">${l.c}/${l.t}</td><td class="num">${pc(l.c/l.t)}</td><td><button class="btn sm dng" data-act="dellog" data-id="${l.id}">Excluir</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="muted">Nenhum registro ainda.</div>'}</div>`;
  }else{
    h+=`<div class="card"><h3>Registrar simulado</h3><div class="grid2"><label class="f">Nome<input type="text" id="sn" placeholder="Ex.: Simulado Enamed 2026"></label><label class="f">Data<input type="date" id="sd" value="${today()}"></label></div>
    <div class="small muted" style="margin:10px 0 6px">Preencha as áreas que o simulado cobriu (total de questões e acertos).</div>
    ${AK.map(a=>`<div class="ldim"><span>${AREAS[a].n}</span><input type="number" min="0" id="st_${a}" placeholder="Total"><input type="number" min="0" id="sc_${a}" placeholder="Acertos"></div>`).join('')}
    <button class="btn pri" data-act="savesim" style="margin-top:8px">Salvar simulado</button></div>`;
    h+=`<div class="card"><h3>Simulados feitos</h3>${S.sims.length?`<div class="scroll-x"><table><thead><tr><th>Data</th><th>Nome</th>${AK.map(a=>`<th class="num">${a}</th>`).join('')}<th class="num">Total</th><th></th></tr></thead><tbody>${[...S.sims].sort((a,b)=>b.d.localeCompare(a.d)).map(s=>{let t=0,c=0;AK.forEach(a=>{if(s.sc[a]){t+=s.sc[a][0];c+=s.sc[a][1]}});return `<tr><td>${fmt(s.d)}</td><td>${esc(s.n)}</td>${AK.map(a=>`<td class="num">${s.sc[a]?pc(s.sc[a][1]/s.sc[a][0]):'–'}</td>`).join('')}<td class="num"><b>${pc(t?c/t:null)}</b></td><td><button class="btn sm dng" data-act="delsim" data-id="${s.id}">Excluir</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="muted">Nenhum simulado registrado.</div>'}</div>`;
  }
  return h;
}
function logModal(tid){openModal(`<h3>Registrar questões</h3><div style="margin-top:10px">${logForm(tid)}</div>`)}

/* ============ DESEMPENHO ============ */
function vDesempenho(){
  const m=S.meta;
  const tot=agg(()=>true);
  let h=`<div class="tiles"><div class="tile"><div class="v">${pc(tot.p)}</div><div class="l">acerto em ${tot.t} questões</div></div>
  <div class="tile"><div class="v">${S.topics.filter(t=>topicAgg(t.id).t>=10).length}</div><div class="l">temas com 10+ questões</div></div>
  <div class="tile"><div class="v">${S.sims.length}</div><div class="l">simulados registrados</div></div></div>`;
  const ins=insights();
  h+=`<div class="card"><h3>O que o plano está vendo</h3>${ins.length?ins.map(i=>`<div class="ins">${i.txt}</div>`).join(''):'<div class="muted">Registre pelo menos 15 questões por área (separando por tipo de pergunta) para surgirem recomendações.</div>'}</div>`;
  h+=`<div class="card"><h3>Por área</h3><div class="legend" style="margin-bottom:8px"><span><i class="dot" style="background:var(--ok)"></i>na meta</span><span><i class="dot" style="background:var(--mid)"></i>até 15 pontos abaixo</span><span><i class="dot" style="background:var(--low)"></i>muito abaixo</span><span>Traço escuro: meta de ${m}%</span></div>`;
  AK.forEach(a=>{const g=areaAgg(a);const st=status(g.p,g.t,10);
    h+=`<div class="ldim" style="grid-template-columns:minmax(120px,1.3fr) 2fr 70px"><span>${areaChip(a)} ${AREAS[a].n}</span><div class="bar ${st==='na'?'':st}"><b style="width:${g.p==null?0:Math.round(g.p*100)}%"></b><span class="meta-line" style="left:${m}%"></span></div><span class="small">${pc(g.p)} · ${g.t}q</span></div>`});
  h+=`</div>`;
  h+=`<div class="card"><h3>Área por tipo de pergunta</h3><div class="small muted" style="margin-bottom:6px">Células só mostram cor com 8 ou mais questões naquele tipo.</div><div class="scroll-x"><table class="heat"><thead><tr><th>Área</th>${DK.map(d=>`<th class="num">${DIMS[d].split(' ')[0]}</th>`).join('')}</tr></thead><tbody>`;
  AK.forEach(a=>{h+=`<tr><td>${AREAS[a].n}</td>${DK.map(d=>{const x=areaDim(a,d);const st=status(x.p,x.t,8);return `<td class="cell ${st}">${x.t?pc(x.p):'–'}<div class="small" style="font-weight:400">${x.t?x.t+'q':''}</div></td>`}).join('')}</tr>`});
  h+=`</tbody></table></div></div>`;
  h+=`<div class="card"><h3>Evolução semanal</h3>${trendSvg()}</div>`;
  h+=`<div class="card"><h3>Temas por desempenho</h3><div class="small muted" style="margin-bottom:6px">Do mais fraco para o mais forte, só temas com 5+ questões.</div>`;
  const rk=S.topics.map(t=>({t,g:topicAgg(t.id)})).filter(x=>x.g.t>=5).sort((a,b)=>a.g.p-b.g.p);
  if(!rk.length)h+=`<div class="muted">Ainda sem temas com 5 questões.</div>`;
  else h+=`<div class="scroll-x"><table><thead><tr><th>Tema</th><th class="num">Geral</th>${DK.map(d=>`<th class="num">${DIMS[d].split(' ')[0].slice(0,5)}.</th>`).join('')}<th>Próx. revisão</th></tr></thead><tbody>${rk.map(({t,g})=>`<tr><td><a href="#" data-act="topic" data-id="${t.id}" style="color:inherit">${areaChip(t.a)} ${esc(t.n)}</a></td><td class="num cell ${status(g.p,g.t,5)}">${pc(g.p)}<div class="small" style="font-weight:400">${g.t}q</div></td>${DK.map(d=>{const x=topicDim(t.id,d);return `<td class="num cell ${status(x.p,x.t,3)}">${x.t?pc(x.p):'–'}</td>`}).join('')}<td>${t.rev?fmt(t.rev.next):'–'}</td></tr>`).join('')}</tbody></table></div>`;
  return h+`</div>`;
}
function trendSvg(){
  const wks=[];
  if(!LOGS.length&&!S.sims.length)return '<div class="muted">O gráfico aparece depois dos primeiros registros.</div>';
  const byW={};
  const wkey=d=>mondayOf(d);
  LOGS.forEach(l=>{const k=wkey(l.d);(byW[k]=byW[k]||[0,0]);byW[k][0]+=l.t;byW[k][1]+=l.c});
  S.sims.forEach(s=>{const k=wkey(s.d);AK.forEach(a=>{if(s.sc[a]){(byW[k]=byW[k]||[0,0]);byW[k][0]+=s.sc[a][0];byW[k][1]+=s.sc[a][1]}})});
  const keys=Object.keys(byW).sort().slice(-14);
  const pts=keys.map(k=>({k,p:byW[k][1]/byW[k][0],n:byW[k][0]}));
  const W=640,H=200,L=34,R=12,Tp=12,B=26;
  const x=i=>L+(pts.length===1?(W-L-R)/2:i*(W-L-R)/(pts.length-1));
  const y=p=>Tp+(1-p)*(H-Tp-B);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Percentual de acerto por semana">`;
  [0,.25,.5,.75,1].forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${Math.round(v*100)}%</text>`});
  s+=`<line x1="${L}" x2="${W-R}" y1="${y(S.meta/100)}" y2="${y(S.meta/100)}" stroke="var(--ink)" stroke-dasharray="4 4" opacity=".5"/><text x="${W-R}" y="${y(S.meta/100)-4}" text-anchor="end">meta ${S.meta}%</text>`;
  if(pts.length>1)s+=`<polyline fill="none" stroke="var(--acc)" stroke-width="2.5" points="${pts.map((p,i)=>x(i)+','+y(p.p)).join(' ')}"/>`;
  pts.forEach((p,i)=>{s+=`<circle cx="${x(i)}" cy="${y(p.p)}" r="${i===pts.length-1?5:3.5}" fill="var(--acc)"><title>Semana de ${fmt(p.k)}: ${pc(p.p)} em ${p.n} questões</title></circle>`;
    if(i===pts.length-1||pts.length<=7)s+=`<text x="${x(i)}" y="${y(p.p)-9}" text-anchor="middle" style="fill:var(--ink)">${pc(p.p)}</text>`;
    if(i%Math.ceil(pts.length/7)===0||i===pts.length-1)s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${fmt(p.k)}</text>`});
  return s+`</svg>`;
}

/* ============ BIBLIOTECA ============ */
function thumbHtml(m){return `<button class="thumb" data-act="lightbox" data-id="${m.id}" aria-label="Abrir imagem"><img data-iid="${m.id}" alt="${esc(m.cap||'Imagem do tema')}"><span class="chip tg ${m.tag==='dom'?'tag-d':'tag-r'}">${m.tag==='dom'?'dominado':'revisar'}</span></button>`}
function hydrateImgs(){
  const els=[...document.querySelectorAll('img[data-iid]')];
  let i=0;const next=async()=>{while(i<els.length){const el=els[i++];const d=await getImg(el.dataset.iid);if(d&&el.isConnected)el.src=d}};
  next();next();next();
}
function vBiblioteca(){
  let list=S.imgs.filter(m=>(!LIBF.a||T(m.topic)?.a===LIBF.a)&&(!LIBF.t||m.topic===LIBF.t)&&(!LIBF.tag||m.tag===LIBF.tag));
  let h=`<div class="card"><div class="row sp"><h3>Biblioteca de imagens</h3><div class="row"><button class="btn pri sm" data-act="addimg" data-id="">Anexar imagem</button><button class="btn sm" data-act="revmode">Modo revisão (${S.imgs.filter(m=>m.tag==='rev').length})</button></div></div>
  <div class="small muted" style="margin:6px 0 10px">Guarde mapas mentais, fichas e fotos dos seus resumos por tema. Marque cada imagem como dominada ou para revisar.</div>
  <div class="grid2"><label class="f">Área<select id="la"><option value="">Todas</option>${AK.map(a=>`<option value="${a}" ${LIBF.a===a?'selected':''}>${AREAS[a].n}</option>`).join('')}</select></label>
  <label class="f">Tema<select id="lti"><option value="">Todos</option>${AK.map(a=>`<optgroup label="${AREAS[a].n}">${S.topics.filter(t=>t.a===a&&(!LIBF.a||LIBF.a===a)).map(t=>`<option value="${t.id}" ${LIBF.t===t.id?'selected':''}>${esc(t.n)}</option>`).join('')}</optgroup>`).join('')}</select></label>
  <label class="f">Situação<select id="lg"><option value="">Todas</option><option value="rev" ${LIBF.tag==='rev'?'selected':''}>Revisar</option><option value="dom" ${LIBF.tag==='dom'?'selected':''}>Dominado</option></select></label></div></div>`;
  h+=`<div class="card">${list.length?`<div class="pgrid">${list.map(thumbHtml).join('')}</div>`:'<div class="muted">Nenhuma imagem ainda. Use Anexar imagem e escolha o tema.</div>'}</div>`;
  return h;
}
function pickFiles(topicId){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
  inp.onchange=()=>{const files=[...inp.files];if(!files.length)return;
    if(topicId)uploadFiles(files,topicId);
    else openModal(`<h3>Em qual tema ficam ${files.length} imagem(ns)?</h3><label class="f" style="margin-top:10px">Tema<select id="upt">${topicOptions('')}</select></label><div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" id="upok">Anexar</button></div>`),
      document.getElementById('upok')&&(document.getElementById('upok').onclick=()=>{const t=document.getElementById('upt').value;closeModal();uploadFiles(files,t)});
  };
  inp.click();
}
function shrink(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file);const im=new Image();
    im.onload=()=>{
      let max=1400,q=0.82,out='';
      for(let i=0;i<6;i++){
        const sc=Math.min(1,max/Math.max(im.width,im.height));
        const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
        const cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);cx.drawImage(im,0,0,c.width,c.height);
        out=c.toDataURL('image/jpeg',q);
        if(out.length<230000)break;
        max=Math.round(max*0.8);q=Math.max(0.55,q-0.06);
      }
      URL.revokeObjectURL(url);
      if(out.length>240000)rej(new Error('grande'));else res(out);
    };
    im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('formato'))};
    im.src=url;
  });
}
async function uploadFiles(files,topic){
  let ok=0;
  for(const f of files){
    try{const d=await shrink(f);const id=uid();await putImg(id,d);S.imgs.push({id,topic,tag:'rev',cap:'',date:today()});ok++}
    catch(e){toast('Não consegui anexar '+f.name+'. Use JPG ou PNG.')}
  }
  if(ok){touch('state');toast(ok+' imagem(ns) anexada(s)');}
  if(document.querySelector('.modal'))topicModal(topic);
  render();
}
let LB=null;
async function lightbox(id,list){
  const l=list||S.imgs.filter(m=>(!LIBF.a||T(m.topic)?.a===LIBF.a)&&(!LIBF.t||m.topic===LIBF.t)&&(!LIBF.tag||m.tag===LIBF.tag));
  const i=l.findIndex(m=>m.id===id);if(i<0)return;
  LB={l,i};drawLB();
}
async function drawLB(){
  const m=LB.l[LB.i];if(!m)return closeModal();
  const t=T(m.topic);
  openModal(`<div class="lightbox"><div class="row sp"><div class="small muted">${t?areaChip(t.a)+' '+esc(t.n):'Tema removido'} · ${LB.i+1}/${LB.l.length}</div><button class="btn sm" data-act="mclose">Fechar</button></div>
  <div style="margin:10px 0"><img id="lbimg" alt="${esc(m.cap||'Imagem')}"></div>
  <label class="f">Legenda<input type="text" id="lbcap" value="${esc(m.cap||'')}" placeholder="Opcional"></label>
  <div class="row" style="margin-top:10px"><button class="btn sm" data-act="lbprev" ${LB.i===0?'disabled':''}>←</button><button class="btn sm" data-act="lbnext" ${LB.i===LB.l.length-1?'disabled':''}>→</button>
  <button class="btn sm ${m.tag==='dom'?'pri':''}" data-act="lbtag" data-t="dom">Dominado</button><button class="btn sm ${m.tag==='rev'?'pri':''}" data-act="lbtag" data-t="rev">Revisar</button><button class="btn sm" data-act="lbsave">Salvar legenda</button><button class="btn sm dng" data-act="lbdel">Excluir</button></div></div>`,true);
  const d=await getImg(m.id);const el=document.getElementById('lbimg');if(el&&d)el.src=d;
}
function revMode(){
  const l=S.imgs.filter(m=>m.tag==='rev');
  if(!l.length)return toast('Nenhuma imagem marcada para revisar.');
  LB={l,i:0};drawLB();
}

/* ============ EDITAIS ============ */
function vEditais(){
  const src=(u,t)=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
  return `<div class="card"><h2>O que os editais de 2026 dizem</h2><div class="muted" style="margin-top:4px">Levantamento feito em 06/11/2026 em páginas de cursinhos e nos PDFs dos editais. Confira sempre o edital oficial antes de se inscrever. O de 2027 ainda não saiu.</div></div>
  <div class="card"><h3>Enare e Enamed (nacional, acesso direto)</h3>
   <ul><li>O Enare 2026/2027 usa o <b>Enamed 2026</b> como prova objetiva do acesso direto. A nota do Enamed vale para o Enare e para outros programas de acesso direto. ${src('https://www.medway.com.br/conteudos/edital-enamed/','Resumo do Enamed (Medway)')}</li>
   <li>Prova do Enamed 2026: 13/09/2026, 100 questões objetivas, 5 horas, <b>20 questões em cada uma das 5 grandes áreas</b>: Clínica Médica, Cirurgia Geral, Pediatria, Ginecologia e Obstetrícia, Medicina Preventiva e Social.</li>
   <li>A nota é por TRI e fica valendo por 3 anos. O candidato pode reaproveitar uma nota anterior.</li>
   <li>Taxa do Enare 2026/2027: R$ 330. Organização: HU Brasil com a FGV. ${src('https://enare2026.conhecimento.fgv.br/docs/36fa57ca8c688040ad69c657f67c4a5d.pdf?v=ea4bb6ba','Edital nº 02/2026')}</li>
   <li><b>Ponto de atenção:</b> o edital do Inep de 2026 diz que estudantes do 4º ano que fizerem o Enamed não podem usar a nota no Enare nem em outros acessos diretos. Quando sair o edital de 2027, confirme se quem está no 6º ano pode usar a nota e em que condição. ${src('https://www.crub.org.br/wp-content/uploads/2026/05/EDITAL-71-ENAMED-2026.pdf','Edital Inep nº 71/2026')}</li></ul>
   <div class="small muted">Temas citados por área na matriz (já marcados como "Enamed" na lista de temas): Clínica Médica (síndromes febris, pneumonia, arritmias, HAS, tireoide, oftalmologia, transtornos mentais, artrites, exantemáticas, diabetes), Cirurgia (tumores digestivos e urológicos, pré-operatório, abdome agudo, trauma, vias biliares, cirurgia pediátrica), Pediatria (obstrutivas, vacinas, crescimento, infecção neonatal, violência, triagem neonatal, nutrição, epilepsia, genética, exantemas), GO (contracepção, rastreio de colo, parto, hipertensão na gestação, pré-natal, PALM-COEIN, amenorreia/SOP, hepatites e HIV na gestação, vulvovaginites), Preventiva (ética, prevenção, APS, epidemias, SUS, saúde do trabalhador, estudos epidemiológicos, testes diagnósticos, drogas).</div></div>
  <div class="card"><h3>PSU-ES/SUL (Cachoeiro de Itapemirim): HIFA e HECI</h3>
   <ul><li>Edital 2026/2027 divulgado em setembro. Prova objetiva única com peso de 100%, <b>02/11/2026</b>, na Multivix Cachoeiro, organizada pelo IBGP. ${src('https://www.medway.com.br/conteudos/residencia-medica-psu-es/','Resumo do PSU-ES/SUL (Medway)')}</li>
   <li><b>80 questões no acesso direto, 16 em cada área</b>: Clínica Médica, Cirurgia Geral, Ginecologia e Obstetrícia, Pediatria, Medicina Preventiva e Social/MFC/Saúde Coletiva. Nota mínima: 50% de acertos.</li>
   <li>Vagas em GO: <b>HIFA, 3 anos, cerca de 8 vagas</b> (o resumo consultado cita 8 na tabela e 10 no texto; confira no edital). O HECI não ofereceu GO nesta edição.</li>
   <li>Concorrência da edição anterior: GO no HIFA, 17 candidatos por vaga; Pediatria no HIFA, 13,7; Clínica Médica no HECI, 13,4; Cirurgia Geral no HECI, 34.</li>
   <li>Desempate: idade de 60 anos ou mais, depois <b>maior nota em Clínica Médica</b>, depois bônus de MFC, depois maior idade. Por isso Clínica Médica merece atenção mesmo para quem quer GO.</li></ul></div>
  <div class="card"><h3>EMESCAM (Vitória), edição com ingresso em 2026</h3>
   <ul><li>Editais publicados em 23/10/2025; prova teórica em 07/12/2025; taxa de R$ 650.</li>
   <li>1ª fase: <b>50 questões, 10 por área</b> (Cirurgia Geral, Clínica Médica, Medicina Social, Pediatria, Obstetrícia/Ginecologia), 3 horas. 2ª fase: prova prática (até 40 pontos) e análise curricular (até 10 pontos).</li>
   <li>GO no Hospital Santa Casa de Vitória: 10 vagas de acesso direto. ${src('https://med.estrategia.com/portal/residencia-medica/emescam-residencia-medica/','Resumo da EMESCAM (Estratégia MED)')}</li>
   <li>A prática pede treino de OSCE: anamnese, exame físico e condutas em estações. Vale reservar tempo na Fase 3.</li></ul></div>
  <div class="card"><h3>UVV, UFES e Medicina de Família e Comunidade</h3>
   <ul><li><b>UVV (Vila Velha):</b> edital 2026 com 10 vagas em 4 áreas, inscrições até 24/11/2025. Não consegui abrir o regulamento da prova, então a estrutura dela está por confirmar. ${src('https://uvv.br/wp-content/uploads/2025/09/20250930-edital-no-028-2025-processo-seletivo-prm-turma-2026-1.pdf','Edital UVV nº 028/2025')}</li>
   <li><b>UFES (HUCAM):</b> publica edital em agosto/setembro, com segunda entrada para vagas ociosas. Os programas incluem Clínica Médica, Cirurgia Geral, Pediatria e GO. Não confirmei a estrutura da prova de 2026. ${src('https://www.medway.com.br/conteudos/residencia-medica-ufes/','Resumo da UFES (Medway)')}</li>
   <li><b>Medicina de Família e Comunidade no ES:</b> o ICEPi/SESA é quem organiza. Num edital de 2023, Cachoeiro de Itapemirim tinha 2 vagas. Não encontrei o edital de residente de 2026, só os de preceptor. Confirme no site do ICEPi quando sair o próximo.</li>
   <li><b>Para a Fernanda:</b> a estrutura é a mesma de sempre, cinco grandes áreas com peso parecido. Estudar o conteúdo uma vez cobre todas as provas; o que muda é a prova prática da EMESCAM e o desempate por Clínica Médica no PSU-ES/SUL.</li></ul></div>
  <div class="card"><h3>Como isso entrou no plano</h3><ul>
   <li>Todos os temas das cinco áreas entram, com ordem por incidência. GO tem 20 temas, o mesmo peso das outras áreas, porque cada área vale 20% da nota.</li>
   <li>A incidência (alta, média, baixa) é uma <b>estimativa</b> a partir dos temas citados nos editais e do padrão das bancas. Não tive acesso às provas antigas. Ajuste a incidência de qualquer tema abrindo o tema e editando.</li>
   <li>Quando você ver que Fernanda vai mesmo para GO, dá para aumentar a incidência dos temas de GO e usar as semanas de revisão com mais questões dessa área.</li></ul></div>
  <div class="card"><h3>Pontos a conferir no edital oficial</h3><ul>
   <li>Outra busca (06/11/2026) trouxe números diferentes do HIFA: 30, 32 ou 36 vagas no total, conforme a fonte. Vale o edital do IBGP.</li>
   <li>O PSU-ES/SUL 2027 teve inscrições de 5 a 19/10/2026 e prova em 02/11/2026. Já passou para esta edição.</li>
   <li>A EMESCAM abriu inscrições do processo de ingresso em 2027 a partir de 19/10/2026 (76 vagas citadas). A data final não foi confirmada.</li>
   <li>Para UFES e UVV, não encontrei edital de 2027.</li>
   <li>Eu não conferi se estudantes ainda sem diploma podem se inscrever em cada processo. Confirme a elegibilidade antes da inscrição.</li></ul></div>`;
}

/* ============ AJUSTES ============ */
function vConfig(){
  return `<div class="card"><h3>Preferências</h3><div class="grid2">
   <label class="f">Início do plano (segunda-feira)<input type="date" id="cs" value="${S.start}"></label>
   <label class="f">Meta de acerto (%)<input type="number" id="cm" min="40" max="100" value="${S.meta}"></label>
   <label class="f">Data de referência da prova<input type="date" id="cx" value="${S.exam}"></label>
   <label class="f">Horas nos dias de rodízio<input type="number" id="chw" min="1" max="8" value="${S.hw}"></label>
   <label class="f">Horas nos dias livres<input type="number" id="chf" min="1" max="12" value="${S.hf}"></label>
   <label class="f">Revisão do Caderno de Erros (dias, crescentes)<input type="text" id="cci" value="${((S.cadCfg||{}).intervalosCaderno||[]).join(', ')}"></label></div>
   <div class="small muted" style="margin-top:8px">A data da prova é uma estimativa até o edital de 2027/2028 sair. Ao mudar a data ou o início, use "Refazer o plano de semanas" mais abaixo para reorganizar as semanas.</div>
   <div class="row" style="margin-top:12px"><button class="btn pri" data-act="savecfg">Salvar</button></div></div>
  <div class="card"><h3>Como a revisão espaçada funciona</h3>
   <p class="small">Quando aula, resumo e card de um tema estão marcados, a primeira revisão fica para 7 dias depois. Os intervalos seguem a sequência 7, 21, 45, 90, 150 e 210 dias. Cada vez que você registra questões, o plano mede o acerto da sessão (mínimo de 5 questões):</p>
   <ul class="small"><li>95% ou mais, com 10+ questões: avança duas etapas.</li><li>85% a 94%: avança uma etapa.</li><li>70% a 84%: repete o mesmo intervalo.</li><li>50% a 69%: volta uma etapa.</li><li>Abaixo de 50%: revisão em 3 dias e volta ao começo da sequência.</li></ul>
   <p class="small muted">Os números são um ponto de partida inspirado em práticas de repetição espaçada. Eles não vieram de um estudo específico com residência. Se parecer rápido ou lento demais, diga e a gente ajusta.</p></div>
  <div class="card"><h3>Seus dados</h3>
   <p class="small">${MODE==='cloud'?'Os dados ficam na sua conta e abrem no celular e no computador. Só você os vê: nem quem criou o plano tem acesso.':'Os dados estão salvos só neste navegador. Para usar em outro aparelho, abra o plano pelo link com a sua conta ou use a cópia de segurança abaixo (as imagens não entram na cópia).'}</p>
   <div class="row" style="margin-bottom:8px"><button class="btn pri" data-act="backupfile">Baixar arquivo de backup</button><button class="btn" data-act="restorefile">Restaurar de um arquivo</button></div>
   <div class="small muted" style="margin-bottom:10px">O arquivo guarda tudo: plano, questões, Caderno de Erros e as imagens. Último backup: ${lastBackupTxt()}.</div>
   <div class="row"><button class="btn sm" data-act="backup">Copiar como texto</button><button class="btn sm" data-act="restore">Restaurar de texto</button></div></div>
  <div class="card"><h3>Recomeçar</h3><p class="small">Refaz a ordem das semanas com os temas originais e mantém tudo o que você já marcou e registrou. Útil se bagunçar o plano.</p><button class="btn dng" data-act="replan">Refazer o plano de semanas</button></div>`;
}

/* ============ BACKUP EM ARQUIVO ============ */
function lastBackup(){try{return localStorage.getItem('fr_last_backup')}catch(e){return null}}
function lastBackupTxt(){const lb=lastBackup();return lb?new Date(lb).toLocaleString('pt-BR'):'nenhum ainda'}
function backupBanner(){
  const lb=lastBackup();const velho=!lb||(Date.now()-Date.parse(lb))>7*864e5;
  let h='';
  if(location.protocol==='file:')h+=`<div class="banner">Você abriu o arquivo direto do aparelho. Em alguns celulares o navegador não guarda os dados desse jeito. Teste uma vez: feche o app, abra de novo e confira se seus registros continuam lá. Faça backup toda semana.</div>`;
  if(velho)h+=`<div class="banner">${lb?'Faz mais de 7 dias do último backup.':'Você ainda não fez backup.'} Baixe o arquivo em Ajustes para não perder seus registros. <button class="btn sm" data-act="tab" data-k="config">Ir para Ajustes</button></div>`;
  return h;
}
function cadDue(){const hj=today();return cadAtivos().filter(i=>i.proximaRevisao<=hj).length}
async function backupFile(){
  toast('Preparando o arquivo…');
  const IMGS={};for(const m of S.imgs){const d=await getImg(m.id);if(d)IMGS[m.id]=d}
  const data=JSON.stringify({app:'plano-fernanda',v:2,exportadoEm:new Date().toISOString(),S,LOGS,IMGS});
  const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='backup-plano-fernanda-'+today()+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  try{localStorage.setItem('fr_last_backup',new Date().toISOString())}catch(e){}
  toast('Backup gerado. Guarde o arquivo no Drive, no e-mail ou no WhatsApp.',6000);
  render();
}
function pickRestore(){
  const inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;const r=new FileReader();
    r.onload=()=>ask('Restaurar este backup? Isso substitui os dados deste aparelho.','Restaurar',()=>restoreFrom(String(r.result)));
    r.readAsText(f)};
  inp.click();
}
async function restoreFrom(txt){
  try{
    const o=JSON.parse(txt);
    if(!o.S||!o.S.topics||!o.S.plan||!Array.isArray(o.S.plan))throw new Error('formato');
    S=o.S;LOGS=Array.isArray(o.LOGS)?o.LOGS:[];
    S.wt=S.wt||{};S.sims=S.sims||[];S.imgs=S.imgs||[];S.exam=S.exam||EXAM_PADRAO;S.caderno=S.caderno||[];
    S.cadCfg=S.cadCfg||{intervalosCaderno:[1,3,7,14,30,60,90]};
    const IM=o.IMGS||{};for(const id of Object.keys(IM))await putImg(id,IM[id]);
    S.imgs=S.imgs.filter(m=>IM[m.id]||IMGC.has(m.id));
    migratePlan();
    S.logMonths=[...new Set(LOGS.map(l=>l.d.slice(0,7)))].sort();
    touch('state',...S.logMonths.map(m=>'logs_'+m));render();toast('Backup restaurado.');
  }catch(e){toast('Esse arquivo não parece um backup válido. Nada foi alterado.')}
}
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-act="backupfile"],[data-act="restorefile"]');if(!el)return;
  if(el.dataset.act==='backupfile')backupFile();else pickRestore();
});

/* ============ CADERNO DE ERROS ============ */
/* Lógica pura em CadernoNucleo (sem IA e sem rede). Aqui fica só a tela. */
const CN=globalThis.CadernoNucleo;
const CAD_COMP=['Definição e classificação','Epidemiologia e fatores de risco','Fisiopatologia','Quadro clínico','Diagnóstico','Diagnóstico diferencial','Exames complementares','Tratamento','Condutas e decisões clínicas','Prevenção','Complicações e prognóstico','Diretrizes e recomendações'];
const CAD={texto:'',rasc:null,fil:{a:'',s:'',tipo:'',q:''},est:{dias:'0',a:''},abertos:{},rev:null};

function cadM(){
  return {
    areas:AK.map(a=>({id:a,nome:AREAS[a].n})),
    assuntos:S.topics.map(t=>({id:t.id,areaId:t.a,area:AREAS[t.a].n,disc:AREAS[t.a].n,ass:t.n})),
    competencias:CAD_COMP,
    erros:CN.TIPOS_ERRO
  };
}
const cadInfo=id=>{const t=id&&T(id);return t?{a:t.a,area:AREAS[t.a].n,ass:t.n}:null};
const cadAtivos=()=>(S.caderno||[]).filter(i=>i.ativo!==false);
const cadVal=id=>{const el=document.getElementById(id);return el?el.value:''};
const cadOrNull=v=>(v===''||v===undefined)?null:v;
function cadOptTopics(sel){
  return '<option value="">— não associar —</option>'+AK.map(a=>`<optgroup label="${esc(AREAS[a].n)}">${S.topics.filter(t=>t.a===a).map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${esc(t.n)}</option>`).join('')}</optgroup>`).join('');
}
function cadAltLines(alts){return alts?Object.keys(alts).map(k=>k+': '+alts[k]).join('\n'):''}
function cadParseAlts(txt){
  const o={};
  String(txt||'').split('\n').forEach(l=>{const m=l.match(/^\s*([A-Ha-h])\s*[:)\-]\s*(.+)$/);if(m)o[m[1].toUpperCase()]=m[2].trim()});
  return o;
}
function cadCopiar(texto,rotulo){
  const ok=()=>toast(rotulo+' copiado. Cole no seu chat de IA.');
  const fallback=()=>{
    const ta=document.createElement('textarea');ta.value=texto;ta.setAttribute('readonly','');
    ta.style.cssText='position:fixed;opacity:0;top:0;left:0';document.body.appendChild(ta);ta.select();
    let done=false;try{done=document.execCommand('copy')}catch(e){}
    ta.remove();
    if(done)ok();else openModal(`<h3>Copie o texto abaixo</h3><textarea style="min-height:220px" readonly id="cadfb">${esc(texto)}</textarea><div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn pri" data-act="mclose">Fechar</button></div>`);
  };
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(texto).then(ok,fallback);else fallback();
}

/* ---------- importação e prévia ---------- */
function cadImportar(){
  const r=CN.interpretarResposta(CAD.texto,cadM());
  if(!r.ok){CAD.rasc={reg:null,erros:r.erros,avisos:r.avisos};return render()}
  CAD.rasc={reg:r.registro,assuntoId:r.assuntoId,editId:null,origem:'importacao',erros:[],avisos:r.avisos,dupes:[],decisao:null};
  render();
}
function cadManual(){
  CAD.rasc={reg:{versao:'1.0',grande_area:null,disciplina:null,assunto:null,subassunto:null,competencia:null,instituicao:null,ano_prova:null,enunciado:'',alternativas:{A:'',B:'',C:'',D:''},alternativa_marcada:null,alternativa_correta:null,status_gabarito:'indeterminado',explicacao_resumida:null,motivo_do_erro:null,explicacao_alternativa_correta:null,analise_das_alternativas:null,conceito_chave:null,dica_de_prova:null,tipo_de_erro:[],referencias:null,observacoes:null,revisao_recomendada:null},assuntoId:null,editId:null,origem:'manual',erros:[],avisos:[],dupes:[],decisao:null};
  render();window.scrollTo(0,0);
}
function cadEditar(id){
  const it=S.caderno.find(i=>i.id===id);if(!it)return;
  CAD.rasc={reg:JSON.parse(JSON.stringify(it.registro)),assuntoId:it.assuntoId,editId:id,origem:it.origem,erros:[],avisos:[],dupes:[],decisao:'editar'};
  render();window.scrollTo(0,0);
}
function cadLerForm(){
  const base=CAD.rasc.reg||{};
  const tipos=[...document.querySelectorAll('input[name=cd-tipo]:checked')].map(i=>i.value);
  const refs=cadVal('cd-refs').split('\n').map(s=>s.trim()).filter(Boolean);
  const obj={
    versao:'1.0',
    grande_area:cadOrNull(cadVal('cd-area')),
    disciplina:cadOrNull(cadVal('cd-disc').trim()),
    assunto:cadOrNull(cadVal('cd-ass').trim()),
    subassunto:cadOrNull(cadVal('cd-sub').trim()),
    competencia:cadOrNull(cadVal('cd-comp')),
    instituicao:cadOrNull(cadVal('cd-inst').trim()),
    ano_prova:cadOrNull(cadVal('cd-ano')),
    enunciado:cadVal('cd-enun').trim(),
    alternativas:cadParseAlts(cadVal('cd-alt')),
    alternativa_marcada:cadOrNull(cadVal('cd-marc').trim().toUpperCase()),
    alternativa_correta:cadOrNull(cadVal('cd-cor').trim().toUpperCase()),
    status_gabarito:cadVal('cd-stat'),
    explicacao_resumida:cadOrNull(cadVal('cd-expl').trim()),
    motivo_do_erro:cadOrNull(cadVal('cd-motivo').trim()),
    explicacao_alternativa_correta:cadOrNull(cadVal('cd-certa').trim()),
    analise_das_alternativas:cadOrNull(cadVal('cd-analise').trim()),
    conceito_chave:cadOrNull(cadVal('cd-conceito').trim()),
    dica_de_prova:cadOrNull(cadVal('cd-dica').trim()),
    tipo_de_erro:tipos,
    referencias:refs.length?refs:null,
    observacoes:cadOrNull(cadVal('cd-obs').trim()),
    revisao_recomendada:base.revisao_recomendada===undefined?null:base.revisao_recomendada
  };
  if(obj.ano_prova!==null)obj.ano_prova=Number(obj.ano_prova);
  return {obj,assuntoSel:cadVal('cd-topico')||null};
}
function cadConfirmar(){
  const lido=cadLerForm(),rc=CAD.rasc;
  const r=CN.validarRegistro(lido.obj,cadM());
  rc.erros=r.erros;rc.avisos=r.avisos;rc.reg=r.registro||lido.obj;rc.assuntoId=lido.assuntoSel||r.assuntoId;
  if(!r.ok){rc.espera=false;return render()}
  if(rc.editId===null&&!rc.decisao){
    rc.dupes=CN.semelhantes(S.caderno,rc.reg.enunciado,null);
    if(rc.dupes.length){rc.espera=true;return render()}
  }
  rc.espera=false;
  const agora=new Date().toISOString();
  let msg;
  if(rc.editId){
    const it=S.caderno.find(i=>i.id===rc.editId);
    const mudou=Object.keys(rc.reg).filter(k=>JSON.stringify(rc.reg[k])!==JSON.stringify(it.registro[k]));
    it.registro=rc.reg;it.assuntoId=rc.assuntoId;it.atualizadoEm=agora;it.alteracoes.push({data:today(),campos:mudou});
    msg='Ficha atualizada. A alteração ficou registrada no histórico.';
  }else if(rc.decisao==='tentativa'&&rc.alvoId){
    CN.registrarTentativa(S.caderno.find(i=>i.id===rc.alvoId),rc.reg.alternativa_marcada,rc.origem);
    msg='Nova tentativa registrada na questão que já existia. Não contou como erro novo.';
  }else{
    S.caderno.push(CN.novoItem(rc.reg,rc.assuntoId,rc.origem,agora));
    msg='Questão salva no Caderno de Erros. Primeira revisão: hoje.';
    // Integra ao motor de revisão dos temas: um erro novo puxa a revisão do tema para até 7 dias.
    const t=rc.assuntoId&&T(rc.assuntoId);
    if(t&&t.rev){const lim=addDays(today(),7);if(t.rev.next>lim){t.rev.next=lim;msg+=' A revisão do tema foi antecipada para '+fmtY(lim)+'.'}}
  }
  touch('state');
  CAD.rasc=null;CAD.texto='';
  render();toast(msg,6000);
}
function cadDecidir(modo,alvo){CAD.rasc.decisao=modo;CAD.rasc.alvoId=alvo||null;CAD.rasc.espera=false;cadConfirmar()}

function cadFormHtml(r,assuntoId){
  const tp=r.tipo_de_erro||[];
  return `<div class="grid2">
   <label class="f">Grande área<select id="cd-area"><option value="">—</option>${AK.map(a=>`<option ${AREAS[a].n===r.grande_area?'selected':''}>${esc(AREAS[a].n)}</option>`).join('')}</select></label>
   <label class="f">Assunto no seu plano<select id="cd-topico">${cadOptTopics(assuntoId)}</select></label>
   <label class="f">Disciplina (como veio)<input type="text" id="cd-disc" value="${esc(r.disciplina)}"></label>
   <label class="f">Assunto (como veio)<input type="text" id="cd-ass" value="${esc(r.assunto)}"></label>
   <label class="f">Subassunto<input type="text" id="cd-sub" value="${esc(r.subassunto)}"></label>
   <label class="f">Competência avaliada<select id="cd-comp"><option value="">—</option>${CAD_COMP.map(c=>`<option ${c===r.competencia?'selected':''}>${esc(c)}</option>`).join('')}</select></label>
   <label class="f">Instituição<input type="text" id="cd-inst" value="${esc(r.instituicao)}"></label>
   <label class="f">Ano da prova<input type="number" id="cd-ano" min="1990" max="2100" value="${esc(r.ano_prova)}"></label></div>
  <label class="f" style="margin-top:10px">Enunciado<textarea id="cd-enun" rows="6">${esc(r.enunciado)}</textarea></label>
  <label class="f" style="margin-top:10px">Alternativas (uma por linha, assim: A: texto)<textarea id="cd-alt" rows="5">${esc(cadAltLines(r.alternativas))}</textarea></label>
  <div class="grid2" style="margin-top:10px">
   <label class="f">Alternativa que eu marquei<input type="text" id="cd-marc" maxlength="1" value="${esc(r.alternativa_marcada)}"></label>
   <label class="f">Alternativa correta<input type="text" id="cd-cor" maxlength="1" value="${esc(r.alternativa_correta)}"></label>
   <label class="f">Gabarito<select id="cd-stat">${['oficial','proposto','indeterminado'].map(s=>`<option ${s===r.status_gabarito?'selected':''}>${s}</option>`).join('')}</select></label></div>
  <div class="small muted" style="margin:12px 0 4px">Tipo de erro (pode marcar mais de um)</div>
  ${CN.TIPOS_ERRO.map(t=>`<label class="row small" style="min-height:36px"><input type="checkbox" name="cd-tipo" value="${esc(t)}" ${tp.includes(t)?'checked':''} style="width:20px;height:20px"> ${esc(t)}</label>`).join('')}
  <label class="f" style="margin-top:10px">Explicação resumida<textarea id="cd-expl" rows="3">${esc(r.explicacao_resumida)}</textarea></label>
  <label class="f" style="margin-top:10px">Motivo do erro<textarea id="cd-motivo" rows="2">${esc(r.motivo_do_erro)}</textarea></label>
  <label class="f" style="margin-top:10px">Explicação da alternativa correta<textarea id="cd-certa" rows="3">${esc(r.explicacao_alternativa_correta)}</textarea></label>
  <label class="f" style="margin-top:10px">Análise das outras alternativas<textarea id="cd-analise" rows="3">${esc(r.analise_das_alternativas)}</textarea></label>
  <label class="f" style="margin-top:10px">Conceito-chave<textarea id="cd-conceito" rows="2">${esc(r.conceito_chave)}</textarea></label>
  <label class="f" style="margin-top:10px">Dica de prova<textarea id="cd-dica" rows="2">${esc(r.dica_de_prova)}</textarea></label>
  <label class="f" style="margin-top:10px">Referências (uma por linha)<textarea id="cd-refs" rows="2">${esc((r.referencias||[]).join('\n'))}</textarea></label>
  <label class="f" style="margin-top:10px">Observações<textarea id="cd-obs" rows="2">${esc(r.observacoes)}</textarea></label>`;
}
function cadPrevia(){
  const rc=CAD.rasc;if(!rc)return '';
  if(!rc.reg){
    return `<div class="card"><div class="banner" style="background:var(--low-bg);color:var(--low)"><b>Não foi possível importar.</b><ul style="margin:6px 0 0 18px;padding:0">${rc.erros.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>
    <div class="small muted" style="margin-top:8px">Corrija o texto colado, use "Adicionar erro manualmente" ou peça ao chat o formato de novo com o botão "Copiar prompt para organizar questão já corrigida".</div>
    <div class="row" style="margin-top:10px"><button class="btn" data-cad="voltar">Voltar ao campo de importação</button></div></div>`;
  }
  const bloq=rc.erros.length?`<div class="banner" style="background:var(--low-bg);color:var(--low)"><b>Corrija antes de salvar:</b><ul style="margin:6px 0 0 18px;padding:0">${rc.erros.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>`:'';
  const av=rc.avisos.length?`<div class="banner"><b>Confira:</b><ul style="margin:6px 0 0 18px;padding:0">${rc.avisos.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>`:'';
  const dup=(rc.dupes&&rc.dupes.length&&!rc.editId)?`<div class="banner" style="background:var(--low-bg);color:var(--low)"><b>Esta questão parece já estar no caderno.</b>
    ${rc.dupes.slice(0,3).map(d=>`<div style="margin-top:8px">${d.score}% de semelhança: ${esc((d.item.registro.enunciado||'').slice(0,120))}…<div style="margin-top:6px"><button class="btn sm" data-cad="duptent" data-id="${d.item.id}">Somar como nova tentativa dessa questão</button></div></div>`).join('')}
    <div style="margin-top:10px"><button class="btn sm" data-cad="dupsep">É outra questão: cadastrar separadamente</button></div>
    ${rc.espera?'<div class="small" style="margin-top:8px">Escolha uma opção acima para continuar.</div>':''}</div>`:'';
  return `<div class="card"><h3>${rc.editId?'Editar ficha':'Prévia da importação'}</h3><div class="small muted" style="margin-bottom:8px">Confira e corrija antes de salvar. Nada é salvo até você confirmar.</div>${bloq}${av}${dup}${cadFormHtml(rc.reg,rc.assuntoId)}
  <div class="row" style="margin-top:14px"><button class="btn pri" data-cad="salvar">${rc.editId?'Salvar alterações':'Confirmar e salvar'}</button><button class="btn" data-cad="cancelar">Cancelar</button></div></div>`;
}

/* ---------- revisão ---------- */
function cadRevisaoHtml(){
  const rv=CAD.rev;if(!rv)return '';
  const it=S.caderno.find(i=>i.id===rv.id);if(!it)return '';
  const r=it.registro,info=cadInfo(it.assuntoId);
  const alts=Object.keys(r.alternativas||{}).map(k=>`<label class="row" style="min-height:40px;align-items:flex-start"><input type="radio" name="cd-resp" value="${esc(k)}" ${rv.marcada===k?'checked':''} ${rv.ok?'disabled':''} style="width:20px;height:20px;margin-top:2px"><span><b>${esc(k)})</b> ${esc(r.alternativas[k])}</span></label>`).join('');
  let corpo='';
  if(!rv.ok){
    corpo=`<div class="row" style="margin-top:8px"><button class="btn pri" data-cad="rvconf">Confirmar resposta</button></div>`;
  }else{
    const cor=r.alternativa_correta;
    if(cor)rv.acertou=(rv.marcada===cor);
    corpo=`<div class="banner" style="margin-top:10px;${rv.acertou?'background:var(--ok-bg);color:var(--ok)':'background:var(--low-bg);color:var(--low)'}">${cor?(rv.acertou?'Você acertou.':'Você errou. Marcou '+esc(rv.marcada)+'.'):'Gabarito indeterminado: diga abaixo se acertou.'}</div>
    <p><b>Gabarito:</b> ${esc(cor||'não identificado')} (${esc(r.status_gabarito)})</p>
    ${r.explicacao_resumida?`<p>${esc(r.explicacao_resumida)}</p>`:''}
    ${r.explicacao_alternativa_correta?`<p><b>Por que a correta:</b> ${esc(r.explicacao_alternativa_correta)}</p>`:''}
    ${r.motivo_do_erro?`<p><b>Motivo do erro:</b> ${esc(r.motivo_do_erro)}</p>`:''}
    ${r.conceito_chave?`<p><b>Conceito-chave:</b> ${esc(r.conceito_chave)}</p>`:''}
    ${r.dica_de_prova?`<p><b>Dica:</b> ${esc(r.dica_de_prova)}</p>`:''}
    ${cor?'':`<div class="row"><label class="row"><input type="radio" name="rv-ac" value="sim" ${rv.acertou===true?'checked':''}> Acertei</label><label class="row"><input type="radio" name="rv-ac" value="nao" ${rv.acertou===false?'checked':''}> Errei</label></div>`}
    <label class="row" style="min-height:40px"><input type="checkbox" id="rv-duvida" ${rv.duvida?'checked':''} style="width:20px;height:20px"> Ainda tenho dúvida</label>
    <div class="row" style="margin-top:8px"><button class="btn pri" data-cad="rvsalvar">Salvar revisão</button></div>`;
  }
  return `<div class="card" id="cad-rev"><h3>Revisão</h3><div class="small muted">Tente responder antes de ver o gabarito. Recordar sem consultar é o que fortalece a memória.</div>
   <p style="margin-top:8px"><b>${info?esc(info.ass):esc(r.assunto||'Assunto não informado')}</b></p><p>${esc(r.enunciado)}</p>${alts}${corpo}
   <div class="row" style="margin-top:10px"><button class="btn sm" data-cad="rvfechar">Fechar revisão</button></div></div>`;
}

/* ---------- resumo, lista e calendário ---------- */
function cadBarras(lista,max){
  if(!lista.length)return '<div class="muted small">Sem dados neste filtro.</div>';
  const top=lista[0].total||1;
  return lista.slice(0,max||10).map(x=>`<div class="ldim" style="grid-template-columns:minmax(110px,1.4fr) 2fr 36px"><span>${esc(x.nome)}</span><div class="bar"><b style="width:${Math.round(x.total/top*100)}%"></b></div><span class="small">${x.total}</span></div>`).join('');
}
function cadResumoHtml(){
  const e=CN.estatisticas(S.caderno,LOGS.map(l=>({topico:l.tp,total:l.t})),cadM(),{dias:Number(CAD.est.dias)||null,area:CAD.est.a||null});
  const evol=e.evolucaoRevisoes.length?`<div class="scroll-x"><table><thead><tr><th>Mês</th><th class="num">Revisões</th><th class="num">Acertos</th></tr></thead><tbody>${e.evolucaoRevisoes.map(m=>`<tr><td>${esc(m.mes)}</td><td class="num">${m.total}</td><td class="num">${pc(m.percentual/100)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="muted small">Ainda não há revisões registradas.</div>';
  const tab=e.topAssuntos.length?`<div class="scroll-x"><table><thead><tr><th>Assunto</th><th class="num">Erros</th><th class="num">Respondidas</th><th class="num">% de erro</th></tr></thead><tbody>${e.topAssuntos.map(a=>`<tr><td>${esc(a.nome)}${a.amostraPequena?' <span class="chip">amostra pequena</span>':''}</td><td class="num">${a.erros}</td><td class="num">${a.respondidas||'–'}</td><td class="num">${a.percentualErro===null?'–':pc(a.percentualErro/100)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="muted small">Nenhum erro neste filtro.</div>';
  return `<div class="card"><h3>Resumo dos erros</h3>
   <div class="tiles">
    <div class="tile"><div class="v">${e.total}</div><div class="l">erros registrados</div></div>
    <div class="tile"><div class="v">${e.tentativas}</div><div class="l">tentativas</div></div>
    <div class="tile"><div class="v">${e.revisadas}</div><div class="l">já revisados</div></div>
    <div class="tile"><div class="v">${e.pendentes}</div><div class="l">ainda sem revisão</div></div>
    <div class="tile"><div class="v" style="color:${e.vencidas?'var(--low)':'var(--ok)'}">${e.vencidas}</div><div class="l">revisões atrasadas</div></div>
    <div class="tile"><div class="v">${e.recorrentes}</div><div class="l">com erro recorrente</div></div></div>
   <div class="grid2" style="margin-top:12px">
    <label class="f">Período<select id="es-dias"><option value="0" ${CAD.est.dias==='0'?'selected':''}>Todo o período</option><option value="30" ${CAD.est.dias==='30'?'selected':''}>Últimos 30 dias</option><option value="90" ${CAD.est.dias==='90'?'selected':''}>Últimos 90 dias</option></select></label>
    <label class="f">Área<select id="es-area"><option value="">Todas</option>${AK.map(a=>`<option value="${a}" ${CAD.est.a===a?'selected':''}>${esc(AREAS[a].n)}</option>`).join('')}</select></label></div>
   <div class="small muted" style="margin-top:10px">Estes números mostram a distribuição dos erros que você registrou. Não são a sua taxa de erro real: a taxa só é calculada quando existem questões respondidas no mesmo assunto.</div>
   ${e.frases.map(f=>`<div class="ins">${esc(f)}</div>`).join('')}</div>
  <div class="card"><h3>Erros por grande área</h3>${cadBarras(e.porArea)}</div>
  <div class="card"><h3>Erros por disciplina</h3>${cadBarras(e.porDisciplina)}</div>
  <div class="card"><h3>Erros por competência clínica</h3>${cadBarras(e.porCompetencia)}</div>
  <div class="card"><h3>Erros por tipo</h3>${cadBarras(e.porTipo)}</div>
  <div class="card"><h3>Erros por subassunto</h3>${cadBarras(e.porSubassunto)}</div>
  <div class="card"><h3>Recorrência ao longo do tempo</h3><div class="small muted" style="margin-bottom:6px">Erros cadastrados por mês.</div>${cadBarras(e.porMes.map(m=>({nome:m.nome,total:m.total})).reverse(),12)}</div>
  <div class="card"><h3>Onde estou errando mais?</h3>${tab}<div class="small muted" style="margin-top:8px">"Amostra pequena" = menos de 5 erros. Para ver o percentual de erro, registre também as questões respondidas do mesmo tema na aba Questões. Poucos erros registrados não provam baixo domínio.</div></div>
  <div class="card"><h3>Evolução nas revisões</h3>${evol}</div>`;
}
function cadFiltrar(lista){
  const f=CAD.fil,hj=today();
  return lista.filter(i=>{
    const info=cadInfo(i.assuntoId);
    if(f.a&&(info?info.a:null)!==f.a)return false;
    if(f.tipo&&!i.registro.tipo_de_erro.includes(f.tipo))return false;
    if(f.s==='pend'&&i.revisoes.length)return false;
    if(f.s==='rev'&&!i.revisoes.length)return false;
    if(f.s==='venc'&&!(i.proximaRevisao<hj))return false;
    if(f.q){const b=CN.norm(f.q),alvo=CN.norm((i.registro.enunciado||'')+' '+(i.registro.assunto||'')+' '+(info?info.ass:'')+' '+(i.registro.subassunto||''));if(!alvo.includes(b))return false}
    return true;
  });
}
function cadCard(i){
  const info=cadInfo(i.assuntoId),r=i.registro,ab=CAD.abertos[i.id]||{},hj=today();
  const st=!i.revisoes.length?'Aguardando revisão':(i.proximaRevisao<hj?'Revisão atrasada':'Revisada');
  const alts=Object.keys(r.alternativas||{}).map(k=>`<li><b>${esc(k)})</b> ${esc(r.alternativas[k])}</li>`).join('');
  return `<div class="card">
   <div class="row sp"><div class="grow">${info?areaChip(info.a)+' ':''}<b>${esc(info?info.ass:(r.disciplina||'Sem assunto no plano'))}</b></div><span class="chip ${st==='Revisão atrasada'?'low':(st==='Revisada'?'ok':'')}">${st}</span></div>
   <div class="small muted" style="margin-top:4px">${esc(r.competencia||'Competência não informada')} · ${esc(r.tipo_de_erro.join(', ')||'tipo não informado')}${i.tentativas.length>1?' · '+i.tentativas.length+' tentativas':''}</div>
   <div style="margin-top:6px">Marcada: <b>${esc(r.alternativa_marcada||'–')}</b> · Correta: <b>${esc(r.alternativa_correta||'–')}</b> <span class="small muted">(${esc(r.status_gabarito)})</span></div>
   ${r.motivo_do_erro?`<div class="small" style="margin-top:6px"><b>Motivo do erro:</b> ${esc(r.motivo_do_erro)}</div>`:''}
   <div class="small muted" style="margin-top:4px">${i.revisoes.length?'Próxima revisão: '+fmtY(i.proximaRevisao):'Primeira revisão: '+(i.proximaRevisao===hj?'hoje':fmtY(i.proximaRevisao))}</div>
   ${ab.q?`<div class="ins"><p>${esc(r.enunciado)}</p><ul>${alts}</ul></div>`:''}
   ${ab.e?`<div class="ins">${r.explicacao_resumida?`<p>${esc(r.explicacao_resumida)}</p>`:''}${r.explicacao_alternativa_correta?`<p><b>Por que a correta:</b> ${esc(r.explicacao_alternativa_correta)}</p>`:''}${r.analise_das_alternativas?`<p><b>Outras alternativas:</b> ${esc(r.analise_das_alternativas)}</p>`:''}${r.conceito_chave?`<p><b>Conceito-chave:</b> ${esc(r.conceito_chave)}</p>`:''}${r.dica_de_prova?`<p><b>Dica:</b> ${esc(r.dica_de_prova)}</p>`:''}${r.referencias&&r.referencias.length?`<p class="small muted">Referências: ${esc(r.referencias.join('; '))}</p>`:''}${!(r.explicacao_resumida||r.explicacao_alternativa_correta||r.conceito_chave)?'<p class="muted">Sem explicação registrada.</p>':''}</div>`:''}
   <div class="row" style="margin-top:10px"><button class="btn sm" data-cad="ver" data-id="${i.id}">${ab.q?'Ocultar questão':'Ver questão completa'}</button><button class="btn sm" data-cad="expl" data-id="${i.id}">${ab.e?'Ocultar explicação':'Ver explicação'}</button><button class="btn sm pri" data-cad="revisar" data-id="${i.id}">Revisar agora</button><button class="btn sm" data-cad="editar" data-id="${i.id}">Editar ficha</button><button class="btn sm dng" data-cad="excluir" data-id="${i.id}">Excluir registro</button></div></div>`;
}
function cadCalendarioHtml(){
  const at=cadAtivos(),hj=today();
  const atr=at.filter(i=>i.proximaRevisao<hj).sort((a,b)=>a.proximaRevisao.localeCompare(b.proximaRevisao));
  const hoje=at.filter(i=>i.proximaRevisao===hj);
  const prox=at.filter(i=>i.proximaRevisao>hj&&i.proximaRevisao<=addDays(hj,14)).sort((a,b)=>a.proximaRevisao.localeCompare(b.proximaRevisao));
  const nome=i=>{const x=cadInfo(i.assuntoId);return esc(x?x.ass:(i.registro.disciplina||'questão'))};
  const lst=l=>l.length?l.map(i=>`<div class="ins">${fmt(i.proximaRevisao)} · ${nome(i)} <button class="btn sm" data-cad="revisar" data-id="${i.id}">Revisar</button></div>`).join(''):'<div class="muted small">Nenhuma.</div>';
  const hist=[];at.forEach(i=>i.revisoes.forEach(r=>hist.push({d:r.data,ok:r.acertou,n:nome(i)})));
  hist.sort((a,b)=>b.d.localeCompare(a.d));
  return `<div class="card"><h3>Calendário de revisões</h3><b>Atrasadas (${atr.length})</b>${lst(atr)}<div style="margin-top:10px"><b>Hoje (${hoje.length})</b></div>${lst(hoje)}<div style="margin-top:10px"><b>Próximos 14 dias (${prox.length})</b></div>${lst(prox)}</div>
  <div class="card"><h3>Histórico de revisões</h3>${hist.length?hist.slice(0,20).map(h=>`<div class="ins">${fmt(h.d)} · ${h.n} · <span class="chip ${h.ok?'ok':'low'}">${h.ok?'acertou':'errou'}</span></div>`).join(''):'<div class="muted small">Nenhuma revisão feita ainda.</div>'}</div>`;
}
function vCaderno(){
  const at=cadAtivos(),lista=cadFiltrar(at).sort((a,b)=>b.criadoEm.localeCompare(a.criadoEm)),f=CAD.fil;
  let h=`<div class="card"><h3>Como adicionar uma questão ao seu Caderno de Erros</h3>
   <ol style="margin:8px 0 8px 20px;padding:0"><li>Copie o prompt disponibilizado abaixo.</li><li>Abra seu chat de inteligência artificial preferido.</li><li>Cole o prompt e envie o print ou texto da questão.</li><li>Informe qual alternativa você marcou.</li><li>Copie o registro estruturado gerado pelo chat.</li><li>Volte ao Caderno de Erros e cole no campo de importação.</li><li>Confira os dados e salve.</li></ol>
   <div class="small muted">Não precisa de chave nem de conta de IA. O app só lê o texto que você colar.</div>
   <div class="row" style="margin-top:10px"><button class="btn pri" data-cad="copy1">Copiar prompt para analisar questão</button><button class="btn" data-cad="copy2">Copiar prompt para organizar uma questão já corrigida</button><button class="btn" data-cad="manual">Adicionar erro manualmente</button></div></div>`;
  h+=CAD.rasc?cadPrevia():`<div class="card"><label class="f">Cole aqui a análise da questão.<textarea id="cd-texto" style="min-height:150px" placeholder="Cole a resposta do chat, com o bloco entre INICIO_CADERNO_ERROS e FIM_CADERNO_ERROS">${esc(CAD.texto)}</textarea></label><div class="row" style="margin-top:10px"><button class="btn pri" data-cad="importar">Interpretar e importar questão</button></div></div>`;
  h+=cadRevisaoHtml();
  h+=cadResumoHtml();
  h+=`<div class="card"><h3>Questões armazenadas (${lista.length} de ${at.length})</h3><div class="grid2">
   <label class="f">Área<select id="fc-area"><option value="">Todas</option>${AK.map(a=>`<option value="${a}" ${f.a===a?'selected':''}>${esc(AREAS[a].n)}</option>`).join('')}</select></label>
   <label class="f">Situação<select id="fc-s"><option value="">Todas</option><option value="pend" ${f.s==='pend'?'selected':''}>Aguardando revisão</option><option value="rev" ${f.s==='rev'?'selected':''}>Já revisadas</option><option value="venc" ${f.s==='venc'?'selected':''}>Revisão atrasada</option></select></label>
   <label class="f">Tipo de erro<select id="fc-tipo"><option value="">Todos</option>${CN.TIPOS_ERRO.map(t=>`<option ${f.tipo===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label>
   <label class="f">Buscar no enunciado ou assunto<input type="text" id="fc-q" value="${esc(f.q)}"></label></div></div>`;
  h+=lista.length?lista.map(cadCard).join(''):`<div class="card muted">${at.length?'Nenhuma questão com esses filtros.':'Seu caderno está vazio. Importe uma questão acima ou adicione manualmente.'}</div>`;
  h+=cadCalendarioHtml();
  return h;
}

/* ---------- ações ---------- */
function cadAcao(a,id){
  switch(a){
    case 'copy1':cadCopiar(CN.PROMPT_ANALISE,'Prompt de análise');break;
    case 'copy2':cadCopiar(CN.PROMPT_CONVERTER,'Prompt de organização');break;
    case 'manual':cadManual();break;
    case 'importar':{const el=document.getElementById('cd-texto');CAD.texto=el?el.value:CAD.texto;cadImportar();break}
    case 'salvar':cadConfirmar();break;
    case 'cancelar':case 'voltar':CAD.rasc=null;render();break;
    case 'duptent':cadDecidir('tentativa',id);break;
    case 'dupsep':cadDecidir('separada',null);break;
    case 'ver':case 'expl':{const o=CAD.abertos[id]||{};const k=a==='ver'?'q':'e';o[k]=!o[k];CAD.abertos[id]=o;render();break}
    case 'revisar':CAD.rev={id,marcada:null,ok:false,duvida:false,acertou:null};CAD.rasc=null;render();{const el=document.getElementById('cad-rev');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}break;
    case 'editar':cadEditar(id);break;
    case 'excluir':
      ask('Excluir esta questão do Caderno de Erros?','Continuar',()=>ask('Exclusão definitiva: a questão, suas tentativas e revisões serão apagadas e não poderão ser recuperadas. Confirmar?','Excluir de vez',()=>{
        S.caderno=S.caderno.filter(i=>i.id!==id);delete CAD.abertos[id];if(CAD.rev&&CAD.rev.id===id)CAD.rev=null;
        touch('state');render();toast('Questão excluída definitivamente.')}));
      break;
    case 'rvconf':{const sel=document.querySelector('input[name=cd-resp]:checked');if(!sel)return toast('Escolha uma alternativa antes de confirmar.');CAD.rev.marcada=sel.value;CAD.rev.ok=true;render();break}
    case 'rvsalvar':{
      const rv=CAD.rev,it=S.caderno.find(i=>i.id===rv.id);
      const ac=document.querySelector('input[name=rv-ac]:checked');
      const acertou=it.registro.alternativa_correta?(rv.marcada===it.registro.alternativa_correta):(ac?ac.value==='sim':null);
      if(acertou===null)return toast('Diga se você acertou.');
      const d=document.getElementById('rv-duvida');
      const r=CN.agendarRevisao(it,{acertou,duvida:!!(d&&d.checked)},S.cadCfg||{});
      touch('state');CAD.rev=null;render();toast('Revisão salva. Próxima em '+fmtY(r.proximaRevisao)+'. '+r.motivo,7000);break}
    case 'rvfechar':CAD.rev=null;render();break;
  }
}
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-cad]');if(!el)return;
  ev.preventDefault();cadAcao(el.dataset.cad,el.dataset.id);
});
document.addEventListener('input',ev=>{if(ev.target.id==='cd-texto')CAD.texto=ev.target.value});
document.addEventListener('change',ev=>{
  const id=ev.target.id;
  if(id==='es-dias'||id==='es-area'){CAD.est.dias=cadVal('es-dias');CAD.est.a=cadVal('es-area');render()}
  if(id==='fc-area'||id==='fc-s'||id==='fc-tipo'||id==='fc-q'){CAD.fil.a=cadVal('fc-area');CAD.fil.s=cadVal('fc-s');CAD.fil.tipo=cadVal('fc-tipo');CAD.fil.q=cadVal('fc-q');render()}
});


/* ============ REGISTRO RÁPIDO DE QUESTÕES ============ */
/* Fluxo: tocar na área, digitar (ou usar +/−) questões e acertos, salvar. Tema e tipo de pergunta são opcionais. */
const QF={a:'',tid:''};
const logArea=l=>l.tp?areaOfTopic(l.tp):l.a;
function qfInit(tid){
  if(tid){const t=T(tid);QF.a=t?t.a:'';QF.tid=t?tid:''}
  else{QF.a=(S.lastQ&&S.lastQ.a)||'';QF.tid=''}
}
function qtOptions(){
  return '<option value="">Sem tema específico (só a área)</option>'+(QF.a?S.topics.filter(t=>t.a===QF.a).map(t=>`<option value="${t.id}" ${t.id===QF.tid?'selected':''}>${esc(t.n)}</option>`).join(''):'');
}
function qBig(f,label){
  const b='style="width:56px;height:56px;font-size:26px;flex:0 0 auto"';
  return `<div><div class="small muted" style="margin-bottom:4px">${label}</div>
    <div class="row" style="flex-wrap:nowrap;gap:8px"><button type="button" class="btn" data-q="step" data-f="${f}" data-d="-1" aria-label="menos um" ${b}>−</button>
    <input type="number" id="${f}" inputmode="numeric" min="0" placeholder="0" style="height:56px;font-size:26px;text-align:center;min-width:0">
    <button type="button" class="btn" data-q="step" data-f="${f}" data-d="1" aria-label="mais um" ${b}>+</button></div>
    <div class="row" style="margin-top:8px">${f==='qt'?[10,20,30,50].map(n=>`<button type="button" class="btn sm" data-q="set" data-f="qt" data-v="${n}">${n}</button>`).join(''):'<button type="button" class="btn sm" data-q="all">Acertei todas</button>'}</div></div>`;
}
function logForm(tid){
  qfInit(tid);
  return `<div id="qf">
  <div class="small muted" style="margin-bottom:6px">1. Toque na área</div>
  <div class="checks" id="qareas">${AK.map(a=>`<button type="button" class="ck" aria-pressed="${QF.a===a}" data-q="area" data-a="${a}" style="min-height:46px;font-size:15px"><i></i>${AREAS[a].n}</button>`).join('')}</div>
  <div class="small muted" style="margin:16px 0 6px">2. Quantas questões você fez e quantas acertou</div>
  <div class="grid2">${qBig('qt','Questões feitas')}${qBig('qc','Acertos')}</div>
  <div id="qpct" class="tile" style="margin-top:12px;text-align:center"><div class="l">Digite os números acima</div></div>
  <div class="grid2" style="margin-top:12px">
   <label class="f">Tema (opcional)<select id="lt">${qtOptions()}</select></label>
   <label class="f">Data<input type="date" id="ld" value="${today()}"></label></div>
  <details style="margin-top:12px"><summary class="small muted">Separar por tipo de pergunta (opcional)</summary>
   <div class="small muted" style="margin:8px 0">Se preencher aqui, os números de cima são ignorados. Útil para o app mostrar se você vai melhor em diagnóstico ou em tratamento.</div>
   <div class="ldim"><span class="small muted">Tipo</span><span class="small muted" style="text-align:center">Total</span><span class="small muted" style="text-align:center">Acertos</span></div>
   ${DK.map(d=>`<div class="ldim"><span>${DIMS[d]}</span><input type="number" min="0" inputmode="numeric" id="lt_${d}"><input type="number" min="0" inputmode="numeric" id="lc_${d}"></div>`).join('')}</details>
  <div class="row" style="margin-top:16px"><button class="btn pri" data-act="savelog" style="min-height:52px;font-size:17px;flex:1 1 auto">Salvar</button><button class="btn" data-act="mclose">Cancelar</button></div></div>`;
}
function qPctUpdate(){
  const el=document.getElementById('qpct');if(!el)return;
  const t=parseInt(document.getElementById('qt').value),c=parseInt(document.getElementById('qc').value);
  if(isNaN(t)||t<1||isNaN(c)){el.innerHTML='<div class="l">Digite os números acima</div>';el.style.background='';return}
  if(c<0||c>t){el.innerHTML=`<div class="v" style="color:var(--low);font-size:20px">Acertos maiores que as questões</div>`;return}
  const p=c/t;
  el.innerHTML=`<div class="v">${pc(p)}</div><div class="l">${c} de ${t} questões${S.meta&&p*100>=S.meta?' · na meta':''}</div>`;
}
function qRefreshArea(){
  document.querySelectorAll('#qareas [data-a]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a===QF.a)));
  const sel=document.getElementById('lt');if(sel)sel.innerHTML=qtOptions();
}
function saveLog(){
  const d=(document.getElementById('ld')||{}).value||today();
  const tid=(document.getElementById('lt')||{}).value||'';
  const t=tid?T(tid):null;
  const area=t?t.a:QF.a;
  if(!area)return toast('Toque na área das questões.');
  const det=[];let bad=false;
  DK.forEach(k=>{
    const tt=parseInt(document.getElementById('lt_'+k).value),cc=parseInt(document.getElementById('lc_'+k).value);
    if(!isNaN(tt)&&tt>0){const c=isNaN(cc)?0:cc;if(c>tt||c<0){bad=true;return}det.push({k,tt,c})}
  });
  if(bad)return toast('Os acertos não podem passar do total.');
  let rows;
  if(det.length)rows=det.map(r=>({id:uid(),tp:tid||null,a:area,d,dim:r.k,t:r.tt,c:r.c}));
  else{
    const tt=parseInt(document.getElementById('qt').value),cc=parseInt(document.getElementById('qc').value);
    if(isNaN(tt)||tt<1)return toast('Digite quantas questões você fez.');
    if(isNaN(cc)||cc<0)return toast('Digite quantas você acertou (pode ser 0).');
    if(cc>tt)return toast('Os acertos não podem passar do total de questões.');
    rows=[{id:uid(),tp:tid||null,a:area,d,dim:'G',t:tt,c:cc}];
  }
  const sumT=rows.reduce((s,r)=>s+r.t,0),sumC=rows.reduce((s,r)=>s+r.c,0);
  rows.forEach(r=>LOGS.push(r));
  const msg=t?applySession(t,d,sumT,sumC):`${sumC} de ${sumT} (${pc(sumC/sumT)}) registradas em ${AREAS[area].n}.`;
  S.lastQ={a:area,tid:tid||''};
  rows.forEach(r=>saveLogs(r.d));
  touch('state');
  closeModal();render();toast(msg,7000);
}
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-q]');if(!el)return;
  ev.preventDefault();
  const q=el.dataset.q;
  if(q==='area'){QF.a=el.dataset.a;const t=QF.tid&&T(QF.tid);if(t&&t.a!==QF.a)QF.tid='';qRefreshArea()}
  else if(q==='step'){const i=document.getElementById(el.dataset.f);i.value=Math.max(0,(parseInt(i.value)||0)+parseInt(el.dataset.d));qPctUpdate()}
  else if(q==='set'){document.getElementById(el.dataset.f).value=el.dataset.v;qPctUpdate()}
  else if(q==='all'){const t=document.getElementById('qt').value;if(t){document.getElementById('qc').value=t;qPctUpdate()}else toast('Digite primeiro quantas questões fez.')}
});
document.addEventListener('input',ev=>{if(ev.target.id==='qt'||ev.target.id==='qc')qPctUpdate()});
document.addEventListener('change',ev=>{
  if(ev.target.id==='lt'&&document.getElementById('qareas')){
    QF.tid=ev.target.value;const t=QF.tid&&T(QF.tid);
    if(t&&t.a!==QF.a){QF.a=t.a;document.querySelectorAll('#qareas [data-a]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a===QF.a)))}
  }
});



/* ============ AÇÕES ============ */
function afterCheck(t,k){
  const d=today();
  if(t.ck[k]){t.ck[k]=null}else t.ck[k]=d;
  if(isDone(t)&&!t.rev){t.rev={stage:0,last:d,next:addDays(d,LADDER[0]),n:0};toast('Tema concluído. Primeira revisão em '+LADDER[0]+' dias ('+fmtY(t.rev.next)+').')}
  touch('state');
}
function quickRev(id,r){
  const t=T(id);const d=today();
  if(!t.rev)t.rev={stage:0,last:d,next:d,n:0};
  const o=t.rev;
  o.stage=Math.max(0,Math.min(LADDER.length-1,o.stage+(r>0?1:r<0?-1:0)));
  o.last=d;o.n=(o.n||0)+1;o.next=addDays(d,r<0?Math.min(LADDER[o.stage],7):LADDER[o.stage]);
  touch('state');render();
  toast(`Revisão registrada. Próxima em ${fmtY(o.next)}. Questões do tema dão um ajuste mais preciso.`);
}
function backup(){
  const data=JSON.stringify({S,LOGS});
  openModal(`<h3>Cópia de segurança</h3><div class="small muted" style="margin:6px 0">Selecione tudo, copie e guarde em um lugar seguro (e-mail para você mesma, por exemplo). As imagens não entram.</div><textarea id="bk" style="min-height:160px" readonly>${esc(data)}</textarea><div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn" id="bkc">Copiar</button><button class="btn pri" data-act="mclose">Fechar</button></div>`);
  document.getElementById('bkc').onclick=async()=>{const ta=document.getElementById('bk');ta.select();try{await navigator.clipboard.writeText(ta.value);toast('Copiado.')}catch(e){toast('Selecionei o texto: copie com Ctrl+C ou segurando o dedo.')}};
}
function restore(){
  openModal(`<h3>Restaurar cópia</h3><div class="small muted" style="margin:6px 0">Cole aqui o texto da cópia. Isso substitui o que está salvo agora.</div><textarea id="rs" style="min-height:160px"></textarea><div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn" data-act="mclose">Cancelar</button><button class="btn pri" id="rsok">Restaurar</button></div>`);
  document.getElementById('rsok').onclick=()=>{
    try{const o=JSON.parse(document.getElementById('rs').value);if(!o.S||!o.S.topics||!o.S.plan)throw 0;S=o.S;LOGS=o.LOGS||[];S.imgs=(S.imgs||[]).filter(m=>IMGC.has(m.id));
      S.logMonths=[...new Set(LOGS.map(l=>l.d.slice(0,7)))].sort();touch('state',...S.logMonths.map(m=>'logs_'+m));closeModal();render();toast('Cópia restaurada.')}
    catch(e){toast('Esse texto não parece uma cópia válida.')}
  };
}

document.addEventListener('click',async ev=>{
  const el=ev.target.closest('[data-act]');if(!el)return;
  const a=el.dataset.act,id=el.dataset.id;
  if(a==='mbg'){if(ev.target===el)closeModal();return}
  if(a!=='mbg')ev.preventDefault?.();
  switch(a){
    case 'tab':VIEW=el.dataset.k;WK=null;render();window.scrollTo(0,0);break;
    case 'mclose':closeModal();break;
    case 'ck':{const t=T(id);afterCheck(t,el.dataset.k);const open=document.querySelector('.modal');render();if(open)topicModal(id);break}
    case 'wt':{const k=el.dataset.i+':'+el.dataset.k;S.wt[k]=!S.wt[k];touch('state');render();break}
    case 'topic':topicModal(id);break;
    case 'logq':logModal(id);break;
    case 'savelog':saveLog();break;
    case 'quickrev':quickRev(id,parseInt(el.dataset.r));break;
    case 'gowk':WK=parseInt(el.dataset.i);VIEW='plano';render();window.scrollTo(0,0);break;
    case 'wk':{const cur=WK==null?curWeek():WK;const d=el.dataset.d;WK=d==='cur'?curWeek():Math.max(0,Math.min(S.plan.length-1,cur+parseInt(d)));render();break}
    case 'newtopic':newTopicModal();break;
    case 'savenewtopic':{
      const n=document.getElementById('ntn').value.trim();if(!n)return toast('Dê um nome ao tema.');
      const ar=document.getElementById('nta').value;
      const nid=ar+'X'+uid().slice(0,4);
      S.topics.push({id:nid,a:ar,n,inc:parseInt(document.getElementById('nti').value),e:false,img:false,custom:true,ck:{aula:null,resumo:null,card:null},rev:null,note:''});
      const free=S.plan.findIndex((w,i)=>w.k==='new'&&i>=curWeek());
      if(free>=0)S.plan[free].t.push(nid);
      touch('state');closeModal();render();toast('Tema adicionado.');break}
    case 'savetopic':{
      const t=T(id);t.note=document.getElementById('tnote').value;
      const nw=parseInt(document.getElementById('tweek').value);
      S.plan.forEach(w=>{w.t=w.t.filter(x=>x!==id)});
      if(nw>=0&&S.plan[nw])S.plan[nw].t.push(id);
      touch('state');closeModal();render();toast('Tema atualizado.');break}
    case 'deltopic':{
      const t=T(id);
      ask(t.custom?'Excluir este tema e seus registros?':'Tirar este tema do plano? Os registros dele serão apagados.','Confirmar',()=>{
        S.topics=S.topics.filter(x=>x.id!==id);S.plan.forEach(w=>{w.t=w.t.filter(x=>x!==id)});
        const months=new Set(LOGS.filter(l=>l.tp===id).map(l=>l.d));LOGS=LOGS.filter(l=>l.tp!==id);
        S.imgs.filter(m=>m.topic===id).forEach(m=>delImg(m.id));S.imgs=S.imgs.filter(m=>m.topic!==id);
        months.forEach(d=>saveLogs(d));touch('state');render();toast('Tema removido.')});break}
    case 'qtab':QTAB=el.dataset.k;render();break;
    case 'dellog':{const l=LOGS.find(x=>x.id===id);ask('Excluir este registro?','Excluir',()=>{LOGS=LOGS.filter(x=>x.id!==id);saveLogs(l.d);render()});break}
    case 'savesim':{
      const n=document.getElementById('sn').value.trim()||'Simulado',d=document.getElementById('sd').value||today();
      const sc={};let any=false,bad=false;
      AK.forEach(ar=>{const tt=parseInt(document.getElementById('st_'+ar).value),cc=parseInt(document.getElementById('sc_'+ar).value);
        if(!isNaN(tt)&&tt>0){const c=isNaN(cc)?0:cc;if(c>tt)bad=true;sc[ar]=[tt,c];any=true}});
      if(bad)return toast('Os acertos não podem passar do total.');
      if(!any)return toast('Preencha ao menos uma área.');
      S.sims.push({id:uid(),n,d,sc});touch('state');render();toast('Simulado salvo. Ele conta no desempenho por área.');break}
    case 'delsim':ask('Excluir este simulado?','Excluir',()=>{S.sims=S.sims.filter(s=>s.id!==id);touch('state');render()});break;
    case 'addimg':pickFiles(id);break;
    case 'lightbox':lightbox(id);break;
    case 'revmode':revMode();break;
    case 'lbprev':LB.i=Math.max(0,LB.i-1);drawLB();break;
    case 'lbnext':LB.i=Math.min(LB.l.length-1,LB.i+1);drawLB();break;
    case 'lbtag':{const m=LB.l[LB.i];m.tag=el.dataset.t;touch('state');
      if(document.querySelector('.lightbox')){const wasRev=LB.l.every(x=>x.tag==='rev'||x===m);
        if(el.dataset.t==='dom'&&LB.i<LB.l.length-1)LB.i++;drawLB()}
      break}
    case 'lbsave':{const m=LB.l[LB.i];m.cap=document.getElementById('lbcap').value;touch('state');toast('Legenda salva.');break}
    case 'lbdel':{const m=LB.l[LB.i];ask('Excluir esta imagem?','Excluir',()=>{delImg(m.id);S.imgs=S.imgs.filter(x=>x.id!==m.id);touch('state');closeModal();render()});break}
    case 'savecfg':{
      const s=document.getElementById('cs').value;
      S.start=mondayOf(s||S.start);S.meta=Math.max(40,Math.min(100,parseInt(document.getElementById('cm').value)||75));
      S.hw=parseInt(document.getElementById('chw').value)||3;S.hf=parseInt(document.getElementById('chf').value)||5;
      const xe=document.getElementById('cx').value;if(xe)S.exam=xe;
      const iv=document.getElementById('cci').value.split(',').map(x=>parseInt(x.trim()));
      if(iv.length>=2&&iv.every((n,i)=>n>=1&&n<=365&&(i===0||n>iv[i-1])))S.cadCfg={...(S.cadCfg||{}),intervalosCaderno:iv};
      else toast('Intervalos do Caderno: use números crescentes, como 1, 3, 7, 14, 30.');
      touch('state');render();toast('Salvo. O início do plano é sempre uma segunda-feira.');break}
    case 'backup':backup();break;
    case 'restore':restore();break;
    case 'replan':ask('Refazer a ordem das semanas? Marcações e questões continuam.','Refazer',()=>{S.plan=genPlan(S.topics,planDims(S.start,S.exam));S.wt={};touch('state');render();toast('Plano de semanas refeito.')});break;
  }
});
document.addEventListener('change',ev=>{
  const id=ev.target.id;
  if(id==='tq'||id==='ta'||id==='ts'){TF.q=document.getElementById('tq').value;TF.a=document.getElementById('ta').value;TF.s=document.getElementById('ts').value;render()}
  if(id==='la'||id==='lti'||id==='lg'){LIBF.a=document.getElementById('la').value;LIBF.t=document.getElementById('lti').value;LIBF.tag=document.getElementById('lg').value;if(id==='la')LIBF.t='';render()}
});
function flushNow(){if(dirty.size){clearTimeout(saveTimer);saveTimer=null;flush()}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushNow()});
window.addEventListener('pagehide',flushNow);
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape')closeModal();
  if(ev.key==='Enter'&&ev.target.id==='tq'){TF.q=ev.target.value;render()}
});

/* ============ INÍCIO ============ */
(async function(){
  const warn=await loadAll();
  const w0=curWeek();
  if(warn){document.getElementById('main').innerHTML=`<div class="banner">${warn}</div>`}
  render();
  if(warn){const m=document.getElementById('main');m.insertAdjacentHTML('afterbegin',`<div class="banner">${warn}</div>`)}
  setSave('ok');
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}
})();
