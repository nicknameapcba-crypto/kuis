
// ==========================================
// SMART QUIZ INDONESIA
// JAVASCRIPT - VERSI PERBAIKAN
// ==========================================

// KONFIGURASI
const QUESTIONS_PER_SUBJECT = 25;

const TIME_PER_QUESTION = {
    easy: 50,
    normal: 50,
    medium: 30,
    hard: 20,
    extreme: 25
};

const levelNames = {
    easy: "Easy - SD Kelas 1–4",
    normal: "Normal - SD Kelas 5–6",
    medium: "Medium - SMP",
    hard: "Hard - SMA",
    extreme: "Extreme - Perguruan Tinggi"
};

// ELEMEN HTML
const pages = {
    menu: document.getElementById("menuPage"),
    quiz: document.getElementById("quizPage"),
    result: document.getElementById("resultPage")
};

const $ = id => document.getElementById(id);

// BANK SOAL CONTOH
// Format: [Pertanyaan, [Pilihan A-D], Indeks Jawaban Benar]
const questionBank = {
    "Matematika": [
        ["Berapakah hasil dari 12 + 8?", ["18", "20", "22", "24"], 1],
        ["Hasil dari 9 × 7 adalah ...", ["56", "63", "72", "49"], 1],
        ["Berapakah hasil 144 ÷ 12?", ["10", "11", "12", "13"], 2],
        ["Hasil dari 25² adalah ...", ["525", "625", "425", "725"], 1],
        ["Jika 3x + 6 = 21, nilai x adalah ...", ["3", "4", "5", "6"], 2]
    ],

    "IPA": [
        ["Planet yang paling dekat dengan Matahari adalah ...", ["Venus", "Mars", "Merkurius", "Bumi"], 2],
        ["Organ tubuh yang berfungsi memompa darah adalah ...", ["Paru-paru", "Jantung", "Hati", "Ginjal"], 1],
        ["Proses tumbuhan membuat makanan disebut ...", ["Respirasi", "Fotosintesis", "Evaporasi", "Transpirasi"], 1],
        ["Satuan SI untuk gaya adalah ...", ["Joule", "Watt", "Newton", "Pascal"], 2],
        ["Organel penghasil sebagian besar ATP adalah ...", ["Ribosom", "Mitokondria", "Lisosom", "Nukleus"], 1]
    ],

    "Bahasa Indonesia": [
        ["Lawan kata dari 'rajin' adalah ...", ["Tekun", "Malas", "Pintar", "Cerdas"], 1],
        ["Sinonim kata 'indah' adalah ...", ["Buruk", "Elok", "Jelek", "Kotor"], 1],
        ["Ide utama dalam sebuah paragraf disebut ...", ["Kalimat penjelas", "Gagasan pokok", "Kesimpulan", "Kata penghubung"], 1],
        ["Teks yang berisi langkah-langkah melakukan sesuatu disebut ...", ["Narasi", "Deskripsi", "Prosedur", "Eksposisi"], 2],
        ["Majas yang membandingkan dua hal secara langsung disebut ...", ["Personifikasi", "Metafora", "Hiperbola", "Ironi"], 1]
    ],

    "PKN": [
        ["Dasar negara Indonesia adalah ...", ["UUD 1945", "Pancasila", "Bhinneka Tunggal Ika", "Garuda"], 1],
        ["Lambang negara Indonesia adalah ...", ["Merpati", "Garuda Pancasila", "Harimau", "Rajawali"], 1],
        ["Sila ketiga Pancasila berbunyi ...", ["Ketuhanan Yang Maha Esa", "Persatuan Indonesia", "Keadilan Sosial", "Kemanusiaan yang Adil dan Beradab"], 1],
        ["Konstitusi tertulis negara Indonesia adalah ...", ["Pancasila", "UUD NRI Tahun 1945", "Peraturan Daerah", "KUHP"], 1],
        ["Lembaga yang memiliki fungsi legislasi bersama Presiden adalah ...", ["MA", "MK", "DPR", "BPK"], 2]
    ],

    "Bahasa Arab": [
        ["Apa arti kata كِتَابٌ ?", ["Rumah", "Buku", "Meja", "Pintu"], 1],
        ["Bahasa Arab dari 'sekolah' adalah ...", ["مَدْرَسَةٌ", "مَسْجِدٌ", "بَيْتٌ", "قَلَمٌ"], 0],
        ["Apa arti kata مُعَلِّمٌ ?", ["Murid", "Guru laki-laki", "Dokter", "Pedagang"], 1],
        ["Bahasa Arab dari 'air' adalah ...", ["طَعَامٌ", "مَاءٌ", "نَارٌ", "شَمْسٌ"], 1],
        ["Apa arti kata السَّمَاءُ ?", ["Bumi", "Langit", "Laut", "Gunung"], 1]
    ]
};

