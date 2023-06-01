// ==UserScript==
// @name         Pre ChatGPT
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Handle multiple questions for ChatGPT
// @author       Your Name
// @match        https://chat.openai.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // 添加 CSS 样式
  GM_addStyle(`
    #sidebar {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 300px;
      padding: 20px;
      background-color: #fafafa;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease-in-out;
      overflow: hidden;
    }

    #toggleSidebar {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      background: #fafafa;
      border: 1px solid #ccc;
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: left 0.3s, border 0.3s, background 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #sidebar.collapsed #sidebarContent {
      display: none;
    }

    #sidebar.collapsed #toggleSidebar {
      left: 15px;
    }

    #sidebarWrapper {
      position: relative; /* New wrapper */
    }

    #toggleSidebar:hover {
      border-color: #007BFF; /* Change border color on hover */
      background: #e6e6e6; /* Change background color on hover */
    }

    #toggleSidebar svg {
      height: 15px;
      width: 15px;
      transition: all 0.3s ease-in-out;
    }

    #sidebar.collapsed {
      width: 60px;
    }

    #sidebar.collapsed #toggleSidebar {
      left: 15px; /* Position it to the right when sidebar is collapsed */
    }

    #sidebar h2 {
      text-align: center;
      color: #333;
      font-size: 1.4em;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }

    #sidebar textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      transition: border-color 0.3s;
      resize: none;
    }

    #sidebar textarea:focus {
      border-color: #007BFF;
      outline: none;
    }

    #sidebar button {
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    #submitQuestion {
      background-color: #4CAF50;
    }

    #submitQuestion:hover {
      background-color: #45a049;
    }

    #start {
      background-color: #008CBA;
      margin-bottom: 20px;
    }

    #start:hover {
      background-color: #007B99;
    }

    #questionList {
      max-height: 200px;
      overflow-y: auto;
    }

    .question {
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.3s;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .question:hover {
      background-color: #f0f0f0;
    }

    .question:before {
      content: '❓';
      margin-right: 4px;
    }

    .question.answered {
      color: #aaa;
    }

    .question.answered:before {
      content: '✅';
    }

    .question button {
      margin-left: 0px;
      background: none;
      border: 1px solid #000; /* 新增此行 */
      box-sizing: border-box; /* 新增此行 */
      cursor: pointer;
      transition: color 0.3s;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .question button:hover {
      color: #007BFF;
    }

    .question .button-container {
      margin-left: auto;
      display: flex;
      gap: 0px;
    }
    .button-container button {
      width: 24px;  /* Increase the size of the button */
      height: 24px; /* Increase the size of the button */
      padding: 0;
      border: 2px solid red; /* Use a more visible border */
    }

    .question button svg {
      width: 18px;
      height: 18px;
      margin: auto;
      pointer-events: none; /* Let click events pass through the SVG to the button */
    }

    .button-group {
      display: flex;
      justify-content: space-between;
    }

    .question-text {
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border: none;
      outline: none;
    }
    #settingSidebar {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 300px;
      padding: 20px;
      background-color: #fafafa;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease-in-out;
      overflow: hidden;
    }

    #settingSidebar h2 {
      text-align: center;
      color: #333;
      font-size: 1.4em;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }

    .input-row {
      margin-bottom: 10px;
    }

    .input-row label {
      display: block;
      margin-bottom: 5px;
      color: #333;
    }

    .input-row input[type="text"],
    .input-row input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      transition: border-color 0.3s;
    }

    .input-row input[type="text"]:focus,
    .input-row input[type="number"]:focus {
      border-color: #007BFF;
      outline: none;
    }

    #runMode {
      display: flex;
      align-items: center;
    }

    #runMode input[type="radio"] {
      margin-right: 5px;
    }

    #delayTime {
      width: 80px;
      margin-left: 10px;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
      transition: border-color 0.3s;
    }

    #delayTime:disabled {
      background-color: #f0f0f0;
    }

  `);
  // 创建主侧边栏
  function createMainSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';

    sidebar.innerHTML = `
    <div id="toggleSidebar">
      <svg viewBox="0 0 24 24" id="icon-expand">
        <path d="M10 18h4v-2h-4v2zM3 13h18v-2H3v2zm0 7h12v-2H3v2zm0-14v2h18V6H3z"/>
      </svg>
      <svg viewBox="0 0 24 24" id="icon-collapse" style="display: none;">
        <path d="M10 20h4V4h-4v16zm0-18H6v20h4V2zm8 0h-4v20h4V2z"/>
      </svg>
    </div>
    <section id="sidebarContent">
      <h2 id="openSetting" style="cursor: pointer;">Pre ChatGPT</h2>
      <textarea id="questionInput" placeholder="Enter your question here..."></textarea>
      <div class="button-group">
        <button id="submitQuestion">Submit</button>
        <button id="start">Start</button>
      </div>
      <ul id="questionList"></ul>
    </section>
  `;
    document.body.appendChild(sidebar);

    document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);

  }

  function createSettingSidebar() {
    const settingSidebar = document.createElement('div');
    settingSidebar.id = 'settingSidebar';
    settingSidebar.style.display = 'none'; // 初始时隐藏设置侧边栏

    settingSidebar.innerHTML = `
    <section id="sidebarContent">
      <h2 id="backToMainSidebar" style="cursor: pointer;">Pre ChatGPT</h2>
      <div class="input-row">
        <label for="splitCharInput">拆分符号:</label>
        <input type="text" id="splitCharInput" placeholder="输入你的分隔符" />
      </div>
      <div class="input-row">
        <label for="additionalInput">输出增强:</label>
        <input type="text" id="additionalInput" placeholder="例如，详细点" />
      </div>
      <div class="input-row">
        <label for="runMode">运行模式:</label>
        <div id="runMode">
          <input type="radio" id="instant" name="mode" value="instant" checked>
          <label for="instant">即时</label>
          <input type="radio" id="delayed" name="mode" value="delayed">
          <label for="delayed">延时</label>
          <input type="number" id="delayTime" placeholder="432000" disabled>
        </div>
      </div>
    </section>
    
  `;
  document.body.appendChild(settingSidebar);  // 将设置侧边栏添加到 DOM 中
  }

  // 主侧边栏和设置侧边栏的创建代码
  createMainSidebar();
  createSettingSidebar();

  document.getElementById('openSetting').addEventListener('click', function() {
    // 隐藏主侧边栏
    document.getElementById('sidebar').style.display = 'none';
    
    // 显示设置侧边栏
    document.getElementById('settingSidebar').style.display = '';
    
    // 从本地存储加载设置
    const splitChar = localStorage.getItem('splitChar');
    const additional = localStorage.getItem('additional');
    const runMode = localStorage.getItem('runMode');
    const delayTime = localStorage.getItem('delayTime');
    
    // 更新设置侧边栏中的字段
    document.getElementById('splitCharInput').value = splitChar || '';
    document.getElementById('additionalInput').value = additional || '';
    document.getElementById('delayTime').value = delayTime || '';
    
    if (runMode === 'instant') {
      document.getElementById('instant').checked = true;
    } else if (runMode === 'delayed') {
      document.getElementById('delayed').checked = true;
    }
  });

  document.getElementById('backToMainSidebar').addEventListener('click', function() {
    // 获取设置侧边栏中的字段值
    const splitChar = document.getElementById('splitCharInput').value;
    const additional = document.getElementById('additionalInput').value;
    const runMode = document.querySelector('input[name="mode"]:checked').value;
    const delayTime = document.getElementById('delayTime').value;
    
    // 保存设置到本地存储
    localStorage.setItem('splitChar', splitChar);
    localStorage.setItem('additional', additional);
    localStorage.setItem('runMode', runMode);
    localStorage.setItem('delayTime', delayTime);
    
    // 隐藏设置侧边栏
    document.getElementById('settingSidebar').style.display = 'none';
    
    // 显示主侧边栏
    document.getElementById('sidebar').style.display = '';
  });
  
  

  // Toggle logic
  document.getElementById('toggleSidebar').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    var iconExpand = document.getElementById('icon-expand');
    var iconCollapse = document.getElementById('icon-collapse');
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
      iconCollapse.style.display = 'none';
      iconExpand.style.display = '';
    } else {
      iconExpand.style.display = 'none';
      iconCollapse.style.display = '';
    }
  });

  //以下是逻辑函数

  (function () {
    const questionList = document.getElementById('questionList');
    const submitQuestionButton = document.getElementById('submitQuestion');
    const questionInput = document.getElementById('questionInput');
    const startButton = document.getElementById('start');

    // Event listeners
    submitQuestionButton.addEventListener('click', handleQuestionSubmission);
    questionList.addEventListener('click', handleQuestionClick);
    window.addEventListener('load', loadQuestionsFromLocalStorage);
    startButton.addEventListener('click', startAskingQuestions);

    // Event handlers
    function handleQuestionSubmission() {
      const questions = getQuestionsFromInput();
      for (let question of questions) {
        addQuestionToList(question);
        addQuestionToLocalStorage(question);
      }
      clearInput();
      makeQuestionListSortable();
    }

    function addQuestionToLocalStorage(question) {
      let storedQuestions = getQuestionsFromLocalStorage();
      storedQuestions.push({ text: question, answered: false });
      localStorage.setItem('questions', JSON.stringify(storedQuestions));
    }

    function handleQuestionClick(event) {
      if (event.target.classList.contains('question-text')) {
        toggleQuestionTextWhiteSpace(event.target);
      }
    }

    // Helper functions
    function getQuestionsFromInput() {
      return questionInput.value.split('\n').filter(question => question.trim() !== '');
    }

    function addQuestionToList(question, answered) {
      const questionDiv = createQuestionDiv(question, answered);
      questionList.appendChild(questionDiv);
      if (answered) {
        questionDiv.classList.add('answered');
      }
      return questionDiv;
    }


    function createQuestionDiv(question, answered) {
      const div = document.createElement('div');
      div.className = 'question';

      const questionText = document.createElement('input');
      questionText.type = 'text';
      questionText.className = 'question-text';
      questionText.value = question;
      questionText.readOnly = true;
      div.appendChild(questionText);
      questionText.style.border = 'none'; // Hide the textarea box border
      questionText.rows = 1; // Initially show as single line

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';

      const editButton = createButton('edit', handleEditButtonClick);
      buttonContainer.appendChild(editButton);

      const deleteButton = createButton('delete', handleDeleteButtonClick);
      buttonContainer.appendChild(deleteButton);

      const sortButton = createButton('sort');
      buttonContainer.appendChild(sortButton);

      div.appendChild(buttonContainer);
      // Add 'answered' class if the question is answered
      if (answered) {
        div.classList.add('answered');
      }

      return div;
    }

    function createButton(type, clickHandler) {
      const button = document.createElement('button');
      button.className = `${type}-button`;

      switch (type) {
        case 'edit':
          button.innerHTML = `<svg t="1684557647867" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3766" width="20" height="20"><path d="M862.709333 116.042667a32 32 0 1 1 45.248 45.248L455.445333 613.813333a32 32 0 1 1-45.258666-45.258666L862.709333 116.053333zM853.333333 448a32 32 0 0 1 64 0v352c0 64.8-52.533333 117.333333-117.333333 117.333333H224c-64.8 0-117.333333-52.533333-117.333333-117.333333V224c0-64.8 52.533333-117.333333 117.333333-117.333333h341.333333a32 32 0 0 1 0 64H224a53.333333 53.333333 0 0 0-53.333333 53.333333v576a53.333333 53.333333 0 0 0 53.333333 53.333333h576a53.333333 53.333333 0 0 0 53.333333-53.333333V448z" fill="#000000" p-id="3767"></path></svg>`; // SVG for edit button
          break;
        case 'delete':
          button.innerHTML = `<svg t="1684556652392" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2423" width="20" height="20"><path d="M202.666667 256h-42.666667a32 32 0 0 1 0-64h704a32 32 0 0 1 0 64H266.666667v565.333333a53.333333 53.333333 0 0 0 53.333333 53.333334h384a53.333333 53.333333 0 0 0 53.333333-53.333334V352a32 32 0 0 1 64 0v469.333333c0 64.8-52.533333 117.333333-117.333333 117.333334H320c-64.8 0-117.333333-52.533333-117.333333-117.333334V256z m224-106.666667a32 32 0 0 1 0-64h170.666666a32 32 0 0 1 0 64H426.666667z m-32 288a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z m170.666666 0a32 32 0 0 1 64 0v256a32 32 0 0 1-64 0V437.333333z" fill="#000000" p-id="2424"></path></svg>`; // SVG for delete button
          break;
        case 'sort':
          button.innerHTML = `<svg t="1684417162772" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6670" width="24" height="24"><path d="M368 706.72l-64 64V576h-64v194.72l-64-64L130.72 752 272 893.28 413.28 752 368 706.72zM272 130.72L130.72 272 176 317.28l64-64V448h64V253.28l64 64L413.28 272 272 130.72zM480 192h416v64H480zM480 384h416v64H480zM480 576h416v64H480zM480 768h416v64H480z" fill="#333333" p-id="6671"></path></svg>`; // SVG for sort button
          break;
      }

      if (clickHandler) {
        button.addEventListener('click', clickHandler);
      }

      return button;
    }

    function handleEditButtonClick(event) {
      const questionText = event.target.parentElement.previousSibling;

      // Check if we have a 'isEditing' property and flip its value, otherwise set it to true
      questionText.isEditing = !questionText.hasOwnProperty('isEditing') ? true : !questionText.isEditing;

      if (questionText.isEditing) {
        questionText.readOnly = false;
        questionText.style.border = '1px solid'; // Show border when editing
        questionText.rows = 'auto'; // Expand the textarea box to show all text
        questionText.focus();

        // Move the cursor to the end of the text
        questionText.selectionStart = questionText.selectionEnd = questionText.value.length;
      } else {
        questionText.readOnly = true;
        questionText.style.border = 'none'; // Hide the textarea box border again after editing
        questionText.rows = 1; // Collapse the textarea box back to single line

        // Update the question text in localStorage
        let storedQuestions = localStorage.getItem('questions');
        storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
        let questionToUpdate = storedQuestions.find(q => q.text === questionText.value);
        if (questionToUpdate) {
          questionToUpdate.text = questionText.value;
          localStorage.setItem('questions', JSON.stringify(storedQuestions));
        }
      }
    }



    function handleDeleteButtonClick(event) {
      // Use the closest method to get the question div
      const questionDiv = event.target.closest('.question');

      const questionText = questionDiv.querySelector('input.question-text');

      // Remove the question from the DOM
      questionDiv.remove();

      // Remove the question from localStorage
      let storedQuestions = localStorage.getItem('questions');
      storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
      storedQuestions = storedQuestions.filter(q => q.text !== questionText.value);
      localStorage.setItem('questions', JSON.stringify(storedQuestions));
    }

    function clearInput() {
      questionInput.value = '';
    }

    function makeQuestionListSortable() {
      new Sortable(questionList, {
        handle: '.sort-button',
        animation: 150
      });
    }

    function toggleQuestionTextWhiteSpace(questionText) {
      questionText.style.whiteSpace = questionText.style.whiteSpace === 'nowrap' ? 'normal' : 'nowrap';
    }

    function loadQuestionsFromLocalStorage() {
      const storedQuestions = getQuestionsFromLocalStorage();
      for (let question of storedQuestions) {
        let questionDiv = addQuestionToList(question.text, question.answered);
        if (question.answered) {
          questionDiv.classList.add('answered');
        }
      }
    }

    function getQuestionsFromLocalStorage() {
      let storedQuestions = localStorage.getItem('questions');
      return storedQuestions ? JSON.parse(storedQuestions) : [];
    }


    async function startAskingQuestions() {
      const questions = document.getElementsByClassName('question');
      for (let i = 0; i < questions.length; i++) {
        let questionDiv = questions[i];
        let questionInput = questionDiv.querySelector('input.question-text'); // Get the input element
        if (!questionDiv.classList.contains('answered')) {
          await askQuestion(questionInput.value);
          questionDiv.classList.add('answered');
          updateQuestionInLocalStorage(questionInput.value, true);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before starting the next question
        }
      }
    }

    function updateQuestionInLocalStorage(questionText, answered) {
      let storedQuestions = getQuestionsFromLocalStorage();
      let questionToUpdate = storedQuestions.find(q => q.text === questionText);
      if (questionToUpdate) {
        questionToUpdate.answered = answered;
        localStorage.setItem('questions', JSON.stringify(storedQuestions));
      }
    }

    async function askQuestion(question) {
      return new Promise((resolve, reject) => {
        // Find the input box and the send button
        const inputBox = document.querySelector('textarea');
        const sendButton = inputBox.nextElementSibling;

        // Input the question
        inputBox.value = question;
        const event = new Event('input', { bubbles: true });
        inputBox.dispatchEvent(event);

        // Click the send button after a short delay
        setTimeout(() => sendButton.click(), 500);

        // Create a MutationObserver to wait for the answer
        const observer = new MutationObserver((mutations, observer) => {
          for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE && node.textContent.includes('Regenerate response')) {
                  // The answer has finished generating, stop observing
                  observer.disconnect();

                  // Check if the "Continue generating" button is present
                  const continueButton = document.querySelector('form.stretch .justify-center polygon[points="11 19 2 12 11 5 11 19"]');
                  if (continueButton) {
                    // If the "Continue generating" button is present, click it and continue waiting
                    continueButton.parentElement.click();
                  } else {
                    // If the "Continue generating" button is not present, resolve the promise
                    resolve();
                  }
                  return;
                }
              }
            }
          }
        });

        const observerConfig = { childList: true, subtree: true };
        observer.observe(document.body, observerConfig);
      });
    }

  })();


})();


