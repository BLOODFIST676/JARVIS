// =====================================================
// JARVIS - MAIN SCRIPT
// AI + MEMORY + VOICE + STUDY HUB + STUDY TIMER
// =====================================================


// =====================================================
// CONVERSATION HISTORY
// =====================================================

let conversationHistory = [];


// =====================================================
// PERSISTENT MEMORY
// =====================================================

let jarvisMemory =
    JSON.parse(
        localStorage.getItem("jarvisMemory") || "[]"
    );


// =====================================================
// STUDY SESSION VARIABLES
// =====================================================

let studyTimer = null;

let studyTotalSeconds = 0;

let studyRemainingSeconds = 0;

let studyRunning = false;

let studyStartTime = null;


// =====================================================
// STUDY TASKS
// =====================================================

let studyTasks = [];

let currentTaskIndex = 0;


// =====================================================
// SAVE MEMORY
// =====================================================

function saveMemory() {

    localStorage.setItem(
        "jarvisMemory",
        JSON.stringify(jarvisMemory)
    );

}


// =====================================================
// ADD MEMORY
// =====================================================

function addMemory(memory) {

    if (!memory || memory.trim() === "") {
        return;
    }

    jarvisMemory.push(
        memory.trim()
    );

    saveMemory();

}


// =====================================================
// CLEAR MEMORY
// =====================================================

function clearMemory() {

    jarvisMemory = [];

    saveMemory();

}


// =====================================================
// GET MEMORY
// =====================================================

function getMemoryText() {

    if (jarvisMemory.length === 0) {

        return "No personal memories have been saved yet.";

    }

    return jarvisMemory
        .map(
            (memory, index) =>
                `${index + 1}. ${memory}`
        )
        .join("\n");

}


// =====================================================
// SEND COMMAND
// =====================================================

function sendCommand() {

    const input =
        document.getElementById("commandInput");

    const command =
        input.value.trim();

    const lowerCommand =
        command.toLowerCase();

    const response =
        document.getElementById("response");


    if (command === "") {

        response.innerText =
            "JARVIS: Please give me a command.";

        speak(response.innerText);

        return;

    }


    // REMEMBER

    if (
        lowerCommand.startsWith("remember that ") ||
        lowerCommand.startsWith("remember ")
    ) {

        let memory =
            command
                .replace(
                    /^remember that /i,
                    ""
                )
                .replace(
                    /^remember /i,
                    ""
                )
                .trim();


        if (memory !== "") {

            addMemory(memory);

            response.innerText =
                "JARVIS: I'll remember that.";

            speak(response.innerText);

            input.value = "";

            return;

        }

    }


    // CLEAR MEMORY

    if (
        lowerCommand.includes("forget everything") ||
        lowerCommand.includes("clear my memory") ||
        lowerCommand.includes("erase my memory")
    ) {

        clearMemory();

        response.innerText =
            "JARVIS: I've cleared my saved memory.";

        speak(response.innerText);

        input.value = "";

        return;

    }


    // SHOW MEMORY

    if (
        lowerCommand.includes("what do you remember") ||
        lowerCommand.includes("show my memory") ||
        lowerCommand.includes("what do you know about me")
    ) {

        openMemory();

        input.value = "";

        return;

    }


    // STUDY HUB

    if (
        lowerCommand === "study" ||
        lowerCommand === "study hub" ||
        lowerCommand.includes("start studying") ||
        lowerCommand.includes("start study")
    ) {

        openStudyHub();

        input.value = "";

        return;

    }


    // SCHEDULE

    if (
        lowerCommand.includes("schedule") ||
        lowerCommand.includes("calendar") ||
        lowerCommand.includes("what do i have today") ||
        lowerCommand.includes("what's on today")
    ) {

        openSchedule();

        input.value = "";

        return;

    }


    // STUDY REQUESTS

    if (
        lowerCommand.includes("revise") ||
        lowerCommand.includes("revision") ||
        lowerCommand.includes("physics") ||
        lowerCommand.includes("chemistry") ||
        lowerCommand.includes("math")
    ) {

        openStudyHub();

        input.value = "";

        return;

    }


    // DOCUMENTS

    if (
        lowerCommand.includes("notes") ||
        lowerCommand.includes("document") ||
        lowerCommand.includes("docs") ||
        lowerCommand.includes("find my")
    ) {

        response.innerText =
            "JARVIS: Document search detected. Google Drive integration will be connected later.";

        speak(response.innerText);

        input.value = "";

        return;

    }


    // HOMEWORK

    if (
        lowerCommand.includes("homework") ||
        lowerCommand.includes("assignment") ||
        lowerCommand.includes("assignments")
    ) {

        openHomework();

        input.value = "";

        return;

    }


    // TESTS

    if (
        lowerCommand.includes("test") ||
        lowerCommand.includes("tests") ||
        lowerCommand.includes("exam") ||
        lowerCommand.includes("exams")
    ) {

        openTests();

        input.value = "";

        return;

    }


    // AI

    askJARVIS(command);

    input.value = "";

}


