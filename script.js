// =====================================================
// JARVIS - MAIN SCRIPT
// AI CONVERSATION + PERSISTENT MEMORY + VOICE
// =====================================================


// =====================================================
// CONVERSATION MEMORY
// =====================================================

let conversationHistory = [];


// =====================================================
// PERSISTENT JARVIS MEMORY
// =====================================================

let jarvisMemory =
    JSON.parse(
        localStorage.getItem("jarvisMemory") || "[]"
    );


// Save memory to the browser
function saveMemory() {

    localStorage.setItem(
        "jarvisMemory",
        JSON.stringify(jarvisMemory)
    );

}


// Add something to JARVIS memory
function addMemory(memory) {

    if (!memory || memory.trim() === "") {
        return;
    }

    jarvisMemory.push(memory.trim());

    saveMemory();

}


// Clear all saved memory
function clearMemory() {

    jarvisMemory = [];

    saveMemory();

}


// Get saved memory
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


    // Empty command
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

        let memory = command
            .replace(/^remember that /i, "")
            .replace(/^remember /i, "")
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


    // =================================================
    // SHOW MEMORY
    // =================================================

    if (
        lowerCommand.includes("what do you remember") ||
        lowerCommand.includes("show my memory") ||
        lowerCommand.includes("what do you know about me")
    ) {

        const memoryText =
            getMemoryText();

        response.innerText =
            "JARVIS: Here is what I remember:\n\n" +
            memoryText;

        speak(
            "Here is what I remember. " +
            memoryText
        );

        input.value = "";

        return;
    }


    // =================================================
    // SCHEDULE
    // =================================================

    if (
        lowerCommand.includes("schedule") ||
        lowerCommand.includes("calendar") ||
        lowerCommand.includes("what do i have today") ||
        lowerCommand.includes("what's on today")
    ) {

        response.innerText =
            "JARVIS: Accessing your schedule. Google Calendar integration is not connected yet.";

        speak(response.innerText);

        input.value = "";

        return;
    }


    // =================================================
    // STUDY
    // =================================================

    if (
        lowerCommand.includes("study") ||
        lowerCommand.includes("revise") ||
        lowerCommand.includes("revision") ||
        lowerCommand.includes("physics") ||
        lowerCommand.includes("chemistry") ||
        lowerCommand.includes("math")
    ) {

        response.innerText =
            "JARVIS: Study mode detected. I can help you plan your revision once your study data is connected.";

        speak(response.innerText);

        input.value = "";

        return;
    }


    // =================================================
    // DOCUMENTS
    // =================================================

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


    // =================================================
    // HOMEWORK
    // =================================================

    if (
        lowerCommand.includes("homework") ||
        lowerCommand.includes("assignment") ||
        lowerCommand.includes("assignments")
    ) {

        response.innerText =
            "JARVIS: Homework system detected. Your task database has not been connected yet.";

        speak(response.innerText);

        input.value = "";

        return;
    }


    // =================================================
    // TESTS / EXAMS
    // =================================================

    if (
        lowerCommand.includes("test") ||
        lowerCommand.includes("tests") ||
        lowerCommand.includes("exam") ||
        lowerCommand.includes("exams")
    ) {

        response.innerText =
            "JARVIS: Test and examination system detected. I will need your test data to provide your schedule.";

        speak(response.innerText);

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

        const result = await fetch(
            "https://jarvis-ai.tvisha-sanish.workers.dev/",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    message: message,

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
                data.error || "Request failed"
            );

        }


        // =================================================
        // SAVE CONVERSATION
        // =================================================

        conversationHistory.push({

            role: "user",

            content: message

        });


        conversationHistory.push({

            role: "assistant",

            content: data.response

        });


        // =================================================
        // LIMIT CONVERSATION MEMORY
        // =================================================

        // Keep the most recent 20 messages
        // so the request does not become unnecessarily large.

        if (conversationHistory.length > 20) {

            conversationHistory =
                conversationHistory.slice(-20);

        }


        // =================================================
        // DISPLAY RESPONSE
        // =================================================

        response.innerText =
            "JARVIS: " + data.response;


        // =================================================
        // SPEAK RESPONSE
        // =================================================

        speak(response.innerText);


    } catch (error) {

        console.error(
            "JARVIS connection error:",
            error
        );


        response.innerText =
            "JARVIS: I'm having trouble connecting to my AI system.";


        speak(response.innerText);

    }

}


// =====================================================
// VOICE RECOGNITION
// =====================================================

function startListening() {

    const response =
        document.getElementById("response");

    const input =
        document.getElementById("commandInput");


    // Check browser support

    if (!("webkitSpeechRecognition" in window)) {

        response.innerText =
            "JARVIS: Voice recognition is not supported by this browser.";

        speak(response.innerText);

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
                event.results[0][0].transcript;


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

            speak(response.innerText);

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
// SCHEDULE BUTTON
// =====================================================

function openSchedule() {

    const response =
        document.getElementById("response");


    response.innerText =
        "JARVIS: Calendar system detected. Google Calendar integration is coming next.";


    speak(response.innerText);

}


// =====================================================
// STUDY BUTTON
// =====================================================

function startStudy() {

    const response =
        document.getElementById("response");


    response.innerText =
        "JARVIS: Study Hub activated.";


    speak(response.innerText);

}


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
        new SpeechSynthesisUtterance(text);


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