// VARIABEL KUIS
let questions = [];
let selectedSubjects = [];
let selectedLevel = "";

let currentQuestion = 0;
let correct = 0;
let wrong = 0;

let timeLeft = 50;
let timerInterval = null;
let autoNextTimeout = null;

let quizFinished = false;
let questionLocked = false;
let quizStartTime = 0;

// STATISTIK PER MAPEL
let subjectStats = {};

// ==========================================
// FUNGSI DASAR
// ==========================================

function showPage(pageName) {
    Object.values(pages).forEach(page => {
        page.classList.remove("active");
    });

    pages[pageName].classList.add("active");
}

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

// ==========================================
// PILIH MATA PELAJARAN
// ==========================================

document.querySelectorAll('input[name="subject"]').forEach(input => {
    input.addEventListener("change", () => {
        const checked = document.querySelectorAll(
            'input[name="subject"]:checked'
        );

        const error = $("menuError");

        if (checked.length > 2) {
            input.checked = false;

            error.textContent =
                "Maksimal hanya boleh memilih 2 mata pelajaran!";
        } else {
            error.textContent = "";
        }

        updatePreview();
    });
});

// ==========================================
// UPDATE PREVIEW MENU
// ==========================================

function updatePreview() {
    const checked = document.querySelectorAll(
        'input[name="subject"]:checked'
    );

    const count = checked.length;

    $("selectedCount").textContent = `${count} / 2`;

    $("previewQuestions").textContent =
        `${count * QUESTIONS_PER_SUBJECT} soal`;

    const selectedLevelElement = document.querySelector(
        'input[name="level"]:checked'
    );

    const level = selectedLevelElement
        ? selectedLevelElement.value
        : "normal";

    $("previewTime").textContent =
        `${TIME_PER_QUESTION[level]} detik`;
}

document.querySelectorAll('input[name="level"]').forEach(input => {
    input.addEventListener("change", updatePreview);
});

// Tampilkan informasi awal
updatePreview();

// ==========================================
// TOMBOL MULAI
// ==========================================

$("startBtn").addEventListener("click", () => {
    selectedSubjects = [
        ...document.querySelectorAll(
            'input[name="subject"]:checked'
        )
    ].map(input => input.value);

    selectedLevel = document.querySelector(
        'input[name="level"]:checked'
    ).value;

    if (selectedSubjects.length === 0) {
        $("menuError").textContent =
            "Silakan pilih minimal 1 mata pelajaran!";

        return;
    }

    if (selectedSubjects.length > 2) {
        $("menuError").textContent =
            "Maksimal hanya boleh memilih 2 mata pelajaran!";

        return;
    }

    $("menuError").textContent = "";

    startQuiz();
});

// ==========================================
// MENYIAPKAN SOAL
// ==========================================

function createQuestions() {
    questions = [];

    selectedSubjects.forEach(subject => {
        const bank = questionBank[subject];

        // Acak bank soal
        const shuffledBank = shuffle(bank);

        // Buat 25 soal untuk setiap mata pelajaran.
        // Bank contoh saat ini berisi 5 soal unik,
        // sehingga soal akan diulang untuk mencapai 25.
        for (let i = 0; i < QUESTIONS_PER_SUBJECT; i++) {
            const item = shuffledBank[i % shuffledBank.length];

            questions.push({
                subject: subject,
                question: item[0],
                options: [...item[1]],
                answer: item[2]
            });
        }
    });

    // Acak urutan seluruh soal
    questions = shuffle(questions);
}

// ==========================================
// MEMULAI KUIS
// ==========================================

function startQuiz() {
    createQuestions();

    currentQuestion = 0;
    correct = 0;
    wrong = 0;

    quizFinished = false;
    questionLocked = false;

    quizStartTime = Date.now();

    subjectStats = {};

    selectedSubjects.forEach(subject => {
        subjectStats[subject] = {
            correct: 0,
            wrong: 0,
            unanswered: 0,
            total: QUESTIONS_PER_SUBJECT
        };
    });

    const total = questions.length;

    $("quizTitle").textContent = selectedSubjects.join(" + ");

    $("levelInfo").textContent = levelNames[selectedLevel];

    $("totalQuestions").textContent = `${total} Soal`;

    $("progressBar").style.width = "0%";

    showPage("quiz");

    displayQuestion();
}

