import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import {todayISO,addDays} from '../../public/js/domain.js';
test('browse, filter, favorite and restore a real local preference',async({page})=>{
 const failures=[],external=[];
 page.on('pageerror',e=>failures.push(e.message));
 page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4328'))external.push(request.url());});
 await page.goto('/');
 await expect(page.locator('.stay-card')).toHaveCount(6);
 await page.locator('[data-filter="bosque"]').click();await expect(page.locator('.stay-card')).toHaveCount(2);
 await page.locator('#pets').check();await expect(page.locator('#empty-state')).toBeVisible();
 await page.locator('#reset-filters').click();await expect(page.locator('.stay-card')).toHaveCount(6);
 await page.locator('[data-favorite="lago"]').click();await page.reload();
 await expect(page.locator('#favorites-count')).toHaveText('1');
 await page.locator('#favorites-toggle').click();await expect(page.locator('.stay-card')).toHaveCount(1);
 expect(external).toEqual([]);expect(failures).toEqual([]);
});
test('complete a priced stay, persist it and download text and calendar files',async({page})=>{
 await page.goto('/');await page.locator('[data-open="lago"]').click();
 await page.locator('#book-checkin').fill(addDays(todayISO(),1));
 await page.locator('#book-checkout').fill(addDays(todayISO(),4));
 await page.locator('#book-breakfast').check();await page.locator('#book-walk').check();
 const total=await page.locator('#quote-breakdown [data-total]').getAttribute('data-total');
 await page.locator('#save-plan').click();await expect(page.locator('#plan-dialog')).toBeVisible();
 await expect(page.locator('#plan-content [data-total]')).toHaveAttribute('data-total',total);
 const download1=page.waitForEvent('download');await page.locator('#download-text').click();
 const file1=await download1;expect(await readFile(await file1.path(),'utf8')).toContain('No es una reserva.');
 const download2=page.waitForEvent('download');await page.locator('#download-calendar').click();
 const file2=await download2;expect(await readFile(await file2.path(),'utf8')).toContain('BEGIN:VCALENDAR');
 await page.locator('[data-close="plan-dialog"]').click();await page.reload();await page.locator('#open-plan').click();
 await expect(page.locator('#plan-content h3')).toHaveText('El refugio del lago');
 await page.locator('#delete-plan').click();await expect(page.locator('.plan-empty')).toBeVisible();
});
test('date and availability errors prevent invalid plans and recover',async({page})=>{
 await page.goto('/');await page.locator('#checkout').fill(await page.locator('#checkin').inputValue());
 await page.locator('.search-submit').click();await expect(page.locator('#search-error')).toContainText('posterior');
 await page.locator('[data-open="lago"]').click();
 await page.locator('#book-checkin').fill(addDays(todayISO(),12));await page.locator('#book-checkout').fill(addDays(todayISO(),14));
 await expect(page.locator('#booking-error')).toContainText('ocupadas');await expect(page.locator('#save-plan')).toBeDisabled();
 await page.locator('#book-checkin').fill(addDays(todayISO(),2));await page.locator('#book-checkout').fill(addDays(todayISO(),4));
 await expect(page.locator('#save-plan')).toBeEnabled();
});
test('privacy control only clears Senda data; storage denial is honestly reported',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('unrelated','keep'));
 await page.locator('[data-favorite="lago"]').click();await page.locator('#privacy-button').click();await page.locator('#clear-data').click();
 await expect(page.locator('#privacy-feedback')).toContainText('borrado');
 expect(await page.evaluate(()=>localStorage.getItem('unrelated'))).toBe('keep');
 await page.locator('[data-close="privacy-dialog"]').click();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('denied');};});
 await page.locator('[data-favorite="lago"]').click();await expect(page.locator('#toast')).toContainText('no permite guardarlos');
});
test('keyboard dialog escape restores focus and FAQ works without custom widgets',async({page})=>{
 await page.goto('/');await page.locator('#open-plan').focus();await page.keyboard.press('Enter');
 await expect(page.locator('#plan-dialog')).toBeVisible();await page.keyboard.press('Escape');
 await expect(page.locator('#open-plan')).toBeFocused();
 await page.locator('summary').first().click();await expect(page.locator('details').first()).toHaveAttribute('open','');
});
test('reduced motion skips smooth scrolling and the saved plan attaches to the edge',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(()=>{window.scrollChoices=[];const original=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(options){window.scrollChoices.push(options?.behavior);return original.call(this,options);};});
 await page.locator('#favorites-toggle').click();
 expect(await page.evaluate(()=>window.scrollChoices)).toContain('instant');
 expect(await page.evaluate(()=>window.scrollChoices)).not.toContain('smooth');
 await page.locator('#open-plan').click();
 const bounds=await page.locator('#plan-dialog').boundingBox();expect(Math.abs(bounds.x+bounds.width-1440)).toBeLessThan(2);
 expect(await page.locator('#plan-dialog').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('desktop, mobile and planner have no axe A/AA violations or horizontal overflow',async({page})=>{
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const home=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(home.violations).toEqual([]);
  await page.locator('[data-open="lago"]').click();
  const modal=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(modal.violations).toEqual([]);
  await page.locator('[data-close="stay-dialog"]').click();
 }
});

