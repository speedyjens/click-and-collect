//const capitalizeFirstLetter = require("./helpers");

function renderNavigation(store) {
    return `
        <nav class="navigation">
            <a href="/admin?storeid=${store.id}" id="home">Admin</a>
            <ul>
                <a href="/admin?storeid=${store.id}" style="flex: 2; width: 16em;"><li>Admin dashboard</li></a>
                <a href="/store?storeid=${store.id}" style="flex: 2; width: 16em;"><li>Employee dashboard</li></a>
                <a href="/admin/queues?storeid=${store.id}"><li>Queues</li></a>
                <a href="/admin/settings?storeid=${store.id}"><li>Settings</li></a>
                <a href="/admin/package_form?storeid=${store.id}"><li>Package</li></a>
                <a href="/admin/employees?storeid=${store.id}"><li>Employees</li></a>
            </ul>
            <div id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav> 

        <div id="hamburger-menu">
            <a href="/admin?storeid=${store.id}">Admin dashboard</a>
            <a href="/store?storeid=${store.id}">Employee dashboard</a>
            <a href="/admin/queues?storeid=${store.id}">Queues</a>
            <a href="/admin/settings?storeid=${store.id}">Settings</a>
            <a href="/admin/package_form?storeid=${store.id}">Package</a>
            <a href="/admin/employees?storeid=${store.id}">Employees</a>
        </div>    

        <script>
            let hamburger = document.getElementById("hamburger");
            let hamburgerMenu = document.getElementById("hamburger-menu");

            hamburger.addEventListener("click", () => {
                hamburger.classList.toggle("close");
                hamburgerMenu.classList.toggle("close");
            })
        </script>
    `
}

function renderEmployeeNav(store) {
    return `
        <nav class="employee-nav">
            <a href="/store?storeid=${store.id}">Home</a>
            <a id="scan" href="/store/scan?storeid=${store.id}">Scan</a>
        </nav>
    `;
}

exports.render404 = function render404(userId) {
    let page = `
        <html>
            <head>
                <title>404 page not found</title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>
                <div class="main-body">
                    <b> Webpage can not be found. <br></b>
                    <a href="/login">Go to login page </a> <br>
                    <a href="/store?storeid=${userId}"> Go to employee dashboard</a> <br>
                    <a href="/admin?storeid=${userId}"> Go to admin dashboard</a> <br>
                </div>
            </body>
        </html>
    `;

    return page;
}

exports.renderAdmin = function renderAdmin(request, store) {
    let page = `
        <html>
            <head>
                <link rel="stylesheet" href="/static/css/style.css">
                <title>Store admin for ${store.name}</title>
            </head>
            <body>`;
    
    page += `${renderNavigation(store)}`;
    page += `
                <div class="main-body">
                    <h1>Admin dashboard</h1>
                    <h2>Welcome, ${request.user.name}</h2>
                    <ul class="dash">
                        <a href="/store?storeid=${store.id}"><li>Employee dashboard</li></a>
                        <a href="/admin/queues?storeid=${store.id}"><li>Manage queues</li></a>
                        <a href="/admin/settings?storeid=${store.id}"><li>Change settings</li></a>
                        <a href="/admin/package_form?storeid=${store.id}"><li>Create package manually</li></a>
                        <a href="/admin/employees?storeid=${store.id}"><li>Manage employees</li></a>
                    </ul>
                </div> 
            </body>
        </html>
    `;
    return page;
}

/* Helper function for renderQueueList */
function renderQueues(queues) {
    let html = '';
    queues.forEach(queue => {
    html += `<div>
                <h3>Latitude/longitude</h3>
                <p>Lat: ${queue.latitude}</p>
                <p>Lon: ${queue.longitude}</p>
                <h3>Size:</h3>
                <p>${queue.size}</p>
                <form action="/admin/queues/remove" method="POST">
                    <input type="hidden" name="storeid" value="${queue.storeId}">
                    <input type="hidden" name="queueid" value="${queue.id}">
                    <input type="submit" value="Remove">
                </form>
            </div>` 
    });
    return html;
}

