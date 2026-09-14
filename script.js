// =====================================================
// J.A.R.V.I.S.
// PROTOTYPE 8.5
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const WORKER_URL =
    "https://jarvis-ai.tvisha-sanish.workers.dev/";


// =====================================================
// DATA
// =====================================================

let conversationHistory =
    JSON.parse(
        localStorage.getItem("jarvisConversation") || "[]"
    );

let jarvisMemory =
    JSON.parse(
        localStorage.getItem("jarvisMemory") || "[]"
    );

let homework =
    JSON.parse(
        localStorage.getItem("jarvisHomework") || "[]"
    );

let schedule =
    JSON.parse(
        localStorage.getItem("jarvisSchedule") || "[]"
    );

let tests =
    JSON.parse(
        localStorage.getItem("jarvisTests") || "[]"
    );


// =====================================================
// INITIALISE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateMemoryCount();

        renderHomework();

        renderSchedule();

        renderTests();

        updateDashboardSummaries();

        setupCommandInput();

        initialiseVoice();

    }
);


// =====================================================
// COMMAND INPUT
// =====================================================

function setupCommandInput() {

    const input =
        document.getElementById(
            "commandInput"
        );

    if (!input) return;

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                sendCommand();

            }

        }
    );

}


// =====================================================
// AI
// =====================================================

async function sendCommand() {

    const input =
        document.getElementById(
            "commandInput"
        );

    const message =
        input.value.trim();

    if (!message) return;


    input.value = "";

    showUserMessage(message);

    showThinking();

    setAIStatus(
        "CONNECTING..."
    );


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

                    body: JSON.stringify({

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
                "Worker returned an error."
            );

        }


        if (
            !data.response
        ) {

            throw new Error(
                "No AI response received."
            );

        }


        conversationHistory.push({

            role: "user",

            content:
                message

        });


        conversationHistory.push({

            role: "assistant",

            content:
                data.response

        });


        if (
            conversationHistory.length > 20
        ) {

            conversationHistory =
                conversationHistory.slice(
                    -20
                );

        }


        localStorage.setItem(
            "jarvisConversation",
            JSON.stringify(
                conversationHistory
            )
        );


        showResponse(
            data.response
        );


        setAIStatus(
            "ONLINE"
        );


        speak(
            data.response
        );


        detectMemory(
            message
        );


    } catch (error) {

        console.error(
            "JARVIS AI ERROR:",
            error
        );


        showResponse(
            "AI connection failed.\n\n" +
            "JARVIS could not connect to the AI server.\n\n" +
            "Please check that the Cloudflare Worker is deployed and that the OPENAI_API_KEY secret is configured."
        );


        setAIStatus(
            "OFFLINE"
        );

    }

}


// =====================================================
// UI RESPONSE
// =====================================================

function showThinking() {

    document.getElementById(
        "responseBox"
    ).textContent =
        "JARVIS is processing your request...";

}


function showUserMessage(message) {

    document.getElementById(
        "responseBox"
    ).textContent =
        "YOU: " + message;

}


function showResponse(response) {

    document.getElementById(
        "responseBox"
    ).textContent =
        response;

}


function setAIStatus(status) {

    const element =
        document.getElementById(
            "aiStatus"
        );

    if (element) {

        element.textContent =
            status;

    }

}


// =====================================================
// MEMORY
// =====================================================

function detectMemory(message) {

    const lower =
        message.toLowerCase();


    const triggers = [

        "remember that",

        "remember my",

        "don't forget",

        "save this"

    ];


    const matched =
        triggers.some(
            trigger =>
                lower.includes(trigger)
        );


    if (!matched) return;


    let memory =
        message;


    memory =
        memory.replace(
            /remember that/i,
            ""
        );

    memory =
        memory.replace(
            /remember my/i,
            ""
        );

    memory =
        memory.replace(
            /don't forget/i,
            ""
        );

    memory =
        memory.replace(
            /save this/i,
            ""
        );


    memory =
        memory.trim();


    if (!memory) return;


    jarvisMemory.push(
        memory
    );


    localStorage.setItem(
        "jarvisMemory",
        JSON.stringify(
            jarvisMemory
        )
    );


    updateMemoryCount();

}


