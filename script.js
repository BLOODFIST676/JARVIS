// =====================================================
// J.A.R.V.I.S.
// COMPLETE FRONTEND SCRIPT
// AI + MEMORY + VOICE + STUDY HUB + TIMER + HOMEWORK
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const WORKER_URL =
    "https://jarvis-ai.tvisha-sanish.workers.dev/";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let conversationHistory = [];

let jarvisMemory =
    JSON.parse(
        localStorage.getItem("jarvisMemory") || "[]"
    );

let homework =
    JSON.parse(
        localStorage.getItem("jarvisHomework") || "[]"
    );

let timerInterval = null;

let totalStudySeconds = 0;

let remainingStudySeconds = 0;

let studyTimerRunning = false;

let currentStudyTask = null;

let recognition = null;

let voiceAvailable = false;

let isListening = false;


// =====================================================
// PAGE INITIALISATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "JARVIS initialising..."
        );

        loadHomework();

        initialiseVoice();

        updateMemoryDisplay();

        setupKeyboard();

        updateSystemStatus();

        setTimeout(
            () => {

                showResponse(
                    "JARVIS online. All systems initialised."
                );

            },
            500
        );

    }
);


// =====================================================
// KEYBOARD SUPPORT
// =====================================================

function setupKeyboard() {

    const input =
        document.getElementById(
            "commandInput"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                sendCommand();

            }

        }
    );

}


// =====================================================
// SYSTEM STATUS
// =====================================================

function updateSystemStatus() {

    const status =
        document.querySelector(
            ".system-status"
        );

    if (!status) {
        return;
    }

    status.innerHTML = `
        <span class="status-dot">●</span>
        SYSTEM ONLINE
    `;

}


// =====================================================
// AI COMMAND SYSTEM
// =====================================================

async function sendCommand() {

    const input =
        document.getElementById(
            "commandInput"
        );

    if (!input) {
        return;
    }

    const message =
        input.value.trim();

    if (!message) {
        return;
    }


    // Clear input

    input.value = "";


    // Show user message

    showUserMessage(
        message
    );


    // Show thinking state

    showThinking();


    try {

        const response =
            await fetch(
                WORKER_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            message:
                                message,

                            history:
                                conversationHistory,

                            memory:
                                jarvisMemory

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "JARVIS server error."
            );

        }


        const answer =
            data.response ||
            "I could not generate a response.";


        // Save conversation

        conversationHistory.push(
            {
                role: "user",
                content: message
            }
        );

        conversationHistory.push(
            {
                role: "assistant",
                content: answer
            }
        );


        // Limit history size

        if (
            conversationHistory.length >
            20
        ) {

            conversationHistory =
                conversationHistory.slice(
                    -20
                );

        }


        // Display answer

        showResponse(
            answer
        );


        // Speak answer

        speak(
            answer
        );


        // Check whether user asked JARVIS
        // to remember something

        detectMemoryRequest(
            message
        );

    }

    catch (error) {

        console.error(
            "JARVIS error:",
            error
        );


        showResponse(
            "I am unable to connect to my AI core right now."
        );

    }

}


// =====================================================
// RESPONSE DISPLAY
// =====================================================

function showResponse(
    text
) {

    const response =
        document.getElementById(
            "response"
        );

    if (!response) {
        return;
    }


    response.innerHTML = `

        <span class="response-label">
            JARVIS
        </span>

        <span class="response-text">
            ${formatText(text)}
        </span>

    `;

}


// =====================================================
// USER MESSAGE DISPLAY
// =====================================================

function showUserMessage(
    message
) {

    const response =
        document.getElementById(
            "response"
        );

    if (!response) {
        return;
    }


    response.innerHTML = `

        <span class="response-label">
            COMMAND
        </span>

        <span class="response-text">
            ${formatText(message)}
        </span>

    `;

}


// =====================================================
// THINKING DISPLAY
// =====================================================

function showThinking() {

    const response =
        document.getElementById(
            "response"
        );

    if (!response) {
        return;
    }


    response.innerHTML = `

        <span class="response-label">
            JARVIS
        </span>

        <span class="response-text">
            Processing...
        </span>

    `;

}


// =====================================================
// BASIC TEXT FORMATTING
// =====================================================

function formatText(
    text
) {

    if (!text) {
        return "";
    }


    return text
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /\n/g,
            "<br>"
        );

}


// =====================================================
// VOICE RECOGNITION
// =====================================================

function initialiseVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.log(
            "Speech recognition is not supported."
        );

        voiceAvailable = false;

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous = true;

    recognition.interimResults = false;

    recognition.lang = "en-SG";


    recognition.onstart =
        () => {

            isListening = true;

            updateVoiceStatus(
                "LISTENING"
            );

        };


    recognition.onresult =
        (event) => {

            const lastResult =
                event.results[
                    event.results.length - 1
                ];

            const transcript =
                lastResult[0].transcript.trim();


            if (!transcript) {
                return;
            }


            console.log(
                "Voice command:",
                transcript
            );


            const input =
                document.getElementById(
                    "commandInput"
                );


            if (input) {

                input.value =
                    transcript;

            }


            sendCommand();

        };


    recognition.onerror =
        (event) => {

            console.log(
                "Voice recognition:",
                event.error
            );


            isListening = false;

            updateVoiceStatus(
                "VOICE READY"
            );


            /*
             * Some browsers report "not-allowed"
             * when microphone permission has not
             * been granted.
             */

            if (
                event.error ===
                "not-allowed"
            ) {

                console.log(
                    "Microphone permission required."
                );

                return;

            }

        };


    recognition.onend =
        () => {

            isListening = false;


            updateVoiceStatus(
                "VOICE READY"
            );


            /*
             * Automatically restart listening
             * when possible.
             */

            if (
                voiceAvailable
            ) {

                setTimeout(
                    () => {

                        try {

                            recognition.start();

                        }

                        catch (
                            error
                        ) {

                            console.log(
                                "Voice restart waiting..."
                            );

                        }

                    },
                    1000
                );

            }

        };


    voiceAvailable = true;


    /*
     * Attempt automatic startup.
     *
     * Chrome may require the user to interact
     * with the page before allowing microphone
     * access.
     */

    setTimeout(
        () => {

            startListening();

        },
        1200
    );

}


// =====================================================
// START LISTENING
// =====================================================

function startListening() {

    if (
        !recognition ||
        !voiceAvailable
    ) {

        return;

    }


    if (isListening) {
        return;
    }


    try {

        recognition.start();

    }

    catch (
        error
    ) {

        console.log(
            "Unable to start voice:",
            error
        );

    }

}


// =====================================================
// VOICE STATUS
// =====================================================

function updateVoiceStatus(
    status
) {

    const systemData =
        document.querySelectorAll(
            ".system-data strong"
        );


    /*
     * The third system item is VOICE.
     */

    if (
        systemData.length >= 3
    ) {

        systemData[2].textContent =
            status;

    }


    const ready =
        document.querySelector(
            ".ready"
        );


    if (ready) {

        ready.innerHTML = `

            <span class="status-indicator">
                ●
            </span>

            ${status === "LISTENING"
                ? "LISTENING FOR COMMAND"
                : "READY FOR COMMAND"}

        `;

    }

}


// =====================================================
// TEXT-TO-SPEECH
// =====================================================

