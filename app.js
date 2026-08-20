// Eclipse Tomcat Backend Base URL (Port 8085)
const TOMCAT_URL = 'https://placement-backend-api.onrender.com/placementx-backend/api';

let currentUser = null;
let profileEditing = false;
let editingJobId = null;

// Exact SVG Registry (Matching Main Dashboard & App Styles)
const SVG_ICONS = {
    bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    arrowLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    cross: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    
    // Main Dashboard Icons
    crown: `<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`,
    studentCap: `<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`,
    briefcaseFilled: `<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`,
    building: `<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`
};

// Silent Error Handler for Server Communications
async function postToServlet(endpoint, formData) {
    try {
        const params = new URLSearchParams(formData);
        const response = await fetch(`${TOMCAT_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: params
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return { status: "ERROR", message: errData.message || `Server Status ${response.status}` };
        }
        return await response.json();
    } catch (err) {
        console.warn("Servlet Warning:", err);
        return { status: "ERROR", message: "Connection temporarily unavailable" };
    }
}

async function getFromServlet(endpoint) {
    try {
        const response = await fetch(`${TOMCAT_URL}${endpoint}`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.warn("Fetch Warning:", err);
        return [];
    }
}

// Modal Handlers
window.openLoginModal = function(role) {
    document.getElementById('selectedRole').value = role;
    document.getElementById('modalTitle').innerText = `${role.replace('_', ' ')} Login`;
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginModal').style.display = 'flex';
};

window.closeLoginModal = function() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('authForm').reset();
};

window.handleOverlayClick = function(e) {
    if (e.target.id === 'loginModal') closeLoginModal();
};

window.handleAuthSubmit = async function(e) {
    e.preventDefault();
    const role = document.getElementById('selectedRole').value;
    const uid = document.getElementById('authUsername').value.trim();
    const pass = document.getElementById('authPassword').value;

    const result = await postToServlet('/login', { username: uid, password: pass, role: role });

    if (result && result.status === "SUCCESS") {
        const savedProfile = JSON.parse(localStorage.getItem(`student_profile_${uid}`) || '{}');

        currentUser = {
            id: result.username || uid,
            username: result.username || uid,
            name: savedProfile.name || result.user_name || uid,
            dept: savedProfile.dept || 'CSE',
            cgpa: savedProfile.cgpa || '8.8',
            role: result.role || role
        };
        closeLoginModal();
        document.getElementById('mainDashboard').style.display = 'none';
        document.getElementById('portalWorkspace').style.display = 'block';
        
        applyHeaderButtonStyles();
        await updateHeaderUserBadge();
        renderRoleWorkspace(role);
    } else {
        const errorDiv = document.getElementById('loginError');
        errorDiv.innerText = result.message || "Invalid Credentials!";
        errorDiv.style.display = 'block';
    }
};

function applyHeaderButtonStyles() {
    const backBtn = document.querySelector('#portalWorkspace button, .btn-back, [onclick*="logoutToMainDashboard"]');
    if (backBtn) {
        backBtn.style.cssText = "background: rgba(255, 255, 255, 0.12) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important; padding: 7px 16px !important; border-radius: 20px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; backdrop-filter: blur(4px) !important; transition: all 0.2s ease !important; display: inline-flex !important; align-items: center !important; gap: 6px !important;";
        backBtn.innerHTML = `${SVG_ICONS.arrowLeft} Back to Main Dashboard`;
    }
}

// Professional Top-Right Header Badge
async function updateHeaderUserBadge() {
    const jobs = await getFromServlet('/jobs');
    const applications = await getFromServlet('/applications');
    const badgeContainer = document.getElementById('userBadge');
    
    if (currentUser.role === 'MANAGEMENT') {
        badgeContainer.innerHTML = `
            <div style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.12); padding:6px 16px; border-radius:24px; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(4px); box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                <span style="display:flex; align-items:center; gap:8px; font-weight:700; color:#f8fafc; font-size:13px; letter-spacing:0.3px;">
                    ${SVG_ICONS.user} ${currentUser.name}
                </span>
            </div>`;
        return;
    }

    let notifCount = jobs.length;
    if (currentUser.role === 'RECRUITER') {
        const recUid = String(currentUser.username || currentUser.id).toLowerCase();
        notifCount = applications.filter(a => String(a.recruiter_id || a.recruiterId).toLowerCase() === recUid).length;
    } else if (currentUser.role === 'STUDENT') {
        const studentUid = String(currentUser.username || currentUser.id).toLowerCase();
        const myUpdates = applications.filter(a => String(a.student_id || a.studentId).toLowerCase() === studentUid && (a.status === 'SELECTED' || a.status === 'REJECTED'));
        notifCount = jobs.length + myUpdates.length;
    }
    
    badgeContainer.innerHTML = `
        <div style="display:inline-flex; align-items:center; gap:14px;">
            <div onclick="openNotificationModal()" style="position:relative; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; background:rgba(255,255,255,0.15); width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.25); transition:all 0.2s ease;" title="View Notifications">
                ${SVG_ICONS.bell}
                <span class="notif-badge" style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:white; font-size:10px; font-weight:800; padding:2px 6px; border-radius:10px; border:2px solid #14532d; min-width:16px; text-align:center;">${notifCount}</span>
            </div>
            <div style="display:inline-flex; align-items:center; background:rgba(255,255,255,0.12); padding:6px 16px; border-radius:24px; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(4px); box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                <span style="font-weight:700; color:#f8fafc; font-size:13px; letter-spacing:0.3px;">
                    ${currentUser.name}
                </span>
            </div>
        </div>`;
}

// Custom Notification Modal
window.openNotificationModal = async function() {
    const jobs = await getFromServlet('/jobs');
    const applications = await getFromServlet('/applications');
    
    let modalOverlay = document.getElementById('customNotifOverlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'customNotifOverlay';
        modalOverlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); backdrop-filter:blur(6px); z-index:99999; display:flex; align-items:center; justify-content:center;";
        modalOverlay.onclick = (e) => { if (e.target.id === 'customNotifOverlay') modalOverlay.remove(); };
        document.body.appendChild(modalOverlay);
    }
    
    let notifHTML = '';
    
    if (currentUser.role === 'RECRUITER') {
        const recUid = String(currentUser.username || currentUser.id).toLowerCase();
        const myApps = applications.filter(a => String(a.recruiter_id || a.recruiterId).toLowerCase() === recUid);
        
        notifHTML = `
            <div style="background:#ffffff; width:90%; max-width:540px; border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,0.25); overflow:hidden; border:1px solid #e2e8f0;">
                <div style="background:#1b4332; padding:18px 24px; display:flex; justify-content:space-between; align-items:center; color:#ffffff;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="background:rgba(255,255,255,0.2); padding:6px; border-radius:50%; display:flex;">${SVG_ICONS.bell}</span>
                        <h3 style="margin:0; font-size:16px; font-weight:700;">Student Applications Received (${myApps.length})</h3>
                    </div>
                    <button onclick="document.getElementById('customNotifOverlay').remove()" style="background:transparent; border:none; color:#ffffff; font-size:20px; cursor:pointer; font-weight:bold;">&times;</button>
                </div>
                <div style="padding:20px; max-height:380px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                    ${myApps.length > 0 ? myApps.map(a => `
                        <div style="background:#f8fafc; border-left:4px solid #1b4332; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:700; color:#0f172a; font-size:14px;">${a.student_name || a.studentName} (${a.dept || 'CSE'})</div>
                                <div style="color:#64748b; font-size:12px; margin-top:2px;">Applied for Position: <strong>${a.role}</strong></div>
                            </div>
                            <span style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:11px; padding:4px 8px; border-radius:12px;">CGPA: ${a.cgpa || '8.8'}</span>
                        </div>
                    `).join('') : '<div style="text-align:center; padding:30px; color:#64748b; font-size:14px;">No student applications received yet.</div>'}
                </div>
            </div>`;
    } else if (currentUser.role === 'STUDENT') {
        const studentUid = String(currentUser.username || currentUser.id).toLowerCase();
        const myApps = applications.filter(a => String(a.student_id || a.studentId).toLowerCase() === studentUid && (a.status === 'SELECTED' || a.status === 'REJECTED'));
        
        notifHTML = `
            <div style="background:#ffffff; width:90%; max-width:560px; border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,0.25); overflow:hidden; border:1px solid #e2e8f0;">
                <div style="background:#1b4332; padding:18px 24px; display:flex; justify-content:space-between; align-items:center; color:#ffffff;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="background:rgba(255,255,255,0.2); padding:6px; border-radius:50%; display:flex;">${SVG_ICONS.bell}</span>
                        <h3 style="margin:0; font-size:16px; font-weight:700;">Your Notifications & Drive Updates</h3>
                    </div>
                    <button onclick="document.getElementById('customNotifOverlay').remove()" style="background:transparent; border:none; color:#ffffff; font-size:20px; cursor:pointer; font-weight:bold;">&times;</button>
                </div>
                <div style="padding:20px; max-height:380px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
                    ${myApps.map(a => `
                        <div style="background:${a.status === 'SELECTED' ? '#ecfdf5' : '#fef2f2'}; border:1px solid ${a.status === 'SELECTED' ? '#a7f3d0' : '#fecaca'}; border-left:4px solid ${a.status === 'SELECTED' ? '#10b981' : '#ef4444'}; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:11px; font-weight:800; color:${a.status === 'SELECTED' ? '#047857' : '#b91c1c'}; text-transform:uppercase; display:inline-flex; align-items:center; gap:4px;">
                                    ${a.status === 'SELECTED' ? SVG_ICONS.check : SVG_ICONS.cross} Application Status Update
                                </span>
                                <div style="font-weight:700; color:#0f172a; font-size:14px; margin-top:2px;">${a.company} - ${a.role}</div>
                                <div style="color:#475569; font-size:12px; margin-top:2px;">You have been <strong>${a.status}</strong> for this recruitment drive.</div>
                            </div>
                            <span style="padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; ${a.status === 'SELECTED' ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">${a.status}</span>
                        </div>
                    `).join('')}

                    ${jobs.map(j => `
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #16a34a; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-size:11px; font-weight:700; color:#15803d; text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:4px;">
                                    New Campus Drive: ${j.company || 'Corporate Partner'}
                                </span>
                                <div style="font-weight:700; color:#0f172a; font-size:14px; margin-top:2px;">${j.title}</div>
                                <div style="color:#64748b; font-size:12px; margin-top:2px;">Package: <strong>${j.salary}</strong> • Openings: <strong>${j.vacancy}</strong></div>
                            </div>
                            <span style="font-size:11px; color:#94a3b8; font-weight:600;">${j.posted_date || '2026-08-20'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }
    
    modalOverlay.innerHTML = notifHTML;
};

async function renderRoleWorkspace(role) {
    const container = document.getElementById('workspaceContent');
    applyHeaderButtonStyles();

    if (role === 'STUDENT') {
        renderStudentPortalView(container);
    } else if (role === 'TPO_ADMIN') {
        renderTpoPortalView(container);
    } else if (role === 'RECRUITER') {
        renderRecruiterPortalView(container);
    } else if (role === 'MANAGEMENT') {
        renderManagementMainHub(container);
    }
}

// 1. Student Portal View
async function renderStudentPortalView(container) {
    const jobs = await getFromServlet('/jobs');
    const applications = await getFromServlet('/applications');
    
    const studentUid = String(currentUser.username || currentUser.id);
    const myApps = applications.filter(a => String(a.student_id || a.studentId) === studentUid);

    container.innerHTML = `
        <h2 class="dashboard-title">Student Personal Workspace - ${currentUser.name}</h2>
        
        <div class="form-card profile-form-container">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">Update Profile Information</h3>
                <button type="button" class="btn-portal" style="width:auto; padding:8px 18px; display:inline-flex; align-items:center; gap:6px; cursor:pointer;" onclick="toggleProfileEdit()">
                    ${profileEditing ? `${SVG_ICONS.check} Update Details` : `${SVG_ICONS.edit} Edit Details`}
                </button>
            </div>
            
            <form id="studentProfileForm" class="profile-input-grid" onsubmit="event.preventDefault();" style="margin-top:16px;">
                <div>
                    <label style="font-size:12px; color:#64748b; font-weight:600;">FULL NAME</label>
                    <input type="text" id="prof_name" value="${currentUser.name}" class="input-field-custom" ${profileEditing ? '' : 'disabled'} style="${profileEditing ? 'background:#ffffff; border-color:#16a34a;' : ''}" required>
                </div>
                <div>
                    <label style="font-size:12px; color:#64748b; font-weight:600;">ROLL / USER ID</label>
                    <input type="text" id="prof_id" value="${studentUid}" class="input-field-custom" disabled required>
                </div>
                <div>
                    <label style="font-size:12px; color:#64748b; font-weight:600;">DEPARTMENT</label>
                    <input type="text" id="prof_dept" value="${currentUser.dept || 'CSE'}" class="input-field-custom" ${profileEditing ? '' : 'disabled'} style="${profileEditing ? 'background:#ffffff; border-color:#16a34a;' : ''}" required>
                </div>
                <div>
                    <label style="font-size:12px; color:#64748b; font-weight:600;">CGPA</label>
                    <input type="text" id="prof_cgpa" value="${currentUser.cgpa || '8.8'}" class="input-field-custom" ${profileEditing ? '' : 'disabled'} style="${profileEditing ? 'background:#ffffff; border-color:#16a34a;' : ''}" required>
                </div>
            </form>
        </div>

        <div class="table-card" style="margin-top:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0;">Eligible Campus Drives</h3>
                <span class="badge badge-success">Applied Jobs: ${myApps.length}</span>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>COMPANY</th>
                        <th>JOB TITLE</th>
                        <th>PACKAGE</th>
                        <th>POSTED DATE</th>
                        <th>ACTION / STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobs.length > 0 ? jobs.map(j => {
                        const existing = applications.find(a => (a.job_id || a.jobId) == j.id && String(a.student_id || a.studentId) === studentUid);
                        const compDisplay = (j.company && j.company !== 'null' && j.company.trim() !== '') ? j.company : (j.recruiter_id || 'Corporate');
                        
                        let statusBtn = `<button class="btn-portal" style="padding:6px 14px; font-size:12px; width:auto; cursor:pointer;" onclick="applyForDrive(${j.id}, '${j.title}', '${compDisplay}', '${j.recruiter_id || j.recruiterId}')">Apply Drive</button>`;
                        
                        if (existing) {
                            if (existing.status === 'SELECTED') {
                                statusBtn = `<span style="background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:6px 14px; border-radius:20px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.check} SELECTED</span>`;
                            } else if (existing.status === 'REJECTED') {
                                statusBtn = `<span style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:6px 14px; border-radius:20px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.cross} REJECTED</span>`;
                            } else {
                                statusBtn = `<span style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:6px 14px; border-radius:20px; font-weight:700; font-size:12px; display:inline-block;">Applied (PENDING)</span>`;
                            }
                        }

                        return `
                            <tr>
                                <td><strong>${compDisplay}</strong></td>
                                <td>${j.title}</td>
                                <td><span class="badge badge-success">${j.salary}</span></td>
                                <td>${j.posted_date || '2026-08-20'}</td>
                                <td>${statusBtn}</td>
                            </tr>
                        `;
                    }).join('') : '<tr><td colspan="5" style="text-align:center;">No active job drives.</td></tr>'}
                </tbody>
            </table>
        </div>`;
}

window.toggleProfileEdit = async function() {
    if (profileEditing) {
        const newName = document.getElementById('prof_name').value.trim();
        const newDept = document.getElementById('prof_dept').value.trim();
        const newCgpa = document.getElementById('prof_cgpa').value.trim();
        const studentUid = String(currentUser.username || currentUser.id);

        if (!newName || !newDept || !newCgpa) {
            alert("Please fill all profile fields!");
            return;
        }

        currentUser.name = newName;
        currentUser.dept = newDept;
        currentUser.cgpa = newCgpa;

        localStorage.setItem(`student_profile_${studentUid}`, JSON.stringify({
            name: newName,
            dept: newDept,
            cgpa: newCgpa
        }));

        profileEditing = false;
        await updateHeaderUserBadge();
        alert("Profile Information Updated Successfully!");
    } else {
        profileEditing = true;
    }
    renderStudentPortalView(document.getElementById('workspaceContent'));
};

window.applyForDrive = async function(jobId, title, company, recruiterId) {
    const result = await postToServlet('/applications', {
        jobId: jobId,
        studentId: String(currentUser.username || currentUser.id),
        studentName: currentUser.name,
        rollNumber: String(currentUser.username || currentUser.id),
        dept: currentUser.dept || 'CSE',
        cgpa: currentUser.cgpa || '8.8',
        company: company,
        role: title,
        recruiterId: recruiterId
    });

    alert(result.message || `Applied successfully! Recruiter pipeline notified.`);
    await updateHeaderUserBadge();
    renderRoleWorkspace('STUDENT');
};

// 2. Recruiter Module View
async function renderRecruiterPortalView(container) {
    const jobs = await getFromServlet('/jobs');
    const applications = await getFromServlet('/applications');
    const recUid = String(currentUser.username || currentUser.id);

    const myJobs = jobs.filter(j => String(j.recruiter_id || j.recruiterId).toLowerCase() === recUid.toLowerCase());
    const myApps = applications.filter(a => String(a.recruiter_id || a.recruiterId).toLowerCase() === recUid.toLowerCase());

    container.innerHTML = `
        <h2 class="dashboard-title">Recruiter Module - ${currentUser.name}</h2>
        
        <div class="form-card">
            <h3 id="formHeading">Post New Job Opening for ${currentUser.name}</h3>
            <form id="recJobForm" class="form-grid" style="grid-template-columns: repeat(4, 1fr) auto;">
                <input type="text" id="rec_j_comp" placeholder="Company Name (e.g. Google, Amazon)" class="input-field-custom" required>
                <input type="text" id="rec_j_title" placeholder="Job Title (e.g. Cloud SDE)" class="input-field-custom" required>
                <input type="number" id="rec_j_vac" placeholder="Vacancies" class="input-field-custom" required>
                <input type="text" id="rec_j_sal" placeholder="Package (e.g. 15 LPA)" class="input-field-custom" required>
                <button type="submit" id="submitJobBtn" class="btn-portal" style="grid-column: 1 / -1; margin-top: 6px;">Publish & Broadcast to All Students</button>
            </form>
        </div>

        <div class="table-card" style="margin-top:24px;">
            <h3>Active Job Openings Posted by You</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>JOB TITLE</th>
                        <th>COMPANY</th>
                        <th>VACANCIES</th>
                        <th>PACKAGE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    ${myJobs.length > 0 ? myJobs.map(j => {
                        const safeComp = String(j.company || '').replace(/'/g, "\\'");
                        const safeTitle = String(j.title || '').replace(/'/g, "\\'");
                        const safeSalary = String(j.salary || '').replace(/'/g, "\\'");
                        
                        return `
                        <tr>
                            <td><strong>${j.title}</strong></td>
                            <td>${j.company || currentUser.name}</td>
                            <td><span class="badge badge-success">${j.vacancy} Openings</span></td>
                            <td>${j.salary}</td>
                            <td>
                                <button onclick="populateInlineEdit(${j.id}, '${safeComp}', '${safeTitle}', '${safeSalary}', ${j.vacancy})" style="background:#f59e0b; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.edit} Edit</button>
                                <button onclick="deleteJobOpening(${j.id})" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; margin-left:4px; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.trash} Delete</button>
                            </td>
                        </tr>
                        `;
                    }).join('') : `<tr><td colspan="5" style="text-align:center; color:#64748b;">No active jobs posted yet.</td></tr>`}
                </tbody>
            </table>
        </div>

        <div class="table-card" style="margin-top:24px;">
            <h3>Candidate Evaluation Pipeline</h3>
            <table class="data-table">
                <thead><tr><th>STUDENT NAME</th><th>ROLL NO</th><th>DEPT</th><th>CGPA</th><th>ROLE</th><th>STATUS / ACTION</th></tr></thead>
                <tbody>
                    ${myApps.length > 0 ? myApps.map(a => `
                        <tr>
                            <td><strong>${a.student_name || a.studentName}</strong></td>
                            <td>${a.roll_number || a.rollNumber}</td>
                            <td>${a.dept || 'CSE'}</td>
                            <td>${a.cgpa || '8.8'}</td>
                            <td>${a.role}</td>
                            <td>
                                ${a.status === 'PENDING' ? `
                                    <button onclick="updateCandidateStatus(${a.id || a.app_id}, 'SELECTED')" style="background:#16a34a; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.check} Select</button>
                                    <button onclick="updateCandidateStatus(${a.id || a.app_id}, 'REJECTED')" style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.cross} Reject</button>
                                ` : `<span style="padding:4px 12px; border-radius:20px; font-weight:bold; font-size:12px; ${a.status === 'SELECTED' ? 'background:#dcfce7; color:#15803d; border:1px solid #86efac;' : 'background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;'}">${a.status}</span>`}
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="6" style="text-align:center; color:#64748b;">No student applications received yet.</td></tr>`}
                </tbody>
            </table>
        </div>`;

    document.getElementById('recJobForm').onsubmit = async function(e) {
        e.preventDefault();
        
        let payload = {
            recruiterId: recUid,
            company: document.getElementById('rec_j_comp').value.trim(),
            title: document.getElementById('rec_j_title').value.trim(),
            vacancy: document.getElementById('rec_j_vac').value,
            salary: document.getElementById('rec_j_sal').value.trim()
        };

        if (editingJobId) {
            payload.action = 'UPDATE';
            payload.jobId = editingJobId;
        }

        const result = await postToServlet('/jobs', payload);
        alert(result.message || "Job operation completed successfully!");
        editingJobId = null;
        await updateHeaderUserBadge();
        renderRoleWorkspace('RECRUITER');
    };
}

window.populateInlineEdit = function(jobId, company, title, salary, vacancy) {
    editingJobId = jobId;
    document.getElementById('rec_j_comp').value = company;
    document.getElementById('rec_j_title').value = title;
    document.getElementById('rec_j_sal').value = salary;
    document.getElementById('rec_j_vac').value = vacancy;
    
    document.getElementById('formHeading').innerText = `Update Job Opening Details (Job ID: ${jobId})`;
    document.getElementById('submitJobBtn').innerText = `Update Job Opening Details`;
    window.scrollTo({ top: 100, behavior: 'smooth' });
};

window.deleteJobOpening = async function(jobId) {
    if (confirm(`Are you sure you want to delete Job ID ${jobId}?`)) {
        const result = await postToServlet('/jobs', {
            action: 'DELETE',
            jobId: jobId
        });
        alert(result.message || "Job opening deleted from database!");
        await updateHeaderUserBadge();
        renderRoleWorkspace('RECRUITER');
    }
};

window.updateCandidateStatus = async function(appId, status) {
    const result = await postToServlet('/applications', {
        action: 'UPDATE_STATUS',
        appId: appId,
        status: status
    });
    alert(`Candidate status updated to: ${status}`);
    await updateHeaderUserBadge();
    renderRoleWorkspace('RECRUITER');
};

// 3. Management Super-Admin Control Center (Main Dashboard Icons & Hover Animation)
function renderManagementMainHub(container) {
    container.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 10px 0;">
            <div style="margin-bottom: 36px;">
                <h2 style="font-size: 26px; font-weight: 800; color: #1b4332; margin: 0 0 6px 0; letter-spacing: -0.5px;">Management Super-Admin Control Center</h2>
                <p style="color: #64748b; font-size: 14px; margin: 0;">Select a sub-system module below to manage credentials, audits, and placement drives.</p>
            </div>

            <div class="role-grid" style="display: grid; grid-template-columns: repeat(4, minmax(240px, 1fr)); gap: 24px;">
                
                <!-- Card 1: Issue Credentials (Crown Icon) -->
                <div class="mgmt-card" onclick="loadMgmtSubModule('CREDENTIALS')" style="background: #ffffff; border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); min-height: 250px; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 16px 30px rgba(27, 67, 50, 0.12)'; this.style.borderColor='#1b4332';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0, 0, 0, 0.04)'; this.style.borderColor='#e2e8f0';">
                    <div>
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #1b4332;">
                            ${SVG_ICONS.crown}
                        </div>
                        <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Issue / Create Credentials</h3>
                        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Register and assign new role credentials directly into PostgreSQL database.</p>
                    </div>
                    <button class="btn-portal" style="margin-top: 22px; width: 100%; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 13px; background: #1b4332; transition: background 0.2s;" onclick="event.stopPropagation(); loadMgmtSubModule('CREDENTIALS')">Open Module →</button>
                </div>

                <!-- Card 2: Student Portal Audits (Graduation Cap Icon) -->
                <div class="mgmt-card" onclick="loadMgmtSubModule('STUDENTS')" style="background: #ffffff; border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); min-height: 250px; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 16px 30px rgba(27, 67, 50, 0.12)'; this.style.borderColor='#1b4332';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0, 0, 0, 0.04)'; this.style.borderColor='#e2e8f0';">
                    <div>
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #1b4332;">
                            ${SVG_ICONS.studentCap}
                        </div>
                        <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Student Portal Audits</h3>
                        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Track live applications, individual student selections, and rejections.</p>
                    </div>
                    <button class="btn-portal" style="margin-top: 22px; width: 100%; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 13px; background: #1b4332; transition: background 0.2s;" onclick="event.stopPropagation(); loadMgmtSubModule('STUDENTS')">Open Module →</button>
                </div>

                <!-- Card 3: Recruiter Modules (Briefcase Icon) -->
                <div class="mgmt-card" onclick="loadMgmtSubModule('RECRUITERS')" style="background: #ffffff; border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); min-height: 250px; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 16px 30px rgba(27, 67, 50, 0.12)'; this.style.borderColor='#1b4332';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0, 0, 0, 0.04)'; this.style.borderColor='#e2e8f0';">
                    <div>
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #1b4332;">
                            ${SVG_ICONS.briefcaseFilled}
                        </div>
                        <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Recruiter Modules</h3>
                        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Analyze corporate job posting metrics and candidate evaluation throughput.</p>
                    </div>
                    <button class="btn-portal" style="margin-top: 22px; width: 100%; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 13px; background: #1b4332; transition: background 0.2s;" onclick="event.stopPropagation(); loadMgmtSubModule('RECRUITERS')">Open Module →</button>
                </div>

                <!-- Card 4: Placement Officers (Building Icon) -->
                <div class="mgmt-card" onclick="loadMgmtSubModule('OFFICERS')" style="background: #ffffff; border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); min-height: 250px; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 16px 30px rgba(27, 67, 50, 0.12)'; this.style.borderColor='#1b4332';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0, 0, 0, 0.04)'; this.style.borderColor='#e2e8f0';">
                    <div>
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #1b4332;">
                            ${SVG_ICONS.building}
                        </div>
                        <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Placement Officers</h3>
                        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">Monitor active TPO Admins and comprehensive campus drive operations.</p>
                    </div>
                    <button class="btn-portal" style="margin-top: 22px; width: 100%; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 13px; background: #1b4332; transition: background 0.2s;" onclick="event.stopPropagation(); loadMgmtSubModule('OFFICERS')">Open Module →</button>
                </div>

            </div>
        </div>
    `;
}

// Global Window Binding for Back to Hub Button
window.goBackToMgmtHub = function() {
    const container = document.getElementById('workspaceContent');
    if (container) {
        renderManagementMainHub(container);
    }
};

// 4. Management Sub-Module Audits (Clean Separated Badges)
window.loadMgmtSubModule = async function(type) {
    const container = document.getElementById('workspaceContent');
    const userAccounts = await getFromServlet('/users');
    const applications = await getFromServlet('/applications');
    const jobs = await getFromServlet('/jobs');

    if (type === 'CREDENTIALS') {
        container.innerHTML = `
            <button type="button" class="btn-portal" style="background:#1b4332; color:#ffffff; width:auto; margin-bottom:24px; cursor:pointer; padding:9px 20px; font-weight:600; border-radius:8px; border:none; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:inline-flex; align-items:center; gap:6px;" onclick="window.goBackToMgmtHub()">${SVG_ICONS.arrowLeft} Back to Management Hub</button>
            <h2 class="dashboard-title">Issue / Create Credentials</h2>
            <div class="form-card">
                <h3>Assign Credentials</h3>
                <form id="createAccountForm" class="form-grid">
                    <select id="new_role" class="input-field-custom" required>
                        <option value="">-- Select Role Type --</option>
                        <option value="STUDENT">Student</option>
                        <option value="TPO_ADMIN">Placement Officer (TPO)</option>
                        <option value="RECRUITER">Recruiter</option>
                    </select>
                    <input type="text" id="new_id" placeholder="Assign User ID" class="input-field-custom" required>
                    <input type="text" id="new_name" placeholder="Full Name" class="input-field-custom" required>
                    <input type="password" id="new_pass" placeholder="Assign Password" class="input-field-custom" required>
                    <button type="submit" class="btn-portal">Create Credential</button>
                </form>
            </div>
            <div class="table-card" style="margin-top:24px;">
                <h3>System Accounts (Live Database)</h3>
                <table class="data-table">
                    <thead><tr><th>USER ID</th><th>FULL NAME</th><th>ASSIGNED ROLE TYPE</th><th>ASSIGNED PASSWORD</th><th>ACTION</th></tr></thead>
                    <tbody>
                        ${userAccounts.length > 0 ? userAccounts.map(u => {
                            const uId = u.user_email || u.username;
                            const uName = u.user_name || u.name;
                            const uPass = u.user_password || '********';
                            const uRole = u.role_name || u.role || (u.role_id === 1 ? 'MANAGEMENT' : (u.role_id === 3 ? 'RECRUITER' : (u.role_id === 4 ? 'TPO_ADMIN' : 'STUDENT')));
                            return `
                                <tr>
                                    <td><strong>${uId}</strong></td>
                                    <td>${uName}</td>
                                    <td><span class="badge badge-success">${uRole}</span></td>
                                    <td><code>${uPass}</code></td>
                                    <td>
                                        ${uRole !== 'MANAGEMENT' ? `
                                            <button onclick="deleteUserAccount('${uId}')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.trash} Delete</button>
                                        ` : '<span style="color:#94a3b8; font-size:12px;">Admin (Protected)</span>'}
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" style="text-align:center;">No user accounts found in Database.</td></tr>'}
                    </tbody>
                </table>
            </div>`;

        document.getElementById('createAccountForm').onsubmit = async function(e) {
            e.preventDefault();
            await postToServlet('/register', {
                role: document.getElementById('new_role').value,
                username: document.getElementById('new_id').value,
                name: document.getElementById('new_name').value,
                password: document.getElementById('new_pass').value
            });

            alert("Account created successfully!");
            await loadMgmtSubModule('CREDENTIALS');
        };
    } 
    else if (type === 'STUDENTS') {
        const studentAccs = userAccounts.filter(u => (u.role_name || u.role || (u.role_id === 2 ? 'STUDENT' : '')) === 'STUDENT');
        container.innerHTML = `
            <button type="button" class="btn-portal" style="background:#1b4332; color:#ffffff; width:auto; margin-bottom:24px; cursor:pointer; padding:9px 20px; font-weight:600; border-radius:8px; border:none; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:inline-flex; align-items:center; gap:6px;" onclick="window.goBackToMgmtHub()">${SVG_ICONS.arrowLeft} Back to Management Hub</button>
            <h2 class="dashboard-title">Real-time Student Module Audit View</h2>
            <div class="table-card" style="margin-top:20px; box-shadow:0 4px 16px rgba(0,0,0,0.06); border-radius:12px; border:1px solid #e2e8f0;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ROLL NO / USER ID</th>
                            <th>STUDENT NAME</th>
                            <th>DEPT & CGPA</th>
                            <th style="width:30%;">SELECTED OFFERS</th>
                            <th style="width:30%;">REJECTED / PENDING APPLICATIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentAccs.length > 0 ? studentAccs.map(s => {
                            const sUid = String(s.user_email || s.username);
                            const savedP = JSON.parse(localStorage.getItem(`student_profile_${sUid}`) || '{}');
                            const sName = savedP.name || s.user_name || s.name || sUid;
                            const sDept = savedP.dept || 'CSE';
                            const sCgpa = savedP.cgpa || '8.8';

                            const apps = applications.filter(a => String(a.student_id || a.studentId) === sUid);
                            const selectedApps = apps.filter(a => a.status === 'SELECTED');
                            const otherApps = apps.filter(a => a.status !== 'SELECTED');

                            return `
                                <tr>
                                    <td><strong>${sUid}</strong></td>
                                    <td><div style="font-weight:700; color:#0f172a;">${sName}</div></td>
                                    <td><span style="font-size:12px; color:#475569; font-weight:600;">${sDept} • ${sCgpa} CGPA</span></td>
                                    <td>
                                        <div style="display:flex; gap:6px; flex-direction:column;">
                                        ${selectedApps.length > 0 ? selectedApps.map(a => `
                                            <span style="background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:5px 10px; border-radius:8px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
                                                ${SVG_ICONS.check} ${a.company} (${a.role}) - SELECTED
                                            </span>
                                        `).join('') : '<span style="color:#94a3b8; font-size:12px;">No Selection Yet</span>'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style="display:flex; gap:6px; flex-direction:column;">
                                        ${otherApps.length > 0 ? otherApps.map(a => `
                                            <span style="${a.status === 'REJECTED' ? 'background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;' : 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;'} padding:5px 10px; border-radius:8px; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                                                ${a.company} (${a.role}) - <strong>${a.status}</strong>
                                            </span>
                                        `).join('') : (selectedApps.length > 0 ? '<span style="color:#94a3b8; font-size:12px;">No Other Active Applications</span>' : '<span style="color:#94a3b8; font-size:12px;">No Drives Applied Yet</span>')}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" style="text-align:center;">No student accounts found.</td></tr>'}
                    </tbody>
                </table>
            </div>`;
    } 
    else if (type === 'RECRUITERS') {
        const recruiterAccs = userAccounts.filter(u => (u.role_name || u.role || (u.role_id === 3 ? 'RECRUITER' : '')) === 'RECRUITER');
        container.innerHTML = `
            <button type="button" class="btn-portal" style="background:#1b4332; color:#ffffff; width:auto; margin-bottom:24px; cursor:pointer; padding:9px 20px; font-weight:600; border-radius:8px; border:none; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:inline-flex; align-items:center; gap:6px;" onclick="window.goBackToMgmtHub()">${SVG_ICONS.arrowLeft} Back to Management Hub</button>
            <h2 class="dashboard-title">Recruiter Module Real-time Stats</h2>
            <div class="table-card" style="margin-top:20px;">
                <table class="data-table">
                    <thead><tr><th>RECRUITER ID</th><th>RECRUITER NAME</th><th>POSTED JOBS COUNT</th><th>SELECTED CANDIDATES</th><th>REJECTED CANDIDATES</th></tr></thead>
                    <tbody>
                        ${recruiterAccs.length > 0 ? recruiterAccs.map(r => {
                            const recUid = String(r.user_email || r.username);
                            const recName = r.user_name || r.name || recUid;
                            const rJobs = jobs.filter(j => String(j.recruiter_id || j.recruiterId).toLowerCase() === recUid.toLowerCase());
                            const selected = applications.filter(a => String(a.recruiter_id || a.recruiterId).toLowerCase() === recUid.toLowerCase() && a.status === 'SELECTED');
                            const rejected = applications.filter(a => String(a.recruiter_id || a.recruiterId).toLowerCase() === recUid.toLowerCase() && a.status === 'REJECTED');
                            return `
                                <tr>
                                    <td><strong>${recUid}</strong></td>
                                    <td>${recName}</td>
                                    <td><span class="badge badge-success">${rJobs.length} Jobs Posted</span></td>
                                    <td><span style="background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:12px;">${selected.length} Selected</span></td>
                                    <td><span style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:12px;">${rejected.length} Rejected</span></td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" style="text-align:center;">No recruiter accounts found.</td></tr>'}
                    </tbody>
                </table>
            </div>`;
    }
    else if (type === 'OFFICERS') {
        const tpoAccs = userAccounts.filter(u => (u.role_name || u.role || (u.role_id === 4 ? 'TPO_ADMIN' : '')) === 'TPO_ADMIN');
        container.innerHTML = `
            <button type="button" class="btn-portal" style="background:#1b4332; color:#ffffff; width:auto; margin-bottom:24px; cursor:pointer; padding:9px 20px; font-weight:600; border-radius:8px; border:none; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:inline-flex; align-items:center; gap:6px;" onclick="window.goBackToMgmtHub()">${SVG_ICONS.arrowLeft} Back to Management Hub</button>
            <h2 class="dashboard-title">Placement Officers (TPO Admins)</h2>
            <div class="table-card" style="margin-top:20px;">
                <table class="data-table">
                    <thead><tr><th>USER ID</th><th>OFFICER NAME</th><th>ROLE</th></tr></thead>
                    <tbody>
                        ${tpoAccs.length > 0 ? tpoAccs.map(t => {
                            const tUid = String(t.user_email || t.username);
                            const tName = t.user_name || t.name || tUid;
                            return `
                                <tr>
                                    <td><strong>${tUid}</strong></td>
                                    <td>${tName}</td>
                                    <td><span class="badge badge-success">TPO_ADMIN</span></td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="3" style="text-align:center;">No TPO Officer accounts found in Database.</td></tr>'}
                    </tbody>
                </table>
            </div>`;
    }
};

window.deleteUserAccount = async function(userId) {
    if (confirm(`Are you sure you want to delete user account: ${userId}?`)) {
        await postToServlet('/delete-user', { userId: userId });
        alert("Account deleted!");
        await loadMgmtSubModule('CREDENTIALS');
    }
};

window.logoutToMainDashboard = function() {
    currentUser = null;
    document.getElementById('portalWorkspace').style.display = 'none';
    document.getElementById('mainDashboard').style.display = 'block';
};