// =====================================================
// ASK JARVIS AI
// =====================================================

async function askJARVIS(message) {

    const response =
        document.getElementById("response");


    response.innerText =
        "JARVIS: Thinking...";


    try {

        const result =
            await fetch(
                "https://jarvis-ai.tvisha-sanish.workers.dev/",
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
            await result.json();


        if (!result.ok) {

            throw new Error(
                data.error ||
                "Request failed"
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
                conversationHistory.slice(-20);

        }


        response.innerText =
            "JARVIS: " +
            data.response;


        speak(
            response.innerText
        );


    } catch (error) {

        console.error(
            "JARVIS connection error:",
            error
        );


        response.innerText =
            "JARVIS: I'm having trouble connecting to my AI system.";

        speak(
            response.innerText
        );

    }

}


// =====================================================
// MEMORY
// =====================================================

function openMemory() {

    const response =
        document.getElementById("response");


    const memoryText =
        getMemoryText();


    response.innerText =
        "JARVIS: Here is what I remember:\n\n" +
        memoryText;


    speak(
        "Here is what I remember. " +
        memoryText
    );

}


// =====================================================
// OPEN STUDY HUB
// =====================================================

function openStudyHub() {

    const studyHub =
        document.getElementById("studyHub");


    if (!studyHub) {
        return;
    }


    studyHub.classList.add(
        "active"
    );


    const topic =
        document.getElementById("studyTopic");


    if (topic) {

        setTimeout(
            function() {

                topic.focus();

            },
            200
        );

    }


    const response =
        document.getElementById("response");


    response.innerText =
        "JARVIS: Study Hub activated.";

}


// =====================================================
// CLOSE STUDY HUB
// =====================================================

function closeStudyHub() {

    const studyHub =
        document.getElementById("studyHub");


    if (!studyHub) {
        return;
    }


    studyHub.classList.remove(
        "active"
    );

}


// =====================================================
// GENERATE STUDY SESSION
// =====================================================

async function generateStudySession() {

    const subject =
        document.getElementById(
            "studySubject"
        ).value;


    const topic =
        document.getElementById(
            "studyTopic"
        ).value.trim();


    const duration =
        document.getElementById(
            "studyDuration"
        ).value;


    const goal =
        document.getElementById(
            "studyGoal"
        ).value;


    const result =
        document.getElementById(
            "studyResult"
        );


    const activeSession =
        document.getElementById(
            "activeStudySession"
        );


    if (topic === "") {

        result.innerHTML = `

            <div class="response-label">
                JARVIS STUDY SYSTEM
            </div>

            <p>
                Please enter a topic first.
            </p>

        `;

        return;

    }


    result.innerHTML = `

        <div class="response-label">
            JARVIS STUDY SYSTEM
        </div>

        <p>
            Generating your ${duration}-minute
            ${subject} study session...
        </p>

    `;


    const studyPrompt = `

You are JARVIS, a personal AI study assistant.

Create a structured study session for a secondary school student.

Subject: ${subject}

Topic: ${topic}

Duration: ${duration} minutes

Study goal: ${goal}

Create a practical study plan.

Include:

1. Warm-up / recall
2. Key concepts
3. Main learning or revision activity
4. Practice questions or tasks
5. Final recall/check
6. Time breakdown

Keep it realistic and suitable for a secondary school student.

`;


    try {

        const aiResult =
            await fetch(
                "https://jarvis-ai.tvisha-sanish.workers.dev/",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            studyPrompt,

                        history:
                            conversationHistory,

                        memory:
                            jarvisMemory

                    })

                }
            );


        const data =
            await aiResult.json();


        if (!aiResult.ok) {

            throw new Error(
                data.error ||
                "Study generation failed."
            );

        }


        result.innerHTML = `

            <div class="response-label">
                JARVIS STUDY PLAN
            </div>

            <p>
                <strong>${subject}</strong>
            </p>

            <p>
                <strong>Topic:</strong>
                ${topic}
            </p>

            <p>
                <strong>Duration:</strong>
                ${duration} minutes
            </p>

            <hr>

            <div class="study-ai-response">
                ${formatStudyResponse(data.response)}
            </div>

        `;


        // Prepare the actual timer session

        prepareStudySession(
            subject,
            topic,
            duration
        );


        activeSession.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });


        conversationHistory.push({

            role: "user",

            content:
                studyPrompt

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
                conversationHistory.slice(-20);

        }


        const response =
            document.getElementById(
                "response"
            );


        response.innerText =
            "JARVIS: Your study session is ready. Press START when you're ready.";


        speak(
            `Your ${duration} minute ${subject} study session is ready.`
        );


    } catch (error) {

        console.error(
            "Study Hub error:",
            error
        );


        result.innerHTML = `

            <div class="response-label">
                JARVIS STUDY SYSTEM
            </div>

            <p>
                I couldn't generate your study session.
            </p>

            <p>
                Please try again.
            </p>

        `;

    }

}