function speak(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    speechSynthesis.cancel();


    const cleanText =
        text
            .replace(
                /[*#_`]/g,
                ""
            )
            .replace(
                /\n/g,
                " "
            );


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    utterance.lang =
        "en-SG";

    utterance.rate =
        1;

    utterance.pitch =
        0.9;

    utterance.volume =
        1;


    speechSynthesis.speak(
        utterance
    );

}


// =====================================================
// MEMORY SYSTEM
// =====================================================

function detectMemoryRequest(
    message
) {

    const lower =
        message.toLowerCase();


    const memoryTriggers = [

        "remember that",

        "remember this",

        "remember my",

        "don't forget",

        "do not forget",

        "save this",

        "save that"

    ];


    const matched =
        memoryTriggers.some(
            trigger =>
                lower.includes(
                    trigger
                )
        );


    if (!matched) {
        return;
    }


    let memoryText =
        message;


    const patterns = [

        "remember that",

        "remember this",

        "remember my",

        "don't forget",

        "do not forget",

        "save this",

        "save that"

    ];


    for (
        const pattern of patterns
    ) {

        const index =
            lower.indexOf(
                pattern
            );


        if (
            index !== -1
        ) {

            memoryText =
                message
                    .substring(
                        index +
                        pattern.length
                    )
                    .trim();

            break;

        }

    }


    if (!memoryText) {
        return;
    }


    saveMemory(
        memoryText
    );

}


// =====================================================
// SAVE MEMORY
// =====================================================

function saveMemory(
    memoryText
) {

    if (
        jarvisMemory.includes(
            memoryText
        )
    ) {

        return;

    }


    jarvisMemory.push(
        memoryText
    );


    localStorage.setItem(
        "jarvisMemory",
        JSON.stringify(
            jarvisMemory
        )
    );


    updateMemoryDisplay();


    console.log(
        "Memory saved:",
        memoryText
    );

}


// =====================================================
// MEMORY DISPLAY
// =====================================================

function updateMemoryDisplay() {

    const memoryPanel =
        document.querySelector(
            ".memory-panel p"
        );


    if (!memoryPanel) {
        return;
    }


    if (
        jarvisMemory.length === 0
    ) {

        memoryPanel.textContent =
            "No saved memories yet.";

        return;

    }


    memoryPanel.textContent =
        `${jarvisMemory.length} saved memories available.`;

}


// =====================================================
// MEMORY WINDOW
// =====================================================

function openMemory() {

    let memoryText =
        "";


    if (
        jarvisMemory.length === 0
    ) {

        memoryText =
            "No saved memories yet.";

    }

    else {

        memoryText =
            jarvisMemory
                .map(
                    (memory, index) =>
                        `${index + 1}. ${memory}`
                )
                .join("\n");

    }


    alert(
        "JARVIS MEMORY\n\n" +
        memoryText
    );

}


// =====================================================
// STUDY HUB
// =====================================================

function openStudyHub() {

    const hub =
        document.getElementById(
            "studyHub"
        );


    if (hub) {

        hub.style.display =
            "flex";

    }

}


function closeStudyHub() {

    const hub =
        document.getElementById(
            "studyHub"
        );


    if (hub) {

        hub.style.display =
            "none";

    }

}


// =====================================================
// GENERATE STUDY SESSION
// =====================================================

function generateStudySession() {

    const subject =
        document.getElementById(
            "studySubject"
        ).value;


    const topic =
        document.getElementById(
            "studyTopic"
        ).value.trim();


    const duration =
        parseInt(
            document.getElementById(
                "studyDuration"
            ).value
        );


    const goal =
        document.getElementById(
            "studyGoal"
        ).value;


    if (!topic) {

        alert(
            "Please enter a study topic."
        );

        return;

    }


    currentStudyTask = {

        subject:
            subject,

        topic:
            topic,

        duration:
            duration,

        goal:
            goal

    };


    totalStudySeconds =
        duration * 60;


    remainingStudySeconds =
        totalStudySeconds;


    updateTimerDisplay();


    document.getElementById(
        "sessionSubject"
    ).textContent =
        subject;


    document.getElementById(
        "sessionTopic"
    ).textContent =
        topic;


    document.getElementById(
        "sessionStatus"
    ).textContent =
        "READY";


    document.getElementById(
        "currentTask"
    ).textContent =
        getStudyTask(
            goal
        );


    document.getElementById(
        "studyResult"
    ).innerHTML = `

        <div class="response-label">
            JARVIS STUDY SYSTEM
        </div>

        <p>
            Study session generated for
            <strong>${subject}</strong>:
            ${topic}
        </p>

        <p>
            Duration:
            <strong>${duration} minutes</strong>
        </p>

        <p>
            Goal:
            <strong>${goal}</strong>
        </p>

    `;


    document.getElementById(
        "activeStudySession"
    ).style.display =
        "block";


    updateProgress(
        0
    );


    resetTimer();

}


// =====================================================
// STUDY TASK GENERATOR
// =====================================================

function getStudyTask(
    goal
) {

    switch (
        goal
    ) {

        case "Learn the topic":

            return (
                "Read and understand the key concepts."
            );


        case "Revise":

            return (
                "Review your notes and recall the main ideas."
            );


        case "Prepare for a test":

            return (
                "Review key concepts, formulas and common question types."
            );


        case "Practise questions":

            return (
                "Attempt practice questions without looking at the answers."
            );


        case "Memorise key concepts":

            return (
                "Use active recall to memorise the important information."
            );


        default:

            return (
                "Begin studying your selected topic."
            );

    }

}


// =====================================================
// STUDY TIMER
// =====================================================

function startTimer() {

    if (
        !currentStudyTask
    ) {

        alert(
            "Generate a study session first."
        );

        return;

    }


    if (
        studyTimerRunning
    ) {

        return;

    }


    studyTimerRunning =
        true;


    document.getElementById(
        "sessionStatus"
    ).textContent =
        "RUNNING";


    timerInterval =
        setInterval(
            () => {

                if (
                    remainingStudySeconds <= 0
                ) {

                    finishStudySession();

                    return;

                }


                remainingStudySeconds--;


                updateTimerDisplay();


                const completed =
                    1 -
                    (
                        remainingStudySeconds /
                        totalStudySeconds
                    );


                updateProgress(
                    completed * 100
                );


                updateCurrentStudyTask();

            },
            1000
        );

}


// =====================================================
// PAUSE TIMER
// =====================================================

function pauseTimer() {

    if (
        !studyTimerRunning
    ) {

        return;

    }


    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    studyTimerRunning =
        false;


    document.getElementById(
        "sessionStatus"
    ).textContent =
        "PAUSED";

}


// =====================================================
// RESET TIMER
// =====================================================

function resetTimer() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    studyTimerRunning =
        false;


    if (
        currentStudyTask
    ) {

        totalStudySeconds =
            currentStudyTask.duration *
            60;

        remainingStudySeconds =
            totalStudySeconds;

    }


    updateTimerDisplay();


    updateProgress(
        0
    );


    const status =
        document.getElementById(
            "sessionStatus"
        );


    if (status) {

        status.textContent =
            "READY";

    }


    const task =
        document.getElementById(
            "currentTask"
        );


    if (task) {

        task.textContent =
            currentStudyTask
                ? getStudyTask(
                    currentStudyTask.goal
                )
                : "Prepare to begin.";

    }

}


