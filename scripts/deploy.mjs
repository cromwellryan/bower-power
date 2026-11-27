import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import './check.mjs';
const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID;
if(!token||!account)throw Error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in your environment. Never commit credentials.');
// Deploy only a clean checkout of main. Explicitly fetch origin/main and verify the checkout.
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
git('fetch','origin','main');
if(git('rev-parse','HEAD')!==git('rev-parse','origin/main')||git('status','--porcelain'))throw Error('Deploy only from a clean checkout of the current origin/main.');
const config=JSON.parse(readFileSync(new URL('../deployment.json',import.meta.url),'utf8'));
const source=readFileSync(new URL('../'+config.entry,import.meta.url),'utf8');
const metadata={main_module:config.main_module,compatibility_date:config.compatibility_date,compatibility_flags:config.compatibility_flags,bindings:config.bindings};
const form=new FormData();form.append('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}));form.append(config.main_module,new Blob([source],{type:'application/javascript+module'}),config.main_module);
const response=await fetch('https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(account)+'/workers/scripts/'+encodeURIComponent(config.worker),{method:'PUT',headers:{Authorization:'Bearer '+token},body:form});
const result=await response.json();if(!response.ok||!result.success)throw Error(JSON.stringify(result.errors||[]));console.log('Deployed commit',git('rev-parse','HEAD'),'as',result.result.deployment_id);