exports.renderQueueList = function renderQueueList(store, queues) {
    let page = `
        <html>
            <head>
                <title>Queue list for ${store.name}</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/css/ol.css" type="text/css">
                <script src="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/build/ol.js"></script>
                <link rel="stylesheet" href="/static/css/style.css">
                <style>
                    .map {
                        height: 400px;
                        width: 500px;
                    }
                </style>
            </head>
            <body>`;

    page += `${renderNavigation(store)}`;
    page += `
                <div class="main-body">
                    <h1>Queues for ${store.name}</h1>
                    <div class="queue-list">
                        ${renderQueues(queues)}
                    </div>
                    <h2>Add queue</h2>
                    <form action="/admin/queues/add", method="POST">
                        <div id="queue-placement-map" class="map"></div>
                        <label for="queueName">Name:</label>
                        <input type="text" id="queueName-input" name="queueName">
                        <label for="size">Queue capacity: </label>
                        <input type="number" name="size" required>
                        
                        <input id="latitude-input" type="hidden" name="latitude">
                        <input id="longitude-input" type="hidden" name="longitude">
                        <input type="hidden" name="storeid" value="${store.id}">
                        <input type="submit" value="Add">
                    </form>
                    <script type="text/javascript">
                        var queues = ${JSON.stringify(queues)};
                    </script>
                    <script type="text/javascript" src="/static/js/queueListScript.js"></script>
                </div>
            </body>
        </html>
    `;

    return page;
}

exports.renderPackageForm = function renderPackageForm(store, request) {
    let page = `
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Add package</title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>`;
    page += `${renderNavigation(store)}`;
    page += `
                <div class="main-body">
                    <h1>Add package</h1>
                    <form action="/package_form_handler?storeid=${store.id}" method="POST">
                        <label for="customerName">Customer name:</label>
                        <input type="text" name="customerName" placeholder="Customer name" required>
                        <label for="customerEmail">Customer email:</label>
                        <input type="text" name="customerEmail" placeholder="Customer email" required>
                        <label for="externalOrderId">Order ID:</label>
                        <input type="text" name="externalOrderId" placeholder="Order ID" required> 
                        <input type="submit">
                    </form>
                    ${request.session.statusMsg ? `<p class="success-message">${request.session.statusMsg}</p>` : ''}
                </div>
            </body>
        </html>
    `;
    return page;
}

exports.manageEmployees = function manageEmployees(store, request) {
    let page = `
        <html>
            <head>
                <title>Store admin for ${request.session.storeName}</title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body> `;
    
    page += `${renderNavigation(store)}`;
    page += `
                <div class="main-body">
                    <h1>Manage employees </h1>
                    <ul class="dash">
                        <a href="/admin/employees/employee_list?storeid=${request.session.storeId}"><li>View employees</li></a>
                        <a href="/admin/employees/add?storeid=${request.session.storeId}"><li>Add employee</li></a>
                    </ul>   
                </div>
            </body>
        </html>
    `;

    return page;
}

/* Helper function for employeeListPage */
function renderListOfEmployees(list, storeId) {
    let html = '';

    list.forEach(employee => {
        html += `
            <div>
                <h2>${employee[2]}</h2>
                <p>Username: ${employee[1]}</p>
                <p>Superuser: ${employee[3] == 1 ? "YES" : "NO"}</p>
                <div>
                    <form action="/admin/employees/edit" method="GET">
                        <input type="hidden" value="${employee[0]}" name="id">   
                        <input type="hidden" value="${employee[1]}" name="username">
                        <input type="hidden" value="${employee[2]}" name="name">
                        <input type="hidden" value="${employee[3]}" name="superuser">     
                        
                        <input type="hidden" value="${storeId}" name="storeid">   
                        <input type="submit" value="Edit">
                    </form>

                    <form action="/admin/employees/remove" method="POST">
                        <input type="hidden" value="${employee[1]}" name="username">     
                        <input type="hidden" value="${storeId}" name="storeid">   
                        <input type="submit" value="Remove">
                    </form>
                </div>
            </div>
        `
    });

    return html;
}

exports.employeeListPage = function employeeListPage(store, employeeList, error) {
    let page = `
        <html>
            <head>
                <title>Employee list </title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>`;
    
    page += `${renderNavigation(store)}`;
    page += `
            <div class="main-body">
                <h1>Employee list</h1>
                ${error ? `<p>${error}</p>` : ""}
                <div class="employee-list">
                    ${renderListOfEmployees(employeeList, store.id)}
                </div>
                <a href="/admin/employees?storeid=${store.id}" class="knap">Back</a>
            </div>
            </body>
        </html>
    `;

    return page;
}