// ==========================================
// TIMER PER SOAL
// ==========================================

function startTimer() {
    clearInterval(timerInterval);

    clearTimeout(autoNextTimeout);

    timeLeft = TIME_PER_QUESTION[selectedLevel];

    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (quizFinished || questionLocked) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;

        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

// ==========================================
// UPDATE TAMPILAN TIMER
// ==========================================

function updateTimerDisplay() {
    $("timer").textContent = formatTime(timeLeft);

    // FIX: menggunakan elemen yang benar dari HTML
    const timerBox = $("timerContainer");

    timerBox.classList.remove("warning", "danger");

    if (timeLeft <= 10) {
        timerBox.classList.add("danger");
    } else if (timeLeft <= 20) {
        timerBox.classList.add("warning");
    }
}

// ==========================================
// MENAMPILKAN SOAL
// ==========================================

function displayQuestion() {
    if (currentQuestion >= questions.length) {
        finishQuiz();
        return;
    }

    questionLocked = false;

    const q = questions[currentQuestion];

    const total = questions.length;

    const questionNumber = currentQuestion + 1;

    $("questionNumber").textContent =
        `${questionNumber} / ${total}`;

    $("questionIndex").textContent =
        `SOAL ${questionNumber}`;

    $("questionPoints").textContent =
        `${(100 / total).toFixed(1).replace(/\.0$/, "")} Poin`;

    $("progressBar").style.width =
        `${(questionNumber / total) * 100}%`;

    $("subjectLabel").textContent = q.subject;

    const subjectIndex = selectedSubjects.indexOf(q.subject) + 1;

    $("subjectProgress").textContent =
        `Mapel ${subjectIndex} dari ${selectedSubjects.length}`;

    $("questionText").textContent = q.question;

    $("answerMessage").textContent = "";

    $("answerMessage").style.color = "";

    $("nextBtn").disabled = true;

    $("nextBtn").textContent = "Soal Berikutnya →";

    const answerContainer = $("answerOptions");

    answerContainer.innerHTML = "";

    q.options.forEach((option, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "answer-option";

        button.textContent =
            `${String.fromCharCode(65 + index)}. ${option}`;

        button.addEventListener("click", () => {
            selectAnswer(index);
        });

        answerContainer.appendChild(button);
    });

    startTimer();
}

// ==========================================
// MEMILIH JAWABAN
// ==========================================

function selectAnswer(selectedIndex) {
    if (quizFinished || questionLocked) return;

    questionLocked = true;

    clearInterval(timerInterval);

    const q = questions[currentQuestion];

    const buttons = document.querySelectorAll(".answer-option");

    const message = $("answerMessage");

    buttons.forEach(button => {
        button.disabled = true;
    });

    if (selectedIndex === q.answer) {
        correct++;

        subjectStats[q.subject].correct++;

        buttons[selectedIndex].classList.add("correct");

        message.textContent = "✓ Jawaban benar!";

        message.style.color = "#16a36a";
    } else {
        wrong++;

        subjectStats[q.subject].wrong++;

        buttons[selectedIndex].classList.add("wrong");

        buttons[q.answer].classList.add("correct");

        message.textContent =
            `✗ Jawaban salah. Jawaban benar: ${q.options[q.answer]}`;

        message.style.color = "#e34d5b";
    }

    $("nextBtn").disabled = false;
}

// ==========================================
// WAKTU HABIS
// ==========================================

function handleTimeOut() {
    if (quizFinished || questionLocked) return;

    questionLocked = true;

    const q = questions[currentQuestion];

    subjectStats[q.subject].unanswered++;

    const buttons = document.querySelectorAll(".answer-option");

    buttons.forEach(button => {
        button.disabled = true;
    });

    // Tampilkan jawaban yang benar
    if (buttons[q.answer]) {
        buttons[q.answer].classList.add("correct");
    }

    $("answerMessage").textContent =
        "⌛ Waktu habis! Soal dilewati.";

    $("answerMessage").style.color = "#e34d5b";

    $("nextBtn").disabled = true;

    // Otomatis berpindah setelah jeda singkat
    autoNextTimeout = setTimeout(() => {
        moveToNextQuestion();
    }, 1200);
}

// ==========================================
// SOAL BERIKUTNYA
// ==========================================

$("nextBtn").addEventListener("click", () => {
    if (quizFinished || !questionLocked) return;

    moveToNextQuestion();
});

function moveToNextQuestion() {
    if (quizFinished) return;

    clearInterval(timerInterval);
    clearTimeout(autoNextTimeout);

    currentQuestion++;

    if (currentQuestion < questions.length) {
        displayQuestion();
    } else {
        finishQuiz();
    }
}

// ==========================================
// SELESAIKAN KUIS
// ==========================================

function finishQuiz() {
    if (quizFinished) return;

    quizFinished = true;

    clearInterval(timerInterval);
    clearTimeout(autoNextTimeout);

    showResult();
}

// ==========================================
// HASIL KUIS
// ==========================================

function showResult() {
    const total = questions.length;

    const unanswered = total - correct - wrong;

    const score = Math.round((correct / total) * 100);

    const elapsedSeconds = Math.floor(
        (Date.now() - quizStartTime) / 1000
    );

    $("finalScore").textContent = score;

    $("correctCount").textContent = correct;

    $("wrongCount").textContent = wrong;

    // HTML menggunakan ID totalAnswered,
    // bukan unansweredCount.
    $("totalAnswered").textContent = total;

    $("totalTime").textContent = formatTime(elapsedSeconds);

    let title;
    let description;

    if (score >= 90) {
        title = "Luar Biasa!";
        description =
            "Kemampuanmu sangat baik. Pertahankan prestasimu!";
    } else if (score >= 75) {
        title = "Bagus Sekali!";
        description =
            "Hasil yang bagus. Terus tingkatkan kemampuanmu!";
    } else if (score >= 60) {
        title = "Cukup Baik!";
        description =
            "Kamu sudah cukup baik. Tetap semangat belajar!";
    } else {
        title = "Tetap Semangat!";
        description =
            "Jangan menyerah. Belajar dan coba kembali!";
    }

    if (unanswered > 0) {
        description += ` Ada ${unanswered} soal yang tidak dijawab.`;
    }

    $("resultTitle").textContent = title;

    $("resultDescription").textContent = description;

    // HASIL PER MATA PELAJARAN
    const resultContainer = $("subjectResults");

    resultContainer.innerHTML = "";

    selectedSubjects.forEach(subject => {
        const stats = subjectStats[subject];

        const percentage = Math.round(
            (stats.correct / stats.total) * 100
        );

        const card = document.createElement("div");

        card.className = "subject-result-card";

        const heading = document.createElement("h3");
        heading.textContent = subject;

        const details = document.createElement("div");
        details.className = "subject-result-details";

        const correctText = document.createElement("span");
        correctText.innerHTML =
            `Benar: <strong>${stats.correct}</strong>`;

        const wrongText = document.createElement("span");
        wrongText.innerHTML =
            `Salah: <strong>${stats.wrong}</strong>`;

        const unansweredText = document.createElement("span");
        unansweredText.innerHTML =
            `Tidak dijawab: <strong>${stats.unanswered}</strong>`;

        const scoreText = document.createElement("span");
        scoreText.innerHTML =
            `Nilai: <strong>${percentage}</strong>`;

        details.append(
            correctText,
            wrongText,
            unansweredText,
            scoreText
        );

        card.append(heading, details);

        resultContainer.appendChild(card);
    });

    showPage("result");
}

// ==========================================
// KEMBALI KE MENU UTAMA
// ==========================================

$("homeBtn").addEventListener("click", () => {
    clearInterval(timerInterval);
    clearTimeout(autoNextTimeout);

    quizFinished = true;
    questionLocked = false;

    currentQuestion = 0;
    correct = 0;
    wrong = 0;

    questions = [];
    selectedSubjects = [];

    // Reset pilihan mata pelajaran
    document.querySelectorAll(
        'input[name="subject"]'
    ).forEach(input => {
        input.checked = false;
    });

    // Reset menu dan preview
    $("menuError").textContent = "";

    updatePreview();

    // Reset tampilan timer
    timeLeft = 50;

    updateTimerDisplay();

    // Reset progress
    $("progressBar").style.width = "0%";

    showPage("menu");
});
