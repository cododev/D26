// AI Chatbot JavaScript - Enhanced Version

document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chatButton');
    const chatWidget = document.getElementById('chatWidget');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const closeButton = document.getElementById('chatCloseBtn');

    // Load chat history from localStorage
    loadChatHistory();

    // Toggle chat widget
    chatButton.addEventListener('click', function() {
        openChat();
    });

    // Close button
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeChat();
        });
    }

    function openChat() {
        chatWidget.classList.add('active');
        chatButton.classList.add('active');
        chatInput.focus();

        // Show welcome message only if no chat history
        if (chatMessages.children.length <= 1) { // Only clear chat button
            setTimeout(() => {
                const welcomeVariations = [
                    "Hey there! 👋 I'm the DeediX assistant. What brings you here today?",
                    "Hello! I'm here to help you explore DeediX Technologies. What would you like to know?",
                    "Hi! 😊 Looking for IT solutions or training? I'm here to help!",
                    "Welcome! I can tell you about our services, training programs, and more. What interests you?"
                ];
                const randomWelcome = welcomeVariations[Math.floor(Math.random() * welcomeVariations.length)];
                addBotMessage(randomWelcome);
                showQuickSuggestions(['Our Services', 'Training Programs', 'Contact Info', 'About Us']);
            }, 500);
        }
    }

    function closeChat() {
        chatWidget.classList.remove('active');
        chatButton.classList.remove('active');
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Enable/disable send button based on input
    chatInput.addEventListener('input', function() {
        sendButton.disabled = this.value.trim() === '';
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Add user message
        addUserMessage(message);
        chatInput.value = '';
        sendButton.disabled = true;

        // Show typing indicator
        showTypingIndicator();

        // Simulate AI response delay (more human-like)
        setTimeout(() => {
            hideTypingIndicator();
            const response = getAIResponse(message);
            addBotMessage(response.message, response.copyData);
            if (response.suggestions) {
                showQuickSuggestions(response.suggestions);
            }
        }, 800 + Math.random() * 1200);
    }

    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(message)}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        saveChatHistory();
    }

    function addBotMessage(message, copyData = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';

        let copyButtonHTML = '';
        if (copyData) {
            copyButtonHTML = `<button class="copy-btn" data-copy="${escapeHtml(copyData.text)}" title="Copy ${copyData.label}">
                <i class="fas fa-copy"></i> Copy ${copyData.label}
            </button>`;
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${message}${copyButtonHTML}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);

        // Add copy button functionality
        if (copyData) {
            const copyBtn = messageDiv.querySelector('.copy-btn');
            copyBtn.addEventListener('click', function() {
                copyToClipboard(this.dataset.copy, this);
            });
        }

        scrollToBottom();
        saveChatHistory();
    }

    function showQuickSuggestions(suggestions) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'message bot';
        suggestionsDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="quick-suggestions">
                    ${suggestions.map(s => `<button class="suggestion-chip">${s}</button>`).join('')}
                </div>
            </div>
        `;
        chatMessages.appendChild(suggestionsDiv);

        // Add click handlers to suggestion chips
        suggestionsDiv.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                chatInput.value = this.textContent;
                sendMessage();
            });
        });

        scrollToBottom();
    }

    function showTypingIndicator() {
        typingIndicator.classList.add('active');
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.classList.remove('active');
    }

    function getAIResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Services related
        if (lowerMessage.includes('service') || lowerMessage.includes('what do you do') || lowerMessage.includes('what you do') || lowerMessage.includes('offer')) {
            const responses = [
                "We're your one-stop shop for IT excellence! 🚀<br><br>Here's what we offer:<br>• Cloud Computing & Infrastructure<br>• Cybersecurity Solutions<br>• IT Consulting & Strategy<br>• Custom Software Development<br>• Network Design & Implementation<br>• Data Analytics & Business Intelligence<br><br>Which area interests you most?",
                "Great question! We provide comprehensive IT solutions including:<br><br>• Cloud Computing & Infrastructure ☁️<br>• Cybersecurity Solutions 🔒<br>• IT Consulting & Strategy 💡<br>• Custom Software Development 💻<br>• Network Design & Implementation 🌐<br>• Data Analytics & Business Intelligence 📊<br><br>Want to dive deeper into any of these?"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['Cloud Solutions', 'Cybersecurity', 'Training Programs', 'Contact Us']
            };
        }

        // Training related
        if (lowerMessage.includes('training') || lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('certification')) {
            const responses = [
                "Love your enthusiasm for learning! 📚<br><br>We offer hands-on training in:<br>• Cloud Technologies (AWS, Azure, Google Cloud)<br>• Cybersecurity & Ethical Hacking<br>• Network Administration<br>• Programming & Software Development<br>• Data Science & Analytics<br><br>Whether you're starting out or leveling up, we've got you covered!",
                "Our training programs are designed to get you job-ready! 💪<br><br>We teach:<br>• Cloud Technologies (AWS, Azure, Google Cloud) ☁️<br>• Cybersecurity & Ethical Hacking 🛡️<br>• Network Administration 🌐<br>• Programming & Software Development 👨‍💻<br>• Data Science & Analytics 📊<br><br>Beginners and pros both welcome!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['View Training Schedule', 'Course Pricing', 'Certification Info', 'Contact Us']
            };
        }

        // Contact related
        if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('location') || lowerMessage.includes('call') || lowerMessage.includes('address')) {
            const responses = [
                "Let's connect! Here's how to reach us:<br><br>📧 Email: info@deedixtech.com<br>📞 Phone: +234 807 438-7880<br>📍 Location: Edo State, Nigeria<br><br>We're available Monday to Friday, 9 AM - 6 PM WAT. Looking forward to hearing from you!",
                "We'd love to hear from you! 😊<br><br>📧 Email: info@deedixtech.com<br>📞 Phone: +234 807 438-7880<br>📍 Location: Edo State, Nigeria<br><br>Office hours: Monday-Friday, 9 AM - 6 PM WAT<br>Feel free to reach out anytime!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                copyData: { text: '+2348074387880', label: 'Phone' },
                suggestions: ['Send Message', 'Visit Office', 'Our Services', 'Training Programs']
            };
        }

        // About Us related
        if (lowerMessage.includes('about') || lowerMessage.includes('who are you') || lowerMessage.includes('company') || lowerMessage.includes('deedix')) {
            const responses = [
                "Thanks for asking! 🌟<br><br>DeediX Technologies is Nigeria's leading IT solutions provider. We're passionate about empowering businesses and individuals across Africa with cutting-edge technology, expert training, and world-class support.<br><br>Our mission? To make technology work for YOU, not the other way around!",
                "Great to meet you! 👋<br><br>We're DeediX Technologies - your tech partners based in Nigeria. We specialize in innovative IT solutions, professional training, and comprehensive support services across Africa.<br><br>Think of us as your technology growth partner, here to help you succeed in the digital age!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['Our Services', 'Our Team', 'Training Programs', 'Contact Us']
            };
        }

        // Pricing related
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('pricing') || lowerMessage.includes('budget')) {
            const responses = [
                "Good question! Our pricing is flexible and tailored to your needs:<br><br>💼 IT Consulting: Custom quotes based on scope<br>📚 Training Programs: ₦50,000 - ₦200,000 per course<br>☁️ Cloud Solutions: Flexible monthly plans<br>🔒 Cybersecurity: Starting from ₦150,000<br><br>Want a personalized quote? Let's chat!",
                "We believe in transparent, value-based pricing! 💰<br><br>• IT Consulting: Custom quotes for your project<br>• Training Programs: ₦50,000 - ₦200,000 per course<br>• Cloud Solutions: Pay-as-you-grow monthly plans<br>• Cybersecurity Services: From ₦150,000<br><br>Each business is unique - let's discuss your specific needs!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['Request Quote', 'Training Prices', 'Contact Sales', 'Our Services']
            };
        }

        // Cloud related
        if (lowerMessage.includes('cloud') || lowerMessage.includes('aws') || lowerMessage.includes('azure') || lowerMessage.includes('google cloud')) {
            const responses = [
                "The cloud is our specialty! ☁️<br><br>We offer:<br>• Cloud Migration & Deployment<br>• AWS, Azure, Google Cloud Platform<br>• Infrastructure Design & Optimization<br>• Cloud Security & Compliance<br>• Cost Optimization Strategies<br>• 24/7 Cloud Support<br><br>Ready to take your business to the cloud?",
                "Let's get you on the cloud! 🚀<br><br>Our cloud services include:<br>• Seamless Cloud Migration<br>• Multi-cloud Solutions (AWS, Azure, GCP)<br>• Infrastructure Architecture<br>• Security & Compliance<br>• Cost Reduction Consulting<br>• Round-the-clock Support<br><br>The future is in the cloud - let's get you there!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['Cloud Pricing', 'Migration Services', 'Training', 'Contact Expert']
            };
        }

        // Cybersecurity related
        if (lowerMessage.includes('security') || lowerMessage.includes('cyber') || lowerMessage.includes('protect') || lowerMessage.includes('hack') || lowerMessage.includes('safe')) {
            const responses = [
                "Security is everything these days! 🔒<br><br>We protect your business with:<br>• Comprehensive Security Assessments<br>• Penetration Testing (Ethical Hacking)<br>• 24/7 Security Monitoring<br>• Firewall & Network Security<br>• Employee Security Training<br>• Compliance Consulting<br><br>Don't wait for a breach - let's secure your systems now!",
                "Your security is our priority! 🛡️<br><br>Our cybersecurity arsenal includes:<br>• Security Audits & Assessments<br>• Penetration Testing<br>• Real-time Threat Monitoring<br>• Network & Firewall Protection<br>• Security Awareness Training<br>• Regulatory Compliance Help<br><br>Stay one step ahead of cyber threats!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['Security Assessment', 'Training', 'Contact Security Team', 'Learn More']
            };
        }

        // Team/People related
        if (lowerMessage.includes('team') || lowerMessage.includes('people') || lowerMessage.includes('staff') || lowerMessage.includes('expert') || lowerMessage.includes('who works')) {
            const responses = [
                "Our team is our superpower! 💪<br><br>We have certified experts in:<br>• Cloud Architecture & Engineering<br>• Cybersecurity & Network Security<br>• Software Development<br>• IT Consulting & Project Management<br>• Training & Education<br><br>Visit our 'Our People' page to meet the brilliant minds behind DeediX!",
                "Meet the dream team! 🌟<br><br>Our squad includes specialists in:<br>• Cloud Solutions & Infrastructure<br>• Cybersecurity & Threat Protection<br>• Custom Software Development<br>• IT Strategy & Consulting<br>• Professional Training<br><br>Check out our 'Our People' page - we're pretty awesome if we say so ourselves! 😊"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['Meet Our Team', 'Our Services', 'Training Programs', 'Contact Us']
            };
        }

        // Portfolio/Projects related
        if (lowerMessage.includes('portfolio') || lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('case study') || lowerMessage.includes('client')) {
            const responses = [
                "We're proud of what we've built! 🏆<br><br>Our portfolio includes:<br>• Enterprise Cloud Migrations<br>• Custom Software Solutions<br>• Network Infrastructure Deployments<br>• Cybersecurity Implementations<br>• Corporate Training Programs<br><br>Check out our portfolio page for detailed case studies and success stories!",
                "Actions speak louder than words! 💼<br><br>We've delivered:<br>• Large-scale Cloud Migrations<br>• Bespoke Software Applications<br>• Complete Network Overhauls<br>• Security Infrastructure Upgrades<br>• Organization-wide Training<br><br>Visit our portfolio to see the impact we've made!"
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)],
                suggestions: ['View Portfolio', 'Our Services', 'Request Quote', 'Contact Us']
            };
        }

        // Greetings
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage === 'good morning' || lowerMessage === 'good afternoon' || lowerMessage === 'good evening') {
            const greetings = [
                "Hey there! 👋 Welcome to DeediX Technologies. How can I help you today?",
                "Hello! 😊 Great to see you here. What can I do for you?",
                "Hi! Welcome aboard! What would you like to know about DeediX?",
                "Hey! 🌟 Thanks for stopping by. How can I assist you today?"
            ];
            return {
                message: greetings[Math.floor(Math.random() * greetings.length)],
                suggestions: ['Our Services', 'Training Programs', 'Contact Info', 'About Us']
            };
        }

        // Thank you
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
            const thanks = [
                "You're very welcome! 😊 Anything else I can help with?",
                "Happy to help! Feel free to ask if you need anything else.",
                "My pleasure! Is there anything else you'd like to know?",
                "Anytime! Let me know if you have more questions. 👍"
            ];
            return {
                message: thanks[Math.floor(Math.random() * thanks.length)],
                suggestions: ['Our Services', 'Training Programs', 'Contact Us', 'Request Quote']
            };
        }

        // Goodbye
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
            const goodbyes = [
                "Thanks for chatting! Feel free to come back anytime. Have a great day! 👋",
                "Take care! We're here whenever you need us. Bye! 😊",
                "Goodbye! Don't hesitate to reach out if you need anything. 🌟",
                "See you later! Looking forward to our next chat. 👋"
            ];
            return {
                message: goodbyes[Math.floor(Math.random() * goodbyes.length)],
                suggestions: []
            };
        }

        // Default response - more conversational variations
        const defaults = [
            "Hmm, I'm not quite sure about that one. 🤔<br><br>But I'm great at helping with:<br>• Our IT services & solutions<br>• Training programs & courses<br>• Contact information<br>• Pricing & quotes<br>• Company info<br><br>What would you like to explore?",
            "Good question! Let me point you in the right direction. 😊<br><br>I can help you with:<br>• Information about our services<br>• Training and certification programs<br>• Getting in touch with our team<br>• Pricing and custom quotes<br>• About DeediX Technologies<br><br>Where should we start?",
            "I want to give you the best answer! 💡<br><br>I'm most helpful with:<br>• IT services we offer<br>• Training opportunities<br>• Contact details<br>• Pricing information<br>• Company background<br><br>Which topic interests you?"
        ];
        return {
            message: defaults[Math.floor(Math.random() * defaults.length)],
            suggestions: ['Our Services', 'Training Programs', 'Contact Info', 'Pricing']
        };
    }

    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.classList.add('copied');
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';

            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // localStorage functions
    function saveChatHistory() {
        const messages = [];
        chatMessages.querySelectorAll('.message').forEach(msg => {
            if (!msg.querySelector('.quick-suggestions') && !msg.querySelector('.clear-chat-btn')) {
                messages.push(msg.outerHTML);
            }
        });
        localStorage.setItem('deedix_chat_history', JSON.stringify(messages));
    }

    function loadChatHistory() {
        const history = localStorage.getItem('deedix_chat_history');
        if (history) {
            const messages = JSON.parse(history);
            messages.forEach(msgHTML => {
                const temp = document.createElement('div');
                temp.innerHTML = msgHTML;
                const messageElement = temp.firstChild;

                // Re-attach copy button listeners
                const copyBtn = messageElement.querySelector('.copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', function() {
                        copyToClipboard(this.dataset.copy, this);
                    });
                }

                chatMessages.appendChild(messageElement);
            });
        }

        // Add clear chat button
        addClearChatButton();
    }

    function addClearChatButton() {
        const existingBtn = document.getElementById('clearChatBtn');
        if (!existingBtn) {
            const clearBtn = document.createElement('button');
            clearBtn.id = 'clearChatBtn';
            clearBtn.className = 'clear-chat-btn';
            clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Chat History';
            clearBtn.addEventListener('click', clearChatHistory);
            chatMessages.appendChild(clearBtn);
        }
    }

    function clearChatHistory() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            localStorage.removeItem('deedix_chat_history');
            chatMessages.innerHTML = '';
            addClearChatButton();

            // Show fresh welcome message
            setTimeout(() => {
                addBotMessage("Chat cleared! 🧹 How can I help you today?");
                showQuickSuggestions(['Our Services', 'Training Programs', 'Contact Info', 'About Us']);
            }, 300);
        }
    }
});
