export const VERSION = 1;
export const SEASON_DAYS = 60;
export const WORLD_HOURS_PER_REAL_HOUR = 4;
export const SEASON_HOURS = SEASON_DAYS * 24;
export const GOODS = {
  herb: { name: 'Erva', icon: '🍃', base: 75 },
  pills: { name: 'Sintéticos', icon: '💊', base: 210 },
  parts: { name: 'Peças', icon: '⚙️', base: 155 },
};
export const CRIMES = [
  { id:'pickpocket', name:'Bater carteira', tag:'Rua', difficulty:12, energy:9, hours:0.5, low:70, high:165, heat:4, stat:'agility', description:'Uma distração rápida no centro.' },
  { id:'shop', name:'Assaltar lojinha', tag:'Rua', difficulty:21, energy:15, hours:1, low:160, high:360, heat:7, stat:'strength', description:'Um caixa distraído e uma rota de fuga.' },
  { id:'warehouse', name:'Invadir depósito', tag:'Planejamento', difficulty:31, energy:22, hours:2, low:330, high:650, heat:11, stat:'intelligence', description:'A fechadura é fácil; sair com a carga, nem tanto.' },
  { id:'cars', name:'Roubar carros', tag:'Organizado', difficulty:43, energy:29, hours:3, low:680, high:1120, heat:15, stat:'agility', description:'Uma garagem vigiada, vários veículos valiosos.' },
  { id:'armored', name:'Atacar carro-forte', tag:'Alto risco', difficulty:58, energy:36, hours:4, low:1600, high:2700, heat:22, stat:'strength', description:'Explosivo, cronômetro e muita coragem.' },
  { id:'bank', name:'Assaltar banco', tag:'Alto risco', difficulty:75, energy:44, hours:6, low:3100, high:5100, heat:29, stat:'intelligence', description:'Uma operação para criminosos experientes.' },
];
export const FACTORIES = [
  { id:'greenhouse', name:'Estufa clandestina', good:'herb', price:2200, perHour:0.15, capacity:60, heat:1, description:'Produção constante, fácil de revender.' },
  { id:'lab', name:'Laboratório', good:'pills', price:6900, perHour:0.085, capacity:36, heat:2, description:'Margem alta, operação mais arriscada.' },
  { id:'chopshop', name:'Oficina de desmanche', good:'parts', price:11500, perHour:0.11, capacity:45, heat:3, description:'Transforma veículos em peças valiosas.' },
];
export const ATTRS = [
  {id:'strength',label:'Força',icon:'💪',description:'Ameaça e combate'},
  {id:'intelligence',label:'Inteligência',icon:'🧠',description:'Planejamento e estratégia'},
  {id:'agility',label:'Agilidade',icon:'⚡',description:'Fuga e ação furtiva'},
  {id:'charisma',label:'Carisma',icon:'🎭',description:'Negociação e influência'},
];
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const round=v=>Math.round(v);
const roll=()=>Math.random();
export const formatMoney=v=>'$'+Math.floor(v).toLocaleString('pt-BR');
export const currentDay=s=>Math.floor(s.hours/24)+1;
export const currentHour=s=>String(Math.floor(s.hours%24)).padStart(2,'0')+':'+String(Math.round((s.hours%1)*60)%60).padStart(2,'0');
export const finished=s=>s.mode==='season' && s.hours>=SEASON_HOURS;
export const availableEnergy=s=>Math.max(0,Math.floor(s.energy));
export const statsPower=s=>s.stats.strength+s.stats.intelligence+s.stats.agility+s.stats.charisma;
export const assetsValue=s=>s.factories.reduce((sum,f)=>sum+(FACTORIES.find(x=>x.id===f.id)?.price||0)*f.count,0);
export const inventoryValue=s=>Object.keys(GOODS).reduce((sum,id)=>sum+(s.inventory[id]||0)*GOODS[id].base,0);
export const respect=s=>Math.max(0,Math.floor(statsPower(s)*11 + (s.cash+s.bank+assetsValue(s)+inventoryValue(s))*0.15+s.crimesWon*24));
export const crimeChance=(s,c)=>clamp(round(53+(s.stats[c.stat]*1.15+s.stats.intelligence*.38+s.stats.agility*.22-c.difficulty)*1.65-s.heat*.14),8,95);
export const factoryOutput=(s,f)=>Math.min(f.count*f.capacity,Math.floor(f.stock));
export const canAct=s=>!finished(s)&&s.jailUntil<=s.hours&&s.health>0;
const EVENT_LIST=[
  {id:'quiet',title:'Uma cidade em silêncio',body:'Nenhum evento especial afeta o mercado hoje.',good:null,mult:1},
  {id:'port',title:'Navio estrangeiro no porto',body:'Os compradores das docas pagam mais pelas peças.',good:'parts',mult:1.4},
  {id:'party',title:'Raves lotadas',body:'A procura por sintéticos subiu por toda a cidade.',good:'pills',mult:1.35},
  {id:'harvest',title:'Grande apreensão',body:'Uma operação policial reduziu a oferta de erva.',good:'herb',mult:1.5},
  {id:'surplus',title:'Excesso de mercadoria',body:'O preço dos sintéticos caiu após uma nova rota de abastecimento.',good:'pills',mult:.7},
  {id:'checkpoints',title:'Polícia nas ruas',body:'Agentes reforçaram as rondas. Evite chamar atenção.',good:null,mult:1},
];
export const marketEvent=s=>EVENT_LIST[(Math.floor((currentDay(s)-1)/3))%EVENT_LIST.length];
export const marketPrice=(s,good)=>Math.round(GOODS[good].base*(marketEvent(s).good===good?marketEvent(s).mult:1)*(1+Math.sin(currentDay(s)*.72+good.length)*.09));
export const rivals=s=>[
  {name:'Viper',initial:1600,rate:335,accent:'#d98951'},
  {name:'Fantasma',initial:1200,rate:290,accent:'#96a8d6'},
  {name:'Mamba',initial:900,rate:380,accent:'#b6d47e'}
].map((x,i)=>({name:x.name,respect:Math.floor(x.initial+x.rate*Math.max(0,s.hours/24)+Math.sin(s.hours/36+i)*350),accent:x.accent}));
export const leaderboard=s=>[...rivals(s),{name:s.name,respect:respect(s),isPlayer:true,accent:'#dc5c57'}].sort((a,b)=>b.respect-a.respect);
export function newGame({name='Sem Nome',mode='season'}={}){
  const now=Date.now();
  return {version:VERSION,name:name.trim().slice(0,22)||'Sem Nome',mode,startedAt:now,lastSavedAt:now,hours:8,energy:100,health:100,heat:4,cash:2600,bank:0,stats:{strength:12,intelligence:12,agility:12,charisma:12},inventory:{herb:0,pills:0,parts:0},factories:[],crimesWon:0,crimesFailed:0,jailUntil:0,records:[],lastEventDay:1};
}
function log(s,title,description,tone='neutral'){
  s.records=[{id:`${Date.now()}-${Math.floor(roll()*1e7)}`,day:currentDay(s),title,description,tone},...s.records].slice(0,55);
}
export function advance(s,additionalHours){
  if(!(additionalHours>0)) return s;
  const next=structuredClone(s);
  const passage=next.mode==='season'?Math.max(0,Math.min(additionalHours,SEASON_HOURS-next.hours)):additionalHours;
  if(!passage)return next;
  next.hours+=passage;
  next.energy=clamp(next.energy+passage*1.8,0,100);
  next.heat=clamp(next.heat-passage*.22,0,100);
  next.health=clamp(next.health+passage*.3,1,100);
  for(const factory of next.factories){
    const spec=FACTORIES.find(f=>f.id===factory.id);
    if(spec)factory.stock=Math.min(factory.count*spec.capacity,factory.stock+passage*spec.perHour*factory.count);
  }
  if(finished(next)&&!finished(s))log(next,'Fim da temporada',`Você encerrou a rodada com ${respect(next).toLocaleString('pt-BR')} de respeito.`,'good');
  return next;
}
export function offlineProgress(s,now=Date.now()){
  const previous=Number(s.lastSavedAt)||now;
  const elapsed=Math.max(0,(now-previous)/3600000);
  const next=advance(s,Math.min(elapsed*WORLD_HOURS_PER_REAL_HOUR,24*90));
  const total=next.factories.reduce((x,f)=>x+Math.floor(f.stock),0);
  if(elapsed>=.02&&next.hours>s.hours&&next.factories.length)log(next,'Enquanto você estava fora',`Suas operações continuaram trabalhando. Estoque atual: ${total} unidades.`,'neutral');
  next.lastSavedAt=now;
  return next;
}
function failReason(s,energy=0){
  if(finished(s))return 'A temporada terminou. Continue no infinito ou comece uma nova.';
  if(s.jailUntil>s.hours)return 'Você está preso. Avance o tempo para sair.';
  if(s.health<=0)return 'Você precisa de atendimento médico.';
  if(s.energy<energy)return `Estamina insuficiente (${energy} necessários).`;
  return null;
}
export function perform(s,action){
  const next=structuredClone(s);
  const error=(message)=>({state:s,error:message});
  const ok=(value)=>({state:value,error:null});
  const energyCost=action.type==='crime'?CRIMES.find(c=>c.id===action.id)?.energy:action.type==='train'?14:0;
  if(action.type==='crime'||action.type==='train'||action.type==='buy'||action.type==='sell'){
    const bad=failReason(next,energyCost);
    if(bad)return error(bad);
  }
  if(action.type==='crime'){
    const crime=CRIMES.find(c=>c.id===action.id);
    if(!crime)return error('Roubo não encontrado.');
    const chance=crimeChance(next,crime);
    next.energy-=crime.energy;
    const success=roll()*100<chance;
    if(success){
      const earned=round(crime.low+roll()*(crime.high-crime.low));
      next.cash+=earned;next.crimesWon++;
      next.stats[crime.stat]+=roll()<.45?2:1;
      next.heat=clamp(next.heat+crime.heat,0,100);
      log(next,'Golpe bem-sucedido',`${crime.name}: +${formatMoney(earned)}. Chance: ${chance}%.`,'good');
    }else{
      next.crimesFailed++;
      next.heat=clamp(next.heat+crime.heat*1.55,0,100);
      const damage=Math.floor(5+roll()*16);
      next.health=Math.max(1,next.health-damage);
      const arrested=roll()<(0.14+next.heat/200);
      if(arrested){next.jailUntil=next.hours+8;next.cash=Math.max(0,next.cash-100);}
      log(next,arrested?'Preso pela polícia':'O roubo falhou',`${crime.name}: -${damage} de saúde${arrested?', detido por 8 horas':''}. Chance: ${chance}%.`,'bad');
    }
    return ok(advance(next,crime.hours));
  }
  if(action.type==='train'){
    if(!ATTRS.some(x=>x.id===action.id))return error('Atributo inválido.');
    const cost=trainingCost(next,action.id);
    if(next.cash<cost)return error('Dinheiro insuficiente para treinar.');
    next.cash-=cost;next.energy-=14;next.stats[action.id]+=3;
    log(next,'Treinamento concluído',`+3 em ${ATTRS.find(x=>x.id===action.id).label}. Custo: ${formatMoney(cost)}.`,'good');
    return ok(advance(next,2));
  }
  if(action.type==='buy'){
    const spec=FACTORIES.find(x=>x.id===action.id);if(!spec)return error('Negócio desconhecido.');
    if(next.cash<spec.price)return error('Dinheiro insuficiente para comprar.');
    next.cash-=spec.price;
    const existing=next.factories.find(x=>x.id===spec.id);
    if(existing)existing.count++;else next.factories.push({id:spec.id,count:1,stock:0});
    next.heat=clamp(next.heat+spec.heat,0,100);
    log(next,'Novo negócio adquirido',`Você comprou ${spec.name} por ${formatMoney(spec.price)}.`,'good');
    return ok(advance(next,1));
  }
  if(action.type==='sell'){
    const good=action.id;
    if(!GOODS[good])return error('Produto inválido.');
    const total=next.factories.filter(f=>FACTORIES.find(x=>x.id===f.id)?.good===good).reduce((v,f)=>v+Math.floor(f.stock),0);
    if(!total)return error('Sem mercadorias para vender.');
    const price=marketPrice(next,good);
    let sold=0;
    for(const f of next.factories){if(FACTORIES.find(x=>x.id===f.id)?.good===good){const qty=Math.floor(f.stock);f.stock-=qty;sold+=qty;}}
    next.cash+=sold*price;
    next.heat=clamp(next.heat+Math.ceil(sold/24),0,100);
    log(next,'Venda nas docas',`${sold}x ${GOODS[good].name}: +${formatMoney(sold*price)}.`,'good');
    return ok(advance(next,.5));
  }
  if(action.type==='rest'){
    if(finished(next))return error('A temporada terminou.');
    const hours=clamp(Number(action.hours)||8,1,24);
    let updated=advance(next,hours);
    updated.energy=clamp(updated.energy+hours*7,0,100);
    updated.health=clamp(updated.health+hours*1.5,0,100);
    updated.jailUntil=Math.max(updated.jailUntil,updated.hours);
    log(updated,'Descanso',`Você descansou ${hours}h, recuperou energia e a cidade continuou em movimento.`);
    return ok(updated);
  }
  if(action.type==='hospital'){
    const cost=400;
    if(next.cash<cost)return error('Você precisa de $400 para receber atendimento.');
    if(finished(next))return error('A temporada terminou.');
    next.cash-=cost;next.health=100;next.jailUntil=Math.max(next.jailUntil,next.hours);
    log(next,'Alta hospitalar','Saúde recuperada ao máximo por $400.','good');
    return ok(advance(next,3));
  }
  if(action.type==='deposit'||action.type==='withdraw'){
    if(finished(next))return error('A temporada terminou.');
    const amount=Math.floor(Number(action.amount));
    if(!Number.isFinite(amount)||amount<=0)return error('Informe um valor válido.');
    if(action.type==='deposit'){
      if(next.cash<amount)return error('Você não tem esse dinheiro em mãos.');
      next.cash-=amount;next.bank+=amount;
    }else{
      if(next.bank<amount)return error('Saldo bancário insuficiente.');
      next.bank-=amount;next.cash+=amount;
    }
    log(next,action.type==='deposit'?'Depósito realizado':'Saque realizado',formatMoney(amount));
    return ok(next);
  }
  if(action.type==='infinite'){
    if(!finished(next))return error('Conclua a temporada antes de continuar no modo infinito.');
    next.mode='infinite';
    log(next,'Modo infinito desbloqueado','Sua cidade continua após o encerramento da temporada.','good');
    return ok(next);
  }
  return error('Ação desconhecida.');
}
export const trainingCost=(s,id)=>Math.round(130+s.stats[id]*22);
export function validateSave(raw){
  if(!raw||raw.version!==VERSION||!['season','infinite'].includes(raw.mode))throw new Error('Save incompatível.');
  if(!raw.stats||!ATTRS.every(x=>Number.isFinite(raw.stats[x.id])&&raw.stats[x.id]>=0))throw new Error('Atributos inválidos.');
  if(!Array.isArray(raw.factories)||!raw.factories.every(f=>FACTORIES.some(x=>x.id===f.id)&&Number.isInteger(f.count)&&f.count>=1&&Number.isFinite(f.stock)&&f.stock>=0))throw new Error('Negócios inválidos.');
  if(!Number.isFinite(raw.hours)||raw.hours<0||!Number.isFinite(raw.cash)||raw.cash<0||!Number.isFinite(raw.bank)||raw.bank<0)return false;
  return true;
}