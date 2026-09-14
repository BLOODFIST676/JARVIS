function sendCommand() {

    const input = document.getElementById("commandInput");

    const command = input.value.trim();

    const response = document.getElementById("response");


    if (command === "") {

        response.innerText =
            "JARVIS: Please give me a command.";

        return;
    }


    response.innerText =
        "JARVIS: Command received — " + command;


    input.value = "";
}


function startListening() {

    const response = document.getElementById("response");

    response.innerText =
        "JARVIS: Voice interface will be activated in the next stage.";

}


function openSchedule() {

    const response = document.getElementById("response");

    response.innerText =
        "JARVIS: Calendar system is currently offline. Google Calendar integration will be added later.";

}


function startStudy() {

    const response = document.getElementById("response");

    response.innerText =
        "JARVIS: Study Hub is ready for development.";

}
