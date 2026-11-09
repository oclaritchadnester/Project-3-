const petForm = document.getElementById("petForm");
const petList = document.getElementById("petList");
const symptomForm = document.getElementById("symptomForm");
const resultBox = document.getElementById("assessmentResult");
const historyBox = document.getElementById("history");

let pets = JSON.parse(localStorage.getItem("pawfurPets") || "[]");
let history = JSON.parse(localStorage.getItem("pawfurHistory") || "[]");

function saveData() {
    localStorage.setItem("pawfurPets", JSON.stringify(pets));
    localStorage.setItem("pawfurHistory", JSON.stringify(history));
}

function renderPets() {
    petList.innerHTML = "";

    if (pets.length === 0) {
        petList.textContent = "No pet profiles yet. Add your pet above.";
        return;
    }

    pets.forEach(pet => {
        const card = document.createElement("div");
        card.className = "pet-card";
        card.textContent = `${pet.type === "Dog" ? "🐶" : "🐱"} ${pet.name} · ${pet.type} · ${pet.age || "Age not entered"}`;
        petList.appendChild(card);
    });
}

function renderHistory() {
    if (history.length === 0) {
        historyBox.innerHTML = "";
        return;
    }

    historyBox.innerHTML = "<h3>Recent symptom records</h3>";
    history.slice(-5).reverse().forEach(item => {
        const p = document.createElement("p");
        p.textContent = `${item.date} — ${item.urgency}`;
        historyBox.appendChild(p);
    });
}

petForm.addEventListener("submit", event => {
    event.preventDefault();

    pets.push({
        name: document.getElementById("petName").value.trim(),
        type: document.getElementById("petType").value,
        age: document.getElementById("petAge").value.trim()
    });

    saveData();
    renderPets();
    petForm.reset();
});

symptomForm.addEventListener("submit", async event => {
    event.preventDefault();

    const symptoms = [...symptomForm.querySelectorAll('input[type="checkbox"]:checked')]
        .map(input => input.value);

    try {
        const response = await fetch("/api/assess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();

        resultBox.classList.remove("hidden");
        resultBox.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = data.urgency;
        const message = document.createElement("p");
        message.textContent = data.message;
        const care = document.createElement("p");
        care.textContent = "General guidance: " + data.homeCare;

        resultBox.append(heading, message, care);

        history.push({
            date: new Date().toLocaleString(),
            urgency: data.urgency,
            symptoms: symptoms
        });

        saveData();
        renderHistory();
    } catch (error) {
        resultBox.classList.remove("hidden");
        resultBox.textContent =
            "Unable to connect. Please make sure the PawFur Java application is running.";
    }
});

document.getElementById("clinicForm").addEventListener("submit", event => {
    event.preventDefault();

    const location = document.getElementById("location").value.trim();
    const query = encodeURIComponent("veterinary clinic near " + location);
    const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + query;

    window.open(mapsUrl, "_blank", "noopener");
});

renderPets();
renderHistory();