// =====================================================
// PREPARE STUDY SESSION
// =====================================================

function prepareStudySession(
    subject,
    topic,
    duration
) {

    const activeSession =
        document.getElementById(
            "activeStudySession"
        );


    const sessionSubject =
        document.getElementById(
            "sessionSubject"
        );


    const sessionTopic =
        document.getElementById(
            "sessionTopic"
        );


    const currentTask =
        document.getElementById(
            "currentTask"
        );


    const sessionStatus =
        document.getElementById(
            "sessionStatus"
        );


    const durationNumber =
        parseInt(
            duration
        );


    studyTotalSeconds =
        durationNumber * 60;


    studyRemainingSeconds =
        studyTotalSeconds;


    studyRunning =
        false;


    currentTaskIndex =
        0;


    studyStartTime =
        null;


    studyTasks = [

        "Warm up by recalling what you already know.",

        `Review the key concepts of ${topic}.`,

        `Work through examples related to ${topic}.`,

        `Complete practice questions on ${topic}.`,

        "Check your answers and identify weak areas.",

        "Do a final recall without looking at your notes."

    ];


    sessionSubject.innerText =
        subject;


    sessionTopic.innerText =
        topic;


    currentTask.innerText =
        studyTasks[0];


    sessionStatus.innerText =
        "READY";


    updateTimerDisplay();


    updateProgress();


    activeSession.classList.add(
        "session-visible"
    );

}


// =====================================================
// START TIMER
// =====================================================

function startTimer() {

    if (
        studyTotalSeconds <= 0
    ) {

        return;

    }


    if (studyRunning) {

        return;

    }


    studyRunning =
        true;


    studyStartTime =
        new Date();


    const sessionStatus =
        document.getElementById(
            "sessionStatus"
        );


    sessionStatus.innerText =
        "RUNNING";


    speak(
        "Study session started."
    );


    studyTimer =
        setInterval(
            function() {

                studyRemainingSeconds--;

                updateTimerDisplay();

                updateProgress();

                updateCurrentTask();


                if (
                    studyRemainingSeconds <= 0
                ) {

                    completeStudySession();

                }

            },
            1000
        );

}


