import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:4328/');
await page.evaluate(()=>document.fonts.ready);
const values=[];
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});
 const measurements=await page.evaluate(()=>({width:innerWidth,gap:document.querySelector('.hero').getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth}));
 assert.equal(measurements.gap,width>760?28:18);assert.equal(measurements.overflow,false);values.push(measurements);
}
await page.setViewportSize({width:1440,height:900});
await page.locator('.site-header nav a').first().hover();
const hover=await page.locator('.site-header nav a').first().evaluate(el=>({background:getComputedStyle(el).backgroundColor,underline:getComputedStyle(el).textDecorationLine}));
assert.equal(hover.underline,'none');assert.notEqual(hover.background,'rgba(0, 0, 0, 0)');
await mkdir('docs/screenshots',{recursive:true});
await page.screenshot({path:'docs/screenshots/header-hover.png'});
await page.locator('#open-plan').hover();
await page.screenshot({path:'docs/screenshots/header-action-hover.png'});
await writeFile('evidence/header-refinement.json',JSON.stringify({testedAt:new Date().toISOString(),passed:true,values,hover},null,2));
console.log(JSON.stringify({headerRefinement:'passed',values,hover}));
await browser.close();

