import { stays } from './catalog.js';
const DAY = 86400000;
export const money = cents => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:cents%100===0?0:2}).format(cents/100);
export function todayISO(now=new Date()){return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}
export function parseDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
 const date=new Date(value+'T12:00:00Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value) return null;
 return date;
}
export function addDays(iso,number){const date=parseDate(iso);if(!date)return '';date.setUTCDate(date.getUTCDate()+number);return date.toISOString().slice(0,10);}
export function nextWeekend(today=todayISO()){const d=parseDate(today);const offset=(5-d.getUTCDay()+7)%7;const start=addDays(today,offset);return {checkin:start,checkout:addDays(start,2)};}
export function formatDate(iso){const date=parseDate(iso);return date?new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',timeZone:'UTC'}).format(date):'Sin fecha';}
export function validateDates(checkin,checkout,today=todayISO(),allowPast=false){
 const start=parseDate(checkin),end=parseDate(checkout),base=parseDate(today);
 if(!start||!end) return {ok:false,error:'Elige una fecha de llegada y otra de salida.'};
 if(!allowPast&&start<base)return {ok:false,error:'La llegada no puede estar en el pasado. Elige hoy o una fecha posterior.'};
 const nights=(end-start)/DAY;
 if(nights<1)return {ok:false,error:'La salida debe ser posterior a la llegada.'};
 if(nights>14)return {ok:false,error:'Esta demo permite estancias de hasta 14 noches. Acorta las fechas.'};
 if(!allowPast&&(start-base)/DAY>180)return {ok:false,error:'Elige una llegada dentro de los próximos 180 días.'};
 return {ok:true,nights,start,end};
}
export function unavailableDates(stay,today=todayISO()){return [addDays(today,stay.blockedOffset),addDays(today,stay.blockedOffset+1)];}
export function isAvailable(stay,checkin,checkout,today=todayISO()){
 return !unavailableDates(stay,today).some(day=>day>=checkin&&day<checkout);
}
export function quote(stay,input,{today=todayISO(),historical=false}={}){
 if(!stay)return {ok:false,error:'No encontramos ese refugio. Vuelve a elegir uno.'};
 const dates=validateDates(input.checkin,input.checkout,today,historical);
 if(!dates.ok)return dates;
 const guests=Number(input.guests);
 if(!Number.isInteger(guests)||guests<1||guests>stay.capacity)return {ok:false,error:'Este refugio admite de 1 a '+stay.capacity+' personas. Ajusta los huéspedes.'};
 if(!historical&&!isAvailable(stay,input.checkin,input.checkout,today))return {ok:false,error:'Estas fechas están ocupadas en el calendario de ejemplo. Prueba otro fin de semana.'};
 let lodging=0,weekendNights=0;
 for(let day=0;day<dates.nights;day++){
  const dow=parseDate(addDays(input.checkin,day)).getUTCDay();
  const weekend=dow===5||dow===6;
  weekendNights+=weekend?1:0;
  lodging+=Math.round(stay.price*(weekend?1.2:1));
 }
 const discount=dates.nights>=3?Math.round(lodging*0.1):0;
 const breakfast=input.breakfast?1200*guests*dates.nights:0;
 const walk=input.walk?2500*guests:0;
 return {ok:true,nights:dates.nights,guests,lodging,weekendNights,discount,cleaning:stay.cleaning,breakfast,walk,total:lodging-discount+stay.cleaning+breakfast+walk};
}
export function filterStays(filters,today=todayISO()){
 return stays.filter(stay=>
  (filters.landscape==='all'||stay.landscape===filters.landscape)&&
  stay.capacity>=Number(filters.guests||1)&&
  stay.price<=Number(filters.maxPrice||250)*100&&
  (!filters.pets||stay.petFriendly)&&
  (!filters.favoritesOnly||(filters.favorites||[]).includes(stay.id))&&
  (!filters.checkin||!filters.checkout||isAvailable(stay,filters.checkin,filters.checkout,today))
 ).sort((a,b)=>filters.sort==='price-asc'?a.price-b.price:filters.sort==='price-desc'?b.price-a.price:stays.indexOf(a)-stays.indexOf(b));
}
export function sanitizeState(input){
 const value=input&&typeof input==='object'?input:{};
 const favorites=Array.isArray(value.favorites)?[...new Set(value.favorites.filter(id=>stays.some(s=>s.id===id)))]:[];
 let plan=null;
 if(value.plan&&typeof value.plan==='object'){
  const p=value.plan,stay=stays.find(s=>s.id===p.stayId);
  const safe={stayId:stay?.id,checkin:p.checkin,checkout:p.checkout,guests:Number(p.guests),breakfast:p.breakfast===true,walk:p.walk===true};
  if(stay&&quote(stay,safe,{historical:true}).ok)plan=safe;
 }
 return {favorites,plan};
}
export function itineraryText(plan){
 const stay=stays.find(s=>s.id===plan.stayId);const q=quote(stay,plan,{historical:true});
 if(!q.ok)throw Error('Invalid itinerary');
 return ['SENDA / TU ESCAPADA','Plan de demostración. No es una reserva.', '',stay.name,stay.region,
 'Llegada: '+plan.checkin,'Salida: '+plan.checkout,q.guests+' personas · '+q.nights+' noches',
 '', 'Alojamiento: '+money(q.lodging),'Descuento de estancia: -'+money(q.discount),'Preparación y limpieza: '+money(q.cleaning),'Desayunos: '+money(q.breakfast),'Ruta guiada: '+money(q.walk),'TOTAL DE EJEMPLO: '+money(q.total),'',
 'Este plan solo se guarda en tu dispositivo. No se envía a ningún alojamiento.'].join('\n');
}
export function itineraryICS(plan){
 const stay=stays.find(s=>s.id===plan.stayId);
 if(!quote(stay,plan,{historical:true}).ok)throw Error('Invalid itinerary');
 const compact=s=>s.replaceAll('-','');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Senda Portfolio Demo//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT',
 'UID:senda-'+stay.id+'-'+compact(plan.checkin)+'@demo.invalid',
 'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),
 'DTSTART;VALUE=DATE:'+compact(plan.checkin),'DTEND;VALUE=DATE:'+compact(plan.checkout),
 'SUMMARY:Demo Senda - '+stay.name,'DESCRIPTION:Plan ficticio de portfolio. NO es una reserva.','STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}

