function sendCommand() {

    const command = document.getElementById("commandInput").value;

    const response = document.getElementById("response");

    if (command.trim() === "") {
        response.innerText = "Please give me a command.";
        return;
    }

    response.innerText =
        "Command received: " + command;
}
