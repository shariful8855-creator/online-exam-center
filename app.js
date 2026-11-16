const $ = id => document.getElementById(id);
const hasConfig = window.SUPABASE_URL && !window.SUPABASE_URL.startsWith("YOUR_") && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.startsWith("YOUR_");
const db = hasConfig && window.supabase ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
let currentExam=null, questions=[], answers={}, currentIndex=0, remaining=0, timerHandle=null, adminUser=null;
const bn = n => String(n).replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d]);
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2800)}
function show(view){['examView','quizView','resultView','adminView'].forEach(id=>$(id).classList.toggle('hidden',id!==view));$('hero').classList.toggle('hidden',view!=='examView');$('navExams').classList.toggle('active',view==='examView'||view==='quizView'||view==='resultView');$('navAdmin').classList.toggle('active',view==='adminView')}
function configWarning(){if(!db){$('examList').innerHTML='<div class="empty">ওয়েবসাইট চালু করতে Supabase সেটআপ বাকি আছে। README ফাইলে ধাপে ধাপে নির্দেশনা দেওয়া হয়েছে।</div>';}}
async function loadExams(){
 if(!db){configWarning();return}
 $('examList').innerHTML='<div class="loading">লোড হচ্ছে...</div>';
 const {data,error}=await db.from('exams').select('id,title,subject,duration_minutes,created_at').eq('published',true).order('created_at',{ascending:false});
 if(error){$('examList').innerHTML='<div class="empty">পরীক্ষা লোড করা যায়নি। ডেটাবেস সেটআপ ও নীতিমালা যাচাই করো।</div>';return}
 if(!data.length){$('examList').innerHTML='<div class="empty">এখনো কোনো পরীক্ষা প্রকাশ করা হয়নি। অ্যাডমিন প্যানেল থেকে প্রশ্ন আপলোড করো।</div>';return}
 $('examList').innerHTML=data.map(e=>`<article class="exam-card"><p class="eyebrow">${esc(e.subject||'অনুশীলন')}</p><h3>${esc(e.title)}</h3><div class="exam-meta"><span>◷ ${bn(e.duration_minutes)} মিনিট</span><span>▤ MCQ পরীক্ষা</span></div><button class="primary-btn" data-start="${e.id}">পরীক্ষা শুরু করো →</button></article>`).join('');
 document.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',()=>startExam(b.dataset.start)));
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function startExam(id){
 const {data:exam,error}=await db.from('exams').select('*').eq('id',id).single();
 if(error){toast('পরীক্ষা খোলা যায়নি');return}
 const {data:q,error:qerr}=await db.from('questions').select('*').eq('exam_id',id).order('position');
 if(qerr||!q?.length){toast('এই পরীক্ষায় প্রশ্ন পাওয়া যায়নি');return}
 currentExam=exam;questions=q;answers={};currentIndex=0;remaining=(exam.duration_minutes||30)*60;
 $('quizTitle').textContent=exam.title;$('quizSubject').textContent=exam.subject||'অনুশীলন';show('quizView');renderQuestion();updateTimer();clearInterval(timerHandle);timerHandle=setInterval(()=>{remaining--;updateTimer();if(remaining<=0)submitExam()},1000);
}
function updateTimer(){$('timer').textContent='⏱ '+bn(Math.floor(remaining/60).toString().padStart(2,'0'))+':'+bn((remaining%60).toString().padStart(2,'0'))}
function renderQuestion(){
 const q=questions[currentIndex];$('progressText').textContent=`প্রশ্ন ${bn(currentIndex+1)} / ${bn(questions.length)}`;$('progressBar').style.width=((currentIndex+1)/questions.length*100)+'%';
 const opts=Array.isArray(q.options)?q.options:[];
 $('questionArea').innerHTML=`<div class="question-number">প্রশ্ন ${bn(currentIndex+1)}</div><div class="question-text">${esc(q.question_text)}</div>${opts.map((o,i)=>`<label class="option ${answers[q.id]===i?'selected':''}"><input type="radio" name="answer" value="${i}" ${answers[q.id]===i?'checked':''}><span>${'ABCD'[i]||i+1}. ${esc(o)}</span></label>`).join('')}`;
 document.querySelectorAll('input[name=answer]').forEach(r=>r.addEventListener('change',()=>{answers[q.id]=Number(r.value);renderQuestion()}));
 $('prevBtn').disabled=currentIndex===0;$('prevBtn').style.opacity=currentIndex===0?'.45':'1';
 $('nextBtn').classList.toggle('hidden',currentIndex===questions.length-1);$('submitBtn').classList.toggle('hidden',currentIndex!==questions.length-1);
}
async function submitExam(){
 clearInterval(timerHandle);let correct=0,wrong=0,skip=0;questions.forEach(q=>{if(answers[q.id]===undefined)skip++;else if(answers[q.id]===q.correct_index)correct++;else wrong++});
 const percent=Math.round(correct/questions.length*100);$('scoreText').textContent=`${bn(correct)} / ${bn(questions.length)}`;$('scorePercent').textContent=`তোমার প্রাপ্ত নম্বর ${bn(percent)}%`;
 $('correctCount').textContent=bn(correct);$('wrongCount').textContent=bn(wrong);$('skipCount').textContent=bn(skip);
 $('reviewList').innerHTML='<h3>উত্তর পর্যালোচনা</h3>'+questions.map((q,i)=>{const a=answers[q.id],ok=a===q.correct_index;return `<div class="review-item"><b>${bn(i+1)}. ${esc(q.question_text)}</b><div class="${ok?'correct':'wrong'}">${a===undefined?'উত্তর দাওনি':(ok?'সঠিক উত্তর':'তোমার উত্তর: '+esc(q.options[a]))}</div><div class="correct">সঠিক উত্তর: ${esc(q.options[q.correct_index])}</div>${q.explanation?`<div class="muted">ব্যাখ্যা: ${esc(q.explanation)}</div>`:''}</div>`}).join('');
 show('resultView');
}
function parseTxt(text){
 const blocks=text.replace(/\r/g,'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean),out=[];
 for(const block of blocks){
  const lines=block.split('\n').map(s=>s.trim()).filter(Boolean);
  const qline=lines.find(s=>/^প্রশ্ন\s*[:：]/i.test(s)||/^Q\s*[:：]/i.test(s));
  const q=qline?qline.replace(/^(প্রশ্ন|Q)\s*[:：]\s*/i,'').trim():'';
  const opts=['A','B','C','D'].map(k=>{const l=lines.find(s=>new RegExp('^'+k+'\\s*[).ঃ:：-]').test(s));return l?l.replace(new RegExp('^'+k+'\\s*[).ঃ:：-]\\s*'),'').trim():''});
  const ansline=lines.find(s=>/^(উত্তর|ANS|ANSWER)\s*[:：]/i.test(s));
  const ans=ansline?ansline.replace(/^(উত্তর|ANS|ANSWER)\s*[:：]\s*/i,'').trim().toUpperCase():'';
  const expl=lines.find(s=>/^ব্যাখ্যা\s*[:：]/i.test(s));
  const explanation=expl?expl.replace(/^ব্যাখ্যা\s*[:：]\s*/i,'').trim():'';
  const correct_index='ABCD'.indexOf(ans[0]);
  if(q&&opts.every(Boolean)&&correct_index>=0)out.push({question_text:q,options:opts,correct_index,explanation});
 }
 return out;
}
async function adminState(){
 if(!db){$('adminLogin').classList.remove('hidden');return}
 const {data:{session}}=await db.auth.getSession();adminUser=session?.user||null;
 if(adminUser){const {data}=await db.from('admins').select('user_id').eq('user_id',adminUser.id).maybeSingle();if(data){$('adminLogin').classList.add('hidden');$('adminDashboard').classList.remove('hidden');loadAdminExams()}else{$('adminLogin').classList.remove('hidden');$('adminDashboard').classList.add('hidden');$('loginNotice').textContent='এই অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত নয়।'}}else{$('adminLogin').classList.remove('hidden');$('adminDashboard').classList.add('hidden')}
}
async function loadAdminExams(){const {data}=await db.from('exams').select('id,title,subject').order('created_at',{ascending:false});$('adminExamList').innerHTML=(data||[]).map(e=>`<div class="admin-exam"><span><b>${esc(e.title)}</b><br><small class="muted">${esc(e.subject||'')}</small></span><button class="delete-btn" data-delete="${e.id}">মুছুন</button></div>`).join('')||'<p class="muted">কোনো পরীক্ষা নেই।</p>';document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteExam(b.dataset.delete))}
async function deleteExam(id){if(!confirm('এই পরীক্ষা ও এর প্রশ্ন মুছে ফেলবে?'))return;const {error}=await db.from('exams').delete().eq('id',id);if(error)toast('মুছতে সমস্যা হয়েছে');else{toast('পরীক্ষা মুছে ফেলা হয়েছে');loadAdminExams();loadExams()}}
$('navExams').onclick=()=>{show('examView');loadExams()};$('homeLink').onclick=e=>{e.preventDefault();show('examView');loadExams()};$('navAdmin').onclick=()=>{show('adminView');adminState()};$('refreshBtn').onclick=loadExams;$('backToExams').onclick=()=>{clearInterval(timerHandle);show('examView');loadExams()};$('prevBtn').onclick=()=>{if(currentIndex>0){currentIndex--;renderQuestion()}};$('nextBtn').onclick=()=>{if(currentIndex<questions.length-1){currentIndex++;renderQuestion()}};$('submitBtn').onclick=()=>{if(confirm('তুমি কি পরীক্ষা জমা দিতে চাও?'))submitExam()};$('resultHome').onclick=()=>{show('examView');loadExams()};
$('txtFile').onchange=()=>{$('fileInfo').textContent=$('txtFile').files[0]?.name||'এখনো কোনো ফাইল নির্বাচন করা হয়নি।'};
$('loginBtn').onclick=async()=>{if(!db){$('loginNotice').textContent='আগে config.js-এ Supabase তথ্য বসাও।';return}const {error}=await db.auth.signInWithPassword({email:$('adminEmail').value,password:$('adminPassword').value});$('loginNotice').textContent=error?error.message:'লগইন হয়েছে।';adminState()};
$('logoutBtn').onclick=async()=>{await db.auth.signOut();adminState()};
$('uploadBtn').onclick=async()=>{
 const title=$('examTitle').value.trim(),subject=$('examSubject').value.trim(),duration=Number($('examDuration').value),file=$('txtFile').files[0];
 if(!title||!file||!duration){$('uploadNotice').textContent='পরীক্ষার নাম, সময় ও TXT ফাইল দিতে হবে।';return}
 const parsed=parseTxt(await file.text());if(!parsed.length){$('uploadNotice').textContent='ফাইলের ফরম্যাট ঠিক নেই। README-তে নমুনা দেখো।';return}
 $('uploadNotice').textContent=`${bn(parsed.length)}টি প্রশ্ন পাওয়া গেছে, আপলোড হচ্ছে...`;
 const {data:exam,error}=await db.from('exams').insert({title,subject,duration_minutes:duration,published:true,created_by:adminUser.id}).select().single();
 if(error){$('uploadNotice').textContent='আপলোড হয়নি: '+error.message;return}
 const rows=parsed.map((q,i)=>({...q,exam_id:exam.id,position:i+1}));
 const {error:qerr}=await db.from('questions').insert(rows);
 if(qerr){await db.from('exams').delete().eq('id',exam.id);$('uploadNotice').textContent='প্রশ্ন সংরক্ষণ হয়নি: '+qerr.message;return}
 $('uploadNotice').textContent=`সফল! ${bn(parsed.length)}টি প্রশ্নসহ পরীক্ষা প্রকাশিত হয়েছে।`;$('examTitle').value='';$('examSubject').value='';$('txtFile').value='';$('fileInfo').textContent='এখনো কোনো ফাইল নির্বাচন করা হয়নি।';loadAdminExams();loadExams();
};
$('year').textContent=new Date().getFullYear();show('examView');loadExams();