exports.addEmployeePage = function addEmployeePage(store, error) {
    let page = `
        <html>
            <head>
                <title>Adding new employee </title>
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>`;

    page += `${renderNavigation(store)}`;
    page += `
                <div class="main-body">
                    <h1>Add new employee</h1>
                    <form action="/admin/employees/add" method="POST">
                        <label for="username">Username:</label>
                        <input type="text" name="username" placeholder="username" required>

                        <label for="name">Employee name:</label>
                        <input type="text" name="employeeName" placeholder="Employee name" required>

                        <label for="password"> Password:</label>
                        <div class="container">
                            <input type="password" name="password" placeholder="password" id="password" onchange='checkPass();' minlength="8" required>
                            <i class="fas fa-eye" id="togglePassword"></i>
                        </div>

                        <label for="confirmPassword"> Confirm password:</label>
                        <div class="container">
                            <input type="password" name="confirmPassword" placeholder="password" id="confirmPassword" onchange='checkPass();' required>
                            <i class="fas fa-eye" id="toggleConfirmPassword"></i>
                        </div>

                        <input type="hidden" value="${store.id}" name="storeid">    
                        <p id="matchingPasswords" style="color:red" hidden>The passwords do not match</p>
                        
                        <label for="superuser"> Is the account an admin account:</label>
                        <input type="radio" value="1" name="superuser" checked>Yes</input>
                        <input type="radio" value="0" name="superuser">No</input>
                    
                        <input type="submit" id="submit" value="Create user" disabled>
                    </form>
                    ${error ? `<p class="success-message">${error}</p>` : ""}
                    <a href="/admin/employees?storeid=${store.id}" class="knap">Back</a>
                </div>
                <script>
                    function checkPass() {
                        if (document.getElementById('password').value ==
                                document.getElementById('confirmPassword').value) {
                            document.getElementById('submit').disabled = false;
                            document.getElementById('matchingPasswords').hidden = true;
                        } else {
                            document.getElementById('submit').disabled = true;
                            document.getElementById('matchingPasswords').hidden = false;
                        }
                    }
                    
                    // Eye toggle for password
                    const togglePassword = document.querySelector('#togglePassword');
                    const password = document.querySelector('#password');

                    togglePassword.addEventListener('click', function (e) {
                        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                        password.setAttribute('type', type);
                        this.classList.toggle('fa-eye-slash');
                    });

                    // Eye toggle for confirmPassword
                    const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
                    const ConfirmPassword = document.querySelector('#confirmPassword');

                    toggleConfirmPassword.addEventListener('click', function (e) {
                        const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
                        confirmPassword.setAttribute('type', type);
                        this.classList.toggle('fa-eye-slash');
                    });
                </script>
            </body>
        </html>
    `;

    return page;
}

exports.renderStoreMenu = function renderStoreMenu(store, request) {
    let page = `
        <html>
            <head>
                <title>Store menu for ${store.name}</title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>

            <body>`;

    page += `${renderEmployeeNav(store)}`;
    page += `

                <div class="main-body">
                <h1>Menu for ${request.user.name}:</h1>
                <ul class="dash">
                    ${request.user.superuser ? `<a href="/admin?storeid=${store.id}"><li>Back to admin page</li></a>` : ""}
                    <a href="/store/packages?storeid=${store.id}"><li>Package overview</li></a>
                    <a href="/store/scan?storeid=${store.id}"><li>Scan package</li></a>
                </ul>
                </div>
            </body>
        </html>
    `;

    return page;
}

exports.renderPackageList = function renderPackageList(store, packageTable) {
    let page = `
        <html>
            <head>
                <title>Package overview</title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>`;

    page += `${renderEmployeeNav(store)}`;
    page += `
                <div class="main-body">
                    <h1>Package Overview</h1>
                    ${packageTable}
                    <a href="/store?storeid=${store.id}" class="knap">Back</a>
                </div>
            </body>
        </html>
    `;

    return page;
}

function capitalizeFirstLetter(str) {
    return str[0].toUpperCase()+str.slice(1);
}

exports.renderSettings = function renderSettings(store, request, DAYS_OF_WEEK, parsedOpeningTime, hasError) {
    let page = `
        <html>
            <head>
                <title>Opening time for ${store.name}</title>
                <link rel="stylesheet" href="/static/css/style.css">
                <style>
                    .hidden {
                        display: none;
                    }
                </style>
            </head>
            <body>`;
    
            page += `${renderNavigation(store)}`;
            page += `
                <div class="main-body">
                    <h1>Settings for ${store.name}</h1>
                    <p id="error-message" class="${hasError ? "" : "hidden"}">${hasError ? "" : request.session.settingsError}</p>
                    <form method="POST" id="settings-form">
                        <table>
                            <thead>
                                <tr>
                                    <th style="text-align: left">Day</th>
                                    <th>Open time</th>
                                    <th>Closing time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${DAYS_OF_WEEK.map((day) => {
                                    if (parsedOpeningTime[day].length == 0) {
                                        parsedOpeningTime[day] = ["00:00:00", "00:00:00"];
                                    }
                                    return `<tr>
                                        <td>${capitalizeFirstLetter(day)}</td>
                                        <td><input name="${day}-open" type="time" value="${parsedOpeningTime[day][0]}" step="1"></td>
                                        <td><input name="${day}-close" type="time" value="${parsedOpeningTime[day][1]}" step="1"></td>
                                    </tr>`;
                                }).join("\n")}
                            </tbody>
                        </table>
                        <label for="delete-timeslots">Delete existing timeslots outside of open times: </label>
                        <input type="checkbox" name="delete-timeslots"><br>
                        <input type="submit" value="Set new opentime">
                    </form>
                </div>
                <script src="/static/js/settingsScript.js"></script>
            </body>
        </html>
    `;

    return page;
}

