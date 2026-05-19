// =====================================================
// AI Chat Engine - দৈনিক আলোকিত
// =====================================================

let chatHistory = [];
let currentModel = 'gpt-4o'; // Default

// API Config (User can fill this later if they want real responses)
const AI_CONFIG = {
    useRealAPI: false, // Set to true and add keys below to use real AI
    openaiKey: '',
    geminiKey: ''
};

// Initialize the Chat UI
function initAIChat() {
    const container = document.getElementById('ai-chat-container');
    if (!container) return;

    container.innerHTML = `
        <button class="ai-fab" onclick="openAIChat()">
            <i class="fas fa-robot"></i>
            <div class="badge"></div>
        </button>

        <div class="ai-overlay" id="ai-overlay" onclick="closeAIChat()"></div>

        <div class="ai-panel" id="ai-panel">
            <!-- Header -->
            <div class="ai-panel-header">
                <div class="ai-panel-top">
                    <div class="ai-panel-title">
                        <i class="fas fa-robot"></i> আলোকিত AI
                    </div>
                    <div class="ai-panel-actions">
                        <button onclick="toggleHistoryPanel()" title="History"><i class="fas fa-history"></i></button>
                        <button onclick="startNewChat()" title="New Chat"><i class="fas fa-plus"></i></button>
                        <button onclick="closeAIChat()" title="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                
                <div class="model-selector">
                    <button class="model-btn active" onclick="setModel('gpt-4o', this)">GPT-4o</button>
                    <button class="model-btn" onclick="setModel('claude-3', this)">Claude 3</button>
                    <button class="model-btn" onclick="setModel('gemini-pro', this)">Gemini</button>
                    <button class="model-btn" onclick="setModel('grok', this)">Grok</button>
                </div>
            </div>

            <!-- Chat Area -->
            <div class="ai-chat-area" id="ai-chat-area">
                <div class="ai-welcome" id="ai-welcome-screen">
                    <div class="ai-welcome-icon">✨</div>
                    <h3>আলোকিত AI তে স্বাগতম</h3>
                    <p>আমি একটি কৃত্রিম বুদ্ধিমত্তাসম্পন্ন সহকারী। সংবাদ সম্পর্কে প্রশ্ন করুন, অনুবাদ করুন বা আরও জানুন।</p>
                    
                    <div class="ai-suggestions" id="ai-suggestions">
                        <button class="ai-suggest-btn" onclick="sendSuggestedMessage('আজকের প্রধান খবরগুলো সংক্ষেপে বলুন।')">
                            <i class="fas fa-newspaper suggest-icon"></i> আজকের প্রধান খবরগুলো সংক্ষেপে বলুন।
                        </button>
                        <button class="ai-suggest-btn" onclick="sendSuggestedMessage('বাংলাদেশের অর্থনীতি সম্পর্কে সর্বশেষ খবর কী?')">
                            <i class="fas fa-chart-line suggest-icon"></i> বাংলাদেশের অর্থনীতি সম্পর্কে সর্বশেষ খবর কী?
                        </button>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="ai-input-area">
                <div class="ai-input-wrap">
                    <button class="ai-attach-btn" title="Upload File (Demo)"><i class="fas fa-paperclip"></i></button>
                    <textarea 
                        class="ai-input" 
                        id="ai-input" 
                        placeholder="বার্তা লিখুন..." 
                        rows="1"
                        oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
                        onkeydown="handleInputKeydown(event)"
                    ></textarea>
                    <div class="ai-input-actions">
                        <button class="ai-send-btn" id="ai-send-btn" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
                <div class="ai-input-hint">AI ভুল করতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করুন।</div>
            </div>

            <!-- History Sidebar (Slides in over chat) -->
            <div class="ai-history-panel" id="ai-history-panel">
                <div class="ai-history-header">
                    <h3>পূর্বের কথোপকথন</h3>
                    <button onclick="toggleHistoryPanel()" style="font-size: 1.2rem; color: #4a5068;"><i class="fas fa-times"></i></button>
                </div>
                <div class="ai-history-list" id="ai-history-list">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>
    `;

    loadChatHistory();
}

function openAIChat(initialPrompt = null) {
    document.getElementById('ai-panel').classList.add('open');
    document.getElementById('ai-overlay').classList.add('active');
    
    // Focus input
    setTimeout(() => {
        document.getElementById('ai-input').focus();
    }, 300);

    if (initialPrompt) {
        document.getElementById('ai-input').value = initialPrompt;
        setTimeout(() => sendMessage(), 100);
    }
}

