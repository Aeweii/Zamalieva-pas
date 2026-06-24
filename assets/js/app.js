/* ====================================================
   ОБЩАЯ ЛОГИКА ДЛЯ ВСЕХ СТРАНИЦ
   Версия: 2.3 (Исправлен вход админа)
   ==================================================== */

// ----- ИНИЦИАЛИЗАЦИЯ АДМИНИСТРАТОРА (при первом запуске) -----
(function initAdmin() {
    const users = JSON.parse(localStorage.getItem('passengers_users')) || [];
    const adminExists = users.some(u => u.login === 'Admin26');
    if (!adminExists) {
        users.push({
            id: 'admin_' + Date.now(),
            login: 'Admin26',
            password: 'Demo20',
            fullName: 'Администратор',
            birthDate: '1990-01-01',
            phone: '+7 (999) 000-00-00',
            email: 'admin@passazhiry.ru',
            registeredAt: new Date().toISOString(),
            isAdmin: true
        });
        localStorage.setItem('passengers_users', JSON.stringify(users));
        console.log('✅ Администратор Admin26 создан');
    }
})();

// ----- Хранилище -----
const DB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('passengers_users')) || [];
    },
    setUsers(users) {
        localStorage.setItem('passengers_users', JSON.stringify(users));
    },
    getRequests() {
        return JSON.parse(localStorage.getItem('passengers_requests')) || [];
    },
    setRequests(requests) {
        localStorage.setItem('passengers_requests', JSON.stringify(requests));
    },
    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('passengers_current_user')) || null;
    },
    setCurrentUser(user) {
        sessionStorage.setItem('passengers_current_user', JSON.stringify(user));
    },
    logout() {
        sessionStorage.removeItem('passengers_current_user');
    }
};

// ----- Утилиты -----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateFull(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'scale(0.9)';
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) container.remove();
        }, 300);
    }, 2800);
}

// ----- Валидация -----
function validateLogin(login) { return /^[A-Za-z0-9]{6,}$/.test(login); }
function validatePassword(password) { return password.length >= 8; }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePhone(phone) { return /^[\d\s\+\(\)\-]{10,}$/.test(phone); }

// ----- Регистрация -----
function registerUser(e) {
    e.preventDefault();
    const login = document.getElementById('regLogin').value.trim();
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('regFullName').value.trim();
    const birthDate = document.getElementById('regBirth').value;
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();

    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));

    let valid = true;

    if (!validateLogin(login)) {
        document.getElementById('regLoginError').textContent = 'Логин: минимум 6 символов, латиница и цифры';
        document.getElementById('regLogin').classList.add('error');
        valid = false;
    }
    if (!validatePassword(password)) {
        document.getElementById('regPasswordError').textContent = 'Пароль: минимум 8 символов';
        document.getElementById('regPassword').classList.add('error');
        valid = false;
    }
    if (!fullName) {
        document.getElementById('regFullNameError').textContent = 'Введите ФИО';
        document.getElementById('regFullName').classList.add('error');
        valid = false;
    }
    if (!birthDate) {
        document.getElementById('regBirthError').textContent = 'Укажите дату рождения';
        document.getElementById('regBirth').classList.add('error');
        valid = false;
    }
    if (!validatePhone(phone)) {
        document.getElementById('regPhoneError').textContent = 'Введите корректный телефон';
        document.getElementById('regPhone').classList.add('error');
        valid = false;
    }
    if (!validateEmail(email)) {
        document.getElementById('regEmailError').textContent = 'Введите корректный email';
        document.getElementById('regEmail').classList.add('error');
        valid = false;
    }

    const users = DB.getUsers();
    if (users.find(u => u.login === login)) {
        document.getElementById('regLoginError').textContent = 'Этот логин уже занят';
        document.getElementById('regLogin').classList.add('error');
        valid = false;
    }

    if (!valid) return;

    const newUser = {
        id: generateId(),
        login, password, fullName, birthDate, phone, email,
        registeredAt: new Date().toISOString()
    };
    users.push(newUser);
    DB.setUsers(users);

    showToast('Регистрация успешна!', 'success');
    setTimeout(() => window.location.href = 'login.html', 1000);
}