// =====================================================
// FINISH STUDY SESSION
// =====================================================

function finishStudySession() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    studyTimerRunning =
        false;


    remainingStudySeconds =
        0;


    updateTimerDisplay();


    updateProgress(
        100
    );


    const status =
        document.getElementById(
            "sessionStatus"
        );


    if (status) {

        status.textContent =
            "COMPLETED";

    }


    const task =
        document.getElementById(
            "currentTask"
        );


    if (task) {

        task.textContent =
            "Study session completed. Great work.";

    }


    speak(
        "Study session completed. Great work."
    );

}


// =====================================================
// TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {

    const display =
        document.getElementById(
            "timerDisplay"
        );


    if (!display) {
        return;
    }


    const minutes =
        Math.floor(
            remainingStudySeconds /
            60
        );


    const seconds =
        remainingStudySeconds %
        60;


    display.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


// =====================================================
// STUDY PROGRESS
// =====================================================

function updateProgress(
    percent
) {

    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    const percentText =
        document.getElementById(
            "progressPercent"
        );


    const fill =
        document.getElementById(
            "progressFill"
        );


    if (percentText) {

        percentText.textContent =
            `${Math.round(
                safePercent
            )}%`;

    }


    if (fill) {

        fill.style.width =
            `${safePercent}%`;

    }

}


// =====================================================
// UPDATE CURRENT STUDY TASK
// =====================================================

function updateCurrentStudyTask() {

    if (
        !currentStudyTask
    ) {

        return;

    }


    const elapsed =
        totalStudySeconds -
        remainingStudySeconds;


    const elapsedMinutes =
        Math.floor(
            elapsed /
            60
        );


    let taskText;


    if (
        elapsedMinutes < 5
    ) {

        taskText =
            "Review the topic and identify the key concepts.";

    }

    else if (
        elapsedMinutes < 15
    ) {

        taskText =
            "Study and understand the main concepts.";

    }

    else if (
        elapsedMinutes < 30
    ) {

        taskText =
            "Attempt active recall without looking at your notes.";

    }

    else {

        taskText =
            "Practise questions and check your mistakes.";

    }


    const task =
        document.getElementById(
            "currentTask"
        );


    if (task) {

        task.textContent =
            taskText;

    }

}


// =====================================================
// HOMEWORK MANAGER
// =====================================================

function openHomework() {

    const manager =
        document.getElementById(
            "homeworkManager"
        );


    if (manager) {

        manager.style.display =
            "flex";

    }


    loadHomework();

}


// =====================================================
// CLOSE HOMEWORK
// =====================================================

function closeHomework() {

    const manager =
        document.getElementById(
            "homeworkManager"
        );


    if (manager) {

        manager.style.display =
            "none";

    }

}


// =====================================================
// ADD HOMEWORK
// =====================================================

function addHomework() {

    const subject =
        document.getElementById(
            "homeworkSubject"
        ).value;


    const task =
        document.getElementById(
            "homeworkTask"
        ).value.trim();


    const dueDate =
        document.getElementById(
            "homeworkDueDate"
        ).value;


    const priority =
        document.getElementById(
            "homeworkPriority"
        ).value;


    if (!task) {

        alert(
            "Please enter a homework task."
        );

        return;

    }


    const newHomework = {

        id:
            Date.now(),

        subject:
            subject,

        task:
            task,

        dueDate:
            dueDate,

        priority:
            priority,

        completed:
            false

    };


    homework.push(
        newHomework
    );


    saveHomework();


    document.getElementById(
        "homeworkTask"
    ).value = "";


    document.getElementById(
        "homeworkDueDate"
    ).value = "";


    loadHomework();


    showResponse(
        `Homework added: ${task}`
    );

}


