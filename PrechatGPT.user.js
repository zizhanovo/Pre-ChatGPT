// ==UserScript==
// @name         PreChatGPT
// @description  自动化批量的提交ChatGPT的提问
// @version      1.3
// @author       zizhanovo
// @namespace    https://github.com/zizhanovo/Pre-ChatGPT
// @supportURL   https://github.com/xcanwin/KeepChatGPT/
// @license      GPL-2.0-only
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

    #submitQuestion, #start {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      color: white;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      box-shadow: 0px 5px 10px rgba(0,0,0,0.2);
    }
    
    #submitQuestion {
      background-color: #4CAF50;
    }
    
    #submitQuestion:active {
      box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
      transform: translateY(3px);
    }
    
    #submitQuestion:hover {
      background-color: #45a049;
    }
    
    #start {
      background-color: #008CBA;
      margin-bottom: 20px;
    }
    
    #start:active {
      box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
      transform: translateY(3px);
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
      font-weight: bold;
    }

    .input-row input[type="text"],
    .input-row input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      transition: border-color 0.3s;
      font-size: 14px;
      font-family: Arial, sans-serif;
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
      margin-right: 10px;
    }

    #delayTime {
      width: 80px;
      margin-left: 10px;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
      transition: border-color 0.3s;
      width: 100px; /* 调整宽度为适当大小 */
      text-align: right; /* 将文本右对齐 */
    }

    #delayTime:disabled {
      background-color: #f0f0f0;
    }

  
    .clear-cache-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #88c0d0;
      color: white;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      box-shadow: 0px 5px 10px rgba(0,0,0,0.2);
    }
    
    .clear-cache-btn:active {
        box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
        transform: translateY(3px);
    }
    
    .clear-cache-btn:hover {
        background-color: #81a1c1;
    }
    .button-container1 {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
    }

    #questionSummary {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0,0,0,0.08);
      transition: all 0.3s ease-in-out;
      height: 100px; /* 添加此行并设置合适的高度 */
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between; 
      align-items: flex-start;
      width: 45%;
      padding: 10px;
      background-color: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      box-shadow: 0px 0px 5px rgba(0,0,0,0.05);
      transition: all 0.3s ease-in-out;
    }
    
    .summary-item:hover {
      box-shadow: 0px 0px 5px rgba(0,0,0,0.1);
      transform: scale(1.02);
    }
    
    .icon-count-container {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      width: 50%;
    }
    
    .summary-icon {
      font-size: 20px;
      margin-right: 10px;
      color: #333333;
    }
    
    .summary-count {
      font-size: 18px;
      margin-right: 10px;
      color: #333333;
    }
    
    .button-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50%;
      padding: 5px;
      height: 100%; /* 添加此行 */
    }
    
    .summary-action {
      display: flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      border: none;
      color: white;
      background-color: #1890ff;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      width: 100%;
      height: 100%;
    }
    
    .summary-action:hover {
      background-color: #40a9ff;
    }
    
    .vertical-text {
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-size: 20px;
      margin: 0 auto;
    }
    #openSetting{
      font-size: 24px; /* 调整字体大小 */
      color: #4a4a4a; /* 改变字体颜色 */

      transition: all 0.3s ease; /* 过渡动画 */
      cursor: pointer; /* 更改鼠标光标样式 */
    }
    
    #openSetting:hover {
        color: #3b3b3b; /* 鼠标悬停时的颜色 */
        text-shadow: 2px 2px 4px #888; /* 鼠标悬停时的阴影颜色 */
    }
    
    #openSetting:active {
        transform: scale(0.97); /* 点击时缩小比例 */
    }
    #backToMainSidebar{
      font-size: 24px; /* 调整字体大小 */
      color: #4a4a4a; /* 改变字体颜色 */

      transition: all 0.3s ease; /* 过渡动画 */
      cursor: pointer; /* 更改鼠标光标样式 */
    }
    
    #backToMainSidebar:hover {
        color: #3b3b3b; /* 鼠标悬停时的颜色 */
        text-shadow: 2px 2px 4px #888; /* 鼠标悬停时的阴影颜色 */
    }
    
    #backToMainSidebar:active {
        transform: scale(0.97); /* 点击时缩小比例 */
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
      <div id="questionSummary" class="question-summary">
      <div class="summary-item">
          <div class="icon-count-container">
              <div class="icon-container">
                  <span class="summary-icon">✅</span>
              </div>
              <div class="count-container">
                  <span class="summary-count" id="completedCount">0</span>
              </div>
          </div>
          <div class="button-container">
              <a href="#" class="summary-action" id="deleteCompleted">
                  <svg t="1685867554988" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2373" width="200" height="200">
                      <path d="M832 1024H192V288h64v672h512V288h64v736zM128 160h768v64H128z" fill="#2A2A3B" p-id="2374"></path>
                      <path d="M672 224H352V0h320z m-256-64h192V64h-192zM384 384h64v448h-64zM576 384h64v448h-64z" fill="#2A2A3B" p-id="2375"></path>
                  </svg>
              </a>
          </div>
      </div>
      <div class="summary-item">
          <div class="icon-count-container">
              <div class="icon-container">
                  <span class="summary-icon">❓</span>
              </div>
              <div class="count-container">
                  <span class="summary-count" id="pendingCount">0</span>
              </div>
          </div>
          <div class="button-container">
              <a href="#" class="summary-action" id="deletePending">
                  <svg t="1685867554988" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2373" width="200" height="200">
                      <path d="M832 1024H192V288h64v672h512V288h64v736zM128 160h768v64H128z" fill="#2A2A3B" p-id="2374"></path>
                      <path d="M672 224H352V0h320z m-256-64h192V64h-192zM384 384h64v448h-64zM576 384h64v448h-64z" fill="#2A2A3B" p-id="2375"></path>
                  </svg>
              </a>
          </div>
      </div>
    </div>
    
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
      <div class="button-container1">
        <button class="clear-cache-btn" onclick="clearCache()">清空缓存</button>
       </div>
    </section>
    
  `;
    document.body.appendChild(settingSidebar);  // 将设置侧边栏添加到 DOM 中
    const clearCacheBtn = document.querySelector('.clear-cache-btn');
    clearCacheBtn.addEventListener('click', clearCache);

  }

  // 主侧边栏和设置侧边栏的创建代码
  createMainSidebar();
  createSettingSidebar();

  document.getElementById('openSetting').addEventListener('click', function () {
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

  document.getElementById('backToMainSidebar').addEventListener('click', function () {
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

  // Event listener for run mode radio button inputs
  const delayedRadio = document.getElementById('delayed');
  const delayTimeInput = document.getElementById('delayTime');

  delayedRadio.addEventListener('change', function () {
    delayTimeInput.disabled = false;
  });

  const instantRadio = document.getElementById('instant');
  instantRadio.addEventListener('change', function () {
    delayTimeInput.disabled = true;
  });

  function clearCache() {
    var btn = document.querySelector('.clear-cache-btn');
    if (typeof (Storage) !== "undefined") {
      if (confirm("你确定要清空所有缓存吗？")) {
        try {
          localStorage.clear();
          console.log("缓存已清空!");
          btn.innerText = "缓存已清空";
          setTimeout(function () {
            btn.innerText = "清空缓存";
          }, 3000);  // 3秒后恢复原状
        } catch (e) {
          console.log("清空缓存失败，错误信息: ", e);
        }
      }
    } else {
      alert("抱歉，你的浏览器不支持 Web Storage...");
    }
  }


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

    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }


    function handleQuestionSubmission() {
      const questions = getQuestionsFromInput();
      for (let question of questions) {
        const uuid = generateUUID();  // Generate a unique ID for the question
        addQuestionToList(question, false, uuid);  // Pass the answered state to addQuestionToList
        addQuestionToLocalStorage(question, uuid);  // Pass the UUID to addQuestionToLocalStorage
      }
      clearInput();
      makeQuestionListSortable();
      updateQuestionCounts();
    }


    function addQuestionToLocalStorage(question, uuid) {
      try {
        // Get the current list of questions from local storage
        let storedQuestions = getQuestionsFromLocalStorage();

        // Check if getQuestionsFromLocalStorage returned a valid array
        if (!Array.isArray(storedQuestions)) {
          console.error('Failed to retrieve questions from local storage.');
          return;
        }

        // Add the new question to the list
        storedQuestions.push({ id: uuid, text: question, answered: false });

        // Store the updated list back to local storage
        localStorage.setItem('questions', JSON.stringify(storedQuestions));

        // Update question counts
        updateQuestionCounts();

        console.log(`Question "${question}" with ID "${uuid}" added to local storage.`);
      } catch (err) {
        console.error(`Error adding question to local storage: ${err}`);
      }
    }


    function handleQuestionClick(event) {
      if (event.target.classList.contains('question-text')) {
        toggleQuestionTextWhiteSpace(event.target);
      }
    }

    // Helper functions
    function getQuestionsFromInput() {
      // 从本地存储获取拆分符号，如果没有设置，就使用默认的符号
      const splitChar = localStorage.getItem('splitChar') || '\n';
      return questionInput.value.split(splitChar).filter(question => question.trim() !== '');
    }

    function addQuestionToList(question, answered, uuid) {
      const questionDiv = createQuestionDiv(question, answered);
      questionDiv.dataset.id = uuid;  // Store the UUID in the DOM element
      questionList.appendChild(questionDiv);
      if (answered) {
        questionDiv.classList.add('answered');
      }
      updateQuestionCounts();
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
      const questionUuid = questionDiv.dataset.id;  // Get the UUID from the DOM element

      // Remove the question from the DOM
      questionDiv.remove();
      updateQuestionCounts();

      // Remove the question from localStorage
      let storedQuestions = getQuestionsFromLocalStorage();  // We can use this helper function here
      storedQuestions = storedQuestions.filter(q => q.id !== questionUuid);  // Use the UUID to filter the question
      localStorage.setItem('questions', JSON.stringify(storedQuestions));
      updateQuestionCounts();
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
      try {
        const storedQuestions = getQuestionsFromLocalStorage();
        for (let question of storedQuestions) {
          let questionDiv = addQuestionToList(question.text, question.answered, question.id);
          if (question.answered) {
            questionDiv.classList.add('answered');
          }
        }
        updateQuestionCounts();
        console.log(`Loaded ${storedQuestions.length} questions from local storage.`);
      } catch (err) {
        console.error(`Error loading questions from local storage: ${err}`);
      }
    }

    function getQuestionsFromLocalStorage() {
      try {
        let storedQuestions = localStorage.getItem('questions');
        storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];

        // Map raw objects from local storage to question objects with custom methods
        storedQuestions = storedQuestions.map((rawQuestion) => ({
          id: rawQuestion.id,
          text: rawQuestion.text,
          answered: rawQuestion.answered
        }));

        console.log(`Retrieved ${storedQuestions.length} questions from local storage.`);
        return storedQuestions;
      } catch (err) {
        console.error(`Error retrieving questions from local storage: ${err}`);
        return []; // Return an empty array if there was an error
      }
    }


    function updateQuestionCounts() {
      const counts = getQuestionCounts();
      document.getElementById('completedCount').textContent = counts.answeredCount;
      document.getElementById('pendingCount').textContent = counts.unansweredCount;
    }


    async function startAskingQuestions() {
      try {
        const questions = Array.from(document.getElementsByClassName('question'));
        const runMode = localStorage.getItem('runMode');
        const delayTime = parseInt(localStorage.getItem('delayTime') || '300');
    
        for (let i = 0; i < questions.length; i++) {
          const questionDiv = questions[i];
          const questionInput = questionDiv.querySelector('input.question-text');
          const questionUUID = questionDiv.dataset.id;
    
          if (!questionDiv.classList.contains('answered')) {
            if (runMode === 'instant') {
              console.log(`Asking question instantly: ${questionInput.value}`);
              await askQuestionInstant(questionInput.value);
            } else if (runMode === 'delayed') {
              console.log(`Delaying for ${delayTime}ms before asking question: ${questionInput.value}`);
              await delay(delayTime);
              await askQuestionDelayed(questionInput.value);
            }
    
            questionDiv.classList.add('answered');
            updateQuestionInLocalStorage(questionUUID, true);  // 更新问题状态为已回答
            console.log(`Question asked and marked as answered: ${questionInput.value}`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        await updateQuestionCounts();
      } catch (err) {
        console.error(`Error occurred while asking questions: ${err}`);
      }
    }
    

    async function askQuestionInstant(question) {
      return new Promise((resolve, reject) => {
        try {
          const additional = localStorage.getItem('additional') || '';

          const questionToSend = `${question} ${additional}`.trim();

          const inputBox = document.querySelector('textarea');
          if (!inputBox) {
            reject('Could not find textarea for input.');
          }
          inputBox.value = questionToSend;
          const event = new Event('input', { bubbles: true });
          inputBox.dispatchEvent(event);

          const sendButton = inputBox.nextElementSibling;
          if (!sendButton) {
            reject('Could not find send button.');
          }
          setTimeout(() => {
            sendButton.click();
          }, 500);

          const observer = new MutationObserver((mutations, observer) => {
            for (let mutation of mutations) {
              if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                  if (node.nodeType === Node.ELEMENT_NODE && node.textContent.includes('Regenerate response')) {
                    console.log('Question sent and response generated.');
                    observer.disconnect();
                    resolve();
                    return;
                  }
                }
              }
            }
          });

          const observerConfig = { childList: true, subtree: true };
          observer.observe(document.body, observerConfig);
        } catch (err) {
          console.error(`Error occurred while asking question: ${err}`);
          reject(err);
        }
      });
    }

    function askQuestionDelayed(question) {
      return new Promise((resolve, reject) => {
        try {
          // Check if question is provided
          if (!question) {
            console.error("No question provided");
            reject('No question provided');
            return;
          }

          // Get additional info and delay time from local storage
          const additional = localStorage.getItem('additional') || '';
          const delayTime = parseInt(localStorage.getItem('delayTime'), 10);

          // Check if delayTime is a valid number
          if (isNaN(delayTime)) {
            console.error("Invalid delayTime");
            reject('Invalid delayTime');
            return;
          }

          const questionToSend = `${question} ${additional}`.trim();
          const inputBox = document.querySelector('textarea');

          // Check if inputBox is found
          if (!inputBox) {
            console.error("Input box not found");
            reject('Input box not found');
            return;
          }

          inputBox.value = questionToSend;
          const event = new Event('input', { bubbles: true });
          inputBox.dispatchEvent(event);

          const sendButton = inputBox.nextElementSibling;

          // Check if sendButton is found
          if (!sendButton) {
            console.error("Send button not found");
            reject('Send button not found');
            return;
          }

          // Delay for delayTime then click send button and resolve
          setTimeout(() => {
            console.log(`Question sent after delay of ${delayTime} ms`);
            sendButton.click();
            resolve();
          }, delayTime);
        } catch (error) {
          // Log any error encountered during the process
          console.error(`Error in askQuestionDelayed: ${error}`);
          reject(error);
        }
      });
    }

    function updateQuestionInLocalStorage(questionUUID, answered) {
      try {
        let storedQuestions = getQuestionsFromLocalStorage();
        let questionToUpdate = storedQuestions.find(q => q.id === questionUUID);
    
        // Check if questionToUpdate is found
        if (!questionToUpdate) {
          console.error(`Question with UUID ${questionUUID} not found in local storage.`);
          return false;
        }
        
        console.log('Updating question:', questionToUpdate);
        
        // Update the answered status of the question
        questionToUpdate.answered = answered;
        
        // Update the question list in local storage
        localStorage.setItem('questions', JSON.stringify(storedQuestions));
        
        console.log(`Question with UUID ${questionUUID} updated successfully.`);
        
        // Return true on successful update
        return true;
      } catch (error) {
        console.error(`Error in updateQuestionInLocalStorage: ${error}`);
        return false;
      }
    }
    



    function delay(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    }

    function getQuestionCounts() {
      let storedQuestions = getQuestionsFromLocalStorage();
      let answeredCount = 0;
      let unansweredCount = 0;

      for (let question of storedQuestions) {
        if (question.answered) {
          answeredCount++;
        } else {
          unansweredCount++;
        }
      }

      return {
        answeredCount,
        unansweredCount
      };
    }

    async function deleteCompletedQuestions() {
      let questions = document.querySelectorAll('.question.answered');

      for (let question of questions) {
        let questionUUID = question.getAttribute('data-uuid');
        question.remove();
        await removeFromLocalStorage(questionUUID);
      }

      updateQuestionCounts();
    }

    async function deletePendingQuestions() {
      let confirmation = confirm('你确定要删除所有未完成的问题吗？');

      if (confirmation) {
        let questions = document.querySelectorAll('.question:not(.answered)');

        for (let question of questions) {
          let questionUUID = question.getAttribute('data-uuid');
          question.remove();
          await removeFromLocalStorage(questionUUID);
        }
      }

      updateQuestionCounts();
    }

    async function removeFromLocalStorage(questionUUID) {
      return new Promise((resolve, reject) => {
        let storedQuestions = localStorage.getItem('questions');
        storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
        storedQuestions = storedQuestions.filter(q => q.id !== questionUUID);
        localStorage.setItem('questions', JSON.stringify(storedQuestions));
        resolve();
      });
    }

    document.getElementById('deleteCompleted').addEventListener('click', deleteCompletedQuestions);
    document.getElementById('deletePending').addEventListener('click', deletePendingQuestions);
  })();
})();