// ----- Авторизация -----
function loginUser(e) {
    e.preventDefault();
    const login = document.getElementById('loginLogin').value.trim();
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('loginLogin').classList.remove('error');
    document.getElementById('loginPassword').classList.remove('error');

    if (!login || !password) {
        showToast('Заполните все поля', 'error');
        return;
    }

    const users = DB.getUsers();
    const user = users.find(u => u.login === login);
    if (!user) {
        document.getElementById('loginError').textContent = 'Пользователь с таким логином не найден';
        document.getElementById('loginLogin').classList.add('error');
        return;
    }
    if (user.password !== password) {
        document.getElementById('passwordError').textContent = 'Неверный пароль';
        document.getElementById('loginPassword').classList.add('error');
        return;
    }

    DB.setCurrentUser(user);
    showToast('Добро пожаловать!', 'success');
    
    // Админ → сразу в админку, обычный пользователь → на главную
    setTimeout(() => {
        if (user.login === 'Admin26') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 600);
}

// ----- Проверка авторизации -----
function requireAuth() {
    const user = DB.getCurrentUser();
    if (!user) { 
        showToast('Сначала войдите в систему', 'error');
        window.location.href = 'login.html'; 
        return null; 
    }
    return user;
}

function requireAdmin() {
    const user = DB.getCurrentUser();
    if (!user) {
        showToast('Сначала войдите в систему', 'error');
        window.location.href = 'login.html';
        return false;
    }
    if (user.login !== 'Admin26') {
        showToast('Доступ только для администратора', 'error');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// ----- Создание заявки -----
function createRequest(e) {
    e.preventDefault();
    const user = DB.getCurrentUser();
    if (!user) {
        showToast('Сначала войдите в систему', 'error');
        window.location.href = 'login.html';
        return;
    }

    const transport = document.getElementById('reqTransport').value;
    const date = document.getElementById('reqDate').value;
    const payment = document.getElementById('reqPayment').value;

    if (!transport || !date || !payment) {
        showToast('Заполните все поля', 'error');
        return;
    }

    const requests = DB.getRequests();
    requests.push({
        id: generateId(),
        userId: user.id,
        userLogin: user.login,
        userName: user.fullName || user.login,
        transport, date, payment,
        status: 'Новая',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    DB.setRequests(requests);

    showToast('Заявка отправлена на согласование!', 'success');
    setTimeout(() => window.location.href = 'profile.html', 800);
}

// ----- Получение заявок -----
function getUserRequests(userId) {
    return DB.getRequests().filter(r => r.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getAllRequests() {
    return DB.getRequests().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateRequestStatus(requestId, newStatus) {
    const requests = DB.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return false;
    requests[idx].status = newStatus;
    requests[idx].updatedAt = new Date().toISOString();
    DB.setRequests(requests);
    return true;
}

function saveReview(requestId, text) {
    const requests = DB.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return false;
    requests[idx].review = text;
    requests[idx].reviewDate = new Date().toISOString();
    DB.setRequests(requests);
    return true;
}

// ----- Получение всех отзывов (для главной) -----
function getAllReviews() {
    const requests = DB.getRequests();
    return requests
        .filter(r => r.review && r.review.trim().length > 0 && r.status === 'Обучение завершено')
        .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
        .slice(0, 5);
}

// ----- Слайдер (универсальный) -----
function initSlider(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const track = container.querySelector('.slider-track');
    const slides = track.querySelectorAll('.slider-slide');
    const dotsContainer = container.querySelector('.slider-dots');
    let current = 0;
    let interval;

    function goTo(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        current = index;
        track.style.transform = `translateX(-${current * 100}%)`;
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === current);
            });
        }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    const prevBtn = container.querySelector('.slider-btn.prev');
    const nextBtn = container.querySelector('.slider-btn.next');
    if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(interval); prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(interval); next(); startAuto(); });

    if (dotsContainer) {
        dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.addEventListener('click', () => {
                clearInterval(interval);
                goTo(i);
                startAuto();
            });
        });
    }

    function startAuto() {
        clearInterval(interval);
        interval = setInterval(next, 3000);
    }

    goTo(0);
    startAuto();

    container.addEventListener('mouseenter', () => clearInterval(interval));
    container.addEventListener('mouseleave', startAuto);
}

// ----- Админка: фильтрация, сортировка, пагинация -----
let sortField = 'createdAt';
let sortDir = 'desc';
let currentPage = 1;
const perPage = 5;

function renderAdminTable(requests, page = 1) {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    const searchFilter = document.getElementById('filterSearch')?.value?.toLowerCase() || '';

    let filtered = requests;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchFilter) {
        filtered = filtered.filter(r =>
            r.userLogin.toLowerCase().includes(searchFilter) ||
            r.transport.toLowerCase().includes(searchFilter) ||
            r.id.includes(searchFilter)
        );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    currentPage = page;

    const start = (page - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:30px;">Нет заявок</td></tr>`;
    } else {
        tbody.innerHTML = pageItems.map(r => {
            const hasReview = r.review && r.review.trim().length > 0;
            return `
            <tr>
                <td><strong>${r.userLogin}</strong></td>
                <td>${r.transport}</td>
                <td>${formatDate(r.date)}</td>
                <td><span class="badge badge-${r.status === 'Новая' ? 'new' : r.status === 'Идет обучение' ? 'learning' : 'done'}">${r.status}</span></td>
                <td>
                    <select onchange="adminChangeStatus('${r.id}', this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid #ddd;font-size:13px;background:#fff;">
                        <option value="Новая" ${r.status === 'Новая' ? 'selected' : ''}>Новая</option>
                        <option value="Идет обучение" ${r.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                        <option value="Обучение завершено" ${r.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                    </select>
                </td>
                <td class="review-cell">
                    ${hasReview 
                        ? `<span class="badge-review"><i class="fas fa-comment"></i> Есть отзыв</span>
                           <div class="review-preview">${r.review}</div>`
                        : `<span class="no-review">Нет отзыва</span>`
                    }
                </td>
            </tr>
        `}).join('');
    }

    const pagContainer = document.getElementById('pagination');
    if (pagContainer) {
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === page ? 'active' : ''}" onclick="renderAdminTable(getAllRequests(), ${i})">${i}</button>`;
        }
        pagContainer.innerHTML = html;
    }
}

