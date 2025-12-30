// Dữ liệu chủ đề
const topics = [
    { name: 'SQL Injection', desc: 'Lỗ hổng chèn mã SQL vào database.', icon: 'database' },
    { name: 'XSS', desc: 'Mã độc JavaScript chạy trên trình duyệt.', icon: 'code' },
    { name: 'Phishing', desc: 'Tấn công lừa đảo trực tuyến.', icon: 'user-secret' },
    { name: 'Password Security', desc: 'Quản lý mật khẩu và xác thực.', icon: 'key' },
    { name: 'Malware', desc: 'Phần mềm độc hại và virus.', icon: 'bug' },
    { name: 'Network Safety', desc: 'An toàn mạng WiFi và VPN.', icon: 'wifi' }
];

let currentTopic = '';

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderTopics();
});

// --- NAVIGATION (CHUYỂN TAB) ---
function showTab(tabName) {
    document.getElementById('view-learn').classList.add('hidden');
    document.getElementById('view-check').classList.add('hidden');
    
    // Reset style buttons
    document.getElementById('tab-learn').className = "px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 text-gray-400 hover:text-white transition-all";
    document.getElementById('tab-check').className = "px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 text-gray-400 hover:text-white transition-all";

    if(tabName === 'learn') {
        document.getElementById('view-learn').classList.remove('hidden');
        document.getElementById('tab-learn').className = "px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 bg-gray-800 text-cyber-green transition-all";
    } else {
        document.getElementById('view-check').classList.remove('hidden');
        document.getElementById('tab-check').className = "px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 bg-gray-800 text-cyber-red transition-all";
    }
}

// --- LOGIC PHẦN HỌC TẬP (LEARN) ---
function renderTopics() {
    const grid = document.getElementById('topic-grid');
    grid.innerHTML = '';
    topics.forEach(t => {
        grid.innerHTML += `
            <div onclick="selectTopic('${t.name}')" class="bg-[#1f1f1f] border border-gray-800 hover:border-cyber-green p-6 rounded-lg cursor-pointer transition-all group relative overflow-hidden">
                <div class="flex justify-between mb-4">
                    <i class="fa-solid fa-${t.icon} text-3xl text-cyber-green"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 font-mono">${t.name}</h3>
                <p class="text-gray-400 text-sm">${t.desc}</p>
            </div>
        `;
    });
}

function selectTopic(name) {
    currentTopic = name;
    document.getElementById('topic-grid').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('hidden');
    document.getElementById('mode-select').classList.add('flex');
    document.getElementById('selected-topic-title').innerText = name;
}

function resetLearn() {
    document.getElementById('topic-grid').classList.remove('hidden');
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('flex');
    document.getElementById('lesson-content').classList.add('hidden');
    document.getElementById('quiz-content').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loading').classList.remove('flex');
}

async function startLesson() {
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('flex');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').classList.add('flex');

    const res = await fetch('/api/lesson', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({topic: currentTopic})
    });
    const data = await res.json();

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loading').classList.remove('flex');
    document.getElementById('lesson-content').classList.remove('hidden');
    document.getElementById('lesson-heading').innerText = data.title;
    
    const body = document.getElementById('lesson-body');
    body.innerHTML = '';
    data.sections.forEach(sec => {
        body.innerHTML += `
            <div>
                <h3 class="text-xl font-bold text-white mb-2 font-mono"><span class="text-cyber-blue mr-2">#</span>${sec.heading}</h3>
                <p class="pl-4 border-l border-gray-700">${sec.content}</p>
            </div>
        `;
    });
}

async function startQuiz() {
    document.getElementById('mode-select').classList.add('hidden');
    document.getElementById('mode-select').classList.remove('flex');
    document.getElementById('lesson-content').classList.add('hidden'); // Nếu đang xem lesson
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').classList.add('flex');

    const res = await fetch('/api/quiz', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({topic: currentTopic})
    });
    const data = await res.json();

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loading').classList.remove('flex');
    document.getElementById('quiz-content').classList.remove('hidden');
    document.getElementById('quiz-heading').innerText = data.title;

    const body = document.getElementById('quiz-body');
    body.innerHTML = '';
    data.questions.forEach((q, idx) => {
        let opts = '';
        q.options.forEach((opt, oIdx) => {
            opts += `<button onclick="checkAnswer(this, ${idx}, ${oIdx}, ${q.correctIndex})" class="w-full text-left p-3 border border-gray-700 rounded mb-2 hover:border-gray-500 transition-all text-gray-300">
                <span class="font-bold text-gray-500 mr-2">${['A','B','C','D'][oIdx]}.</span> ${opt}
            </button>`;
        });
        
        body.innerHTML += `
            <div class="bg-[#1f1f1f] border border-gray-700 rounded p-6">
                <div class="mb-4 text-white font-medium"><span class="text-cyber-blue font-mono font-bold mr-2">Q${idx+1}.</span>${q.text}</div>
                <div>${opts}</div>
                <div id="explain-${idx}" class="hidden mt-3 p-3 bg-gray-900 text-sm text-gray-400 border-l-2 border-cyber-blue text-left">
                    <strong class="text-cyber-blue">Giải thích:</strong> ${q.explanation}
                </div>
            </div>
        `;
    });
}

function checkAnswer(btn, qIdx, oIdx, correctIdx) {
    const parent = btn.parentElement;
    const allBtns = parent.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true); // Khóa nút

    if(oIdx === correctIdx) {
        btn.classList.add('bg-green-900', 'border-green-500', 'text-green-500');
    } else {
        btn.classList.add('bg-red-900', 'border-red-500', 'text-red-500');
        allBtns[correctIdx].classList.add('bg-green-900', 'border-green-500', 'text-green-500');
    }
    document.getElementById(`explain-${qIdx}`).classList.remove('hidden');
}

// --- LOGIC PHẦN KIỂM TRA (CHECK) ---
async function runCheck() {
    const input = document.getElementById('check-input').value;
    if(!input) return;

    document.getElementById('check-form').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('loading').classList.add('flex'); // Check dùng chung loading của Learn cho tiện

    const res = await fetch('/api/check', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({input: input})
    });
    const data = await res.json();

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loading').classList.remove('flex');
    document.getElementById('check-result').classList.remove('hidden');

    // Hiển thị kết quả
    const riskEl = document.getElementById('risk-level');
    riskEl.innerText = data.riskLevel;
    riskEl.className = data.riskLevel === 'SAFE' ? 'text-green-500' : (data.riskLevel === 'LOW' ? 'text-blue-400' : 'text-red-500');
    
    const scoreEl = document.getElementById('risk-score');
    scoreEl.innerText = data.score + '/100';
    scoreEl.style.color = data.score > 80 ? '#00ff41' : '#ff2a2a';

    document.getElementById('risk-summary').innerText = data.summary;

    const findingsDiv = document.getElementById('risk-findings');
    findingsDiv.innerHTML = '';
    data.findings.forEach(f => {
        findingsDiv.innerHTML += `
            <div class="bg-black border border-gray-800 rounded p-4">
                <div class="text-xs font-bold mb-1 text-red-400">[${f.severity}]</div>
                <div class="text-white mb-2">${f.description}</div>
                <div class="text-sm text-gray-500 bg-gray-900 p-2 rounded"><strong class="text-cyber-green">Fix:</strong> ${f.recommendation}</div>
            </div>
        `;
    });
}

function resetCheck() {
    document.getElementById('check-result').classList.add('hidden');
    document.getElementById('check-form').classList.remove('hidden');
    document.getElementById('check-input').value = '';
}