function updateMemoryCount() {

    const count =
        document.getElementById(
            "memoryCount"
        );

    if (count) {

        count.textContent =
            jarvisMemory.length;

    }

}


function openMemory() {

    const modal =
        document.getElementById(
            "memoryModal"
        );

    renderMemory();

    modal.classList.add(
        "active"
    );

}


function closeMemory() {

    document
        .getElementById(
            "memoryModal"
        )
        .classList.remove(
            "active"
        );

}


function renderMemory() {

    const list =
        document.getElementById(
            "memoryList"
        );

    if (
        jarvisMemory.length === 0
    ) {

        list.innerHTML =
            "<p>No saved memories.</p>";

        return;

    }


    list.innerHTML =
        jarvisMemory
            .map(
                (memory, index) => `

                    <div class="homework-item">

                        <div class="item-title">
                            Memory ${index + 1}
                        </div>

                        <div class="item-meta">
                            ${escapeHTML(memory)}
                        </div>

                        <div class="item-actions">

                            <button
                                onclick="deleteMemory(${index})"
                            >
                                DELETE
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");

}


function deleteMemory(index) {

    jarvisMemory.splice(
        index,
        1
    );

    localStorage.setItem(
        "jarvisMemory",
        JSON.stringify(
            jarvisMemory
        )
    );

    updateMemoryCount();

    renderMemory();

}


function clearMemory() {

    jarvisMemory = [];

    localStorage.setItem(
        "jarvisMemory",
        JSON.stringify(
            jarvisMemory
        )
    );

    updateMemoryCount();

    renderMemory();

}


// =====================================================
// VOICE RECOGNITION
// =====================================================

let recognition = null;

let voiceAvailable = false;


function initialiseVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        updateVoiceStatus(
            "VOICE NOT SUPPORTED"
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        true;

    recognition.interimResults =
        false;

    recognition.lang =
        "en-SG";


    recognition.onresult =
        event => {

            const result =
                event.results[
                    event.results.length - 1
                ];

            const transcript =
                result[0].transcript.trim();


            if (!transcript) return;


            updateVoiceStatus(
                "COMMAND RECEIVED"
            );


            document.getElementById(
                "commandInput"
            ).value =
                transcript;


            sendCommand();

        };


    recognition.onerror =
        event => {

            console.log(
                "Voice error:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                voiceAvailable =
                    false;

                updateVoiceStatus(
                    "MICROPHONE PERMISSION NEEDED"
                );

            }

        };


    recognition.onend =
        () => {

            if (
                voiceAvailable
            ) {

                setTimeout(
                    () => {

                        try {

                            recognition.start();

                        } catch (error) {

                            console.log(
                                "Voice restart:",
                                error
                            );

                        }

                    },
                    1000
                );

            }

        };


    voiceAvailable =
        true;


    try {

        recognition.start();

        updateVoiceStatus(
            "LISTENING FOR JARVIS"
        );

    } catch (error) {

        console.log(
            "Voice start:",
            error
        );

        updateVoiceStatus(
            "VOICE READY"
        );

    }

}


function updateVoiceStatus(status) {

    const statusElement =
        document.getElementById(
            "voiceStatus"
        );

    const panelElement =
        document.getElementById(
            "voicePanelStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            status;

    }


    if (panelElement) {

        panelElement.textContent =
            status;

    }

}


// =====================================================
// TEXT TO SPEECH
// =====================================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) return;


    speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        "en-SG";

    speech.rate =
        1;

    speech.pitch =
        0.9;


    speechSynthesis.speak(
        speech
    );

}


// =====================================================
// STUDY HUB
// =====================================================

let studyTimer = null;

let studySeconds = 0;

let studyTotalSeconds = 0;

let studyRunning = false;


function openStudyHub() {

    document
        .getElementById(
            "studyModal"
        )
        .classList.add(
            "active"
        );

}


function closeStudyHub() {

    document
        .getElementById(
            "studyModal"
        )
        .classList.remove(
            "active"
        );

}


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
        Number(
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
            "Please enter a topic."
        );

        return;

    }


    studyTotalSeconds =
        duration * 60;

    studySeconds =
        studyTotalSeconds;


    studyRunning =
        false;


    document
        .getElementById(
            "studySession"
        )
        .classList.remove(
            "hidden"
        );


    document.getElementById(
        "currentTask"
    ).textContent =
        `${goal}: ${subject} — ${topic}`;


    updateTimer();

}


function startTimer() {

    if (studyRunning) return;


    studyRunning =
        true;


    studyTimer =
        setInterval(
            () => {

                if (
                    studySeconds <= 0
                ) {

                    finishSession();

                    return;

                }


                studySeconds--;

                updateTimer();

            },
            1000
        );

}


function pauseTimer() {

    studyRunning =
        false;


    clearInterval(
        studyTimer
    );

}


function resetTimer() {

    pauseTimer();


    studySeconds =
        studyTotalSeconds;


    updateTimer();

}


function finishSession() {

    pauseTimer();


    studySeconds =
        0;


    updateTimer();


    document.getElementById(
        "currentTask"
    ).textContent =
        "Study session completed.";

}


function updateTimer() {

    const minutes =
        Math.floor(
            studySeconds / 60
        );

    const seconds =
        studySeconds % 60;


    document.getElementById(
        "timerDisplay"
    ).textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    let progress =
        0;


    if (
        studyTotalSeconds > 0
    ) {

        progress =
            (
                (
                    studyTotalSeconds -
                    studySeconds
                ) /
                studyTotalSeconds
            ) *
            100;

    }


    document.getElementById(
        "progressFill"
    ).style.width =
        `${progress}%`;


    document.getElementById(
        "progressText"
    ).textContent =
        `${Math.round(progress)}%`;

}


// =====================================================
// HOMEWORK
// =====================================================

function openHomework() {

    document
        .getElementById(
            "homeworkModal"
        )
        .classList.add(
            "active"
        );

}


function closeHomework() {

    document
        .getElementById(
            "homeworkModal"
        )
        .classList.remove(
            "active"
        );

}


function addHomework() {

    const subject =
        document.getElementById(
            "homeworkSubject"
        ).value.trim();


    const task =
        document.getElementById(
            "homeworkTask"
        ).value.trim();


    const due =
        document.getElementById(
            "homeworkDue"
        ).value;


    const priority =
        document.getElementById(
            "homeworkPriority"
        ).value;


    if (
        !subject ||
        !task ||
        !due
    ) {

        alert(
            "Please fill in all homework fields."
        );

        return;

    }


    homework.push({

        id:
            Date.now(),

        subject:
            subject,

        task:
            task,

        due:
            due,

        priority:
            priority,

        completed:
            false

    });


    saveHomework();

    renderHomework();

    updateDashboardSummaries();


    document.getElementById(
        "homeworkSubject"
    ).value = "";


    document.getElementById(
        "homeworkTask"
    ).value = "";


    document.getElementById(
        "homeworkDue"
    ).value = "";

}


function saveHomework() {

    localStorage.setItem(
        "jarvisHomework",
        JSON.stringify(
            homework
        )
    );

}


function renderHomework() {

    const list =
        document.getElementById(
            "homeworkList"
        );


    if (!list) return;


    if (
        homework.length === 0
    ) {

        list.innerHTML =
            "<p>No homework yet.</p>";

        return;

    }


    list.innerHTML =
        homework
            .map(
                item => `

                <div class="homework-item">

                    <div
                        class="${
                            item.completed
                                ? "completed"
                                : ""
                        }"
                    >

                        <div class="item-title">
                            ${escapeHTML(item.subject)}
                        </div>

                        <div class="item-meta">
                            ${escapeHTML(item.task)}
                        </div>

                        <div class="item-meta">
                            Due: ${item.due}
                            · Priority: ${item.priority}
                        </div>

                    </div>


                    <div class="item-actions">

                        <button
                            onclick="toggleHomework(${item.id})"
                        >
                            ${
                                item.completed
                                    ? "UNDO"
                                    : "DONE"
                            }
                        </button>


                        <button
                            onclick="deleteHomework(${item.id})"
                        >
                            DELETE
                        </button>

                    </div>

                </div>

            `
            )
            .join("");

}


function toggleHomework(id) {

    const item =
        homework.find(
            h => h.id === id
        );


    if (!item) return;


    item.completed =
        !item.completed;


    saveHomework();

    renderHomework();

    updateDashboardSummaries();

}


function deleteHomework(id) {

    homework =
        homework.filter(
            h => h.id !== id
        );


    saveHomework();

    renderHomework();

    updateDashboardSummaries();

}


function clearCompletedHomework() {

    homework =
        homework.filter(
            h => !h.completed
        );


    saveHomework();

    renderHomework();

    updateDashboardSummaries();

}


// =====================================================
// SCHEDULE
// =====================================================

function openSchedule() {

    document
        .getElementById(
            "scheduleModal"
        )
        .classList.add(
            "active"
        );


    renderSchedule();

}


function closeSchedule() {

    document
        .getElementById(
            "scheduleModal"
        )
        .classList.remove(
            "active"
        );

}


function addScheduleEvent() {

    const eventName =
        document.getElementById(
            "scheduleEvent"
        ).value.trim();


    const date =
        document.getElementById(
            "scheduleDate"
        ).value;


    const time =
        document.getElementById(
            "scheduleTime"
        ).value;


    const type =
        document.getElementById(
            "scheduleType"
        ).value;


    if (
        !eventName ||
        !date ||
        !time
    ) {

        alert(
            "Please fill in the event, date and time."
        );

        return;

    }


    schedule.push({

        id:
            Date.now(),

        event:
            eventName,

        date:
            date,

        time:
            time,

        type:
            type

    });


    saveSchedule();

    renderSchedule();

    updateDashboardSummaries();


    document.getElementById(
        "scheduleEvent"
    ).value = "";

}


function saveSchedule() {

    localStorage.setItem(
        "jarvisSchedule",
        JSON.stringify(
            schedule
        )
    );

}


function renderSchedule() {

    const list =
        document.getElementById(
            "scheduleList"
        );


    if (!list) return;


    if (
        schedule.length === 0
    ) {

        list.innerHTML =
            "<p>No scheduled events.</p>";

        return;

    }


    const sorted =
        [...schedule].sort(
            (a, b) =>
                (
                    `${a.date} ${a.time}`
                ).localeCompare(
                    `${b.date} ${b.time}`
                )
        );


    list.innerHTML =
        sorted
            .map(
                item => `

                <div class="schedule-item">

                    <div class="item-title">
                        ${escapeHTML(item.event)}
                    </div>

                    <div class="item-meta">
                        ${item.date}
                        · ${item.time}
                        · ${escapeHTML(item.type)}
                    </div>

                    <div class="item-actions">

                        <button
                            onclick="deleteSchedule(${item.id})"
                        >
                            DELETE
                        </button>

                    </div>

                </div>

            `
            )
            .join("");

}


function deleteSchedule(id) {

    schedule =
        schedule.filter(
            event =>
                event.id !== id
        );


    saveSchedule();

    renderSchedule();

    updateDashboardSummaries();

}


// =====================================================
// TESTS
// =====================================================

function openTests() {

    document
        .getElementById(
            "testsModal"
        )
        .classList.add(
            "active"
        );


    renderTests();

}


function closeTests() {

    document
        .getElementById(
            "testsModal"
        )
        .classList.remove(
            "active"
        );

}


function addTest() {

    const subject =
        document.getElementById(
            "testSubject"
        ).value.trim();


    const name =
        document.getElementById(
            "testName"
        ).value.trim();


    const date =
        document.getElementById(
            "testDate"
        ).value;


    const topics =
        document.getElementById(
            "testTopics"
        ).value.trim();


    if (
        !subject ||
        !name ||
        !date
    ) {

        alert(
            "Please fill in the subject, test name and date."
        );

        return;

    }


    tests.push({

        id:
            Date.now(),

        subject:
            subject,

        name:
            name,

        date:
            date,

        topics:
            topics

    });


    saveTests();

    renderTests();

    updateDashboardSummaries();


    document.getElementById(
        "testSubject"
    ).value = "";


    document.getElementById(
        "testName"
    ).value = "";


    document.getElementById(
        "testDate"
    ).value = "";


    document.getElementById(
        "testTopics"
    ).value = "";

}


function saveTests() {

    localStorage.setItem(
        "jarvisTests",
        JSON.stringify(
            tests
        )
    );

}


function renderTests() {

    const list =
        document.getElementById(
            "testList"
        );


    if (!list) return;


    if (
        tests.length === 0
    ) {

        list.innerHTML =
            "<p>No tests scheduled.</p>";

        return;

    }


    const sorted =
        [...tests].sort(
            (a, b) =>
                a.date.localeCompare(
                    b.date
                )
        );


    list.innerHTML =
        sorted
            .map(
                item => {

                    const days =
                        daysUntil(
                            item.date
                        );


                    let countdown;


                    if (days < 0) {

                        countdown =
                            "Completed";

                    } else if (
                        days === 0
                    ) {

                        countdown =
                            "TODAY";

                    } else if (
                        days === 1
                    ) {

                        countdown =
                            "Tomorrow";

                    } else {

                        countdown =
                            `${days} days remaining`;

                    }


                    return `

                    <div class="test-item">

                        <div class="item-title">
                            ${escapeHTML(item.subject)}
                            — ${escapeHTML(item.name)}
                        </div>

                        <div class="item-meta">
                            Date: ${item.date}
                        </div>

                        <div class="item-meta">
                            ${escapeHTML(item.topics || "No topics added")}
                        </div>

                        <div class="item-meta">
                            ${countdown}
                        </div>

                        <div class="item-actions">

                            <button
                                onclick="deleteTest(${item.id})"
                            >
                                DELETE
                            </button>

                        </div>

                    </div>

                    `;

                }
            )
            .join("");

}


function deleteTest(id) {

    tests =
        tests.filter(
            test =>
                test.id !== id
        );


    saveTests();

    renderTests();

    updateDashboardSummaries();

}


function daysUntil(dateString) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const target =
        new Date(
            dateString +
            "T00:00:00"
        );


    const difference =
        target - today;


    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


// =====================================================
// DASHBOARD SUMMARIES
// =====================================================

function updateDashboardSummaries() {

    const homeworkSummary =
        document.getElementById(
            "homeworkSummary"
        );


    const scheduleSummary =
        document.getElementById(
            "scheduleSummary"
        );


    const testSummary =
        document.getElementById(
            "testSummary"
        );


    if (homeworkSummary) {

        const incomplete =
            homework.filter(
                item =>
                    !item.completed
            ).length;


        homeworkSummary.textContent =
            incomplete === 0
                ? "No incomplete homework."
                : `${incomplete} homework task${incomplete === 1 ? "" : "s"} remaining.`;

    }


    if (scheduleSummary) {

        scheduleSummary.textContent =
            schedule.length === 0
                ? "No events scheduled."
                : `${schedule.length} event${schedule.length === 1 ? "" : "s"} scheduled.`;

    }


    if (testSummary) {

        if (
            tests.length === 0
        ) {

            testSummary.textContent =
                "No tests scheduled.";

        } else {

            const upcoming =
                tests
                    .filter(
                        test =>
                            daysUntil(
                                test.date
                            ) >= 0
                    )
                    .sort(
                        (a, b) =>
                            a.date.localeCompare(
                                b.date
                            )
                    )[0];


            if (upcoming) {

                testSummary.textContent =
                    `${upcoming.subject}: ${daysUntil(upcoming.date)} day${daysUntil(upcoming.date) === 1 ? "" : "s"} remaining.`;

            } else {

                testSummary.textContent =
                    "No upcoming tests.";

            }

        }

    }

}


// =====================================================
// UTILITIES
// =====================================================

function escapeHTML(value) {

    return String(value)

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
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// MODAL CLICK OUTSIDE
// =====================================================

window.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "active"
            );

        }

    }
);