function closeAIChat() {
    document.getElementById('ai-panel').classList.remove('open');
    document.getElementById('ai-overlay').classList.remove('active');
    document.getElementById('ai-history-panel').classList.remove('open');
}

function setModel(model, btnElement) {
    currentModel = model;
    document.querySelectorAll('.model-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    // Optional: Add a system message stating model changed
}

function toggleHistoryPanel() {
    document.getElementById('ai-history-panel').classList.toggle('open');
}

function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function sendSuggestedMessage(text) {
    document.getElementById('ai-input').value = text;
    sendMessage();
}

// ==========================================
// Chat Logic & Markdown Rendering
// ==========================================

async function sendMessage() {
    const inputEl = document.getElementById('ai-input');
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    inputEl.style.height = ''; // Reset height

    // Hide welcome screen if present
    const welcomeScreen = document.getElementById('ai-welcome-screen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    // 1. Add User Message UI
    appendMessage('user', text);
    
    // Save to history
    chatHistory.push({ role: 'user', content: text });
    saveChatHistory();

    // 2. Add Typing Indicator UI
    const typingId = showTypingIndicator();

    // 3. Generate Response (Simulated or Real)
    let responseText = '';
    
    if (AI_CONFIG.useRealAPI) {
        // Implement real API call here if keys are provided
        responseText = "API integration is enabled but not fully implemented in this demo. Please see documentation.";
    } else {
        // Simulated Intelligent Response based on keywords
        responseText = generateSimulatedResponse(text);
    }

    // 4. Remove Typing Indicator and Stream Response
    setTimeout(() => {
        removeTypingIndicator(typingId);
        streamResponse(responseText);
    }, 800 + Math.random() * 1000); // Fake network delay
}

function appendMessage(role, content, streamId = null) {
    const chatArea = document.getElementById('ai-chat-area');
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${role}`;
    
    const avatar = role === 'assistant' ? '<i class="fas fa-robot"></i>' : 'U';
    
    // Render Markdown if assistant, plain text if user
    const renderedContent = role === 'assistant' ? renderMarkdown(content) : escapeHTML(content);

    let html = `
        <div class="ai-message-avatar">${avatar}</div>
        <div class="ai-message-bubble">
            <div class="msg-content" ${streamId ? `id="${streamId}"` : ''}>${renderedContent}</div>
            ${role === 'assistant' ? `
                <div class="ai-message-actions">
                    <button class="msg-action-btn" title="Copy" onclick="navigator.clipboard.writeText('${content.replace(/'/g, "\\'")}')"><i class="far fa-copy"></i></button>
                    <button class="msg-action-btn" title="Regenerate"><i class="fas fa-sync-alt"></i></button>
                </div>
            ` : ''}
        </div>
    `;
    
    msgDiv.innerHTML = html;
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function showTypingIndicator() {
    const chatArea = document.getElementById('ai-chat-area');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'ai-message assistant';
    div.id = id;
    div.innerHTML = `
        <div class="ai-message-avatar"><i class="fas fa-robot"></i></div>
        <div class="ai-message-bubble" style="padding: 8px 16px;">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
    `;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Simulate streaming text word by word
function streamResponse(fullText) {
    const streamId = 'stream-' + Date.now();
    appendMessage('assistant', '', streamId);
    
    const contentEl = document.getElementById(streamId);
    let words = fullText.split(' ');
    let currentHtml = '';
    let i = 0;

    const chatArea = document.getElementById('ai-chat-area');

    function streamNextWord() {
        if (i < words.length) {
            currentHtml += words[i] + ' ';
            // Render markdown on the fly
            contentEl.innerHTML = renderMarkdown(currentHtml);
            chatArea.scrollTop = chatArea.scrollHeight;
            i++;
            // Randomize typing speed for realism
            setTimeout(streamNextWord, 20 + Math.random() * 50);
        } else {
            // Streaming finished
            chatHistory.push({ role: 'assistant', content: fullText });
            saveChatHistory();
        }
    }

    streamNextWord();
}

// Basic Markdown Parser
function renderMarkdown(text) {
    if (!text) return '';
    
    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><button class="code-copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText)">Copy</button><code>${escapeHTML(code.trim())}</code></pre>`;
    });
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    text = text.replace(/^\- (.*)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    text = text.split('\n\n').map(p => {
        if (p.startsWith('<ul') || p.startsWith('<pre')) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return text;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================
// Simulated Intelligence Engine
// ==========================================

function generateSimulatedResponse(prompt) {
    const q = prompt.toLowerCase();
    
    // Check if we are on an article page to provide context-aware answers
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (articleId && typeof NEWS_DATA !== 'undefined') {
        const article = NEWS_DATA.find(n => n.id === articleId);
        if (article) {
            if (q.includes('সারসংক্ষেপ') || q.includes('সংক্ষেপে')) {
                return `**"${article.title}"** সংবাদের সারসংক্ষেপ:\n\n${article.summary}\n\nআপনি কি এই বিষয়ে আরও কিছু জানতে চান?`;
            }
            if (q.includes('লেখক') || q.includes('লিখেছেন')) {
                return `এই প্রতিবেদনটি লিখেছেন **${article.author}**। এটি প্রকাশিত হয়েছে ${formatDate(article.date)} তারিখে।`;
            }
        }
    }

    // General Responses
    if (q.includes('খবর') || q.includes('সংবাদ')) {
        return `আজকের শীর্ষ সংবাদগুলোর মধ্যে রয়েছে:\n- বাংলাদেশের অর্থনীতিতে রপ্তানি আয়ের নতুন রেকর্ড।\n- দক্ষিণ আফ্রিকার বিপক্ষে বাংলাদেশ ক্রিকেট দলের ঐতিহাসিক জয়।\n- ঢাকায় মেট্রোরেলের নতুন রুট উদ্বোধন।\n\nআপনি কোন বিষয়ে বিস্তারিত জানতে চান?`;
    }
    
    if (q.includes('কে তুমি') || q.includes('তোমার নাম')) {
        return `আমি **আলোকিত AI**, দৈনিক আলোকিত সংবাদপত্রের কৃত্রিম বুদ্ধিমত্তা সম্পন্ন সহকারী। আমি ${currentModel} মডেলের ওপর ভিত্তি করে তৈরি। আপনাকে কীভাবে সাহায্য করতে পারি?`;
    }

    if (q.includes('কোড') || q.includes('code')) {
        return `অবশ্যই, এখানে একটি পাইথন (Python) কোডের উদাহরণ দেওয়া হলো:\n\n\`\`\`python\ndef say_hello(name):\n    print(f"হ্যালো {name}! দৈনিক আলোকিত-এ স্বাগতম।")\n\nsay_hello("পাঠক")\n\`\`\`\n\nএই কোডটি রান করলে এটি আপনাকে শুভেচ্ছা জানাবে।`;
    }

    // Default fallback
    return `আপনার প্রশ্নটি পেয়েছি। এটি একটি ডেমো AI ইঞ্জিন। বাস্তব API যুক্ত করা হলে আমি আরও বিস্তারিত ও সঠিক উত্তর দিতে সক্ষম হবো। বর্তমানে আমি **${currentModel}** মডেল অনুকরণ করছি।`;
}

// ==========================================
// History Management
// ==========================================

function saveChatHistory() {
    localStorage.setItem('alokito_chat_history', JSON.stringify(chatHistory));
    updateHistoryUI();
}

function loadChatHistory() {
    const saved = localStorage.getItem('alokito_chat_history');
    if (saved) {
        try {
            chatHistory = JSON.parse(saved);
            
            // If there's history, render it and hide welcome screen
            if (chatHistory.length > 0) {
                const welcomeScreen = document.getElementById('ai-welcome-screen');
                if (welcomeScreen) welcomeScreen.style.display = 'none';
                
                chatHistory.forEach(msg => {
                    appendMessage(msg.role, msg.content);
                });
            }
        } catch(e) {
            console.error("Failed to load chat history");
        }
    }
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('ai-history-list');
    if (!list) return;
    
    if (chatHistory.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">কোন পূর্বের কথোপকথন নেই</div>';
        return;
    }

    // Just show a dummy entry representing the current session for this demo
    list.innerHTML = `
        <div class="ai-history-item" onclick="toggleHistoryPanel()">
            <div class="history-title">সাম্প্রতিক কথোপকথন</div>
            <div class="history-date">${new Date().toLocaleDateString('bn-BD')}</div>
        </div>
    `;
}

function startNewChat() {
    chatHistory = [];
    localStorage.removeItem('alokito_chat_history');
    document.getElementById('ai-chat-area').innerHTML = `
        <div class="ai-welcome" id="ai-welcome-screen">
            <div class="ai-welcome-icon">✨</div>
            <h3>নতুন কথোপকথন শুরু করুন</h3>
            <p>আমি একটি কৃত্রিম বুদ্ধিমত্তাসম্পন্ন সহকারী।</p>
        </div>
    `;
}
