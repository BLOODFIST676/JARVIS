// =====================================================
// JARVIS - MAIN SCRIPT
// AI CONVERSATION + MEMORY + VOICE + STUDY HUB
// =====================================================


// =====================================================
// CONVERSATION HISTORY
// =====================================================

let conversationHistory = [];


// =====================================================
// PERSISTENT JARVIS MEMORY
// =====================================================

let jarvisMemory =
    JSON.parse(
        localStorage.getItem("jarvisMemory") || "[]"
    );


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


    // =================================================
    // EMPTY COMMAND
    // =================================================

    if (command === "") {

        response.innerText =
            "JARVIS: Please give me a command.";

        speak(response.innerText);

        return;

    }


    // =================================================
    // REMEMBER SOMETHING
    // =================================================

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


    // =================================================
    // FORGET EVERYTHING
    // =================================================

    if (
        lowerCommand.includes(
            "forget everything"
        ) ||

        lowerCommand.includes(
            "clear my memory"
        ) ||

        lowerCommand.includes(
            "erase my memory"
        )
    ) {

        clearMemory();

        response.innerText =
            "JARVIS: I've cleared my saved memory.";

        speak(response.innerText);

        input.value = "";

        return;

    }


    // =================================================
    // SHOW MEMORY
    // =================================================

    if (
        lowerCommand.includes(
            "what do you remember"
        ) ||

        lowerCommand.includes(
            "show my memory"
        ) ||

        lowerCommand.includes(
            "what do you know about me"
        )
    ) {

        openMemory();

        input.value = "";

        return;

    }


    // =================================================
    // OPEN STUDY HUB
    // =================================================

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


    // =================================================
    // SCHEDULE
    // =================================================

    if (
        lowerCommand.includes(
            "schedule"
        ) ||

        lowerCommand.includes(
            "calendar"
        ) ||

        lowerCommand.includes(
            "what do i have today"
        ) ||

        lowerCommand.includes(
            "what's on today"
        )
    ) {

        response.innerText =
            "JARVIS: Accessing your schedule. Google Calendar integration is not connected yet.";

        speak(response.innerText);

        input.value = "";

        return;

    }


    // =================================================
    // STUDY REQUEST
    // =================================================

    if (
        lowerCommand.includes(
            "study"
        ) ||

        lowerCommand.includes(
            "revise"
        ) ||

        lowerCommand.includes(
            "revision"
        ) ||

        lowerCommand.includes(
            "physics"
        ) ||

        lowerCommand.includes(
            "chemistry"
        ) ||

        lowerCommand.includes(
            "math"
        )
    ) {

        openStudyHub();

        input.value = "";

        return;

    }


    // =================================================
    // DOCUMENTS
    // =================================================

    if (
        lowerCommand.includes(
            "notes"
        ) ||

        lowerCommand.includes(
            "document"
        ) ||

        lowerCommand.includes(
            "docs"
        ) ||

        lowerCommand.includes(
            "find my"
        )
    ) {

        response.innerText =
            "JARVIS: Document search detected. Google Drive integration will be connected later.";

        speak(response.innerText);

        input.value = "";

        return;

    }


    // =================================================
    // HOMEWORK
    // =================================================

    if (
        lowerCommand.includes(
            "homework"
        ) ||

        lowerCommand.includes(
            "assignment"
        ) ||

        lowerCommand.includes(
            "assignments"
        )
    ) {

        openHomework();

        input.value = "";

        return;

    }


    // =================================================
    // TESTS AND EXAMS
    // =================================================

    if (
        lowerCommand.includes(
            "test"
        ) ||

        lowerCommand.includes(
            "tests"
        ) ||

        lowerCommand.includes(
            "exam"
        ) ||

        lowerCommand.includes(
            "exams"
        )
    ) {

        openTests();

        input.value = "";

        return;

    }


    // =================================================
    // AI CONVERSATION
    // =================================================

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


        // =================================================
        // CHECK FOR ERROR
        // =================================================

        if (!result.ok) {

            throw new Error(
                data.error ||
                "Request failed"
            );

        }


        // =================================================
        // SAVE CONVERSATION
        // =================================================

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


        // =================================================
        // LIMIT CONVERSATION HISTORY
        // =================================================

        if (
            conversationHistory.length > 20
        ) {

            conversationHistory =
                conversationHistory.slice(
                    -20
                );

        }


        // =================================================
        // DISPLAY RESPONSE
        // =================================================

        response.innerText =
            "JARVIS: " +
            data.response;


        // =================================================
        // SPEAK RESPONSE
        // =================================================

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
// OPEN MEMORY PANEL
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
        "JARVIS: Study Hub activated. Configure your study session.";

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


    const response =
        document.getElementById(
            "response"
        );


    // =================================================
    // CHECK TOPIC
    // =================================================

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


    // =================================================
    // SHOW LOADING
    // =================================================

    result.innerHTML = `

        <div class="response-label">
            JARVIS STUDY SYSTEM
        </div>

        <p>
            Analysing your study requirements...
        </p>

        <p>
            Generating a ${duration}-minute
            ${subject} study session.
        </p>

    `;


    response.innerText =
        "JARVIS: Building your personalised study session...";


    // =================================================
    // BUILD AI REQUEST
    // =================================================

    const studyPrompt = `

You are JARVIS, a personal AI study assistant.

Create a structured study session for a secondary school student.

Subject: ${subject}

Topic: ${topic}

Duration: ${duration} minutes

Study goal: ${goal}

Create a practical study plan.

Include:

1. A short warm-up or recall activity.
2. The key concepts the student should focus on.
3. A main learning or revision activity.
4. Practice questions or tasks.
5. A short final recall/check.
6. A recommended breakdown of the ${duration} minutes.

Keep it clear, realistic and suitable for a secondary school student.

Do not make the session unnecessarily complicated.

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


        // =================================================
        // CHECK ERROR
        // =================================================

        if (!aiResult.ok) {

            throw new Error(
                data.error ||
                "Study session generation failed."
            );

        }


        // =================================================
        // DISPLAY STUDY SESSION
        // =================================================

        result.innerHTML = `

            <div class="response-label">
                JARVIS STUDY SESSION
            </div>

            <p>
                <strong>
                    ${subject}
                </strong>
            </p>

            <p>
                <strong>
                    Topic:
                </strong>
                ${topic}
            </p>

            <p>
                <strong>
                    Duration:
                </strong>
                ${duration} minutes
            </p>

            <hr>

            <div class="study-ai-response">
                ${formatStudyResponse(data.response)}
            </div>

        `;


        // =================================================
        // SAVE TO CONVERSATION
        // =================================================

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
                conversationHistory.slice(
                    -20
                );

        }


        response.innerText =
            "JARVIS: Your study session is ready.";


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
                I couldn't generate the study session right now.
            </p>

            <p>
                Please check your AI connection and try again.
            </p>

        `;


        response.innerText =
            "JARVIS: I couldn't generate your study session.";

        speak(
            response.innerText
        );

    }

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


    // Escape HTML
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


    // Bold markdown
    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // Headings
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


    // Numbered lists
    formatted =
        formatted.replace(
            /^(\d+)\. (.*)$/gm,
            "<p><strong>$1.</strong> $2</p>"
        );


    // Bullet points
    formatted =
        formatted.replace(
            /^[-•] (.*)$/gm,
            "<p>• $1</p>"
        );


    // Line breaks
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
        document.getElementById("response");


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
        document.getElementById("response");


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
        document.getElementById("response");


    response.innerText =
        "JARVIS: Test and examination system activated. Your test database has not been connected yet.";


    speak(
        response.innerText
    );

}


// =====================================================
// LEGACY STUDY BUTTON
// =====================================================

function startStudy() {

    openStudyHub();

}


// =====================================================
// VOICE RECOGNITION
// =====================================================

function startListening() {

    const response =
        document.getElementById("response");


    const input =
        document.getElementById("commandInput");


    // =================================================
    // CHECK BROWSER SUPPORT
    // =================================================

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


    // =================================================
    // VOICE RESULT
    // =================================================

    recognition.onresult =
        function(event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            input.value =
                transcript;


            response.innerText =
                "JARVIS: Command received. Processing...";


            sendCommand();

        };


    // =================================================
    // VOICE ERROR
    // =================================================

    recognition.onerror =
        function() {

            response.innerText =
                "JARVIS: I couldn't hear that. Please try again.";

            speak(
                response.innerText
            );

        };


    // =================================================
    // VOICE END
    // =================================================

    recognition.onend =
        function() {

            console.log(
                "Voice recognition ended."
            );

        };

}


// =====================================================
// ENTER KEY SUPPORT
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


        // Close Study Hub when clicking
        // outside the main box

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
