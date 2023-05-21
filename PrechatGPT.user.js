// ==UserScript==
// @name         Pre ChatGPT
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Handle multiple questions for ChatGPT
// @author       Your Name
// @match        https://chat.openai.com/*
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.10.2/Sortable.min.js
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
  `);



  // 修改 HTML

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
        <h2>Pre ChatGPT</h2>
        <textarea id="questionInput" placeholder="Enter your question here..."></textarea>
        <div class="button-group">
          <button id="submitQuestion">Submit</button>
          <button id="start">Start</button>
        </div>
        <ul id="questionList"></ul>
      </section>
    `;

  document.body.appendChild(sidebar);



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

  document.getElementById('submitQuestion').addEventListener('click', function () {
    const input = document.getElementById('questionInput');
    const questionList = document.getElementById('questionList');
    const questions = input.value.split('\n').filter(question => question.trim() !== '');

    for (let question of questions) {
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

      const editButton = document.createElement('button');
      editButton.innerHTML = `<svg t="1684417102088" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4778" width="24" height="24"><path d="M358.165868 554.624796c-0.533143 0.680499-1.066285 1.391696-1.303692 2.251274l-41.104163 150.700257c-2.400676 8.772804 0.059352 18.226107 6.550183 24.892947 4.860704 4.742001 11.261485 7.350408 18.077727 7.350408 2.252297 0 4.504594-0.267083 6.727215-0.860601l149.630902-40.808428c0.23843 0 0.357134 0.207731 0.534166 0.207731 1.718131 0 3.408633-0.62217 4.683672-1.927909l400.113747-400.054395c11.883655-11.897981 18.404162-28.109198 18.404162-45.74281 0-19.989263-8.476045-39.963177-23.324218-54.767348l-37.786605-37.844933c-14.81645-14.848173-34.822087-23.338544-54.797024-23.338544-17.631566 0-33.842783 6.520507-45.75816 18.388812L358.758362 553.232077C358.344946 553.615816 358.462626 554.179658 358.165868 554.624796M862.924953 257.19778l-39.742143 39.71349-64.428382-65.451688 39.180348-39.179324c6.193049-6.222725 18.194384-5.318122 25.308409 1.822508l37.813211 37.845956c3.943822 3.941775 6.195096 9.18622 6.195096 14.372336C867.223862 250.574942 865.710392 254.42769 862.924953 257.19778M429.322487 560.907896l288.712541-288.728914 64.459081 65.49569L494.314711 625.838721 429.322487 560.907896zM376.718409 677.970032l20.863167-76.580143 55.656601 55.657624L376.718409 677.970032z" fill="#231F20" p-id="4779"></path><path d="M888.265084 415.735539c-15.144932 0-27.562752 12.313443-27.620058 27.665083l0 372.98283c0 19.559475-15.885805 35.444257-35.475979 35.444257L194.220958 851.827709c-19.559475 0-35.504632-15.883759-35.504632-35.444257L158.716326 207.602222c0-19.575848 15.945157-35.474956 35.504632-35.474956l406.367171 0c15.231913 0 27.592428-12.371772 27.592428-27.606755 0-15.202237-12.360516-27.590382-27.592428-27.590382L190.013123 116.930129c-47.684022 0-86.49291 38.779212-86.49291 86.49291L103.520213 820.59231c0 47.713698 38.808888 86.47756 86.49291 86.47756l639.334083 0c47.715745 0 86.509283-38.763862 86.509283-86.47756L915.856489 443.222567C915.794068 428.048983 903.408993 415.735539 888.265084 415.735539" fill="#231F20" p-id="4780"></path></svg>
        `;
      editButton.addEventListener('click', function () {
        if (questionText.readOnly) {
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
          let questionToUpdate = storedQuestions.find(q => q.text === question.text);
          if (questionToUpdate) {
            questionToUpdate.text = questionText.value;
            localStorage.setItem('questions', JSON.stringify(storedQuestions));
          }
        }
      });


      buttonContainer.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = `
          <svg t="1684417025938" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3682" width="24" height="24"><path d="M840 288H688v-56c0-40-32-72-72-72h-208C368 160 336 192 336 232V288h-152c-12.8 0-24 11.2-24 24s11.2 24 24 24h656c12.8 0 24-11.2 24-24s-11.2-24-24-24zM384 288v-56c0-12.8 11.2-24 24-24h208c12.8 0 24 11.2 24 24V288H384zM758.4 384c-12.8 0-24 11.2-24 24v363.2c0 24-19.2 44.8-44.8 44.8H332.8c-24 0-44.8-19.2-44.8-44.8V408c0-12.8-11.2-24-24-24s-24 11.2-24 24v363.2c0 51.2 41.6 92.8 92.8 92.8h358.4c51.2 0 92.8-41.6 92.8-92.8V408c-1.6-12.8-12.8-24-25.6-24z" fill="#272636" p-id="3683"></path><path d="M444.8 744v-336c0-12.8-11.2-24-24-24s-24 11.2-24 24v336c0 12.8 11.2 24 24 24s24-11.2 24-24zM627.2 744v-336c0-12.8-11.2-24-24-24s-24 11.2-24 24v336c0 12.8 11.2 24 24 24s24-11.2 24-24z" fill="#272636" p-id="3684"></path></svg>
        `; // SVG for delete button

      deleteButton.addEventListener('click', function () {
        // Remove the question from the DOM
        div.remove();

        // Remove the question from localStorage
        let storedQuestions = localStorage.getItem('questions');
        storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
        storedQuestions = storedQuestions.filter(q => q.text !== questionText.value);
        localStorage.setItem('questions', JSON.stringify(storedQuestions));
      });




      buttonContainer.appendChild(deleteButton);

      const sortButton = document.createElement('button');
      sortButton.className = 'sort-handle'; // add this line
      sortButton.innerHTML = `
          <svg t="1684417162772" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6670" width="24" height="24"><path d="M368 706.72l-64 64V576h-64v194.72l-64-64L130.72 752 272 893.28 413.28 752 368 706.72zM272 130.72L130.72 272 176 317.28l64-64V448h64V253.28l64 64L413.28 272 272 130.72zM480 192h416v64H480zM480 384h416v64H480zM480 576h416v64H480zM480 768h416v64H480z" fill="#333333" p-id="6671"></path></svg>
        `; // SVG for sort button

      buttonContainer.appendChild(sortButton);
      div.appendChild(buttonContainer);
      questionList.appendChild(div);
      let storedQuestions = localStorage.getItem('questions');
      storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
      storedQuestions.push({ text: question, answered: false });
      localStorage.setItem('questions', JSON.stringify(storedQuestions));
    }

    input.value = '';

    new Sortable(questionList, {
      handle: '.sort-handle',
      animation: 150
    });
  });
  // Add an event listener to the question list to handle click events on the question text
  questionList.addEventListener('click', function (event) {
    if (event.target.classList.contains('question-text')) {
      const questionText = event.target;
      if (questionText.style.whiteSpace === 'nowrap') {
        questionText.style.whiteSpace = 'normal';
      } else {
        questionText.style.whiteSpace = 'nowrap';
      }
    }
  });
  // When the page loads, load the questions from localStorage
  window.addEventListener('load', function () {
    const questionList = document.getElementById('questionList');
    // Get the existing questions from localStorage
    let storedQuestions = localStorage.getItem('questions');
    // Parse the string back into an array
    storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];

    for (let question of storedQuestions) {
      const div = document.createElement('div');
      div.className = 'question';

      const questionText = document.createElement('input');
      questionText.type = 'text';
      questionText.className = 'question-text';
      questionText.value = question.text; // Use question.text instead of question
      questionText.readOnly = true;
      div.appendChild(questionText);
      questionText.style.border = 'none'; // Hide the textarea box border
      questionText.rows = 1; // Initially show as single line

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';

      const editButton = document.createElement('button');
      editButton.innerHTML = `<svg t="1684417102088" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4778" width="24" height="24"><path d="M358.165868 554.624796c-0.533143 0.680499-1.066285 1.391696-1.303692 2.251274l-41.104163 150.700257c-2.400676 8.772804 0.059352 18.226107 6.550183 24.892947 4.860704 4.742001 11.261485 7.350408 18.077727 7.350408 2.252297 0 4.504594-0.267083 6.727215-0.860601l149.630902-40.808428c0.23843 0 0.357134 0.207731 0.534166 0.207731 1.718131 0 3.408633-0.62217 4.683672-1.927909l400.113747-400.054395c11.883655-11.897981 18.404162-28.109198 18.404162-45.74281 0-19.989263-8.476045-39.963177-23.324218-54.767348l-37.786605-37.844933c-14.81645-14.848173-34.822087-23.338544-54.797024-23.338544-17.631566 0-33.842783 6.520507-45.75816 18.388812L358.758362 553.232077C358.344946 553.615816 358.462626 554.179658 358.165868 554.624796M862.924953 257.19778l-39.742143 39.71349-64.428382-65.451688 39.180348-39.179324c6.193049-6.222725 18.194384-5.318122 25.308409 1.822508l37.813211 37.845956c3.943822 3.941775 6.195096 9.18622 6.195096 14.372336C867.223862 250.574942 865.710392 254.42769 862.924953 257.19778M429.322487 560.907896l288.712541-288.728914 64.459081 65.49569L494.314711 625.838721 429.322487 560.907896zM376.718409 677.970032l20.863167-76.580143 55.656601 55.657624L376.718409 677.970032z" fill="#231F20" p-id="4779"></path><path d="M888.265084 415.735539c-15.144932 0-27.562752 12.313443-27.620058 27.665083l0 372.98283c0 19.559475-15.885805 35.444257-35.475979 35.444257L194.220958 851.827709c-19.559475 0-35.504632-15.883759-35.504632-35.444257L158.716326 207.602222c0-19.575848 15.945157-35.474956 35.504632-35.474956l406.367171 0c15.231913 0 27.592428-12.371772 27.592428-27.606755 0-15.202237-12.360516-27.590382-27.592428-27.590382L190.013123 116.930129c-47.684022 0-86.49291 38.779212-86.49291 86.49291L103.520213 820.59231c0 47.713698 38.808888 86.47756 86.49291 86.47756l639.334083 0c47.715745 0 86.509283-38.763862 86.509283-86.47756L915.856489 443.222567C915.794068 428.048983 903.408993 415.735539 888.265084 415.735539" fill="#231F20" p-id="4780"></path></svg>
        `;
      editButton.addEventListener('click', function () {
        if (questionText.readOnly) {
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
          let questionToUpdate = storedQuestions.find(q => q.text === question.text);
          if (questionToUpdate) {
            questionToUpdate.text = questionText.value;
            localStorage.setItem('questions', JSON.stringify(storedQuestions));
          }
        }
      });

      buttonContainer.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = `
          <svg t="1684417025938" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3682" width="24" height="24"><path d="M840 288H688v-56c0-40-32-72-72-72h-208C368 160 336 192 336 232V288h-152c-12.8 0-24 11.2-24 24s11.2 24 24 24h656c12.8 0 24-11.2 24-24s-11.2-24-24-24zM384 288v-56c0-12.8 11.2-24 24-24h208c12.8 0 24 11.2 24 24V288H384zM758.4 384c-12.8 0-24 11.2-24 24v363.2c0 24-19.2 44.8-44.8 44.8H332.8c-24 0-44.8-19.2-44.8-44.8V408c0-12.8-11.2-24-24-24s-24 11.2-24 24v363.2c0 51.2 41.6 92.8 92.8 92.8h358.4c51.2 0 92.8-41.6 92.8-92.8V408c-1.6-12.8-12.8-24-25.6-24z" fill="#272636" p-id="3683"></path><path d="M444.8 744v-336c0-12.8-11.2-24-24-24s-24 11.2-24 24v336c0 12.8 11.2 24 24 24s24-11.2 24-24zM627.2 744v-336c0-12.8-11.2-24-24-24s-24 11.2-24 24v336c0 12.8 11.2 24 24 24s24-11.2 24-24z" fill="#272636" p-id="3684"></path></svg>
        `; // SVG for delete button

      deleteButton.addEventListener('click', function () {
        // Remove the question from the DOM
        div.remove();

        // Remove the question from localStorage
        let storedQuestions = localStorage.getItem('questions');
        storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
        storedQuestions = storedQuestions.filter(q => q.text !== questionText.value);
        localStorage.setItem('questions', JSON.stringify(storedQuestions));
      });


      buttonContainer.appendChild(deleteButton);

      const sortButton = document.createElement('button');
      sortButton.className = 'sort-handle'; // add this line
      sortButton.innerHTML = `
          <svg t="1684417162772" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6670" width="24" height="24"><path d="M368 706.72l-64 64V576h-64v194.72l-64-64L130.72 752 272 893.28 413.28 752 368 706.72zM272 130.72L130.72 272 176 317.28l64-64V448h64V253.28l64 64L413.28 272 272 130.72zM480 192h416v64H480zM480 384h416v64H480zM480 576h416v64H480zM480 768h416v64H480z" fill="#333333" p-id="6671"></path></svg>
        `; // SVG for sort button

      buttonContainer.appendChild(sortButton);

      div.appendChild(buttonContainer);

      questionList.appendChild(div);
      // Use the answered property from localStorage
      if (question.answered) {
        div.classList.add('answered');
      }

    }
  });


  document.getElementById('start').addEventListener('click', async function () {
    const questions = document.getElementsByClassName('question');
    for (let i = 0; i < questions.length; i++) {
      let questionDiv = questions[i];
      let questionInput = questionDiv.querySelector('input.question-text'); // Get the input element
      if (!questionDiv.classList.contains('answered')) {
        await askQuestion(questionInput.value);
        questionDiv.classList.add('answered');
        // Update the answered status in localStorage
        let storedQuestions = localStorage.getItem('questions');
        storedQuestions = storedQuestions ? JSON.parse(storedQuestions) : [];
        let questionToUpdate = storedQuestions.find(q => q.text === questionInput.value);
        if (questionToUpdate) {
          questionToUpdate.answered = true;
          localStorage.setItem('questions', JSON.stringify(storedQuestions));
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before starting the next question
      }
    }
  });

  function findParent(el, selector, level = 5) {
    let parent = el.parentNode;
    let count = 1;
    while (parent && count <= level) {
      if (parent && parent.constructor !== HTMLDocument && parent.matches(selector)) {
        return parent;
      }
      parent = parent.parentNode;
      count++;
    }
    return null;
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
                // Check if the "Continue generating" button is present
                const continueSvg = document.querySelector('form.stretch .justify-center polygon[points="11 19 2 12 11 5 11 19"]');
                if (continueSvg) {
                  const continueButton = findParent(continueSvg, 'button');
                  if (continueButton) {
                    continueButton.click();
                  }
                } else {
                  // The answer has finished generating, stop observing
                  observer.disconnect();
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