// =====================================================
// PAUSE TIMER
// =====================================================

function pauseTimer() {

    if (!studyRunning) {

        return;

    }


    clearInterval(
        studyTimer
    );


    studyRunning =
        false;


    const sessionStatus =
        document.getElementById(
            "sessionStatus"
        );


    sessionStatus.innerText =
        "PAUSED";


    speak(
        "Study session paused."
    );

}


// =====================================================
// RESET TIMER
// =====================================================

function resetTimer() {

    clearInterval(
        studyTimer
    );


    studyRunning =
        false;


    studyRemainingSeconds =
        studyTotalSeconds;


    currentTaskIndex =
        0;


    const sessionStatus =
        document.getElementById(
            "sessionStatus"
        );


    sessionStatus.innerText =
        "READY";


    updateTimerDisplay();

    updateProgress();

    updateCurrentTask();


    speak(
        "Study session reset."
    );

}


// =====================================================
// UPDATE TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {

    const timerDisplay =
        document.getElementById(
            "timerDisplay"
        );


    if (!timerDisplay) {
        return;
    }


    const minutes =
        Math.floor(
            studyRemainingSeconds / 60
        );


    const seconds =
        studyRemainingSeconds % 60;


    timerDisplay.innerText =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


// =====================================================
// UPDATE PROGRESS
// =====================================================

function updateProgress() {

    if (
        studyTotalSeconds <= 0
    ) {

        return;

    }


    const elapsed =
        studyTotalSeconds -
        studyRemainingSeconds;


    const percentage =
        Math.min(
            100,
            Math.round(
                (elapsed /
                    studyTotalSeconds) *
                100
            )
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    const progressPercent =
        document.getElementById(
            "progressPercent"
        );


    if (progressFill) {

        progressFill.style.width =
            percentage + "%";

    }


    if (progressPercent) {

        progressPercent.innerText =
            percentage + "%";

    }

}


// =====================================================
// UPDATE CURRENT TASK
// =====================================================

function updateCurrentTask() {

    if (
        !studyRunning ||
        studyTasks.length === 0
    ) {

        return;

    }


    const elapsed =
        studyTotalSeconds -
        studyRemainingSeconds;


    const progress =
        elapsed /
        studyTotalSeconds;


    let newIndex;


    if (progress < 0.15) {

        newIndex = 0;

    } else if (progress < 0.30) {

        newIndex = 1;

    } else if (progress < 0.55) {

        newIndex = 2;

    } else if (progress < 0.75) {

        newIndex = 3;

    } else if (progress < 0.90) {

        newIndex = 4;

    } else {

        newIndex = 5;

    }


    if (
        newIndex !== currentTaskIndex
    ) {

        currentTaskIndex =
            newIndex;


        const currentTask =
            document.getElementById(
                "currentTask"
            );


        if (currentTask) {

            currentTask.innerText =
                studyTasks[
                    currentTaskIndex
                ];

        }

    }

}


// =====================================================
// FINISH STUDY SESSION
// =====================================================

function finishStudySession() {

    if (
        studyTotalSeconds <= 0
    ) {

        return;

    }


    clearInterval(
        studyTimer
    );


    studyRunning =
        false;


    const sessionStatus =
        document.getElementById(
            "sessionStatus"
        );


    sessionStatus.innerText =
        "COMPLETED";


    const currentTask =
        document.getElementById(
            "currentTask"
        );


    currentTask.innerText =
        "Session completed. Excellent work.";


    const response =
        document.getElementById(
            "response"
        );


    response.innerText =
        "JARVIS: Study session completed. Well done.";


    speak(
        "Study session completed. Well done."
    );


}


// =====================================================
// AUTOMATIC COMPLETION
// =====================================================

function completeStudySession() {

    clearInterval(
        studyTimer
    );


    studyRunning =
        false;


    studyRemainingSeconds =
        0;


    updateTimerDisplay();

    updateProgress();


    const sessionStatus =
        document.getElementById(
            "sessionStatus"
        );


    const currentTask =
        document.getElementById(
            "currentTask"
        );


    sessionStatus.innerText =
        "COMPLETED";


    currentTask.innerText =
        "Time is up. Session completed.";


    const response =
        document.getElementById(
            "response"
        );


    response.innerText =
        "JARVIS: Your study session is complete. Great work.";


    speak(
        "Your study session is complete. Great work."
    );

}


// =====================================================
// FORMAT STUDY RESPONSE
// =====================================================

function formatStudyResponse(text) {

    if (!text) {

        return "No study plan was generated.";

    }


    let formatted =
        text;


    formatted =
        formatted
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
            );


    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    formatted =
        formatted.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );


    formatted =
        formatted.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


    formatted =
        formatted.replace(
            /^(\d+)\. (.*)$/gm,
            "<p><strong>$1.</strong> $2</p>"
        );


    formatted =
        formatted.replace(
            /^[-•] (.*)$/gm,
            "<p>• $1</p>"
        );


    formatted =
        formatted.replace(
            /\n/g,
            "<br>"
        );


    return formatted;

}