// =====================================================
// SAVE HOMEWORK
// =====================================================

function saveHomework() {

    localStorage.setItem(
        "jarvisHomework",
        JSON.stringify(
            homework
        )
    );

}


// =====================================================
// LOAD HOMEWORK
// =====================================================

function loadHomework() {

    const list =
        document.getElementById(
            "homeworkList"
        );


    if (!list) {
        return;
    }


    if (
        homework.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-homework">

                No homework tasks yet.

            </div>

        `;


        updateHomeworkSummary();

        return;

    }


    list.innerHTML =
        homework
            .map(
                item =>
                    createHomeworkHTML(
                        item
                    )
            )
            .join("");


    updateHomeworkSummary();

}


// =====================================================
// CREATE HOMEWORK HTML
// =====================================================

function createHomeworkHTML(
    item
) {

    const completedClass =
        item.completed
            ? "completed"
            : "";


    const checked =
        item.completed
            ? "checked"
            : "";


    const dueText =
        item.dueDate
            ? formatDate(
                item.dueDate
            )
            : "No due date";


    return `

        <div
            class="homework-item ${completedClass}"
        >

            <div class="homework-item-main">

                <label class="homework-check">

                    <input
                        type="checkbox"
                        ${checked}
                        onchange="toggleHomework(${item.id})"
                    >

                    <span></span>

                </label>


                <div class="homework-item-info">

                    <strong>
                        ${formatText(item.task)}
                    </strong>

                    <span>
                        ${formatText(item.subject)}
                    </span>

                    <span>
                        Due: ${dueText}
                    </span>

                </div>

            </div>


            <div class="homework-item-side">

                <span
                    class="homework-priority ${item.priority.toLowerCase()}"
                >

                    ${item.priority}

                </span>


                <button
                    onclick="deleteHomework(${item.id})"
                    class="delete-homework"
                    title="Delete homework"
                >

                    ×

                </button>

            </div>

        </div>

    `;

}


// =====================================================
// TOGGLE HOMEWORK
// =====================================================

function toggleHomework(
    id
) {

    const item =
        homework.find(
            homeworkItem =>
                homeworkItem.id === id
        );


    if (!item) {
        return;
    }


    item.completed =
        !item.completed;


    saveHomework();

    loadHomework();

}


// =====================================================
// DELETE HOMEWORK
// =====================================================

function deleteHomework(
    id
) {

    homework =
        homework.filter(
            item =>
                item.id !== id
        );


    saveHomework();

    loadHomework();

}


// =====================================================
// CLEAR COMPLETED HOMEWORK
// =====================================================

function clearCompletedHomework() {

    homework =
        homework.filter(
            item =>
                !item.completed
        );


    saveHomework();

    loadHomework();

}


// =====================================================
// HOMEWORK SUMMARY
// =====================================================

function updateHomeworkSummary() {

    const count =
        document.getElementById(
            "homeworkCount"
        );


    const status =
        document.getElementById(
            "homeworkStatus"
        );


    const incomplete =
        homework.filter(
            item =>
                !item.completed
        ).length;


    if (count) {

        count.textContent =
            incomplete;

    }


    if (!status) {
        return;
    }


    if (
        homework.length === 0
    ) {

        status.textContent =
            "No homework added yet.";

    }

    else if (
        incomplete === 0
    ) {

        status.textContent =
            "All homework completed.";

    }

    else {

        status.textContent =
            `${incomplete} homework task${incomplete === 1 ? "" : "s"} remaining.`;

    }

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "No due date";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-SG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// SCHEDULE
// =====================================================

function openSchedule() {

    alert(
        "JARVIS SCHEDULE SYSTEM\n\n" +
        "Calendar integration is coming soon."
    );

}


// =====================================================
// TESTS
// =====================================================

function openTests() {

    alert(
        "JARVIS TEST & EXAM SYSTEM\n\n" +
        "Test scheduling is coming soon."
    );

}


// =====================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    (event) => {

        const studyHub =
            document.getElementById(
                "studyHub"
            );


        const homeworkManager =
            document.getElementById(
                "homeworkManager"
            );


        if (
            event.target ===
            studyHub
        ) {

            closeStudyHub();

        }


        if (
            event.target ===
            homeworkManager
        ) {

            closeHomework();

        }

    }
);
