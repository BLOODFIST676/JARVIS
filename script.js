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
