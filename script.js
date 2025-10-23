// main script for the treasure levels app
const TOTAL_LEVELS = 7;
const levelsEl = document.getElementById('levels');
const levelContainer = document.getElementById('level-container');
const homeView = document.getElementById('view-home');
const startBtn = document.getElementById('start-btn');

function getProgress() {
  return parseInt(localStorage.getItem('treasure_progress') || '1', 10);
}
function setProgress(v) {
  localStorage.setItem('treasure_progress', String(v));
  renderSidebar();
}
function renderSidebar() {
  const prog = getProgress();
  levelsEl.innerHTML = '';
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const div = document.createElement('div');
    div.className = 'level' + (i > prog ? ' locked' : '');
    div.dataset.level = i;
    div.innerHTML = `<div class="num">${i}</div><div>Level ${i}</div>`;
    div.onclick = () => {
      if (i > getProgress()) return alert('This level is locked. Complete previous levels to unlock it.');
      showLevel(i);
    };
    levelsEl.appendChild(div);
  }
}

function showLevel(n) {
  homeView.classList.add('hidden');
  levelContainer.classList.remove('hidden');
  levelContainer.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'level-title';
  title.innerHTML = `<h3>Level ${n}</h3><div><button onclick="goHome()" class="small btn" style="background:#4b5563">Home</button></div>`;
  levelContainer.appendChild(title);

  const content = document.createElement('div');
  content.style.marginTop = '16px';

  switch (n) {
    case 1: level1(content, n); break;
    case 2: level2(content, n); break;
    case 3: level3(content, n); break;
    case 4: level4(content, n); break;
    case 5: level5(content, n); break;
    case 6: level6(content, n); break;
    case 7: level7(content, n); break;
  }
  levelContainer.appendChild(content);
}

function goHome() {
  levelContainer.classList.add('hidden');
  homeView.classList.remove('hidden');
}

function unlockNext(current) {
  const prog = getProgress();
  if (current >= prog && current < TOTAL_LEVELS) {
    setProgress(current + 1);
    alert('Nice! Next level unlocked.');
  } else if (current === TOTAL_LEVELS) {
    setProgress(TOTAL_LEVELS);
    alert('You finished all levels!');
  }
}

/*********************** Helper: askForNames ***********************/
function askForNames(levelNum, container, expectedNames = []) {
  const form = document.createElement("div");
  form.innerHTML = `
    <p style="margin-top:10px"><strong>Bonus step:</strong> Enter two names to unlock next level.</p>
    <input id="name1" type="text" placeholder="First name" style="margin:4px"/>
    <input id="name2" type="text" placeholder="Second name" style="margin:4px"/>
    <button class="btn small" id="submitNames">Submit</button>
    <div id="nameMsg" style="margin-top:6px"></div>
  `;
  container.appendChild(form);

  const msg = form.querySelector("#nameMsg");
  form.querySelector("#submitNames").onclick = () => {
    const n1 = form.querySelector("#name1").value.trim().toLowerCase();
    const n2 = form.querySelector("#name2").value.trim().toLowerCase();
    if (
      expectedNames.length === 0 ||
      (n1 === expectedNames[0].toLowerCase() && 
       (expectedNames[1] ? n2 === expectedNames[1].toLowerCase() : true))
    ) {
      msg.innerHTML = `<div class="success">Perfect! You entered the right names 🎉</div>`;
      unlockNext(levelNum);
    } else {
      msg.innerHTML = `<div style="color:red">Hmm... try again!</div>`;
    }
  };
}

