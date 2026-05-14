const EVENT_DATE = new Date(2026, 5, 27, 21, 0, 0);
(function(){const d=document.getElementById('countdown-days');
const h=document.getElementById('countdown-hours');
const m=document.getElementById('countdown-minutes');
const s=document.getElementById('countdown-seconds');
if(!d)return;
function t(){let diff=EVENT_DATE-new Date();
if(diff<0)diff=0;
const days=Math.floor(diff/86400000);
const hrs=Math.floor(diff%86400000/3600000);
const mins=Math.floor(diff%3600000/60000);
const secs=Math.floor(diff%60000/1000);
d.textContent=String(days).padStart(2,'0');
h.textContent=String(hrs).padStart(2,'0');
m.textContent=String(mins).padStart(2,'0');
s.textContent=String(secs).padStart(2,'0');}
t();setInterval(t,1000);})();