exports.renderStoreScan = function renderStoreScan(store) {
    let page = `
        <html>
            <head>
                <title>scanner</title>
                <link rel="stylesheet" href="/static/css/style.css">
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
                <style>
                    .hidden {
                        display: none;
                    }
                </style>
            </head>
            <body>`;

    page += `${renderEmployeeNav(store)}`;
    page += `
                <div class="main-body">
                    <h1>Scan a package</h1>
                    <p id="loading-placeholder">Trying to open camera...</p>
                    <div id="controls-container" class="hidden">
                        <video id="scanner-content" disablepictureinpicture playsinline></video><br>
                        <div id="btn-wrap">
                            <button id="start-scanner-btn">Start scanner</button>
                            <button id="stop-scanner-btn">Stop scanner</button>
                        </div>
                        
                        <h2>Package details</h2>
                        <p>Validation key is automatically set when a QR code is scanned. Press the lock to manually input package:</p>
                        <form action="/store/package" method="GET">
                            <label for="validationKey">Validation key:</label><br>
                            <div class="input-container">
                                <input id="validation-key-input" type="text" name="validationKey" disabled="true" value="">
                                <i id="input-toggle" class="fas fa-unlock" onclick="toggleValidationInput()"> </i> <br>
                            </div>
                            <input type="hidden" value="${store.id}" name="storeid">
                            <input type="submit" value="Go to package"><br>
                        </form>
                    </div>
                    <a href="/store?storeid=${store.id}" class="knap">Back</a>
                </div>

                <!-- Burde måske samles i en script -->
                <script src="/static/js/external/qr-scanner.umd.min.js"></script>
                <script src="/static/js/qrScannerScript.js"></script>
                <script>
                    function toggleValidationInput(){
                        elm = document.getElementById('validation-key-input');
                        elm.disabled ? elm.disabled = false : elm.disabled = true;
                    }
                </script>
            </body>
        </html>
    `;

    return page;
}

exports.renderPackageOverview = function renderPackageOverview(store, package) {
    let page = `
        <html>
            <head>
                <title>Package overview</title>
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>`;

    page += `${renderEmployeeNav(store)}`;
    page += `
                <div class="main-body">
                    <h1>Package details</h1>
                    <p style="display: inline">status: </p><span style="color: ${package.delivered ? "green" : "red"}">${package.delivered ? "DELIVERED" : "NOT DELIVERED"}</span>
                    <p>guid: ${package.guid}</p>
                    <p>bookedTimeId: ${package.bookedTimeId}</p>
                    <p>verification code: ${package.verificationCode}</p>
                    <p>customerEmail: ${package.customerEmail}</p>
                    <p>customerName: ${package.customerName}</p>
                    <p>externalOrderId: ${package.externalOrderId}</p>
                    <p>creationDate: ${package.creationDate}</p>
                    <h2>Actions</h2>
                    <form action="/store/package/${package.delivered == 0 ? "confirm" : "undeliver"}" method="POST">
                        <input type="hidden" value="${store.id}" name="storeid">
                        <input type="hidden" value="${package.id}" name="packageid">
                        <input type="submit" value="${package.delivered == 0 ? "Confirm delivery" : "Mark as not delivered"}">
                    </form>
                    <h2>Links:</h2>
                    <div class="link-wrap">
                        <a href="/store/packages?storeid=${store.id}" class="knap">Package overview</a>
                        <a href="/store/scan?storeid=${store.id}" class="knap">Scan package</a>
                    </div>
                <div class="main-body">
            </body>
        </html>
    `;

    return page;
}

