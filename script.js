function sendCommand() {

    const input = document.getElementById("commandInput");
    const command = input.value.trim().toLowerCase();

    const response = document.getElementById("response");

    if (command === "") {
        response.innerText = "JARVIS: Please give me a command.";
        speak(response.innerText);
        return;
    }


    // SCHEDULE
    if (
        command.includes("schedule") ||
        command.includes("calendar") ||
        command.includes("what do i have today") ||
        command.includes("what's on today")
    ) {

        response.innerText =
            "JARVIS: Accessing your schedule. Google Calendar integration is not connected yet.";

        speak(response.innerText);
        input.value = "";
        return;
    }


    // STUDY
    if (
        command.includes("study") ||
        command.includes("revise") ||
        command.includes("revision") ||
        command.includes("physics") ||
        command.includes("chemistry") ||
        command.includes("math")
    ) {

        response.innerText =
            "JARVIS: Study mode detected. I can help you plan your revision once your study data is connected.";

        speak(response.innerText);
        input.value = "";
        return;
    }


    // DOCUMENTS
    if (
        command.includes("notes") ||
        command.includes("document") ||
        command.includes("docs") ||
        command.includes("find my")
    ) {

        response.innerText =
            "JARVIS: Document search detected. Google Drive integration will be connected later.";

        speak(response.innerText);
        input.value = "";
        return;
    }


    // HOMEWORK
    if (
        command.includes("homework") ||
        command.includes("assignment") ||
        command.includes("assignments")
    ) {

        response.innerText =
            "JARVIS: Homework system detected. Your task database has not been connected yet.";

        speak(response.innerText);
        input.value = "";
        return;
    }


    // TESTS
    if (
        command.includes("test") ||
        command.includes("tests") ||
        command.includes("exam") ||
        command.includes("exams")
    ) {

        response.innerText =
            "JARVIS: Test and examination system detected. I will need your test data to provide your schedule.";

        speak(response.innerText);
        input.value = "";
        return;
    }


    // UNKNOWN COMMAND
    response.innerText =
        "JARVIS: I understood your command, but I don't have the required system connected yet.";

    speak(response.innerText);

    input.value = "";
}


// ================================
// VOICE RECOGNITION
// ================================

function startListening() {

    const response = document.getElementById("response");
    const input = document.getElementById("commandInput");

    if (!("webkitSpeechRecognition" in window)) {

        response.innerText =
            "JARVIS: Voice recognition is not supported by this browser.";

        speak(response.innerText);
        return;
    }

    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-SG";
    recognition.continuous = false;
    recognition.interimResults = false;

    response.innerText =
        "JARVIS: Listening...";

    speak("JARVIS: Listening...");

    recognition.start();


    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;

        input.value = transcript;

        response.innerText =
            "JARVIS: Command received. Processing...";

        sendCommand();
    };


    recognition.onerror = function() {

        response.innerText =
            "JARVIS: I couldn't hear that. Please try again.";

        speak(response.innerText);

    };


    recognition.onend = function() {

        console.log("Voice recognition ended.");

    };

}


// ================================
// TEXT TO SPEECH
// ================================

function speak(text) {

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);
}


// ================================
// SCHEDULE
// ================================

function openSchedule() {

    const response = document.getElementById("response");

    response.innerText =
        "JARVIS: Calendar system detected. Google Calendar integration is coming next.";

    speak(response.innerText);
}


// ================================
// STUDY HUB
// ================================

function startStudy() {

    const response = document.getElementById("response");

    response.innerText =
        "JARVIS: Study Hub activated.";

    speak(response.innerText);
}
```