/*********************** Level 1 ***********************/
    function level1(el,levelNum){
      el.innerHTML = `
        <p><strong>Task:</strong> Record yourself saying this tongue twister:</p>
        <blockquote class="small">"She sells seashells by the seashore"</blockquote>
        <p>Press <strong>Record</strong>, say the line, then press <strong>Stop</strong>.</p>
        <div style="display:flex;gap:8px;margin-top:8px"><button id="rec-start" class="btn small">Record</button><button id="rec-stop" class="btn small" style="background:#94a3b8">Stop</button></div>
        <div id="rec-status" style="margin-top:10px;color:#333;font-weight:600"></div>
        <div id="rec-play" style="margin-top:12px"></div>
        <div id="surprise1" class="hidden" style="margin-top:14px">
          <h4>Surprise Audio Messages</h4>
          <div class="audio-card">
            <img src="https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=60" alt="photo1" />
            <div style="flex:1">
              <div style="font-weight:700">Birthday Message 1</div>
              <div class="small">Click play to hear</div>
            </div>
            <button id="play-surprise1">Play</button>
          </div>

          <div style="height:8px"></div>
          <div class="audio-card">
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60" alt="photo2" />
            <div style="flex:1">
              <div style="font-weight:700">Birthday Message 2</div>
              <div class="small">Plays after the first message</div>
            </div>
            <button id="play-surprise2">Play</button>
          </div>

        </div>
      `;

      // Recording logic
      let mediaRecorder, chunks=[];
      const recStart = el.querySelector('#rec-start');
      const recStop = el.querySelector('#rec-stop');
      const recStatus = el.querySelector('#rec-status');
      const recPlay = el.querySelector('#rec-play');
      const surprise1 = el.querySelector('#surprise1');
      const play1 = () => { new Audio('assets/audio/jyo.mp3').play();};
  const play2 = () => speakText('Surprise! Hope you like your gifts. Love from all of us.');



      // Helper to reveal surprises
      function revealSurprises(){
        surprise1.classList.remove('hidden');
        setTimeout(()=>{
          const play1Btn = el.querySelector('#play-surprise1');
          const play2Btn = el.querySelector('#play-surprise2');
          if(play1Btn) play1Btn.onclick = ()=>play1();
          if(play2Btn) {
            play2Btn.onclick = ()=>play2();
            play2Btn.addEventListener('click', ()=>{unlockNext(levelNum)}, {once: true});
          }
        },300);
      }

      recStart.onclick = async ()=>{
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Recording not supported in this browser. Click Stop to see your surprises!');
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({audio:true});
          mediaRecorder = new MediaRecorder(stream);
          chunks = [];
          mediaRecorder.ondataavailable = e=>chunks.push(e.data);
          mediaRecorder.onstart = ()=>{recStatus.textContent='Recording...';}
          mediaRecorder.onstop = ()=>{
            recStatus.textContent='Recording stopped.';
            const blob = new Blob(chunks,{type:'audio/webm'});
            const url = URL.createObjectURL(blob);
            recPlay.innerHTML = `<audio controls src="${url}"></audio>`;
            revealSurprises();
          }
          mediaRecorder.start();
        } catch(err) {
          recStatus.textContent = 'Microphone access denied. Click Stop to see your surprises anyway!';
        }
      }

      // Provide voice synthesis helper
      function speakText(txt){
        if(typeof speechSynthesis === 'undefined'){alert('SpeechSynthesis not supported');return}
        const ut = new SpeechSynthesisUtterance(txt);
        ut.rate = 0.95; ut.pitch = 1;
        speechSynthesis.speak(ut);
      }

      // Stop button - works even without recording
      recStop.onclick = ()=>{
        if(mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        } else {
          // No recording in progress, just reveal surprises
          recStatus.textContent = 'Opening surprises...';
          revealSurprises();
        }
      }
    }
/*********************** Level 2 ***********************/
function level2(el, levelNum) {
  const sentence = 'I love Chicken, Prawns, Fish';
  const reversed = sentence.split('').reverse().join('');

  el.innerHTML = `
    <p><strong>Task:</strong> The sentence below is reversed. Type it correctly.</p>
    <div style="padding:12px;border-radius:8px;border:1px dashed #ddd;background:#fafafa;font-weight:700">${reversed}</div>
    <input id="lvl2-input" type="text" placeholder="Type the correct sentence" />
    <button id="lvl2-check" class="btn small">Check</button>
    <div id="lvl2-result" style="margin-top:12px"></div>
  `;
  const checkBtn = el.querySelector("#lvl2-check");
  const result = el.querySelector("#lvl2-result");

  checkBtn.onclick = () => {
    const v = el.querySelector("#lvl2-input").value.trim();
    if (v.toLowerCase() === sentence.toLowerCase()) {
      result.innerHTML = `<div class="success">Correct! Surprise unlocked 🎁</div>
      <div style="margin-top:10px;display:flex;gap:8px;">
        <img src="assets/images/rohini.jpg" />
      </div>`;
      askForNames(levelNum, result, ["Rohini"]);
    } else result.textContent = "Try again!";
  };
}

/*********************** Level 3 ***********************/
function level3(el, levelNum) {
  el.innerHTML = `
    <p><strong>Task:</strong> Solve the riddle.</p>
    <p class="small"><em>I speak without a mouth and hear without ears. What am I?</em></p>
    <input id="lvl3-input" type="text" placeholder="Your answer" />
    <button id="lvl3-check" class="btn small">Check</button>
    <div id="lvl3-result" style="margin-top:12px"></div>
  `;
  el.querySelector('#lvl3-check').onclick = () => {
    const ans = el.querySelector('#lvl3-input').value.trim().toLowerCase();
    const res = el.querySelector('#lvl3-result');
    if (ans === 'echo') {
      res.innerHTML = `<div class="success">Correct! Call these numbers: +91 8019479564  & +91 9178761542</div>`;
      askForNames(levelNum, res, ["Vinay", "Jairaj"]);
    } else res.textContent = 'Try again.';
  };
}

