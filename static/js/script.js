document.addEventListener("DOMContentLoaded", function () {
  const blogList = document.getElementById("blogList");
  const blogContent = document.getElementById("blogContent");
  const chatbox = document.getElementById("chatmessage");
  const chatbotContainer = document.getElementById("chatbotContainer");
  const chatForm = document.querySelector(".chat-input"); 
  const chatbotButton = document.getElementById("chatbotButton");
  let isChatbotOpen = false;
  document.addEventListener("DOMContentLoaded", function () {
    const blogList = document.getElementById("blogList");
    const blogContent = document.getElementById("blogContent");

    function fetchBlogContent(postId) {
        fetch(`/api/blog/${postId}`)
            .then(response => response.json())
            .then(data => {
                blogContent.innerHTML = `<h1>${data.title}</h1><p>${data.body}</p>`;
            })
            .catch(error => console.error('Error fetching blog post:', error));
    }

    blogList.addEventListener("click", function (event) {
        event.preventDefault();
        if (event.target.tagName === "A") {
            const postId = event.target.getAttribute("data-post-id");
            fetchBlogContent(postId);
        }
    });
});


  function sendMessageToServer(message) {
    return fetch('/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: new URLSearchParams({ message: message }) 
    })
    .then(response => response.json())
    .catch(error => console.error('Error sending message to server:', error));
  }

  function displayChatResponse(chatData) {
    if (!chatData || !Array.isArray(chatData)) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.classList.add("bot"); 
      messageDiv.innerHTML = "<p class='message-text'>Sorry, I couldn't understand that.</p>";
      chatbox.appendChild(messageDiv);
    } else {
      chatData.forEach(data => {
        if (data.sender === 'user') {
          appendMessage("user", data.message); 
        } else {
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("message");
          messageDiv.classList.add(data.sender.toLowerCase());
          messageDiv.innerHTML = `<p class="message-text">${data.message.replace("\n", "<br>")}</p>`;
          chatbox.appendChild(messageDiv);
        }
      });
    }
    scrollToBottom();
  }
  

  function scrollToBottom() {
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function toggleChatbot() {
    if (!isChatbotOpen) {
      blogContent.style.display = "none";
      chatbotContainer.style.display = "block";
      chatbotButton.textContent = "View Blogs";
      isChatbotOpen = true;
    } else {
      blogContent.style.display = "block";
      chatbotContainer.style.display = "none";
      chatbotButton.textContent = "Open Chatbot";
      isChatbotOpen = false;
    }
  }

  function handleChatFormSubmit(event) {
    event.preventDefault();
    const messageInput = document.getElementById("message");
    const message = messageInput.value.trim();
    if (message !== "") {
      appendMessage("user", message); 
      sendMessageToServer(message)
        .then(data => {
          displayChatResponse(data); 
        });
      messageInput.value = ""; 
    }
  }
  
  function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(sender.toLowerCase());
    messageDiv.innerHTML = `<p class="message-text">${message.replace("\n", "<br>")}</p>`;
    chatbox.appendChild(messageDiv);
  }
  

  blogList.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target.tagName === "A") {
      const postId = event.target.getAttribute("data-post-id");
      fetch(`/api/blog/${postId}`)
        .then(response => response.json())
        .then(data => {
          blogContent.innerHTML = `<h1>${data.title}</h1><p>${data.body}</p>`;
          blogContent.style.display = "block";
          chatbotContainer.style.display = "none"; 
          isChatbotOpen = false;
        })
        .catch(error => console.error('Error fetching blog post:', error));
    }
  });

  chatbotButton.addEventListener("click", toggleChatbot);

  chatForm.addEventListener("submit", handleChatFormSubmit);

});
