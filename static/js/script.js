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

        msgDiv.innerHTML = isSender
            ? `<p>${msg.message}</p>`
            : `
        <div class="avatar">${getAvatarIcon(sender.name)}</div>
        <div>
            <div style="font-weight: bold; font-size: 0.8rem; margin-bottom: 4px;">${sender.name}</div>
            <p>${msg.message}</p>
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
        document.querySelector(".chat").classList.remove("active");
        document.querySelector(".messages").classList.add("active");

        if (window.innerWidth <= 1024) {
            document.querySelectorAll(".message-item").forEach(item => {
                item.classList.remove("active");
            });

            document.body.classList.remove("hide-sidebar");
        }
    }
});

// ==============================
// FETCH DATA JSON & INISIALISASI
// ==============================
fetch("https://gist.githubusercontent.com/asharijuang/23745f3132fa30e666db68d2bf574e4a/raw/5d556dbb9c2aea9fdf3e1ec96e45f62a88cea7b6/chat_response.json")
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