/*********************** Level 4 ***********************/
function level4(el, levelNum) {
  el.innerHTML = `
    <p><strong>Task:</strong> Solve: 12 + 5 - 22 / 11 * 54 = ?</p>
    <input id="lvl4-input" type="text" placeholder="Your answer" />
    <button id="lvl4-check" class="btn small">Check</button>
    <div id="lvl4-result" style="margin-top:12px"></div>
  `;
  el.querySelector('#lvl4-check').onclick = () => {
    const v = parseInt(el.querySelector('#lvl4-input').value.trim(), 10);
    const res = el.querySelector('#lvl4-result');
    if (v === -91) {
      res.innerHTML = `<div class="success">Correct! Surprise: <a href="https://www.instagram.com/bujjikondaa_5408?igsh=YjZvdXRvamF2aHl6" target="_blank">Instagram Profile</a></div>`;
      askForNames(levelNum, res, ["Sarika", "Shiva"]);
    } else res.textContent = 'Try again.';
  };
}

/*********************** Level 5 ***********************/
function level5(el, levelNum) {
  el.innerHTML = `
    <p><strong>Task:</strong> What word becomes shorter when you add two letters to it?</p>
    <input id="lvl5-input" type="text" placeholder="Your answer" />
    <button id="lvl5-check" class="btn small">Check</button>
    <div id="lvl5-result" style="margin-top:12px"></div>
  `;
  el.querySelector('#lvl5-check').onclick = () => {
    const ans = el.querySelector('#lvl5-input').value.trim().toLowerCase();
    const res = el.querySelector('#lvl5-result');
    if (ans === 'short') {
      res.innerHTML = `<div class="success">Correct! Surprise: Check your mail inbox ✉️</div>`;
      askForNames(levelNum, res, ["Surya", "Rakesh"]);
    } else res.textContent = 'Try again.';
  };
}
/*********************** Level 6 ***********************/
function level6(el, levelNum) {
    el.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Level ${levelNum}: Coding Question</h2>
        <p><strong>Task:</strong> Solve this coding question to unlock your surprise video.</p>
        <p class="small text-gray-600">
            What is the output of the following Python code?<br>
            <code>print(11* (13 + 1)+ "pumpkin")</code>
        </p>
        <input id="lvl6-input" type="text" placeholder="Your answer here" class="border p-2 rounded w-full mt-2"/>
        <button id="lvl6-check" class="btn small mt-2">Check Answer</button>
        <div id="lvl6-result" class="mt-4"></div>
    `;

    const input = el.querySelector('#lvl6-input');
    const checkBtn = el.querySelector('#lvl6-check');
    const resultEl = el.querySelector('#lvl6-result');
    const VIDEO_SRC = 'assets/audio/sindhu.mp4'; // Your surprise video

    checkBtn.onclick = () => {
        const ans = input.value.trim();
        if (ans ==='143pumpkin') {
            resultEl.innerHTML = `
                <div class="success">
                    Correct! Here is your surprise video:
                    <video width="100%" height="auto" controls class="mt-3 rounded-lg shadow-md">
                        <source src="${VIDEO_SRC}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
            if (typeof window.unlockNext === 'function') window.unlockNext(levelNum);
        } else {
            resultEl.innerHTML = `<div class="error">Incorrect — try again!</div>`;
        }
    };
}

/*********************** Level 7 ***********************/
function level7(el, levelNum) {
  el.innerHTML = `
    <h2>Final Level 🎓</h2>
    <p>Enter your college ID to unlock the final surprise.</p>
    <input id="clgid" type="text" placeholder="Enter college ID" />
    <button id="checkClg" class="btn small">Submit</button>
    <div id="clgResult" style="margin-top:10px"></div>
  `;
  el.querySelector("#checkClg").onclick = () => {
    const val = el.querySelector("#clgid").value.trim();
    const out = el.querySelector("#clgResult");
    if (val === "223j5a4605") {
      out.innerHTML = `<div class="success">🎁 Correct! Here your final Drive link: 
      <a href="https://drive.google.com/file/d/1pAd2j09JpuK_0R4R1FxPya1m8Kd2MqkJ/view?usp=drivesdk" target="_blank">Open Drive</a></div>`;
      unlockNext(levelNum);
    } else out.textContent = "Incorrect ID, try again!";
  };
}

startBtn.onclick = () => { showLevel(1); };
renderSidebar();
