// ------------------------------
// Селектори DOM
// ------------------------------
const toggle = document.getElementById("theme-toggle");
const body = document.body;
const startPage = document.querySelector(".start-page");
const quizPage = document.querySelector(".quiz-page");
const questionNumberElem = quizPage.querySelector(".question-number");
const questionTitleElem = quizPage.querySelector(".question");
const questionOption = quizPage.querySelector(".question-option");
const answerButtonsContainer = quizPage.querySelector(".buttons-container");
const answerButtons = quizPage.querySelectorAll(".answer");
const submitButton = quizPage.querySelector(".submit-button");
const nextButton = quizPage.querySelector(".next-button");
const progressBar = document.getElementById("progress-bar");
const resultPage = document.querySelector(".result-page");
const scoreElement = resultPage.querySelector(".score");
const maxScoreElement = resultPage.querySelector(".max-score");
const playAgainButton = resultPage.querySelector(".again-button");
// ------------------------------
// Змінні стану
// ------------------------------
let quizzes = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;

// ------------------------------
// Тема (Dark/Light) + LocalStorage
// ------------------------------
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  const isDark = savedTheme === "dark";
  body.classList.toggle("dark-theme", isDark);
  toggle.checked = isDark;
}

toggle.addEventListener("change", () => {
  const isDark = toggle.checked;
  body.classList.toggle("dark-theme", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ------------------------------
// Завантаження JSON з запитаннями
// ------------------------------
fetch("./data.json")
  .then((res) => res.json())
  .then((data) => {
    quizzes = data.quizzes;
    initStartPage();
  })
  .catch((err) => console.error("Помилка завантаження JSON:", err));

// ------------------------------
// Функції
// ------------------------------

// Ініціалізація стартової сторінки (вибір теми)
function initStartPage() {
  document
    .querySelectorAll(".start-page .buttons-container button")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const topic = btn.textContent.trim();
        currentQuiz = quizzes.find((q) => q.title === topic);
        currentQuestionIndex = 0;

        startPage.classList.add("hidden");
        quizPage.classList.remove("hidden");

        showQuestion();
      });
    });
}

// Скидання стилів кнопок відповідей
function resetAnswerButtons() {
  answerButtons.forEach((btn) => {
    btn.classList.remove("selected");
    const option = btn.querySelector(".question-option");
    option.style.backgroundColor = "";
    option.style.color = "";
  });
}

function showQuestion() {
  const questionData = currentQuiz.questions[currentQuestionIndex];

  // Оновлюємо номер питання та текст
  questionNumberElem.textContent = `Question ${currentQuestionIndex + 1} of ${
    currentQuiz.questions.length
  }`;
  questionTitleElem.querySelector(".bold").textContent = questionData.question;
  console.log(currentQuestionIndex);
  progressBar.style.width = (currentQuestionIndex + 1) * 10 + "%";
  // Оновлюємо кнопки з варіантами
  answerButtons.forEach((btn, i) => {
    const optionText = questionData.options[i];
    const optionP = btn.querySelector(".option");

    optionP.textContent = optionText; // заповнюємо текст
    btn.classList.remove("selected");
    const letterDiv = btn.querySelector(".question-option");
    letterDiv.style.backgroundColor = "";
    letterDiv.style.color = "";
  });
}

// Обробка вибору відповіді
answerButtonsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  resetAnswerButtons();

  btn.classList.add("selected");
  const option = btn.querySelector(".question-option");
  option.style.backgroundColor = "var(--purple-600)";
  option.style.color = "var(--white)";
});

submitButton.addEventListener("click", () => {
  const selectedButton = quizPage.querySelector(".answer.selected");
  if (!selectedButton) return; // якщо нічого не вибрано

  const selectedText = selectedButton
    .querySelector(".option")
    .textContent.trim();
  const correctAnswer = currentQuiz.questions[currentQuestionIndex].answer;

  // Скидаємо попередні стани
  answerButtons.forEach((btn) => {
    btn.classList.remove("correct-answer", "incorrect-answer");
    btn.querySelector(".answer-result-img").style.backgroundImage = "";
  });

  if (selectedText === correctAnswer) {
    // Якщо правильна відповідь
    selectedButton.classList.add("correct-answer");
    selectedButton.querySelector(".answer-result-img").style.backgroundImage =
      "var(--icon-correct)";
    selectedButton.querySelector(".question-option").style.backgroundColor =
      "var(--green-500)";
    score++;
  } else {
    // Якщо неправильна відповідь
    selectedButton.classList.add("incorrect-answer");
    selectedButton.querySelector(".answer-result-img").style.backgroundImage =
      "var(--icon-incorrect)";
    selectedButton.querySelector(".question-option").style.backgroundColor =
      "var(--red-500)";

    // Знаходимо правильну кнопку і додаємо тільки іконку + зелений бордер
    answerButtons.forEach((btn) => {
      const optionText = btn.querySelector(".option").textContent.trim();
      if (optionText === correctAnswer) {
        btn.querySelector(".answer-result-img").style.backgroundImage =
          "var(--icon-correct)";
      }
    });
  }

  // Після відповіді блокуємо всі кнопки
  answerButtons.forEach((btn) => {
    btn.classList.add("disabled");
  });
  // але залишаємо вибраний варіант без "disabled"
  selectedButton.classList.remove("disabled");
  submitButton.classList.add("hidden");
  nextButton.classList.remove("hidden");
});

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < currentQuiz.questions.length) {
    // є ще питання → показуємо наступне
    showQuestion();

    // скидаємо стан кнопок
    answerButtons.forEach((btn) => {
      btn.classList.remove("disabled", "correct-answer", "incorrect-answer");
      btn.querySelector(".answer-result-img").style.backgroundImage = "";
    });

    // кнопки назад: Submit видима, Next схована
    submitButton.classList.remove("hidden");
    nextButton.classList.add("hidden");
  } else {
    quizPage.classList.add("hidden");
    resultPage.classList.remove("hidden");
    scoreElement.textContent = score;
    maxScoreElement.textContent =
      maxScoreElement.textContent + " " + currentQuestionIndex;
  }
});

playAgainButton.addEventListener("click", () => {
  // Скидаємо стан
  score = 0;
  currentQuestionIndex = 0;
  currentQuiz = null;

  // Ховаємо resultPage і показуємо startPage
  resultPage.classList.add("hidden");
  startPage.classList.remove("hidden");

  // Скидаємо текст у score / maxScore
  scoreElement.textContent = "";
  maxScoreElement.textContent = "out of";

  // Скидаємо прогрес бар
  progressBar.style.width = "0%";

  // повністю чистимо кнопки відповідей
  answerButtons.forEach((btn) => {
    btn.classList.remove(
      "disabled",
      "correct-answer",
      "incorrect-answer",
      "selected"
    );
    btn.querySelector(".answer-result-img").style.backgroundImage = "";
    const option = btn.querySelector(".question-option");
    option.style.backgroundColor = "";
    option.style.color = "";
  });

  // Submit видима, Next схована (на випадок якщо залишились старі класи)
  submitButton.classList.remove("hidden");
  nextButton.classList.add("hidden");
});

