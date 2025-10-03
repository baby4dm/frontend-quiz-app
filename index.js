// ------------------------------
// DOM SELECTORS
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
const topicContainers = document.querySelectorAll(".topic-title-container");
const headerTopics = document.querySelectorAll(".header-topic-img-container");
const topicNameElements = document.querySelectorAll(".topic-name");
const errorContainer = quizPage.querySelector(".error-container");
// ------------------------------
// State variables
// ------------------------------
let quizzes = [];
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;

// ------------------------------
// Theme switching
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
// Questions fetching
// ------------------------------
fetch("./data.json")
  .then((res) => res.json())
  .then((data) => {
    quizzes = data.quizzes;
    initStartPage();
  })
  .catch((err) => console.error("Помилка завантаження JSON:", err));

// ------------------------------
// Functions
// ------------------------------

// ------------------------------------------------------------
// Start page initialization, choosing topic and switch to it
// ------------------------------------------------------------
function initStartPage() {
  document
    .querySelectorAll(".start-page .buttons-container button")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const topic = btn.textContent.trim();
        currentQuiz = quizzes.find((q) => q.title === topic);
        currentQuestionIndex = 0;
        topicContainers[0].classList.remove("hidden");
        topicNameElements.forEach((element) => {
          element.textContent = topic;
        });
        startPage.classList.add("hidden");
        quizPage.classList.remove("hidden");
        console.log(topic);
        if (topic === "HTML") {
          headerTopics.forEach((topic) => {
            topic.style.backgroundImage = "var(--icon-html)";
            topic.classList.add("html");
          });
        } else if (topic === "CSS") {
          headerTopics.forEach((topic) => {
            topic.style.backgroundImage = "var(--icon-css)";
            topic.classList.add("css");
          });
        } else if (topic === "JavaScript") {
          headerTopics.forEach((topic) => {
            topic.style.backgroundImage = "var(--icon-js)";
            topic.classList.add("js");
          });
        } else {
          headerTopics.forEach((topic) => {
            topic.style.backgroundImage = "var(--icon-access)";
            topic.classList.add("access");
          });
        }
        showQuestion();
      });
    });
}

// ------------------------------
// Add selected state for button
// ------------------------------
answerButtonsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  resetAnswerButtons();

  btn.classList.add("selected");
  const option = btn.querySelector(".question-option");
  option.style.backgroundColor = "var(--purple-600)";
  option.style.color = "var(--white)";
});

// -----------------------------------
// Remove selected state from button
// -----------------------------------
function resetAnswerButtons() {
  answerButtons.forEach((btn) => {
    btn.classList.remove("selected");
    const option = btn.querySelector(".question-option");
    option.style.backgroundColor = "";
    option.style.color = "";
  });
}

// ---------------------------------------------
// Function responses for showing question page
// ---------------------------------------------
function showQuestion() {
  const questionData = currentQuiz.questions[currentQuestionIndex];

  questionNumberElem.textContent = `Question ${currentQuestionIndex + 1} of ${
    currentQuiz.questions.length
  }`;
  questionTitleElem.querySelector(".bold").textContent = questionData.question;
  console.log(currentQuestionIndex);
  progressBar.style.width = (currentQuestionIndex + 1) * 10 + "%";

  answerButtons.forEach((btn, i) => {
    const optionText = questionData.options[i];
    const optionP = btn.querySelector(".option");

    optionP.textContent = optionText;
    btn.classList.remove("selected");
    const letterDiv = btn.querySelector(".question-option");
    letterDiv.style.backgroundColor = "";
    letterDiv.style.color = "";
  });
}
// ---------------------------------------------
// Check user answer and show proper info
// ---------------------------------------------
submitButton.addEventListener("click", () => {
  const selectedButton = quizPage.querySelector(".answer.selected");
  if (!selectedButton) {
    errorContainer.classList.remove("hidden");
    return;
  }
  errorContainer.classList.add("hidden");
  const selectedText = selectedButton
    .querySelector(".option")
    .textContent.trim();
  const correctAnswer = currentQuiz.questions[currentQuestionIndex].answer;

  answerButtons.forEach((btn) => {
    btn.classList.remove("correct-answer", "incorrect-answer");
    btn.querySelector(".answer-result-img").style.backgroundImage = "";
  });

  if (selectedText === correctAnswer) {
    selectedButton.classList.add("correct-answer");
    selectedButton.querySelector(".answer-result-img").style.backgroundImage =
      "var(--icon-correct)";
    selectedButton.querySelector(".question-option").style.backgroundColor =
      "var(--green-500)";
    score++;
  } else {
    selectedButton.classList.add("incorrect-answer");
    selectedButton.querySelector(".answer-result-img").style.backgroundImage =
      "var(--icon-incorrect)";
    selectedButton.querySelector(".question-option").style.backgroundColor =
      "var(--red-500)";

    answerButtons.forEach((btn) => {
      const optionText = btn.querySelector(".option").textContent.trim();
      if (optionText === correctAnswer) {
        btn.querySelector(".answer-result-img").style.backgroundImage =
          "var(--icon-correct)";
      }
    });
  }

  answerButtons.forEach((btn) => {
    btn.classList.add("disabled");
  });
  selectedButton.classList.remove("disabled");
  submitButton.classList.add("hidden");
  nextButton.classList.remove("hidden");
});

// --------------------------------------------
// Next button logic - step into next question
// --------------------------------------------
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < currentQuiz.questions.length) {
    showQuestion();

    answerButtons.forEach((btn) => {
      btn.classList.remove("disabled", "correct-answer", "incorrect-answer");
      btn.querySelector(".answer-result-img").style.backgroundImage = "";
    });

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

// ----------------------------------------------------
// Play again button logic - reset previous quiz state
// ----------------------------------------------------
playAgainButton.addEventListener("click", () => {
  score = 0;
  currentQuestionIndex = 0;
  currentQuiz = null;

  resultPage.classList.add("hidden");
  startPage.classList.remove("hidden");

  scoreElement.textContent = "";
  maxScoreElement.textContent = "out of";
  progressBar.style.width = "0%";

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

  submitButton.classList.remove("hidden");
  nextButton.classList.add("hidden");
});
