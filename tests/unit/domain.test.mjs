import test from 'node:test';
import assert from 'node:assert/strict';
import {stays} from '../../public/js/catalog.js';
import {addDays,parseDate,validateDates,quote,filterStays,sanitizeState,itineraryText,itineraryICS,todayISO} from '../../public/js/domain.js';
import {readState,writeState} from '../../public/js/storage.js';
const today='2026-11-16',lake=stays[0];
test('calendar arithmetic handles leap days and DST without shifting dates',()=>{
 assert.equal(parseDate('2026-02-29'),null);assert.ok(parseDate('2028-02-29'));
 assert.equal(addDays('2026-03-28',2),'2026-03-30');
 assert.equal(addDays('2026-12-31',1),'2027-01-01');
 assert.equal(todayISO(new Date(2026,10,16,1)),today);
});
test('date validation rejects missing, past, reversed, overlong and distant stays',()=>{
 for(const [a,b] of [['',''],['2026-11-15','2026-11-17'],['2026-11-17','2026-11-17'],['2026-11-17','2026-12-02'],['2027-06-20','2027-06-22']])assert.equal(validateDates(a,b,today).ok,false);
 assert.equal(validateDates('2026-11-16','2026-11-30',today).nights,14);
});
test('prices apply weekend surcharge, long-stay discount and extras in cents',()=>{
 const q=quote(lake,{checkin:'2026-11-20',checkout:'2026-11-23',guests:2,breakfast:true,walk:true},{today});
 assert.equal(q.weekendNights,2);assert.equal(q.lodging,43520);assert.equal(q.discount,4352);
 assert.equal(q.breakfast,7200);assert.equal(q.walk,5000);assert.equal(q.total,53768);
});
test('capacity and booked nights are validated, departure day is exclusive',()=>{
 assert.equal(quote(lake,{checkin:'2026-11-20',checkout:'2026-11-22',guests:5},{today}).ok,false);
 assert.equal(quote(lake,{checkin:'2026-11-28',checkout:'2026-11-30',guests:2},{today}).ok,false);
 assert.equal(quote(lake,{checkin:'2026-11-26',checkout:'2026-11-28',guests:2},{today}).ok,true);
});
test('filters combine actual budget, capacity, pets, favorites and availability',()=>{
 const f={landscape:'all',maxPrice:150,guests:2,pets:true,favoritesOnly:true,favorites:['lago','pinos'],sort:'price-asc'};
 assert.deepEqual(filterStays(f,today).map(s=>s.id),['lago']);
 assert.deepEqual(filterStays({...f,checkin:'2026-11-28',checkout:'2026-11-30'},today),[]);
 assert.equal(filterStays({...f,maxPrice:80},today).length,0);
});
test('saved state rejects injected IDs, impossible dates and unrelated personal data',()=>{
 const safe=sanitizeState({favorites:['lago','lago','<script>'],email:'private',plan:{stayId:'lago',checkin:'not-date',checkout:'2026-11-22',guests:2}});
 assert.deepEqual(safe,{favorites:['lago'],plan:null});
 const valid=sanitizeState({plan:{stayId:'lago',checkin:'2026-11-20',checkout:'2026-11-22',guests:'2',breakfast:'yes',walk:true,email:'private'}});
 assert.equal(valid.plan.breakfast,false);assert.equal(valid.plan.walk,true);assert.equal('email' in valid.plan,false);
});
test('local storage failures and corrupt JSON are recoverable',()=>{
 assert.deepEqual(readState({getItem:()=>'{bad'}),{favorites:[],plan:null});
 assert.equal(writeState({setItem(){throw Error('quota');}},{favorites:['lago']}),false);
});
test('exports identify the demo and use exclusive all-day calendar dates',()=>{
 const plan={stayId:'lago',checkin:'2026-11-20',checkout:'2026-11-22',guests:2,breakfast:false,walk:false};
 assert.match(itineraryText(plan),/No es una reserva/);
 const ics=itineraryICS(plan);assert.match(ics,/DTSTART;VALUE=DATE:20261120/);assert.match(ics,/DTEND;VALUE=DATE:20261122/);assert.match(ics,/STATUS:TENTATIVE/);
 assert.throws(()=>itineraryICS({...plan,stayId:'bad'}));
});

