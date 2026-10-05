/* ==========================================================================
   Luminal Energy - Client Script (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu on link click
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }

    // --- Solar Savings Calculator ---
    const billSlider = document.getElementById('monthly-bill');
    const roofSlider = document.getElementById('roof-area');
    
    const billDisplay = document.getElementById('bill-display');
    const roofDisplay = document.getElementById('roof-display');
    
    const systemSizeVal = document.getElementById('system-size');
    const annualGenVal = document.getElementById('annual-gen');
    const monthlySavingsVal = document.getElementById('monthly-savings');
    const co2OffsetVal = document.getElementById('co2-offset');
    const paybackYearsVal = document.getElementById('payback-years');
    const paybackBar = document.getElementById('payback-bar');

    function updateCalculator() {
        if (!billSlider || !roofSlider) return;

        const bill = parseFloat(billSlider.value);
        const roof = parseFloat(roofSlider.value);

        // Update displays
        billDisplay.textContent = bill.toLocaleString('tr-TR') + ' ₺';
        roofDisplay.textContent = roof.toLocaleString('tr-TR') + ' m²';

        // 1. Recommended system size (kWp): ~6m² needed per kWp. Capped at 20 kWp for residential
        let systemCapacity = Math.min(roof / 6, 20);
        systemCapacity = Math.round(systemCapacity * 10) / 10; // round to 1 decimal

        // 2. Annual generation (kWh): ~1,520 kWh/year per kWp in Turkey
        const annualGen = Math.round(systemCapacity * 1520);

        // 3. Savings Calculations
        // Base rate: 1 kWh of solar generation replaces ~5.0 ₺ worth of electricity (incl. taxes)
        const totalAnnualSavings = annualGen * 5.0;
        let estimatedMonthlySavings = totalAnnualSavings / 12;

        // Savings cannot exceed the user's actual bill size
        estimatedMonthlySavings = Math.min(estimatedMonthlySavings, bill);
        estimatedMonthlySavings = Math.round(estimatedMonthlySavings / 10) * 10; // round to nearest 10
        
        const finalAnnualSavings = estimatedMonthlySavings * 12;

        // 4. CO2 Offset (Trees)
        // 1 kWh solar saves ~0.45 kg CO₂. 1 tree absorbs ~22 kg CO₂ annually.
        // Trees = (annualGen * 0.45) / 22 ≈ annualGen / 50
        const treesPlanted = Math.round(annualGen / 50);

        // 5. Payback Period
        // Estimated investment cost: ~40,000 ₺ per kWp
        const investmentCost = systemCapacity * 40000;
        
        let paybackPeriod = 0;
        if (finalAnnualSavings > 0) {
            paybackPeriod = investmentCost / finalAnnualSavings;
            paybackPeriod = Math.round(paybackPeriod * 10) / 10; // round to 1 decimal
        }
        
        // Boundaries for payback period presentation
        paybackPeriod = Math.max(3.2, Math.min(paybackPeriod, 10.0));

        // Update UI DOM
        systemSizeVal.textContent = systemCapacity.toFixed(1) + ' kWp';
        annualGenVal.textContent = annualGen.toLocaleString('tr-TR') + ' kWh';
        monthlySavingsVal.textContent = estimatedMonthlySavings.toLocaleString('tr-TR') + ' ₺';
        co2OffsetVal.innerHTML = `<i class="fa-solid fa-tree"></i> ${treesPlanted} Ağaç`;
        paybackYearsVal.textContent = paybackPeriod.toFixed(1) + ' Yıl';
        
        // Progress bar percentage: scale 3 years to 10 years
        // (payback - 3) / (10 - 3) * 100
        const barPct = Math.max(0, Math.min(100, ((paybackPeriod - 3) / 7) * 100));
        paybackBar.style.width = `${barPct}%`;
    }

    if (billSlider && roofSlider) {
        billSlider.addEventListener('input', updateCalculator);
        roofSlider.addEventListener('input', updateCalculator);
        // Initial run
        updateCalculator();
    }


    // --- Solarix AI Chat Screen ---
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.getElementById('typing-indicator');
    const simulationBanner = document.getElementById('simulation-banner');
    const quickBtns = document.querySelectorAll('.quick-btn');

    let chatHistory = []; // Keeps the history in {role, content} format

    // Initial check on API mode (we ping endpoint to know if we are in simulation, or we infer from first message)
    // We will update banner state dynamically after first call, or we can run an initial check request.
    async function checkApiMode() {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] })
            });
            const data = await res.json();
            if (data.success && !data.simulation) {
                if (simulationBanner) simulationBanner.style.display = 'none';
            }
        } catch (e) {
            console.log('Error checking API mode (server might not be up yet):', e);
        }
    }
    checkApiMode();

    // Custom Markdown to HTML parser
    function parseMarkdown(text) {
        // Escape HTML to prevent XSS
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        // Bold formatting: **text** -> <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        
        // Convert dash/star lists to HTML lists
        let lines = html.split('\n');
        let inList = false;
        let listType = null; // 'ul' or 'ol'
        let parsedLines = [];
        
        for (let line of lines) {
            let trimmed = line.trim();
            // Unordered list match: "- item" or "* item"
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                if (!inList) {
                    parsedLines.push('<ul>');
                    inList = true;
                    listType = 'ul';
                }
                parsedLines.push('<li>' + trimmed.substring(2) + '</li>');
            } 
            // Ordered list match: "1. item"
            else if (/^\d+\.\s/.test(trimmed)) {
                if (!inList) {
                    parsedLines.push('<ol>');
                    inList = true;
                    listType = 'ol';
                }
                const content = trimmed.replace(/^\d+\.\s/, '');
                parsedLines.push('<li>' + content + '</li>');
            }
            // Normal paragraph/text line
            else {
                if (inList) {
                    parsedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                    inList = false;
                    listType = null;
                }
                parsedLines.push(line);
            }
        }
        
        if (inList) {
            parsedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        }
        
        html = parsedLines.join('\n');
        
        // Newline replacements
        html = html.replace(/\n/g, '<br>');
        
        // Clean double breaks around lists to keep layout tight
        html = html.replace(/<\/ul><br>/g, '</ul>');
        html = html.replace(/<ul><br>/g, '<ul>');
        html = html.replace(/<\/ol><br>/g, '</ol>');
        html = html.replace(/<ol><br>/g, '<ol>');
        html = html.replace(/<li><br>/g, '<li>');
        html = html.replace(/<\/li><br>/g, '</li>');
        
        return html;
    }

    // Scroll chat to bottom
    function scrollToBottom() {
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    // Append Message UI Bubble
    function appendMessage(role, text) {
        if (!chatBox) return;

        const isBot = role === 'assistant';
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isBot ? 'msg-bot' : 'msg-user'}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'msg-avatar';
        avatarDiv.innerHTML = isBot ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';

        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.className = 'msg-bubble-wrapper';

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'msg-bubble';
        bubbleDiv.innerHTML = parseMarkdown(text);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'msg-time';
        timeSpan.textContent = isBot ? 'Solarix' : 'Siz';

        bubbleWrapper.appendChild(bubbleDiv);
        bubbleWrapper.appendChild(timeSpan);
        
        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(bubbleWrapper);

        chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    // Send chat request to server API
    async function sendMessage(text) {
        if (!text || text.trim() === '') return;

        // 1. Add user message to UI and history log context
        appendMessage('user', text);
        chatHistory.push({ role: 'user', content: text });

        // Clear input field
        if (chatInput) chatInput.value = '';

        // 2. Show typing indicator
        if (typingIndicator) typingIndicator.style.display = 'flex';
        scrollToBottom();

        try {
            // 3. Make server call
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: chatHistory })
            });

            if (!response.ok) {
                throw new Error('İletişim hatası oluştu.');
            }

            const data = await response.json();

            // Hide typing indicator
            if (typingIndicator) typingIndicator.style.display = 'none';

            if (data.success && data.message) {
                // Add assistant response to UI and history log context
                appendMessage('assistant', data.message.content);
                chatHistory.push(data.message);

                // Update simulation banner visibility based on response state metadata
                if (simulationBanner) {
                    if (data.simulation) {
                        simulationBanner.style.display = 'flex';
                    } else {
                        simulationBanner.style.display = 'none';
                    }
                }
            } else {
                throw new Error(data.error || 'Bilinmeyen API hatası.');
            }

        } catch (error) {
            console.error('Chat error:', error);
            if (typingIndicator) typingIndicator.style.display = 'none';
            appendMessage('assistant', `⚠️ **Hata:** Sunucu ile bağlantı kurulamadı veya bir hata oluştu: *${error.message}*. Lütfen backend sunucusunun çalıştığından emin olun.`);
        }
    }

    // Form Submit Handler
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value;
            sendMessage(text);
        });
    }

    // Quick questions click handler
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            sendMessage(question);
        });
    });

});
