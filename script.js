let currentTest = 1;
let currentQuestionIndex = 0;
let userAnswers = [];
let testQuestions = [];
let startTime;
let timerInterval;
let testDuration = 3600; // 60 minutes in seconds

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showScreen('home-screen');
});

// Start a specific test
function startTest(testNumber) {
    currentTest = testNumber;
    testQuestions = getTestQuestions(testNumber);
    
    if (testQuestions.length === 0) {
        alert('Questions for this test are not available yet. Please select another test.');
        return;
    }
    
    currentQuestionIndex = 0;
    userAnswers = new Array(testQuestions.length).fill(null);
    startTime = new Date();
    
    showScreen('test-screen');
    startTimer();
    loadQuestion();
    updateProgress();
    updateTestInfo();
}

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(function() {
        testDuration--;
        updateTimerDisplay();
        
        if (testDuration <= 0) {
            clearInterval(timerInterval);
            finishTest();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(testDuration / 60);
    const seconds = testDuration % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running low
    const timer = document.getElementById('timer');
    if (testDuration < 300) { // Less than 5 minutes
        timer.style.color = '#e74c3c';
    } else if (testDuration < 600) { // Less than 10 minutes
        timer.style.color = '#f39c12';
    }
}

// Load current question
function loadQuestion() {
    if (currentQuestionIndex >= testQuestions.length) return;
    
    const question = testQuestions[currentQuestionIndex];
    
    document.getElementById('q-number').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = question.question;
    
    // Load options
    for (let i = 0; i < 4; i++) {
        document.getElementById(`option-${i}`).textContent = question.options[i];
    }
    
    // Clear previous selections and feedback
    clearSelections();
    hideFeedback();
    
    // Show previous answer if exists
    if (userAnswers[currentQuestionIndex] !== null) {
        selectOption(userAnswers[currentQuestionIndex], false);
    }
    
    updateNavigationButtons();
}

// Clear all option selections
function clearSelections() {
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });
}

// Hide feedback
function hideFeedback() {
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'none';
    feedback.classList.remove('correct', 'incorrect');
}

// Select an option
function selectOption(optionIndex, showFeedback = true) {
    // Clear previous selections
    clearSelections();
    
    // Mark current selection
    const selectedOption = document.querySelectorAll('.option')[optionIndex];
    selectedOption.classList.add('selected');
    
    // Store user answer
    userAnswers[currentQuestionIndex] = optionIndex;
    
    if (showFeedback) {
        // Show immediate feedback
        const question = testQuestions[currentQuestionIndex];
        const isCorrect = optionIndex === question.correct;
        
        // Mark correct and incorrect answers
        document.querySelectorAll('.option')[question.correct].classList.add('correct');
        if (!isCorrect) {
            selectedOption.classList.add('incorrect');
        }
        
        // Show feedback message
        const feedback = document.getElementById('feedback');
        feedback.style.display = 'block';
        feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = isCorrect ? 
            '✓ Correct! ' + question.explanation :
            '✗ Incorrect. ' + question.explanation;
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

// Update test information
function updateTestInfo() {
    document.getElementById('test-title').textContent = `Mock Test ${currentTest}`;
    document.getElementById('question-counter').textContent = 
        `${currentQuestionIndex + 1}/${testQuestions.length}`;
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        updateProgress();
        updateTestInfo();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < testQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        updateProgress();
        updateTestInfo();
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === testQuestions.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    }
}

// Finish the test
function finishTest() {
    clearInterval(timerInterval);
    calculateAndShowResults();
    showScreen('result-screen');
}

// Calculate and display results
function calculateAndShowResults() {
    let correctAnswers = 0;
    
    for (let i = 0; i < testQuestions.length; i++) {
        if (userAnswers[i] === testQuestions[i].correct) {
            correctAnswers++;
        }
    }
    
    const percentage = Math.round((correctAnswers / testQuestions.length) * 100);
    const timeTaken = formatTime(3600 - testDuration);
    
    document.getElementById('score-percentage').textContent = percentage + '%';
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('incorrect-count').textContent = testQuestions.length - correctAnswers;
    document.getElementById('time-taken').textContent = timeTaken;
}

// Format time for display
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Show answer review
function reviewAnswers() {
    const reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = '';
    
    testQuestions.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.correct;
        const userAnswer = userAnswers[index];
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        reviewItem.innerHTML = `
            <div class="review-question">
                <strong>Question ${index + 1}:</strong> ${question.question}
            </div>
            <div class="review-options">
                ${question.options.map((option, optIndex) => {
                    let className = 'review-option';
                    if (optIndex === question.correct) {
                        className += ' correct-answer';
                    } else if (optIndex === userAnswer && userAnswer !== question.correct) {
                        className += ' incorrect-answer';
                    } else if (optIndex === userAnswer) {
                        className += ' user-answer';
                    }
                    
                    return `<div class="${className}">
                        ${String.fromCharCode(65 + optIndex)}. ${option}
                        ${optIndex === question.correct ? ' ✓ (Correct)' : ''}
                        ${optIndex === userAnswer && userAnswer !== question.correct ? ' ✗ (Your Answer)' : ''}
                    </div>`;
                }).join('')}
            </div>
            <div style="margin-top: 10px; font-style: italic; color: #666;">
                <strong>Explanation:</strong> ${question.explanation}
            </div>
        `;
        
        reviewContent.appendChild(reviewItem);
    });
    
    showScreen('review-screen');
}

// Go back to home screen
function goHome() {
    currentQuestionIndex = 0;
    userAnswers = [];
    testQuestions = [];
    testDuration = 3600;
    clearInterval(timerInterval);
    showScreen('home-screen');
}

// Retake current test
function retakeTest() {
    startTest(currentTest);
}
