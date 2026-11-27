import { readFileSync } from 'node:fs';
const verify=(source)=>{
function check(ok,description){if(!ok)throw Error(description);passed.push(description)}
const passed=[];
const first=source.split('\n')[0];const html=JSON.parse(first.slice(11,-1));const client=html.slice(html.indexOf('<script>')+8,html.indexOf('</script>'));
new Function(client);check(true,'Client JavaScript parses');
new Function(source.replace('export default','return'));check(true,'Worker JavaScript parses');
const routes=new Function(client.slice(client.indexOf('const validToken='),client.indexOf('function readSaved'))+';return {parseRoute,routeHash}')();
const t='a'.repeat(64),id='12345678-1234-1234-1234-123456789012';
for(const [hash,expected] of [['#'+t,{token:t,page:'home',id:''}],[routes.routeHash(t,'standings'),{token:t,page:'standings',id:''}],[routes.routeHash(t,'profile',id),{token:t,page:'profile',id}],[routes.routeHash(t,'record',id),{token:t,page:'record',id}],['#/trips',{token:'',page:'home',id:''}],['#/trip/invalid',{token:'',page:'home',id:''}]]){
check(JSON.stringify(routes.parseRoute(hash))===JSON.stringify(expected),'Route '+(expected.page==='home'?(expected.token?'legacy':'no active trip'):expected.page));
}
const calc=new Function('data','games','const fresh=()=>({w:0,l:0,form:[]});const pair=(a,b)=>[a,b].sort().join("|");'+client.slice(client.indexOf('function stats()'),client.indexOf('function streak'))+';return stats()');
const players=['A','B','C','D','E','F','G'].map(id=>({id}));
const games=[{w1:'A',w2:'B',l1:'C',l2:'D'},{w1:'A',w2:'C',l1:'B',l2:'D'},{w1:'E',w2:'F',l1:'C',l2:'D'}];
const result=calc({players},()=>games);
check(result.individual.map(x=>x[0]).join('')==='AEFBCDG','Individual ranking by win percentage, wins, no games last');
check(result.partnership[0][1].w===1&&result.partnership[0][1].l===0,'One-game partnership qualifies');
check(result.versus['A|D'].w===2&&result.versus['D|A'].l===2,'Head-to-head stats');
check(!/provisional|three games to qualify/i.test(client),'No provisional labels');
check(client.includes("slots=g?participants(g):['','','','']"),'New games are blank; edits keep players');
check(client.includes("team=st.partnership.find(([id,s])=>s.w+s.l>0)"),'Featured leaders qualify from first game');
return passed;
};
const source=readFileSync(new URL('../src/worker.js',import.meta.url),'utf8');
const passed=verify(source);for(const name of passed)console.log('PASS',name);console.log(passed.length+' checks passed');
