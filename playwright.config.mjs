import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',workers:1,timeout:45000,
 use:{baseURL:'http://127.0.0.1:4328',channel:process.env.CI?undefined:'chrome',headless:true,viewport:{width:1440,height:1000},trace:'retain-on-failure'},
 webServer:{command:'node tools/serve.mjs',url:'http://127.0.0.1:4328',timeout:30000,reuseExistingServer:!process.env.CI},
 reporter:[['list'],['json',{outputFile:'evidence/browser-tests.json'}]]
});