exports.renderLogin = function renderLogin(error) {
    let page = `
        <html>
            <head>
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
                <link rel="stylesheet" href="/static/css/style.css">
                <title>login</title>
            </head>

            <body>
                ${error ? `<p>${error}</p>` : ""}
                <form action="/login" method="POST">
                    <label for="username">Username: </label>
                    <input type="text" name="username" placeholder="username" required><br>
                    <label for="password"> Password:     </label>
                        <div class="container">
                            <input type="password" name="password" placeholder="password" id="password" required>
                            <i class="fas fa-eye" id="togglePassword"> </i>
                        </div>
                    <input type="submit" value="login">
                </form>

                <script>
                    // Eye toggle for password
                    const togglePassword = document.querySelector('#togglePassword');
                    const password = document.querySelector('#password');

                    togglePassword.addEventListener('click', function (e) {
                        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                        password.setAttribute('type', type);
                        this.classList.toggle('fa-eye-slash');
                    });
            
                </script>

            </body>
            
        </html>
    `

    return page;
}

exports.renderEditEmployee = function renderEditEmployee(store, request, error) {
    let page = `
        <html>
            <head>
                <title> Editing user: ${request.query.username} </title>
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
                <link rel="stylesheet" href="/static/css/style.css">
            </head>
            <body>`;
    
            page += `${renderNavigation(store)}`;
            page += `
                ${error ? `<p>${error}</p>` : ""}
                <div class="main-body">
                    <h1>Editing ${request.query.username}</h1>
                        
                    <form action="/admin/employees/edit" method="POST">
                        <label for="username">Username:</label>
                        <input type="text" name="username" value="${request.query.username}" required>
                        <label for="name"> Employee name:</label>
                        <input type="text" name="employeeName" value="${request.query.name}" required>
                        
                        <label for="password">Password:</label>
                        <div class="container">
                            <input type="password" name="password" value="password" id="password" onchange='checkPass();' minlength="8" required>
                            <i class="fas fa-eye" id="togglePassword"></i>
                        </div>
                        
                        <label for="confirmPassword"> Confirm password: </label>
                        <div class="container">
                            <input type="password" name="confirmPassword" value="password" id="confirmPassword" onchange='checkPass();' required>
                            <i class="fas fa-eye" id="toggleConfirmPassword"> </i>
                        </div>
                        <input type="hidden" value="${store.id}" name="storeid"> 
                        <input type="hidden" value="${request.query.id}" name="id">   
                        <p id="matchingPasswords" style="color:red" hidden> The passwords do not match </p>
                        
                        <label for="superuser">Is the account an admin account:</label>
                        <input type="radio" value="1" name="superuser" ${request.query.superuser == 1 ? "checked" :""}>Yes</input>
                        <input type="radio" value="0" name="superuser" ${request.query.superuser == 1 ? "" :"checked"}>No</input>
                    
                        <input type="submit" id="submit" value="Edit user">
                    </form>

                    <a href="/admin/employees/employee_list?storeid=${store.id}" class="knap">Back</a>
                </div>
                <script>
                    function checkPass() {
                        if (document.getElementById('password').value ==
                                document.getElementById('confirmPassword').value) {
                            document.getElementById('submit').disabled = false;
                            document.getElementById('matchingPasswords').hidden = true;
                        } else {
                            document.getElementById('submit').disabled = true;
                            document.getElementById('matchingPasswords').hidden = false;
                        }
                    }
                    
                    // Eye toggle for password
                    const togglePassword = document.querySelector('#togglePassword');
                    const password = document.querySelector('#password');

                    togglePassword.addEventListener('click', function (e) {
                        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                        password.setAttribute('type', type);
                        this.classList.toggle('fa-eye-slash');
                    });

                    // Eye toggle for confirmPassword
                    const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
                    const ConfirmPassword = document.querySelector('#confirmPassword');

                    toggleConfirmPassword.addEventListener('click', function (e) {
                        const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
                        confirmPassword.setAttribute('type', type);
                        this.classList.toggle('fa-eye-slash');
                    });
                </script>
            </body>
        </html>
    `;

    return page;
}

exports.render500 = function render500(request) {
    let userId = null;
    if (request.user != null){
        userId = request.user.storeId;
    }
    return`<!DOCTYPE html>
    <html>
        <head>
            <title>500 server error</title>
        </head>
        <body>
            <b>A server error occurred while serving your request<br></b>
            <a href="/login">Go to login page </a> <br>
            ${userId != null ? `
            <a href="/store?storeid=${userId}"> Go to employee dashboard</a> <br>
            <a href="/admin?storeid=${userId}"> Go to admin dashboard</a> <br>
            ` : ""}
        </body>
    </html>
}