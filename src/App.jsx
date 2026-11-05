import { useEffect, useMemo, useState } from 'react';
import recipeData from './data/recipes.json';

const KEY = {
  users: 'recipeUsers', current: 'recipeCurrentUser', email: 'recipeCurrentEmail',
  logged: 'recipeLoggedIn', requests: 'recipeSubmissionRequests', ratings: 'recipeRatings', comments: 'recipeComments',
  custom: 'recipeCustomApproved', deleted: 'recipeDeletedIds'
};
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const groups = [
  {key:'indian-veg', title:'Indian Vegetarian', names:recipeData.indianVegetarianNames, details:recipeData.indianVegDetails, folder:'indian-veg', start:1},
  {key:'indian-nonveg', title:'Indian Non-Vegetarian', names:recipeData.indianNonVegetarianNames, details:recipeData.indianNonVegDetails, folder:'indian-nonveg', start:51},
  {key:'western', title:'Western Recipes', names:recipeData.westernNames, details:recipeData.westernRecipeDetails, folder:'western', start:101},
  {key:'dessert', title:'Desserts', names:recipeData.dessertNames, details:recipeData.dessertRecipeDetails, folder:'dessert', start:151},
  {key:'healthy', title:'Healthy Recipes', names:recipeData.healthyNames, details:recipeData.healthyRecipeDetails, folder:'healthy', start:201}
];
const baseRecipes = groups.flatMap(g => g.names.map((name,i) => ({
  id:g.start+i, title:name, category:g.key, categoryTitle:g.title,
  image:`/images/${g.folder}/${slug(name)}.jpg`,
  ingredients:g.details[name]?.ingredients || [], steps:g.details[name]?.steps || [],
  description:`${name} prepared with carefully selected ingredients.`,
  time:'30–50 minutes', custom:false
})));
const ADMIN_EMAIL='navadeep292@gmail.com';
const makeSingleRecipeUrl = recipe => {
 const url = new URL(window.location.href);
 url.search = '';
 url.hash = '';
 if (recipe.custom) {
  // Community recipes only exist in this browser, so the content travels inside the link (image excluded to keep it short).
  const payload = { id: recipe.id, title: recipe.title, categoryTitle: recipe.categoryTitle, description: recipe.description, ingredients: recipe.ingredients || [], steps: recipe.steps || [], time: recipe.time || '', custom: true };
  url.searchParams.set('sharedRecipe', btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
 } else {
  url.searchParams.set('recipe', recipe.id);
 }
 return url.toString();
};
const readSharedRecipe = () => {
 try {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('recipe');
  if (id) return baseRecipes.find(r => String(r.id) === id) || null;
  const encoded = params.get('sharedRecipe');
  if (!encoded) return null;
  const value = JSON.parse(decodeURIComponent(escape(atob(encoded.replace(/ /g, '+')))));
  if (!value || typeof value.title !== 'string' || !Array.isArray(value.ingredients) || !Array.isArray(value.steps)) return null;
  return { ...value, image: '/images/foodi.png' };
 } catch { return null; }
};
const hasShareParam = () => { const p = new URLSearchParams(window.location.search); return p.has('recipe') || p.has('sharedRecipe'); };
function SharedRecipePage({ recipe, onLogout, onBrowse }) {
 return <div><header className="navbar"><div className="nav-container"><div className="logo"><span className="logo-icon">🍴</span><span className="logo-text">RecipeHub</span></div><nav className="nav-menu"><button className="logout-button" style={{background:'transparent',color:'#f05a00',border:'1px solid #f05a00'}} onClick={onBrowse}>Browse RecipeHub</button><button className="logout-button" onClick={onLogout}>Logout</button></nav></div></header><main className="shared-recipe-page"><article className="shared-recipe-card"><p className="section-subtitle">SHARED RECIPE</p><h1>{recipe.title}</h1><p>{recipe.description}</p>{recipe.image && <img className="shared-recipe-image" src={recipe.image} alt={recipe.title} onError={e=>{e.currentTarget.style.display='none';}}/>}<p className="shared-recipe-category">{recipe.categoryTitle || 'RecipeHub'} {recipe.time ? `· ${recipe.time}` : ''}</p><section><h2>Ingredients</h2><ul>{recipe.ingredients.map((item,i)=><li key={i}>{item}</li>)}</ul></section><section><h2>Preparation</h2><ol>{recipe.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></section><footer>Shared from RecipeHub</footer></article></main></div>;
}

function SubmitIllustration(){
 return <svg viewBox="0 0 400 340" role="img" className="submit-illustration"><defs><radialGradient id="pl" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#fff6e6"/><stop offset="1" stopColor="#f6d9a8"/></radialGradient></defs>
  <rect width="400" height="340" rx="24" fill="#fde7d2"/>
  <ellipse cx="200" cy="292" rx="150" ry="14" fill="#00000014"/>
  <circle cx="200" cy="170" r="128" fill="#b4531a"/><circle cx="200" cy="170" r="118" fill="url(#pl)" stroke="#d99a4e" strokeWidth="3"/>
  <circle cx="200" cy="170" r="52" fill="#c0392b"/><circle cx="200" cy="170" r="44" fill="#e0592a"/><circle cx="188" cy="160" r="9" fill="#f6c453"/><circle cx="212" cy="176" r="8" fill="#6b8e23"/><circle cx="196" cy="184" r="7" fill="#f6c453"/>
  <circle cx="118" cy="130" r="30" fill="#6b8e23"/><circle cx="118" cy="130" r="22" fill="#85a832"/><circle cx="110" cy="124" r="5" fill="#fff6e6"/><circle cx="126" cy="136" r="5" fill="#fff6e6"/>
  <circle cx="286" cy="130" r="30" fill="#d9822b"/><circle cx="286" cy="130" r="22" fill="#eba54a"/><circle cx="278" cy="124" r="4" fill="#a8541a"/><circle cx="294" cy="136" r="4" fill="#a8541a"/>
  <circle cx="132" cy="220" r="28" fill="#f7efd9" stroke="#e5d3a8" strokeWidth="2"/><path d="M110 220q22-14 44 0" stroke="#e5d3a8" strokeWidth="3" fill="none"/>
  <path d="M262 200q30-10 40 18q-20 22-48 8z" fill="#e9b872" stroke="#c98a3c" strokeWidth="2"/><path d="M270 208q16-4 24 10" stroke="#c98a3c" strokeWidth="2" fill="none"/>
  <path d="M158 62q-14-20 0-36M200 56q-14-20 0-38M242 62q-14-20 0-36" stroke="#e0592a" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".55"/>
  <g transform="translate(40 250) rotate(-20)"><ellipse cx="0" cy="0" rx="22" ry="10" fill="#6b8e23"/><path d="M-20 0h40" stroke="#4d6a14" strokeWidth="2"/></g>
  <g transform="translate(360 240) rotate(25)"><ellipse cx="0" cy="0" rx="22" ry="10" fill="#6b8e23"/><path d="M-20 0h40" stroke="#4d6a14" strokeWidth="2"/></g>
  <circle cx="52" cy="70" r="9" fill="#c0392b"/><circle cx="352" cy="82" r="7" fill="#f6c453"/><circle cx="70" cy="300" r="6" fill="#e0592a"/><circle cx="340" cy="296" r="8" fill="#c0392b"/>
 </svg>;
}
function Auth({mode,setMode,onLogin,onRegister,onAdminLogin,sharedNotice}) {
 const [form,setForm]=useState({name:'',email:'',password:'',confirm:''});
 const [show,setShow]=useState(false);
 const update=e=>setForm({...form,[e.target.name]:e.target.value});
 const isAdmin=mode==='admin';
 const isRegister=mode.endsWith('-register');
 const isSubmitter=false;
 const loginMode='viewer-login';
 if(mode==='choose') return <section className="auth-page"><div className="auth-container"><div className="auth-card auth-choice-card"><div className="auth-logo"><span>🍴</span><h1>RecipeHub</h1></div><h2>Welcome to RecipeHub</h2>{sharedNotice&&<p className="shared-login-notice">🔒 Someone shared a recipe with you. Please log in or register to view it.</p>}<p className="auth-subtitle">Choose how you want to continue.</p><button className="auth-button" type="button" onClick={()=>setMode('viewer-login')}>User Mode 1 – View Recipes</button><button className="auth-button admin-choice-button" type="button" onClick={()=>setMode('admin')}>Admin Login</button><div className="auth-switch"><p>New to RecipeHub?</p><button type="button" className="link-button" onClick={()=>setMode('viewer-register')}>Register</button></div></div></div></section>;
 const submit=e=>{
  e.preventDefault();
  if(isRegister) onRegister(form,'viewer');
  else if(isAdmin) onAdminLogin(form);
  else onLogin(form,'viewer');
 };
 return <section className="auth-page"><div className="auth-container"><div className="auth-card">
  <div className="auth-logo"><span>🍴</span><h1>RecipeHub</h1></div>
  {sharedNotice&&<p className="shared-login-notice">🔒 Please log in to view the shared recipe.</p>}
  <h2>{isAdmin?'Admin Login':isRegister?'Create Account':'User Login'}</h2>
  <p className="auth-subtitle">{isAdmin?'Sign in with your administrator credentials to review recipe requests.':isRegister?'Create an account to browse, rate, comment, save and submit recipes.':'Sign in to browse, rate, comment, save and submit recipes.'}</p>
  <form onSubmit={submit}>
   {isRegister&&<div className="form-group"><label>Full Name</label><input name="name" value={form.name} onChange={update} placeholder="Enter your full name" required /></div>}
   <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={update} placeholder={isAdmin?'Enter admin email':'Enter your email'} required autoComplete="username" /></div>
   <div className="form-group"><label>Password</label><div className="password-wrapper"><input type={show?'text':'password'} name="password" value={form.password} onChange={update} placeholder="Enter your password" required minLength="6" autoComplete={isRegister?'new-password':'current-password'}/><button type="button" className="toggle-password" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>👁</button></div></div>
   {isRegister&&<div className="form-group"><label>Confirm Password</label><input type="password" name="confirm" value={form.confirm} onChange={update} placeholder="Confirm your password" required autoComplete="new-password" /></div>}
   <button className="auth-button" type="submit">{isAdmin?'Login as Admin':isRegister?'Register':isSubmitter?'Login as Recipe Contributor':'Login as Recipe Viewer'}</button>
  </form>
  {!isAdmin&&<div className="auth-switch"><p>{isRegister?'Already have an account?':'Don’t have an account?'} <button type="button" className="link-button" onClick={()=>setMode(isRegister?loginMode:(isSubmitter?'submitter-register':'viewer-register'))}>{isRegister?'Login':'Register'}</button></p></div>}
  <button type="button" className="admin-entry" onClick={()=>{setForm({name:'',email:'',password:'',confirm:''});setShow(false);setMode('choose');}}>← Back to Login Options</button>
 </div></div></section>
}
function App(){
 const [users,setUsers]=useState(()=>read(KEY.users,[]));
 const [current,setCurrent]=useState(()=>localStorage.getItem(KEY.email)||'');
 const [logged,setLogged]=useState(()=>localStorage.getItem(KEY.logged)==='true');
 const [authMode,setAuthMode]=useState('choose');
 const [admin,setAdmin]=useState(()=>localStorage.getItem('recipeUserRole')==='admin');
 const [userMode,setUserMode]=useState('viewer');
 const [category,setCategory]=useState('');
 const [indianFilter,setIndianFilter]=useState('indian-veg');
 const [search,setSearch]=useState('');
 const [selected,setSelected]=useState(null);
 const [requests,setRequests]=useState(()=>read(KEY.requests,[]));
 const [ratings,setRatings]=useState(()=>read(KEY.ratings,{}));
 const [approved,setApproved]=useState(()=>read(KEY.custom,[]));
 const [deletedIds,setDeletedIds]=useState(()=>read(KEY.deleted,[]));
 const [requestForm,setRequestForm]=useState({title:'',category:'healthy',description:'',ingredients:'',steps:'',image:''});
 const [message,setMessage]=useState('');
 const [adminSearch,setAdminSearch]=useState('');
 const [adminTab,setAdminTab]=useState('pending');
 const [savedByUser,setSavedByUser]=useState(()=>read('recipeSavedByUser',{}));
 const [shareOpen,setShareOpen]=useState(false);
 const [showSubmit,setShowSubmit]=useState(false);
 const [comments,setComments]=useState({});
 const [adminComments,setAdminComments]=useState([]);
 const [commentsError,setCommentsError]=useState('');
 const [commentDraft,setCommentDraft]=useState('');
 useEffect(()=>{write(KEY.users,users)},[users]);
 useEffect(()=>{write(KEY.requests,requests)},[requests]);
 useEffect(()=>{write(KEY.ratings,ratings)},[ratings]);
 useEffect(()=>{if(!selected)return;let active=true;const recipeId=selected.id;const load=async()=>{const response=await fetch(`/api/comments/${encodeURIComponent(recipeId)}`);if(!response.ok)throw new Error();let list=await response.json();const migrationKey=`recipeCommentsMigrated:${recipeId}`;if(!localStorage.getItem(migrationKey)){const legacy=read(KEY.comments,{})[recipeId]||[];for(const old of legacy){if(!old?.text)continue;const saved=await fetch(`/api/comments/${encodeURIComponent(recipeId)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner:old.owner||current,text:old.text})});if(saved.ok)list.push(await saved.json());}localStorage.setItem(migrationKey,'true');}if(active)setComments(prev=>({...prev,[recipeId]:list}));};load().catch(()=>{if(active)setCommentsError('Comments are temporarily unavailable. Please try again.');});return()=>{active=false;};},[selected?.id,current]);
 useEffect(()=>{if(!admin||adminTab!=='comments')return;let active=true;fetch('/api/admin/comments').then(r=>{if(!r.ok)throw new Error('Could not load comments.');return r.json();}).then(list=>{if(active)setAdminComments(list);}).catch(()=>{if(active)setCommentsError('Admin comment access is unavailable. Please log in again.');});return()=>{active=false;};},[admin,adminTab]);
 useEffect(()=>{write(KEY.custom,approved)},[approved]);
 useEffect(()=>{write(KEY.deleted,deletedIds)},[deletedIds]);
 useEffect(()=>{write('recipeSavedByUser',savedByUser)},[savedByUser]);
 useEffect(()=>{if(admin){document.getElementById('adminSection')?.scrollIntoView({behavior:'instant',block:'start'});}},[admin]);
 useEffect(()=>{if(category){requestAnimationFrame(()=>document.getElementById('recipesSection')?.scrollIntoView({behavior:'smooth',block:'start'}));}},[category]);
 const recipes=useMemo(()=>[...baseRecipes,...approved].filter(r=>!deletedIds.includes(r.id)),[approved,deletedIds]);
 const [sharedRecipe,setSharedRecipe]=useState(()=>readSharedRecipe());
 const [shareLinkPending,setShareLinkPending]=useState(()=>hasShareParam());
 const [loginCount,setLoginCount]=useState(()=>Number(localStorage.getItem('recipeLoginCount')||0));
 const closeSharedRecipe=()=>{window.history.replaceState({},'',window.location.pathname);setSharedRecipe(null);setShareLinkPending(false);};
 const avg=id=>{const vals=Object.values(ratings[id]||{}); return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length):0};
 const ratingCount=id=>Object.keys(ratings[id]||{}).length;
 const filtered=useMemo(()=>{
  if(!category) return [];
  let list=recipes;
  if(category==='indian') list=list.filter(r=>r.category===indianFilter);
  else if(category && category!=='all') list=list.filter(r=>r.category===category);
  if(search.trim()) list=list.filter(r=>r.title.toLowerCase().includes(search.toLowerCase())||r.categoryTitle.toLowerCase().includes(search.toLowerCase()));
  return list;
 },[recipes,category,indianFilter,search]);
 const login=(f,requestedMode='viewer')=>{
  if(f.email.trim().toLowerCase()===ADMIN_EMAIL){alert('This email is reserved for the administrator. Please choose Admin Login.');return;}
  const u=users.find(x=>x.email.toLowerCase()===f.email.toLowerCase()&&x.password===f.password&&((x.mode||'viewer')===requestedMode || (requestedMode==='viewer' && x.mode==='submitter')));
  if(!u){alert(requestedMode==='viewer'?'No account found for these credentials. Please register or check your login details.':'No account found for these credentials. Please register or check your login details.');return;}
  const n=Number(localStorage.getItem('recipeLoginCount')||0)+1;localStorage.setItem('recipeLoginCount',String(n));setLoginCount(n);setAdmin(false);setUserMode('viewer');localStorage.setItem('recipeUserMode','viewer');localStorage.setItem('recipeUserRole','user');setCurrent(u.email);setLogged(true);localStorage.setItem(KEY.logged,'true');localStorage.setItem(KEY.email,u.email);localStorage.setItem(KEY.current,u.name);
 };
 const adminLogin=async f=>{
  try{const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:f.email,password:f.password})});if(!response.ok)throw new Error();}catch{alert('Administrator sign in failed. Start the RecipeHub server and try again.');return;}
  setAdmin(true);setLogged(true);setCurrent(ADMIN_EMAIL);localStorage.setItem(KEY.logged,'true');localStorage.setItem(KEY.email,ADMIN_EMAIL);localStorage.setItem('recipeUserRole','admin');localStorage.removeItem(KEY.current);setAuthMode('admin');
 };
 const register=(f,requestedMode='viewer')=>{
  if(f.email.trim().toLowerCase()===ADMIN_EMAIL){alert('This email is reserved for the administrator.');return;}
  if(f.password!==f.confirm){alert('Passwords do not match.');return;}
  if(f.password.length<6){alert('Password must contain at least 6 characters.');return;}
  if(users.some(u=>u.email.toLowerCase()===f.email.toLowerCase())){alert('This email is already registered.');return;}
  setUsers([...users,{name:f.name,email:f.email,password:f.password,mode:'viewer'}]);alert('Account created. Please log in.');setAuthMode('viewer-login');
 };
 const logout=()=>{if(admin)fetch('/api/admin/logout',{method:'POST',credentials:'same-origin'}).catch(()=>{});setLogged(false);setAdmin(false);setCurrent('');setAuthMode('choose');localStorage.removeItem(KEY.logged);localStorage.removeItem(KEY.email);localStorage.removeItem(KEY.current);localStorage.removeItem('recipeUserRole');localStorage.removeItem('recipeUserMode');setCategory('');};
 const rate=(id,value)=>{if(!logged||admin||userMode!=='viewer'){alert('Only Recipe Viewer accounts can rate recipes.');return;}setRatings(prev=>({...prev,[id]:{...(prev[id]||{}),[current]:value}}));};
 const share=async r=>{if(userMode!=='viewer'||admin)return;const url=makeSingleRecipeUrl(r);const text=`${r.title} – RecipeHub\n${url}`;try{if(navigator.share) await navigator.share({title:r.title,text,url});else{await navigator.clipboard.writeText(text);alert('Single-recipe link copied!');}}catch{}};
 const savedIds=savedByUser[current]||[];
 const toggleSave=r=>{if(!current||userMode!=='viewer'||admin)return;setSavedByUser(prev=>{const list=prev[current]||[];const next=list.includes(r.id)?list.filter(id=>id!==r.id):[...list,r.id];return {...prev,[current]:next};});};
 const copyRecipeLink=async r=>{const url=makeSingleRecipeUrl(r);try{await navigator.clipboard.writeText(`${r.title} – RecipeHub\n${url}`);alert('Single-recipe link copied!');}catch{alert('Copy is unavailable in this browser. Use the Share button on your device.');}};
 const pickImage=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){alert('Please choose an image file.');return;}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=800,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);setRequestForm(f=>({...f,image:c.toDataURL('image/jpeg',0.72)}));};img.src=reader.result;};reader.readAsDataURL(file);};
 const submitRequest=e=>{e.preventDefault();if(!logged||admin||userMode!=='viewer'){alert('Please log in as a user to submit a recipe.');return;}const req={id:Date.now(),...requestForm,owner:current,status:'Pending',createdAt:new Date().toISOString()};setRequests([...requests,req]);setRequestForm({title:'',category:'healthy',description:'',ingredients:'',steps:'',image:''});setMessage('Your recipe request has been sent to the admin for approval.');};
 const approve=req=>{const newRecipe={id:1000+req.id,title:req.title,category:req.category,categoryTitle:groups.find(g=>g.key===req.category)?.title||'Community Recipes',image:req.image||'/images/foodi.png',owner:req.owner,description:req.description||`${req.title} shared by the RecipeHub community.`,ingredients:req.ingredients.split('\n').map(x=>x.trim()).filter(Boolean),steps:req.steps.split('\n').map(x=>x.trim()).filter(Boolean),time:'User submitted',custom:true};setApproved([...approved,newRecipe]);setRequests(requests.map(x=>x.id===req.id?{...x,status:'Approved'}:x));};
 const reject=req=>setRequests(requests.map(x=>x.id===req.id?{...x,status:'Rejected'}:x));
 const deleteComment=async comment=>{if(!admin)return;try{const response=await fetch(`/api/comments/${encodeURIComponent(comment.recipeId)}?id=${encodeURIComponent(comment.id)}`,{method:'DELETE',credentials:'same-origin'});if(!response.ok)throw new Error();const remaining=await response.json();setComments(prev=>({...prev,[comment.recipeId]:remaining}));setAdminComments(prev=>prev.filter(item=>item.id!==comment.id||item.recipeId!==comment.recipeId));}catch{setCommentsError('Comment could not be removed. Please sign in as admin and try again.');}};
 const deleteRecipe=r=>{if(!admin)return; if(!window.confirm(`Delete ${r.title}? This cannot be undone.`))return; setDeletedIds(prev=>[...prev,r.id]); setApproved(prev=>prev.filter(x=>x.id!==r.id)); if(selected?.id===r.id)setSelected(null);};
 if(!logged) return <Auth mode={authMode} setMode={setAuthMode} onLogin={login} onRegister={register} onAdminLogin={adminLogin} sharedNotice={shareLinkPending}/>;
 if(shareLinkPending&&!admin) return sharedRecipe ? <SharedRecipePage recipe={sharedRecipe} onLogout={logout} onBrowse={closeSharedRecipe}/> : <main className="shared-recipe-page"><article className="shared-recipe-card"><h1>Recipe not found</h1><p>This shared recipe link is invalid or the recipe is no longer available.</p><button className="auth-button" onClick={closeSharedRecipe}>Go to RecipeHub</button></article></main>;

 // Admin gets a dedicated management screen only. Public recipe browsing is never
 // rendered in admin mode; recipes appear in the delete panel only after a search.
 if(admin) {
  const pendingRequests=requests.filter(r=>r.status==='Pending');
  const q=adminSearch.trim().toLowerCase();
  const matchingRecipes=q ? recipes.filter(r=>r.title.toLowerCase().includes(q) || r.categoryTitle.toLowerCase().includes(q)) : recipes;
  const approvedList=approved.filter(r=>!deletedIds.includes(r.id));
  const tabs=[['pending','⏳','Pending Requests'],['approved','✅','Approved Community Recipes'],['delete','🗑️','Delete Recipes'],['comments','💬','Manage Comments']];
  return <div id="adminOnlyPage">
   <header className="navbar"><div className="nav-container"><div className="logo"><span className="logo-icon">🍴</span><span className="logo-text">RecipeHub Admin</span></div><nav className="nav-menu"><button className="logout-button" onClick={logout}>Logout</button></nav></div></header>
   <main className="admin-only-main">
    <section id="adminSection" className="submit-section"><div className="section-container">
     <div className="section-heading"><p className="section-subtitle">ADMIN</p><h2>Recipe Approval Dashboard</h2><p>Choose an option below to manage recipes.</p></div>
     <div className="admin-tabs">{tabs.map(([k,icon,label])=><button type="button" key={k} className={'admin-tab'+(adminTab===k?' active':'')} onClick={()=>setAdminTab(k)}><span>{icon}</span>{label}</button>)}</div>
     <div className="admin-stat-cards"><div className="admin-stat-card"><b>{loginCount}</b><span>Total Logins</span></div><div className="admin-stat-card"><b>{pendingRequests.length}</b><span>Pending Requests</span></div><div className="admin-stat-card"><b>{approvedList.length}</b><span>Approved Recipes</span></div></div>
     {adminTab==='pending'&&<section className="admin-manage-recipes admin-approval-panel"><h3>Pending Requests</h3><p>Recipes submitted by Recipe Contributors awaiting your decision.</p>
      {pendingRequests.length===0 ? <p className="admin-empty-state">There are no pending recipe requests.</p> : <div className="admin-requests">{pendingRequests.map(r=><article className="admin-request" key={r.id}><h3>{r.title}</h3><p>Submitted by: {r.owner}</p>{r.image&&<img className="admin-request-image" src={r.image} alt={r.title}/>}<p>{r.description}</p><h4>Ingredients</h4><pre>{r.ingredients}</pre><h4>Preparation</h4><pre>{r.steps}</pre><div className="admin-actions"><button type="button" onClick={()=>approve(r)}>Accept & Publish</button><button type="button" onClick={()=>reject(r)}>Reject</button></div></article>)}</div>}
     </section>}
     {adminTab==='approved'&&<section className="admin-manage-recipes"><h3>Approved Community Recipes</h3><p>Recipes you have approved from Recipe Contributors.</p>
      {approvedList.length===0 ? <p className="admin-empty-state">No community recipes have been approved yet.</p> : <div className="admin-recipe-list">{approvedList.map(r=><div className="admin-recipe-row approved-row" key={r.id}><img src={r.image} alt="" onError={e=>{e.currentTarget.src='/images/foodi.png'}}/><span><strong>{r.title}</strong> <small>({r.categoryTitle}){r.owner?` · by ${r.owner}`:''}</small></span></div>)}</div>}
     </section>}
     {adminTab==='comments'&&<section className="admin-manage-recipes"><h3>Recipe Comments</h3><p>Comments are shared with everyone who views each recipe. Only administrators can remove them.</p>{commentsError&&<p className="admin-empty-state">{commentsError}</p>}{adminComments.length===0?<p className="admin-empty-state">No comments have been posted yet.</p>:<div className="admin-recipe-list">{adminComments.map(comment=><article className="comment-item admin-comment-item" key={`${comment.recipeId}-${comment.id}`}><strong>{recipes.find(r=>String(r.id)===String(comment.recipeId))?.title||`Recipe ${comment.recipeId}`}</strong><p>{comment.text}</p><small>{comment.owner} · {new Date(comment.createdAt).toLocaleString()}</small><button type="button" onClick={()=>deleteComment(comment)}>Delete Comment</button></article>)}</div>}</section>}
     {adminTab==='delete'&&<section id="adminDelete" className="admin-manage-recipes"><h3>Delete Recipes</h3><p>All recipes are listed below. Search by recipe name or category, then delete the one you want to remove.</p>
      <div className="admin-delete-search"><input type="search" value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Search recipe name or category to delete..." aria-label="Search recipes to delete"/><button type="button" onClick={()=>setAdminSearch('')}>Clear</button></div>
      {matchingRecipes.length===0 ? <p className="admin-empty-state">No recipes found.</p> : <><p className="admin-result-count">{q?`${matchingRecipes.length} matching recipe(s)`:`Showing all ${matchingRecipes.length} available recipe(s)`}</p><div className="admin-recipe-list">{matchingRecipes.map(r=><div className="admin-recipe-row" key={r.id}><span><strong>{r.title}</strong> <small>({r.categoryTitle})</small></span><button type="button" onClick={()=>deleteRecipe(r)}>Delete Recipe</button></div>)}</div></>}
     </section>}
    </div></section>
   </main>
   <footer className="footer"><div className="footer-content"><div className="footer-logo">🍴 RecipeHub</div><p>Administrator workspace</p></div></footer>
  </div>;
 }
 const currentName=localStorage.getItem(KEY.current)||'';
 const canView=true;
 const canSubmit=showSubmit;
 return <div id="homePage">
  <header className="navbar"><div className="nav-container"><div className="logo"><a href="#homeSection"><span className="logo-icon">🍴</span><span className="logo-text">RecipeHub</span></a></div><nav className="nav-menu">{canView&&!admin&&<><a href="#homeSection" onClick={()=>setShowSubmit(false)}>Home</a><a href="#categoriesSection" onClick={()=>setShowSubmit(false)}>Categories</a><button type="button" className="nav-submit-button" onClick={()=>{setShowSubmit(true);setMessage('');window.setTimeout(()=>document.getElementById('submitSection')?.scrollIntoView({behavior:'smooth'}),0);}}>Submit</button></>}<button className="logout-button" onClick={logout}>Logout</button></nav></div></header>
  <main>
   {canView&&!showSubmit&&<>
   <section id="homeSection" className="hero-section"><div className="hero-overlay"><div className="hero-content"><p className="hero-small-text">WELCOME TO</p><h1>Recipe<span>Hub</span></h1><h2>Discover Delicious Recipes</h2><p>Explore hundreds of delicious recipes, discover new cuisines, and make every meal special.</p><div className="search-container"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(setCategory('all'),document.getElementById('recipesSection')?.scrollIntoView({behavior:'smooth'}))} placeholder="Search recipes..."/><button onClick={()=>{setCategory('all');document.getElementById('recipesSection')?.scrollIntoView({behavior:'smooth'});}}>Search</button></div></div></div></section>
   <section id="aboutSection" className="about-section welcome-section"><div className="section-container about-content"><p className="section-subtitle">ABOUT US</p><h2>Welcome to RecipeHub{currentName?`, ${currentName}`:''}</h2><p>Discover recipes, share your original cooking ideas, and rate your favorite dishes.</p></div></section>
   <section id="categoriesSection" className="categories-section"><div className="section-container"><div className="section-heading"><p className="section-subtitle">EXPLORE</p><h2>Recipe Categories</h2><p>Choose a category and discover delicious recipes from around the world.</p></div><div className="category-grid">
    {[['indian','🇮🇳','Indian Recipes','Explore delicious vegetarian and non-vegetarian Indian recipes.','100 Recipes','indian-veg/paneer-butter-masala.jpg'],['western','🌎','Western Recipes','Taste popular dishes from different countries around the world.','50 Recipes','western/margherita-pizza.jpg'],['dessert','🍰','Desserts','Enjoy delicious cakes, ice creams, puddings and traditional sweets.','50 Recipes','dessert/gulab-jamun.jpg'],['healthy','🥗','Healthy Recipes','Nutritious and healthy recipes for a balanced lifestyle.','50 Recipes','healthy/grilled-chicken-salad.jpg']].map(c=><article className="category-card" key={c[0]} onClick={()=>{setCategory(c[0]);setSearch('');document.getElementById('recipesSection')?.scrollIntoView({behavior:'smooth'});}}><div className="category-image"><img src={'/images/'+c[5]} alt={c[2]}/></div><div className="category-content"><span className="category-icon">{c[1]}</span><h3>{c[2]}</h3><p>{c[3]}</p><span className="category-count">{c[4]}</span></div></article>)}
   </div></div></section>
   <section id="savedRecipesSection" className="recipes-section saved-recipes-section"><div className="section-container"><div className="section-heading"><p className="section-subtitle">YOUR COLLECTION</p><h2>Saved Recipes</h2><p>Recipes you save are kept in this browser for your next visit.</p></div>{savedIds.length===0?<p className="saved-empty">You have not saved any recipes yet. Open a recipe and select Save Recipe.</p>:<div className="recipe-grid">{recipes.filter(r=>savedIds.includes(r.id)).map(r=><article className="recipe-card" key={`saved-${r.id}`}><div className="recipe-image"><img src={r.image} alt={r.title} onError={e=>{e.currentTarget.src='/images/foodi.png'}}/></div><div className="recipe-info"><h3>{r.title}</h3><div className="recipe-card-bottom"><button className="view-recipe-button" onClick={()=>setSelected(r)}>View Recipe</button><button className="saved-remove-button" onClick={()=>toggleSave(r)}>Remove Saved</button></div></div></article>)}</div>}</div></section>
   {category&&<section id="recipesSection" className="recipes-section"><div className="section-container"><div className="recipe-section-header"><div><p className="section-subtitle">DISCOVER</p><h2>{category==='indian'?'Indian Recipes':category==='western'?'Western Recipes':category==='dessert'?'Desserts':category==='healthy'?'Healthy Recipes':'Delicious Recipes'}</h2></div><button className="back-button" onClick={()=>{setCategory('');setSearch('');}}>← Back to Categories</button></div>
    {category==='indian'&&<div className="indian-filters"><button className={indianFilter==='indian-veg'?'active':''} onClick={()=>setIndianFilter('indian-veg')}>🥗 Vegetarian</button><button className={indianFilter==='indian-nonveg'?'active':''} onClick={()=>setIndianFilter('indian-nonveg')}>🍗 Non-Vegetarian</button></div>}
    <div className="recipe-grid">{filtered.map(r=><article className="recipe-card" id={`recipe-${r.id}`} key={r.id}><div className="recipe-image"><img src={r.image} alt={r.title} onError={e=>{e.currentTarget.src='/images/foodi.png'}}/></div><div className="recipe-info"><h3>{r.title}</h3><p>{r.description}</p><div className="recipe-rating"><span>⭐ {avg(r.id)?avg(r.id).toFixed(1):'No ratings'} ({ratingCount(r.id)})</span></div><div className="recipe-card-bottom"><span className="recipe-card-time">⏱ {r.time}</span><button className="view-recipe-button" onClick={()=>setSelected(r)}>View Recipe</button></div></div></article>)}</div>
   </div></section>}
   </>}
   {canSubmit&&<section id="submitSection" className="submit-section submit-split"><div className="submit-layout">
    <aside className="submit-art" aria-hidden="true"><SubmitIllustration/><h3>Every dish has a story</h3><p>Share the recipe your family has loved for generations.</p></aside>
    <div className="submit-form-side"><div className="section-heading"><p className="section-subtitle">COMMUNITY</p><h2>Share Your Original Recipe</h2><p>Send your recipe to the admin. It will appear publicly after approval.</p></div>{message&&<p className="success-message">{message}</p>}<form className="submission-form" onSubmit={submitRequest}><div className="form-group"><label>Recipe Name</label><input required value={requestForm.title} onChange={e=>setRequestForm({...requestForm,title:e.target.value})}/></div><div className="form-group"><label>Category</label><select value={requestForm.category} onChange={e=>setRequestForm({...requestForm,category:e.target.value})}>{groups.map(g=><option value={g.key} key={g.key}>{g.title}</option>)}</select></div><div className="form-group"><label>Recipe Image</label><input type="file" accept="image/*" onChange={pickImage}/>{requestForm.image&&<div className="image-preview"><img src={requestForm.image} alt="Recipe preview"/><button type="button" onClick={()=>setRequestForm({...requestForm,image:''})}>Remove image</button></div>}</div><div className="form-group"><label>Description</label><textarea value={requestForm.description} onChange={e=>setRequestForm({...requestForm,description:e.target.value})} rows="2"/></div><div className="form-group"><label>Ingredients (one per line)</label><textarea required rows="4" value={requestForm.ingredients} onChange={e=>setRequestForm({...requestForm,ingredients:e.target.value})}/></div><div className="form-group"><label>Preparation Steps (one per line)</label><textarea required rows="5" value={requestForm.steps} onChange={e=>setRequestForm({...requestForm,steps:e.target.value})}/></div><button className="auth-button">Send Approval Request</button></form></div>
   </div></section>}

  </main>
  <footer className="footer"><div className="footer-content"><div className="footer-logo">🍴 RecipeHub</div><p>Delicious recipes from around the world.</p><p>© 2026 RecipeHub. All Rights Reserved.</p></div></footer>
  {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="recipe-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><div className="modal-recipe-image"><img src={selected.image} alt={selected.title}/></div><div className="modal-details"><h2>{selected.title}</h2><p>{selected.description}</p><div className="modal-rating"><strong>Average rating: {avg(selected.id)?avg(selected.id).toFixed(1)+'/5':'No ratings yet'}</strong> ({ratingCount(selected.id)} ratings)</div><div className="rate-control"><span>Rate this recipe:</span>{[1,2,3,4,5].map(n=><button key={n} className={(ratings[selected.id]||{})[current]>=n?'selected':''} onClick={()=>rate(selected.id,n)}>★</button>)}</div><section className="recipe-comments"><h3>Comments ({(comments[selected.id]||[]).length})</h3>{commentsError&&<p className="no-comments">{commentsError}</p>}<form className="comment-form" onSubmit={async e=>{e.preventDefault();const text=commentDraft.trim();if(!text)return;try{const response=await fetch(`/api/comments/${encodeURIComponent(selected.id)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner:currentName||current,text})});if(!response.ok)throw new Error();const comment=await response.json();setComments(prev=>({...prev,[selected.id]:[...(prev[selected.id]||[]),comment]}));setCommentsError('');setCommentDraft('');}catch{setCommentsError('Your comment could not be posted. Please try again.');}}}><textarea value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} placeholder="Write your comment about this recipe..." rows="3" required/><button type="submit">Post Comment</button></form>{(comments[selected.id]||[]).length===0?<p className="no-comments">No comments yet. Be the first to comment!</p>:<div className="comment-list">{(comments[selected.id]||[]).map(c=><article className="comment-item" key={c.id}><strong>{c.owner}</strong><p>{c.text}</p><small>{new Date(c.createdAt).toLocaleString()}</small></article>)}</div>}</section><div className="viewer-recipe-actions"><button className="share-button" onClick={()=>setShareOpen(v=>!v)}>↗ Share Recipe</button><button className="save-recipe-button" onClick={()=>toggleSave(selected)}>{savedIds.includes(selected.id)?'♥ Saved':'♡ Save Recipe'}</button></div>{shareOpen&&<div className="share-options"><strong>Share this recipe</strong><div className="share-option-links"><a href={`https://wa.me/?text=${encodeURIComponent(selected.title+' – RecipeHub '+makeSingleRecipeUrl(selected))}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://t.me/share/url?url=${encodeURIComponent(makeSingleRecipeUrl(selected))}&text=${encodeURIComponent(selected.title+' – RecipeHub')}`} target="_blank" rel="noreferrer">Telegram</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(makeSingleRecipeUrl(selected))}`} target="_blank" rel="noreferrer">Facebook</a><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selected.title+' – RecipeHub')}&url=${encodeURIComponent(makeSingleRecipeUrl(selected))}`} target="_blank" rel="noreferrer">X</a><button type="button" onClick={()=>share(selected)}>More apps / Instagram</button><button type="button" onClick={()=>copyRecipeLink(selected)}>Copy link</button></div><small>Instagram does not provide a standard website link-sharing URL. Use “More apps / Instagram” on a supported phone to choose an available sharing app.</small></div>}<div className="modal-section"><h3>🥘 Ingredients Required</h3><ul>{selected.ingredients.map((x,i)=><li key={i}>{x}</li>)}</ul></div><div className="modal-section"><h3>👨‍🍳 Preparation Process</h3><ol>{selected.steps.map((x,i)=><li key={i}>{x}</li>)}</ol></div></div></div></div>}
 </div>;
}
export default App;
