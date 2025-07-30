// ==============================
// KONSTANTA & VARIABEL GLOBAL
// ==============================
const loggedInUser = "customer@mail.com";

const chatBody = document.querySelector(".chat-body");
const chatHeader = document.querySelector(".chat-header");
const profileSections = document.querySelectorAll(".sidebar-footer .info, .sidebar-header .info");

const newChatBtn = document.querySelector(".new-chat");
const popup = document.getElementById("newChatPopup");
const closePopupBtn = popup.querySelector(".close-popup");
const participantList = popup.querySelector(".participant-list");

let room = null;
let messages = [];
let currentReceiver = null;
let currentNav = "Messages";

// ==============================
// HELPER FUNCTION
// ==============================
function truncate(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength).trim() + "..." : text;
}

function getAvatarIcon(name) {
    if (name.toLowerCase().includes("admin")) {
        return '<i class="fa-solid fa-user-tie"></i>';
    } else if (name.toLowerCase().includes("agent")) {
        return '<i class="fa-solid fa-user"></i>';
    } else {
        return '<i class="fa-solid fa-user"></i>';
    }
}

// ==============================
// TAMPILKAN CHAT DENGAN PESERTA
// ==============================
function renderChatWith(participant) {
    currentReceiver = participant;

    chatHeader.innerHTML = `
        <div class="back-btn"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="avatar large">${getAvatarIcon(participant.name)}</div>
        <div>
            <strong>${participant.name}</strong>
        </div>
    `;

    chatBody.innerHTML = "";

    chatBody.innerHTML = "";

    if (window.innerWidth <= 1024) {
        document.querySelector(".chat").classList.add("active");
        document.querySelector(".messages").classList.remove("active");
        document.body.classList.add("hide-sidebar");
    }
}


// ==============================
// TAMPILKAN LIST PESERTA (POPUP)
// ==============================
function renderParticipantList(participants) {
    participantList.innerHTML = "";
    participants
        .filter(p => p.id !== loggedInUser)
        .forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="popup-item">
                    <div class="popup-avatar">${getAvatarIcon(p.name)}</div>
                    <span>${p.name}</span>
                </div>`;
            li.addEventListener("click", () => {
                renderChatWith(p);
                popup.style.display = "none";
                document.querySelector(".chat").classList.remove("chat-group-hidden");
            });
            participantList.appendChild(li);
        });
}

// ==============================
// TAMPILKAN LIST PESAN PRIBADI
// ==============================
function renderMessageList(participants) {
    const messageList = document.querySelector(".message-list");
    messageList.innerHTML = "";

    const info = document.createElement("p");
    info.style.color = "gray";
    info.style.textAlign = "center";
    info.style.marginTop = "2rem";
    messageList.appendChild(info);
}

// ==============================
// TAMPILKAN LIST GRUP
// ==============================
function renderGroupList() {
    const messageList = document.querySelector(".message-list");
    messageList.innerHTML = "";

    const lastMsg = [...messages].reverse().find(msg => msg.message);

    let senderName = "(unknown)";
    if (lastMsg) {
        const sender = room.participant.find(p => p.id === lastMsg.sender);
        if (sender) {
            senderName = sender.name;
        }
    }

    const item = document.createElement("div");
    item.className = "message-item";
    item.innerHTML = `
        <div class="avatar">
            <img src="${room.image_url}" alt="Group Image" style="width: 40px; height: 40px; border-radius: 50%;" />
        </div>
        <div class="message-info">
            <strong>${room.name}</strong>
            <p>${lastMsg ? `${senderName} : ${truncate(lastMsg.message, 30)}` : "(tidak ada pesan)"}</p>
        </div>
        <div class="message-meta"></div>
    `;

    item.addEventListener("click", () => {
        renderGroupChat();
        document.querySelectorAll(".message-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        document.querySelector(".chat").style.display = "flex";

        if (window.innerWidth <= 1024) {
            document.querySelector(".chat").classList.add("active");
            document.querySelector(".messages").classList.remove("active");
            document.body.classList.add("hide-sidebar");
        }
    });

    messageList.appendChild(item);
}


// ==============================
// TAMPILKAN CHAT GRUP
// ==============================
function renderGroupChat() {
    document.querySelector(".chat").classList.remove("chat-group-hidden");

    chatHeader.innerHTML = `
        <div class="back-btn"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="avatar large">
            <img src="${room.image_url}" style="width: 50px; height: 50px; border-radius: 50%;" />
        </div>
        <div>
            <strong>${room.name}</strong>
            <p class="status">${room.participant.map(p => p.name).join(", ")}</p>
        </div>
    `;

    chatBody.innerHTML = "";

    messages.forEach(msg => {
        const isSender = msg.sender === loggedInUser;
        const sender = room.participant.find(p => p.id === msg.sender);

        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${isSender ? 'sent' : 'received'}`;

        let contentHTML = "";
        if (msg.type === "text") {
            contentHTML = `<p>${msg.message}</p>`;
        } else if (msg.type === "image") {
            contentHTML = `<img src="${msg.message}" alt="image" style="max-width:100%; border-radius: 8px;" />`;
        } else if (msg.type === "video") {
            contentHTML = `
                <video controls style="max-width:100%; border-radius: 8px;">
                    <source src="${msg.message}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`;
        } else if (msg.type === "pdf") {
            const fileName = msg.message.split('/').pop(); // ambil nama file dari URL
            contentHTML = `
        <a href="${msg.message}" target="_blank" style="color:blue; text-decoration:underline;">
            ${fileName}
        </a>`;
        }


        msgDiv.innerHTML = isSender
            ? contentHTML
            : `
            <div class="avatar">${getAvatarIcon(sender.name)}</div>
            <div>
                <div style="font-weight: bold; font-size: 0.8rem; margin-bottom: 4px;">${sender.name}</div>
                ${contentHTML}
            </div>
        `;

        chatBody.appendChild(msgDiv);
    });

    if (window.innerWidth <= 1024) {
        document.querySelector(".chat").classList.add("active");
        document.querySelector(".messages").classList.remove("active");
        document.body.classList.add("hide-sidebar");
    }
}



