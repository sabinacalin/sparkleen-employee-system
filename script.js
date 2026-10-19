
function todayISO(){return new Date().toISOString().slice(0,10)}
function monthNow(){return new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}
const starterEmployees=[
 {id:'EMP001',name:'Juan Dela Cruz',department:'Laundry',position:'Laundry Staff',salary:15000,salaryCategory:'Monthly',status:'Active',email:'juan@example.com',phone:'09171234567'},
 {id:'EMP002',name:'Maria Santos',department:'Maintenance',position:'Maintenance Staff',salary:16000,salaryCategory:'Monthly',status:'Active',email:'maria@example.com',phone:'09181234567'},
 {id:'EMP003',name:'Mark Reyes',department:'Maintenance',position:'Maintenance Staff',salary:10000,salaryCategory:'Weekly',status:'Active',email:'mark@example.com',phone:'09191234567'}
];
function load(key,starter){try{return JSON.parse(localStorage.getItem(key))||starter}catch(e){return starter}}
let employees=load('spEmployees',starterEmployees);
let attendance=load('spAttendance',[
 {id:'ATT001',employeeId:'EMP001',date:'2026-10-04',status:'Present',timeIn:'8:00 AM',timeOut:'5:00 PM'},
 {id:'ATT002',employeeId:'EMP002',date:'2026-10-04',status:'Late',timeIn:'8:20 AM',timeOut:'5:00 PM'},
 {id:'ATT003',employeeId:'EMP003',date:'2026-10-04',status:'Absent',timeIn:'-',timeOut:'-'}
]);
let payroll=load('spPayroll',[
 {id:'PAY001',employeeId:'EMP001',month:'November 2026',amount:10000,releaseAmount:0,status:'Pending'},
 {id:'PAY002',employeeId:'EMP002',month:'November 2026',amount:10000,releaseAmount:0,status:'Pending'},
 {id:'PAY003',employeeId:'EMP003',month:'November 2026',amount:10000,releaseAmount:0,status:'Pending'}
]);
let advances=load('spAdvances',[]);
let page='dashboard',searchText='',sortBy='name',payrollMode='payroll';
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let selectedCalendarDate = todayISO();
const details={
 dashboard:['Employee Management Dashboard','Manage employee information and attendance records in one organized place.'],
 employees:['Employee Management','View and manage employee information.'],
 attendance:['Employee Attendance','Record and monitor daily employee attendance.'],
 payroll:['Employee Management Dashboard','Manage payroll and salary advance records.']
};
const $=id=>document.getElementById(id);
$('todayDate').textContent='▢  '+new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
$('loginForm').addEventListener('submit',e=>{
 e.preventDefault();
 if($('email').value.trim()==='admin@sparkleen.com'&&$('password').value==='sparkleen123'){
  $('loginScreen').classList.add('hidden');$('app').classList.remove('hidden');render('dashboard');
 }else toast('Use the demo email and password shown on the login page.');
});
document.querySelectorAll('.nav-button').forEach(b=>b.addEventListener('click',()=>render(b.dataset.page)));
$('closeModal').addEventListener('click',closeModal);
$('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function save(){localStorage.setItem('spEmployees',JSON.stringify(employees));localStorage.setItem('spAttendance',JSON.stringify(attendance));localStorage.setItem('spPayroll',JSON.stringify(payroll));localStorage.setItem('spAdvances',JSON.stringify(advances))}
function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(v){return '₱'+Number(v||0).toLocaleString('en-PH')}
function nameOf(id){let e=employees.find(x=>x.id===id);return e?e.name:'Unknown'}
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2400)}
function render(p){page=p;searchText='';document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.page===p));$('pageTitle').textContent=details[p][0];$('pageDescription').textContent=details[p][1];renderStats();if(p==='dashboard')dashboard();if(p==='employees')employeePage();if(p==='attendance')attendancePage();if(p==='payroll')payrollPage()}
function renderStats(){
 let today=attendance.filter(a=>a.date===todayISO());let present=today.filter(a=>a.status==='Present').length,absent=today.filter(a=>a.status==='Absent').length,late=today.filter(a=>a.status==='Late').length;
 let items=[['Total Employees',employees.length,'Active Employee Records','♟'],['Present Today',present,'On time this morning','☻'],['Absent Today',absent,'Marked absent today','⊗'],[page==='attendance'?'Total Recorded':'Late Today',page==='attendance'?today.length:late,page==='attendance'?'Attendance records':'Arrived after 8:00 AM','◷']];
 $('stats').innerHTML=items.map(x=>`<div class="stat-card"><span class="stat-icon">${x[3]}</span><div class="stat-label">${x[0]}</div><div class="stat-number">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join('');
}
function dashboard(){
 let present=attendance.filter(a=>a.status==='Present').length,late=attendance.filter(a=>a.status==='Late').length,absent=attendance.filter(a=>a.status==='Absent').length;
 $('pageContent').innerHTML=`<div class="dashboard-grid">
 <div class="panel"><h3>Attendance Summary</h3><div class="chart-area"><div class="donut"></div></div><div class="legend"><span>■ Present: ${present||3}</span><span>■ Late: ${late||1}</span><span>■ Absent: ${absent||2}</span></div></div>
 <div class="panel"><div class="calendar-head"><button class="calendar-arrow" id="prevMonth" aria-label="Previous month">‹</button><div class="calendar-selects"><select id="calendarMonth" aria-label="Month">${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i)=>`<option value="${i}" ${i===calendarMonth?'selected':''}>${m}</option>`).join('')}</select><select id="calendarYear" aria-label="Year">${Array.from({length:11},(_,i)=>calendarYear-5+i).map(y=>`<option value="${y}" ${y===calendarYear?'selected':''}>${y}</option>`).join('')}</select></div><button class="calendar-arrow" id="nextMonth" aria-label="Next month">›</button></div><div class="calendar-grid" id="calendarGrid"></div><p class="calendar-selected" id="calendarSelected"></p></div></div>
 <div class="section-heading" style="margin-top:18px"><h2>Recent Employee Records</h2><button class="small-button blue" onclick="openForm('employee')">+ Add Employee</button></div>${employeeTable(employees.slice(0,3),false)}`;
 drawCalendar();
 $('prevMonth').addEventListener('click',()=>moveCalendar(-1));
 $('nextMonth').addEventListener('click',()=>moveCalendar(1));
 $('calendarMonth').addEventListener('change',e=>{calendarMonth=Number(e.target.value);drawCalendar()});
 $('calendarYear').addEventListener('change',e=>{calendarYear=Number(e.target.value);drawCalendar()});
}
function moveCalendar(amount){
 calendarMonth += amount;
 if(calendarMonth < 0){calendarMonth=11;calendarYear--}
 if(calendarMonth > 11){calendarMonth=0;calendarYear++}
 dashboard();
}
function drawCalendar(){
 const grid=$('calendarGrid');
 if(!grid)return;
 const names=['Su','Mo','Tu','We','Th','Fr','Sa'];
 const firstDay=new Date(calendarYear,calendarMonth,1).getDay();
 const daysInMonth=new Date(calendarYear,calendarMonth+1,0).getDate();
 let content=names.map(n=>`<span class="day-name">${n}</span>`).join('');
 for(let i=0;i<firstDay;i++)content+='<span class="calendar-empty"></span>';
 for(let day=1;day<=daysInMonth;day++){
   const date=`${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
   const isSelected=date===selectedCalendarDate;
   const isToday=date===todayISO();
   content+=`<button type="button" class="calendar-day ${isSelected?'selected':''} ${isToday?'today':''}" data-date="${date}" aria-label="${date}">${day}</button>`;
 }
 grid.innerHTML=content;
 grid.querySelectorAll('.calendar-day').forEach(button=>button.addEventListener('click',()=>{
   selectedCalendarDate=button.dataset.date;
   drawCalendar();
 }));
 const selected=$('calendarSelected');
 if(selected)selected.textContent='Selected: '+new Date(selectedCalendarDate+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
 const monthSelect=$('calendarMonth'),yearSelect=$('calendarYear');
 if(monthSelect)monthSelect.value=String(calendarMonth);
 if(yearSelect && !Array.from(yearSelect.options).some(o=>Number(o.value)===calendarYear)){
   yearSelect.innerHTML=Array.from({length:11},(_,i)=>calendarYear-5+i).map(y=>`<option value="${y}">${y}</option>`).join('');
 }
 if(yearSelect)yearSelect.value=String(calendarYear);
}
function toolbar(placeholder,label,type,extra=''){return `<div class="section-heading"><div class="toolbar"><input class="search-input" id="searchBox" placeholder="${placeholder}" value="${safe(searchText)}"><button class="small-button" onclick="toast('Filter options are ready for your records.')">▽ Filter</button><button class="small-button" onclick="changeSort()">⌄ Sort</button></div><div class="toolbar">${extra}<button class="small-button blue" onclick="openForm('${type}')">+ ${label}</button></div></div>`}
function filtered(list,keys){let q=searchText.toLowerCase();return list.filter(x=>keys.some(k=>String(x[k]??'').toLowerCase().includes(q))).sort((a,b)=>String(a[sortBy]||a.name||a.id).localeCompare(String(b[sortBy]||b.name||b.id)))}
function attachSearch(fn){let box=$('searchBox');if(box)box.addEventListener('input',()=>{searchText=box.value;let pos=box.selectionStart;fn();let n=$('searchBox');if(n){n.focus();n.setSelectionRange(pos,pos)}})}
function changeSort(){sortBy=sortBy==='name'?'id':'name';if(page==='employees')employeePage();else if(page==='attendance')attendancePage();else payrollPage()}
function employeeTable(list,actions=true){if(!list.length)return '<div class="empty-message">No employee records found.</div>';return `<div class="table-wrap"><table><thead><tr><th>Employee ID</th><th>Employee Name</th><th>Department</th><th>Position</th><th>Commencement Date</th><th>Salary Category</th>${actions?'<th>Actions</th>':''}</tr></thead><tbody>${list.map(e=>`<tr><td>${safe(e.id)}</td><td>${safe(e.name)}<br><small>${safe(e.email)}</small></td><td>${safe(e.department)}</td><td>${safe(e.position)}</td><td>November 10, 2001</td><td>${safe(e.salaryCategory||'Weekly')}</td>${actions?`<td><div class="row-actions"><button onclick="editRecord('employee','${e.id}')">Edit</button><button onclick="deleteRecord('employee','${e.id}')">Delete</button></div></td>`:''}</tr>`).join('')}</tbody></table></div>`}
function employeePage(){$('pageContent').innerHTML=toolbar('Search employee name or ID','Add Employee','employee')+`<div class="table-wrap">${employeeTable(filtered(employees,['id','name','department','position','email']))}</div>`;attachSearch(employeePage)}
function attendancePage(){let list=filtered(attendance,['id','employeeId','date','status']);$('pageContent').innerHTML=toolbar('Search employee','Record Attendance','attendance')+`<div class="table-wrap"><table><thead><tr><th>Employee ID</th><th>Employee Name</th><th>Date</th><th>Status</th><th>Time In</th><th>Time Out</th><th>Actions</th></tr></thead><tbody>${list.map(a=>`<tr><td>${safe(a.employeeId)}</td><td>${safe(nameOf(a.employeeId))}</td><td>${safe(a.date)}</td><td><span class="status ${a.status.toLowerCase()}">${safe(a.status)}</span></td><td>${safe(a.timeIn)}</td><td>${safe(a.timeOut)}</td><td><div class="row-actions"><button onclick="editRecord('attendance','${a.id}')">Edit</button><button onclick="deleteRecord('attendance','${a.id}')">Delete</button></div></td></tr>`).join('')}</tbody></table></div>${list.length?'':'<div class="empty-message">No attendance records.</div>'}`;attachSearch(attendancePage)}
function payrollPage(){
 let isAdv=payrollMode==='advances',list=isAdv?filtered(advances,['id','employeeId','date','reason','status']):filtered(payroll,['id','employeeId','month','status']);
 let extra=`<button class="small-button ${isAdv?'':'blue'}" onclick="payrollMode='payroll';payrollPage()">Payroll</button><button class="small-button ${isAdv?'blue':''}" onclick="payrollMode='advances';payrollPage()">Salary Advances</button>`;
 let content=isAdv?`<div class="table-wrap"><table><thead><tr><th>Advance ID</th><th>Employee ID</th><th>Employee Name</th><th>Request Date</th><th>Amount</th><th>Reason</th><th>Deduction Month</th><th>Status</th><th>Actions</th></tr></thead><tbody>${list.map(a=>`<tr><td>${safe(a.id)}</td><td>${safe(a.employeeId)}</td><td>${safe(nameOf(a.employeeId))}</td><td>${safe(a.date)}</td><td>${money(a.amount)}</td><td>${safe(a.reason)}</td><td>${safe(a.deductionMonth)}</td><td><span class="status ${a.status.toLowerCase()}">${safe(a.status)}</span></td><td><div class="row-actions"><button onclick="editRecord('advance','${a.id}')">Edit</button><button onclick="deleteRecord('advance','${a.id}')">Delete</button></div></td></tr>`).join('')}</tbody></table></div>`:`<div class="table-wrap"><table><thead><tr><th>Employee ID</th><th>Employee Name</th><th>Amount</th><th>Release Amount</th><th>Salary Month</th><th>Status</th><th>Actions</th></tr></thead><tbody>${list.map(a=>`<tr><td>${safe(a.employeeId)}</td><td>${safe(nameOf(a.employeeId))}</td><td>${money(a.amount)}</td><td>${money(a.releaseAmount)}</td><td>${safe(a.month)}</td><td><span class="status ${a.status.toLowerCase()}">${safe(a.status)}</span></td><td><div class="row-actions"><button onclick="editRecord('payroll','${a.id}')">Edit</button><button onclick="deleteRecord('payroll','${a.id}')">Delete</button></div></td></tr>`).join('')}</tbody></table></div>`;
 $('pageContent').innerHTML=toolbar(isAdv?'Search salary advance':'Search payroll or employee ID',isAdv?'Add Advance':'Add Payroll',isAdv?'advance':'payroll',extra)+content+(list.length?'':'<div class="empty-message">No records found.</div>');attachSearch(payrollPage)
}
function fields(type){
 if(type==='employee')return [['id','Employee ID','text'],['name','Employee Name','text'],['department','Department','select',['Laundry','Maintenance','Operations','Administration']],['position','Position','text'],['salary','Salary Amount','number'],['salaryCategory','Salary Category','select',['Weekly','Bi-weekly','Monthly']],['status','Employment Status','select',['Active','On Leave','Resigned']],['email','Email','email'],['phone','Contact Number','tel']];
 if(type==='attendance')return [['employeeId','Employee','employee'],['date','Date','date'],['status','Status','select',['Present','Late','Absent']],['timeIn','Time In','text'],['timeOut','Time Out','text']];
 if(type==='payroll')return [['employeeId','Employee','employee'],['amount','Amount','number'],['releaseAmount','Release Amount','number'],['month','Salary Month','text'],['status','Status','select',['Pending','Released']]];
 return [['employeeId','Employee','employee'],['date','Request Date','date'],['amount','Advance Amount','number'],['reason','Reason','text'],['deductionMonth','Deduction Month','text'],['status','Status','select',['Pending','Approved','Rejected','Deducted']]];
}
function openForm(type,record=null){
 if(type!=='employee'&&!employees.length){toast('Add an employee first.');return}
 let fs=fields(type),form=$('recordForm');$('modalTitle').textContent=(record?'Edit ':'Add ')+(type==='advance'?'Salary Advance':type.charAt(0).toUpperCase()+type.slice(1));
 form.innerHTML=`<div class="form-grid">${fs.map(f=>{let v=record&&record[f[0]]!==undefined?record[f[0]]:(f[0]==='date'?todayISO():f[0]==='month'||f[0]==='deductionMonth'?monthNow():f[0]==='salaryCategory'?'Weekly':f[0]==='status'?(type==='employee'?'Active':type==='attendance'?'Present':'Pending'):'');let input='';if(f[2]==='select')input=`<select name="${f[0]}" required>${f[3].map(x=>`<option ${v===x?'selected':''}>${x}</option>`).join('')}</select>`;else if(f[2]==='employee')input=`<select name="employeeId" required>${employees.map(e=>`<option value="${e.id}" ${v===e.id?'selected':''}>${safe(e.id)} - ${safe(e.name)}</option>`).join('')}</select>`;else input=`<input name="${f[0]}" type="${f[2]}" value="${safe(v)}" ${f[0]==='id'&&record?'readonly':''} required ${f[2]==='number'?'min="0" step="0.01"':''}>`;return `<div class="form-field"><label>${f[1]}</label>${input}</div>`}).join('')}</div><div class="form-actions"><button type="button" class="small-button" onclick="closeModal()">Cancel</button><button type="submit" class="small-button blue">Save Record</button></div>`;
 form.onsubmit=e=>{e.preventDefault();let data=Object.fromEntries(new FormData(form).entries());fs.forEach(f=>{if(f[2]==='number')data[f[0]]=Number(data[f[0]])});let list=type==='employee'?employees:type==='attendance'?attendance:type==='payroll'?payroll:advances;if(!record){data.id=data.id||makeId(type);if(type==='employee'&&employees.some(x=>x.id===data.id)){toast('Employee ID already exists.');return}list.push(data)}else{let i=list.findIndex(x=>x.id===record.id);list[i]={...list[i],...data}}if(type==='employee'&&!record)payroll.push({id:makeId('payroll'),employeeId:data.id,amount:data.salary,releaseAmount:0,month:monthNow(),status:'Pending'});save();closeModal();render(page);toast('Record saved.')};
 $('modal').classList.remove('hidden')
}
function makeId(type){let prefix={employee:'EMP',attendance:'ATT',payroll:'PAY',advance:'ADV'}[type]||'REC';let list=type==='employee'?employees:type==='attendance'?attendance:type==='payroll'?payroll:advances;return prefix+String(list.length+1).padStart(3,'0')}
function closeModal(){$('modal').classList.add('hidden')}
function editRecord(type,id){let list=type==='employee'?employees:type==='attendance'?attendance:type==='payroll'?payroll:advances;let r=list.find(x=>x.id===id);if(r)openForm(type,{...r})}
function deleteRecord(type,id){if(!confirm('Delete this record?'))return;let list=type==='employee'?employees:type==='attendance'?attendance:type==='payroll'?payroll:advances;if(type==='employee'){employees=employees.filter(x=>x.id!==id);attendance=attendance.filter(x=>x.employeeId!==id);payroll=payroll.filter(x=>x.employeeId!==id);advances=advances.filter(x=>x.employeeId!==id)}else{let target=type==='attendance'?attendance:type==='payroll'?payroll:advances;let i=target.findIndex(x=>x.id===id);if(i>=0)target.splice(i,1)}save();render(page);toast('Record deleted')}