// =====================================================
// SCHEDULE
// =====================================================

function openSchedule() {

    const response =
        document.getElementById(
            "response"
        );


    response.innerText =
        "JARVIS: Calendar system detected. Google Calendar integration is coming next.";


    speak(
        response.innerText
    );

}


// =====================================================
// HOMEWORK
// =====================================================

function openHomework() {

    const response =
        document.getElementById(
            "response"
        );


    response.innerText =
        "JARVIS: Homework system activated. Your homework database has not been connected yet.";


    speak(
        response.innerText
    );

}


// =====================================================
// TESTS
// =====================================================

function openTests() {

    const response =
        document.getElementById(
            "response"
        );


    response.innerText =
        "JARVIS: Test and examination system activated. Your test database has not been connected yet.";


    speak(
        response.innerText
    );

}


// =====================================================
// LEGACY STUDY FUNCTION
// =====================================================

function startStudy() {

    openStudyHub();

}


// =====================================================
// VOICE RECOGNITION
// =====================================================

function startListening() {

    const response =
        document.getElementById(
            "response"
        );


    const input =
        document.getElementById(
            "commandInput"
        );


    if (
        !("webkitSpeechRecognition" in window)
    ) {

        response.innerText =
            "JARVIS: Voice recognition is not supported by this browser.";

        speak(
            response.innerText
        );

        return;

    }


    const recognition =
        new webkitSpeechRecognition();


    recognition.lang =
        "en-SG";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    response.innerText =
        "JARVIS: Listening...";


    recognition.start();


    recognition.onresult =
        function(event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            input.value =
                transcript;


            sendCommand();

        };


    recognition.onerror =
        function() {

            response.innerText =
                "JARVIS: I couldn't hear that. Please try again.";

            speak(
                response.innerText
            );

        };


    recognition.onend =
        function() {

            console.log(
                "Voice recognition ended."
            );

        };

}


// =====================================================
// ENTER KEY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const input =
            document.getElementById(
                "commandInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        sendCommand();

                    }

                }
            );

        }


        const studyHub =
            document.getElementById(
                "studyHub"
            );


        if (studyHub) {

            studyHub.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        studyHub
                    ) {

                        closeStudyHub();

                    }

                }
            );

        }

    }
);


// =====================================================
// TEXT TO SPEECH
// =====================================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.rate =
        1;


    speech.pitch =
        1;


    speech.volume =
        1;


    window.speechSynthesis.cancel();


    window.speechSynthesis.speak(
        speech
    );

}