function renderGroupListInPopup() {
    participantList.innerHTML = "";

    const li = document.createElement("li");
    li.innerHTML = `
        <div class="popup-item">
            <div class="popup-avatar">
                <img src="${room.image_url}" alt="Group Image" style="width: 35px; height: 35px; border-radius: 50%;" />
            </div>
            <span>${room.name}</span>
        </div>
    `;
    li.addEventListener("click", () => {
        renderGroupChat();
        popup.style.display = "none";
        document.querySelector(".chat").classList.remove("chat-group-hidden");
    });

    participantList.appendChild(li);
}


// ==============================
// EVENT: SIDEBAR NAVIGATION
// ==============================
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");

        const label = item.textContent.trim();

        if (label === "Groups") {
            currentNav = "Groups";
            renderGroupList();
            document.querySelector(".chat").classList.add("chat-group-hidden");

            if (window.innerWidth <= 1024) {
                document.querySelector(".messages").classList.add("active");
                document.querySelector(".chat").classList.remove("active");
            }
        } else if (label === "Messages") {
            currentNav = "Messages";
            renderMessageList(room.participant);
            document.querySelector(".chat").classList.add("chat-group-hidden");

            if (window.innerWidth <= 1024) {
                document.querySelector(".messages").classList.add("active");
                document.querySelector(".chat").classList.remove("active");
            }
        }
    });
});

// ==============================
// EVENT: TOMBOL BACK
// ==============================
document.addEventListener("click", function (e) {
    if (e.target.closest(".back-btn")) {
        const chatPanel = document.querySelector(".chat");
        const messagesPanel = document.querySelector(".messages");

        chatPanel.classList.remove("active");
        messagesPanel.classList.add("active");
        document.body.classList.remove("hide-sidebar");
        chatPanel.classList.add("chat-group-hidden");
        document.querySelectorAll(".message-item").forEach(item => {
            item.classList.remove("active");
        });

        if (currentNav === "Messages") {
            renderMessageList(room.participant);
        } else {
            renderGroupList();
        }
    }
});


// ==============================
// FETCH DATA JSON & INISIALISASI
// ==============================
fetch("https://gist.githubusercontent.com/Agustiann/faa6c6554af990984c4d6118839e2308/raw/45de44513fdcb9183ab13a2755631b91952df916/chat_response.json")
    .then(res => res.json())
    .then(data => {
        room = data.results[0].room;
        messages = data.results[0].comments;

        const userProfile = room.participant.find(p => p.id === loggedInUser);
        if (userProfile) {
            profileSections.forEach(section => {
                section.querySelector("strong").textContent = userProfile.name;
                section.querySelector("small").textContent = userProfile.id;
            });
        }

        renderMessageList(room.participant);
        document.querySelector(".chat").classList.add("chat-group-hidden");

        if (window.innerWidth <= 1024) {
            document.querySelector(".messages").classList.add("active");
        }

        newChatBtn.addEventListener("click", () => {
            const popupTitle = document.getElementById("popupTitle");

            if (currentNav === "Messages") {
                renderParticipantList(room.participant);
                popupTitle.textContent = "Choose a user";
            } else if (currentNav === "Groups") {
                renderGroupListInPopup();
                popupTitle.textContent = "Choose a group";
            }

            popup.style.display = "flex";
        });

        closePopupBtn.addEventListener("click", () => {
            popup.style.display = "none";
        });
    })
    .catch(err => {
        chatBody.innerHTML = "<p style='color:red;'>Failed to load messages</p>";
        console.error(err);
    });

// ==============================
// EVENT: FILE PICKER DENGAN DROPDOWN
// ==============================
const fileInputIcon = document.querySelector(".file-input i");
const fileInputWrapper = document.querySelector(".file-input");
const filePicker = document.getElementById("filePicker");
const fileOptions = document.querySelectorAll(".file-option");

fileInputIcon.addEventListener("click", () => {
    fileInputWrapper.classList.toggle("show");
});

fileOptions.forEach(option => {
    option.addEventListener("click", () => {
        const type = option.getAttribute("data-type");

        if (type === "image") {
            filePicker.accept = "image/*";
        } else if (type === "video") {
            filePicker.accept = "video/*";
        } else if (type === "pdf") {
            filePicker.accept = "application/pdf";
        }

        fileInputWrapper.classList.remove("show");
        filePicker.click();
    });
});

filePicker.addEventListener("change", () => {
    const file = filePicker.files[0];
    if (!file) return;

    const fileType = file.type;
    const url = URL.createObjectURL(file);

    const newMsg = {
        id: Date.now(),
        type: "",
        message: url,
        sender: loggedInUser,
    };

    if (fileType.startsWith("image/")) {
        newMsg.type = "image";
    } else if (fileType.startsWith("video/")) {
        newMsg.type = "video";
    } else if (fileType === "application/pdf") {
        newMsg.type = "pdf";
    } else {
        alert("Tipe file tidak didukung.");
        return;
    }

    messages.push(newMsg);
    renderGroupChat();

    filePicker.value = "";
});
