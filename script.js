const typingForm = document.querySelector(".typing-form");
24
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deletechatButton = document.querySelector("#delete-chat-button");
const suggestions = document.querySelectorAll(".suggestion-list .suggestions");
let userMessage = null;
let isResponseGenerating = false;
const API_KEY = "AIzaSyDRJCQ6pI9yObtFN_wjlaHyiVMKz0D79OI";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash latest:generateContent?key=${API_KEY}`;
const loadLocalStorageData = () => {
const savedChats = localStorage.getItem("savedChats");
const isLightMode = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light_mode", isLightMode);
toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
chatList.innerHTML = savedChats || "";
document.body.classList.toggle("hide-header", savedChats);
chatList.scrollTo(0, chatList.scrollHeight);
};
loadLocalStorageData();
const createMessageElement = (content, ...classes) => {
const div = document.createElement("div");
div.classList.add("message", ...classes);
div.innerHTML = content;
25
return div;
};
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
const words = text.split(" ");
let currentWordIndex = 0;
const typingInterval = setInterval(() => {
textElement.innerText +=
(currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
incomingMessageDiv.querySelector(".icon").classList.add("hide");
if (currentWordIndex === words.length) {
clearInterval(typingInterval);
incomingMessageDiv.querySelector(".icon").classList.remove("hide");
localStorage.setItem("savedChats", chatList.innerHTML);
}
chatList.scrollTo(0, chatList.scrollHeight);
}, 75);
};
const generateAPIResponse = async (incomingMessageDiv) => {
const textElement = incomingMessageDiv.querySelector(".text");
try {
const response = await fetch(API_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: [
{
role: "user",
parts: [{ text: userMessage }],
},
],
}),
});
const data = await response.json();
if (!response.ok) throw new Error(data.error.message);
const apiResponse = data.candidates[0].content.parts[0].text.replace(
/\*\*(.*?)\*\*/g,
"$1"
);
showTypingEffect(apiResponse, textElement, incomingMessageDiv);
} catch (error) {
isResponseGenerating = false;
textElement.innerText = error.message;
textElement.classList.add("error");
} finally {
incomingMessageDiv.classList.remove("loading");
}
27
};
const showLoadingAnimation = () => {
const html = ` <div class="message-content">
<img src="gemini.svg" alt="Gemini Image" class="avatar">
<p class="text"></p>
<div class="loading-indicator">
<div class="loading-bar"></div>
<div class="loading-bar"></div>
<div class="loading-bar"></div>
</div>
</div> 
<span onclick="copyMessage(this)" class="icon material-symbols-rounded">
content_copy
</span>`;
const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
chatList.appendChild(incomingMessageDiv);
chatList.scrollTo(0, chatList.scrollHeight);
generateAPIResponse(incomingMessageDiv);
};
const copyMessage = (copyIcon) => {
const messageText = copyIcon.parentElement.querySelector(".text").innerText;
navigator.clipboard.writeText(messageText);
copyIcon.innerText = "done";
28
setTimeout(() => (copyIcon.innerText = "content_copy"), 1000);
};
suggestions.forEach((suggestion) => {
suggestion.addEventListener("click", () => {
userMessage = suggestion.querySelector(".text").innerText;
handleOutgoingChat();
});
});
const handleOutgoingChat = () => {
userMessage =
typingForm.querySelector(".typing-input").value.trim() || userMessage;
if (!userMessage || isResponseGenerating) return;
isResponseGenerating = true;
const html = `<div class="message-content">
<img src="user_img.jpg" alt="User Image" class="avatar">
<p class="text"></p>
</div>`;
const outgoingMessageDiv = createMessageElement(html, "outgoing");
outgoingMessageDiv.querySelector(".text").innerText = userMessage;
chatList.appendChild(outgoingMessageDiv);
document.body.classList.add("hide-header");
typingForm.reset();
chatList.scrollTo(0, chatList.scrollHeight);
29
setTimeout(showLoadingAnimation, 500);
};
toggleThemeButton.addEventListener("click", () => {
const isLightMode = document.body.classList.toggle("light_mode");
localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});
deletechatButton.addEventListener("click", () => {
if (confirm("Are you want to delete all messages;?")) {
localStorage.removeItem("savedChats");
loadLocalStorageData();
}
});
typingForm.addEventListener("submit", (e) => {
e.preventDefault();
handleOutgoingChat();
});
