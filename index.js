(function(){

    const handlers = {
        'logout-btn':function(e) {
            e.preventDefault();
            fetch('https://obscure-cliffs-22622.herokuapp.com/signout',{
                method:'GET',
                credentials:"include"
            })
            .then(response => response.json())
            .then(data => {
                if(data.err){
                    throw Error(data.msg);
                }else{
                    removeAllEL();
                    removeAllComponents();
                    loadLoginForm();
                }
            })
            .catch(err => {
                showMsg(err);
            })
        },
        'attendance-form':function(e) {
            e.preventDefault();
            const selects = document.getElementsByClassName('select-attendance');
            const attObj = {};
            for(let i=0;i<selects.length;i++){
                attObj[selects[i].id] = selects[i].value === 'present'?true:false;
            }

            fetch('https://obscure-cliffs-22622.herokuapp.com/attendance',{
                method: "POST",
                body: JSON.stringify(attObj),
                credentials:"include",
                headers:{
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                if(data.err){
                    throw Error(data.msg);
                }else{
                    showMsg(data.msg)
                }
            })
            .catch(err => {
                showMsg(err);
            })
        },
        'login-form':function(e){
            e.preventDefault();
            const name = sanitize(e.target.name.value);
            const password = e.target.password.value;
            if(name && password){
                fetch('https://obscure-cliffs-22622.herokuapp.com/signin',{
                    method: "POST",
                    body: JSON.stringify({name,password}),
                    credentials:"include",
                    headers:{
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if(data.err){
                        throw Error(data.msg);
                    }else{
                        removeAllEL();
                        removeAllComponents();
                        data.payload.length?loadAttendanceForm(data.payload):null;
                        loadDateForm();
                        loadLogoutBTN();
                    }
                })
                .catch(err => {
                    showMsg(err);
                })
            }else{
                showMsg('Name or Password is empty');
            }
        },
        'date-form': function(e) {
            e.preventDefault();
            const date = e.target.date.value;
            const regex = /(\d{2})\/(\d{2})\/(\d{4})/;
            if(regex.test(date)){
                const [,day,month,year] = regex.exec(date);
                const ms = new Date(year,Number(month)-1,day).valueOf();
                fetch(`https://obscure-cliffs-22622.herokuapp.com/attendance/date?date=${ms}`,{
                    method:'GET',
                    credentials:"include"
                })
                .then(response => response.json())
                .then(data => {
                    if(data.err){
                        throw Error(data.msg);
                    }else{
                        const showAttDIV = document.getElementById('show-att');
                        let html = `<div class='component'`;
                        let notMarked = ''
                        data.payload.forEach(sheet => {
                            if(sheet.err){
                                notMarked += `${sheet.dept} not marked attendance\n`;
                            }else{
                                html += `<h2>${sheet.dept}</h2>
                                        <table>
                                        <tr>
                                            <th>Name</th>
                                            <th>Attendance</th> 
                                        </tr>`;
                                sheet.payload.forEach(member => {
                                    html += `<tr>
                                    <td>${member.name}</td>
                                    <td>${member.isPresent?'present':'absent'}</td>
                                  </tr>`
                                })
                                html += `</table>`;
                            }
                        })
                        showAttDIV.innerHTML = html + '</div>';
                        showMsg(notMarked);
                    }
                })
                .catch(err => {
                    showMsg(err);
                })
            }else{
                showMsg('Date entered in wrong format');
            }
        }
    };
    const elType = {
        'date-form':'submit',
        'login-form':'submit',
        'attendance-form':'submit',
        'logout-btn':'click'
    }

    function sanitize(str) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
            "`": '&#96;'
        };
        const reg = /[&<>"'`/]/ig;
        return str.replace(reg, (match)=>(map[match]));
    }

    function removeAllComponents() {
        const components = document.querySelectorAll('.component');
        console.log(components);
        for(let i=0;i<components.length;i++){
            components[i].remove();
        }
    }

    function removeAllEL() {
        const components = document.querySelectorAll('.component');
        for(let i=0;i<components.length;i++){
            components[i].removeEventListener(elType[components[i].id],handlers[components[i].id]);
        }
    }

    function loadLogoutBTN() {
        const logoutDIV = document.getElementById('logout');
        logoutDIV.innerHTML = `<button class='component' id='logout-btn'>Logout</button>`;
        const btn = document.getElementById('logout-btn');
        btn.addEventListener('click',handlers['logout-btn']);
    }

    function showMsg(msg) {
        const msgDIV = document.getElementById('msg-box');
        msgDIV.textContent = msg;
    }

    function loadAttendanceForm(data) {
        const attDIV = document.getElementById('attendance');
        let html = `<form class='component' id='attendance-form'>`;
        data.forEach(member => {
            html += `<label for='${member}'>${member}</label>
            <select class='select-attendance' id="${member}">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
            </select>`;
        })
        attDIV.innerHTML = html + `<input type='submit' value='Submit'></form>`;

        const attForm = document.getElementById('attendance-form');

        attForm.addEventListener('submit',handlers['attendance-form']);
    }

    function loadLoginForm() {
        const loginDIV = document.getElementById('login');
        loginDIV.innerHTML = `<form class='component' id='login-form'>
        <input type="text" id='name' placeholder='Name'>
        <input type="password" id='password' placeholder='Password'>
        <input type="submit" value="Submit">
        </form>`;
        
        const form = document.getElementById('login-form');
        form.addEventListener('submit',handlers['login-form']);
    }

    function loadDateForm(){
        const dateDIV = document.getElementById('date');
        dateDIV.innerHTML = `<form class='component' id='date-form'>
        <input type="text" id='date' placeholder='dd/mm/yyyy'>
        <input type="submit" value='Submit'>
        </form>`;
        const form = document.getElementById('date-form');

        form.addEventListener('submit',handlers['date-form']);
    }

    function initiate() {
        fetch('https://obscure-cliffs-22622.herokuapp.com/attendance',{
            method: "GET",
            credentials:"include"
        })
        .then(response => response.json())
        .then(data => {
            if(data.err){
                showMsg(data.msg);
                loadLoginForm();
            }else{
                data.payload.length? loadAttendanceForm(data.payload): null;
                loadDateForm();
                loadLogoutBTN();
            }
        })
    }

    initiate();
})();