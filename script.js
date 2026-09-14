// =========================
// JARVIS CONVERSATION MEMORY
// =========================

let conversationHistory = [];


// =========================
// SEND COMMAND
// =========================

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


    // =========================
    // SCHEDULE
    // =========================

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


    // =========================
    // STUDY
    // =========================

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


    // =========================
    // DOCUMENTS
    // =========================

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


    // =========================
    // HOMEWORK
    // =========================

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


    // =========================
    // TESTS / EXAMS
    // =========================

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


    // =========================
    // AI CONVERSATION
    // =========================

    askJARVIS(command);

    input.value = "";
}


// =========================
// ASK JARVIS AI
// =========================

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
                    history: conversationHistory
                })
            }
        );


        const data =
            await result.json();


        if (!result.ok) {

            throw new Error(
                data.error || "Request failed"
            );
        }


        // =========================
        // SAVE CONVERSATION
        // =========================

        conversationHistory.push({
            role: "user",
            content: message
        });


        conversationHistory.push({
            role: "assistant",
            content: data.response
        });


        // =========================
        // DISPLAY RESPONSE
        // =========================

        response.innerText =
            "JARVIS: " + data.response;


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


// =========================
// VOICE RECOGNITION
// =========================

function startListening() {

    const response =
        document.getElementById("response");

    const input =
        document.getElementById("commandInput");


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


    recognition.onerror =
        function() {

            response.innerText =
                "JARVIS: I couldn't hear that. Please try again.";

            speak(response.innerText);

        };


    recognition.onend =
        function() {

            console.log(
                "Voice recognition ended."
            );

        };

}


// =========================
// SCHEDULE BUTTON
// =========================

function openSchedule() {

    const response =
        document.getElementById("response");


    response.innerText =
        "JARVIS: Calendar system detected. Google Calendar integration is coming next.";


    speak(response.innerText);

}


// =========================
// STUDY BUTTON
// =========================

function startStudy() {

    const response =
        document.getElementById("response");


    response.innerText =
        "JARVIS: Study Hub activated.";


    speak(response.innerText);

}


// =========================
// TEXT TO SPEECH
// =========================

function speak(text) {

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