function adminSort(field) {
    if (sortField === field) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDir = 'asc';
    }
    const requests = getAllRequests();
    const sorted = [...requests].sort((a, b) => {
        let va = a[field] || '';
        let vb = b[field] || '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });
    renderAdminTable(sorted, currentPage);
}

// Глобальные функции для onclick
window.adminChangeStatus = function(id, status) {
    if (updateRequestStatus(id, status)) {
        showToast(`Статус изменён на «${status}»`, 'success');
        renderAdminTable(getAllRequests(), currentPage);
    }
};
window.renderAdminTable = renderAdminTable;
window.getAllRequests = getAllRequests;
window.adminSort = adminSort;
window.submitReview = function(requestId) {
    const textarea = document.getElementById(`reviewText_${requestId}`);
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) {
        showToast('Напишите отзыв', 'error');
        return;
    }
    if (saveReview(requestId, text)) {
        showToast('Отзыв сохранён!', 'success');
        setTimeout(() => location.reload(), 800);
    }
};

// ----- Рендер отзывов на главной -----
function renderUserReviews() {
    const container = document.getElementById('userReviews');
    if (!container) return;

    const reviews = getAllReviews();

    if (reviews.length === 0) {
        container.innerHTML = `<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>`;
        return;
    }

    container.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author"><i class="fas fa-user-circle"></i> ${r.userName || r.userLogin}</span>
                <span class="review-date">${formatDateFull(r.reviewDate)}</span>
            </div>
            <div class="review-stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
            <div class="review-text">«${r.review}»</div>
            <div style="font-size:12px;color:var(--color-gray);margin-top:4px;">
                <i class="fas fa-bus"></i> ${r.transport} · ${formatDate(r.date)}
            </div>
        </div>
    `).join('');
}

// ----- Обработка главной страницы (index.html) -----
function handleIndexPage() {
    const user = DB.getCurrentUser();
    
    // Показываем кнопки входа/кабинета
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBtn) {
            profileBtn.style.display = 'inline-flex';
            // Если админ → ссылка на админку, иначе на профиль
            if (user.login === 'Admin26') {
                profileBtn.href = 'admin.html';
                profileBtn.innerHTML = `<i class="fas fa-user-shield"></i> Админка`;
            } else {
                profileBtn.href = 'profile.html';
                profileBtn.innerHTML = `<i class="fas fa-user"></i> ${user.fullName || user.login}`;
            }
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (profileBtn) profileBtn.style.display = 'none';
    }

    // Отзывы
    renderUserReviews();
}

// ----- Обработка профиля (profile.html) -----
function handleProfilePage() {
    const user = requireAuth();
    if (!user) return;

    // Информация о пользователе
    document.getElementById('profileName').textContent = user.fullName || user.login;
    document.getElementById('profileLogin').innerHTML = `<i class="fas fa-user-tag"></i> Логин: ${user.login}`;
    document.getElementById('profileEmail').innerHTML = `<i class="fas fa-envelope"></i> ${user.email || 'не указан'}`;
    document.getElementById('profilePhone').innerHTML = `<i class="fas fa-phone"></i> ${user.phone || 'не указан'}`;

    // Админка
    const adminLink = document.getElementById('adminLink');
    if (adminLink) adminLink.style.display = user.login === 'Admin26' ? 'inline-flex' : 'none';

    // Заявки
    const container = document.getElementById('requestsList');
    if (container) {
        const requests = getUserRequests(user.id);
        if (requests.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px;">У вас пока нет заявок</p>';
        } else {
            container.innerHTML = requests.map(r => `
                <div class="request-card">
                    <div class="card-header">
                        <strong><i class="fas fa-${r.transport === 'Автобус' ? 'bus' : r.transport === 'Электробус' ? 'bolt' : 'train'}"></i> ${r.transport}</strong>
                        <span class="status status-${r.status === 'Новая' ? 'new' : r.status === 'Идет обучение' ? 'learning' : 'done'}">${r.status}</span>
                    </div>
                    <div class="meta"><i class="far fa-calendar-alt"></i> ${formatDate(r.date)} · <i class="fas fa-wallet"></i> ${r.payment}</div>
                    ${r.status === 'Обучение завершено' ? `
                        <div class="review-area">
                            ${r.review ? `<div class="review-text"><i class="fas fa-star" style="color:#ffc107;"></i> ${r.review}</div>` : `
                                <textarea id="reviewText_${r.id}" class="form-control" placeholder="Оставьте отзыв..." style="font-size:14px;min-height:50px;"></textarea>
                                <button class="btn btn-primary btn-sm mt-8" onclick="submitReview('${r.id}')"><i class="fas fa-pen"></i> Отправить отзыв</button>
                            `}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    }

    // Выход
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        DB.logout();
        window.location.href = 'index.html';
    });
}

// ----- ИНИЦИАЛИЗАЦИЯ В ЗАВИСИМОСТИ ОТ СТРАНИЦЫ -----
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    // Слайдер
    document.querySelectorAll('.slider-container').forEach(container => {
        const slides = container.querySelectorAll('.slider-slide');
        if (slides.length > 0) {
            const id = container.id || 'slider-' + Date.now();
            container.id = id;
            if (!container.querySelector('.slider-dots')) {
                const dotsDiv = document.createElement('div');
                dotsDiv.className = 'slider-dots';
                slides.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
                    dot.dataset.index = i;
                    dotsDiv.appendChild(dot);
                });
                container.appendChild(dotsDiv);
            }
            initSlider(id);
        }
    });

    // Регистрация
    if (page === 'register.html') {
        document.getElementById('registerForm')?.addEventListener('submit', registerUser);
    }

    // Авторизация
    if (page === 'login.html') {
        document.getElementById('loginForm')?.addEventListener('submit', loginUser);
    }

    // Главная страница
    if (page === 'index.html') {
        handleIndexPage();
    }

    // Личный кабинет
    if (page === 'profile.html') {
        handleProfilePage();
    }

    // Новая заявка
    if (page === 'new-request.html') {
        const user = requireAuth();
        if (user) {
            document.getElementById('requestForm')?.addEventListener('submit', createRequest);
            const dateInput = document.getElementById('reqDate');
            if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
        }
    }

    // Админка
    if (page === 'admin.html') {
        if (!requireAdmin()) return;

        const user = DB.getCurrentUser();
        const adminUserEl = document.getElementById('adminUser');
        if (adminUserEl && user) adminUserEl.textContent = ` ${user.fullName || user.login}`;

        renderAdminTable(getAllRequests(), 1);

        document.getElementById('filterStatus')?.addEventListener('change', () => renderAdminTable(getAllRequests(), 1));
        document.getElementById('filterSearch')?.addEventListener('input', () => renderAdminTable(getAllRequests(), 1));

        document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
            DB.logout();
            window.location.href = 'index.html';
        });
    }
});