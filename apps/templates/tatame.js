// Gemini APIキーを読み込む
const { GEMINI_API_KEY } = window.config;

document.addEventListener('DOMContentLoaded', function () {
    // 日付ナビゲーションの機能
    const prevDateBtn = document.getElementById('prevDate');
    const nextDateBtn = document.getElementById('nextDate');
    const currentDateElem = document.getElementById('currentDate');

    prevDateBtn.addEventListener('click', function () {
        const currentDate = new Date(currentDateElem.textContent);
        currentDate.setDate(currentDate.getDate() - 1);
        currentDateElem.textContent = formatDate(currentDate);
    });

    nextDateBtn.addEventListener('click', function () {
        const currentDate = new Date(currentDateElem.textContent);
        currentDate.setDate(currentDate.getDate() + 1);
        currentDateElem.textContent = formatDate(currentDate);
    });

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    // タスク追加機能
    const addTaskBtn = document.getElementById('addTaskBtn');
    const newTaskInput = document.getElementById('newTaskInput');
    const taskDeadline = document.getElementById('taskDeadline');
    const taskList = document.getElementById('taskList');

    addTaskBtn.addEventListener('click', addTask);

    function addTask() {
        const taskText = newTaskInput.value.trim();
        let deadline = taskDeadline.value;

        if (taskText) {
            if (!deadline) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                deadline = formatDate(tomorrow);
            }

            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';

            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            checkboxWrapper.appendChild(checkbox);

            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';

            const taskTextSpan = document.createElement('span');
            taskTextSpan.className = 'task-text';
            taskTextSpan.textContent = taskText;

            const taskDeadlineSpan = document.createElement('span');
            taskDeadlineSpan.className = 'task-deadline';
            taskDeadlineSpan.textContent = deadline;

            taskContent.appendChild(taskTextSpan);
            taskContent.appendChild(taskDeadlineSpan);

            taskItem.appendChild(checkboxWrapper);
            taskItem.appendChild(taskContent);

            taskList.appendChild(taskItem);

            newTaskInput.value = '';
            taskDeadline.value = '';

            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    taskItem.style.opacity = '0';
                    taskItem.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        taskList.removeChild(taskItem);
                    }, 300);
                }
            });

            updateTaskPoints();
        }
    }

    // 画像参照機能
    const imageReferenceBtn = document.getElementById('imageReferenceBtn');
    const imagePreview = document.getElementById('imagePreview');
    let currentImage = null;

    imageReferenceBtn.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (currentImage) {
                        imagePreview.removeChild(currentImage);
                    }
                    currentImage = document.createElement('img');
                    currentImage.src = e.target.result;
                    imagePreview.appendChild(currentImage);
                    showRemoveButton();
                    updateImagePoints(file);
                }
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    function showRemoveButton() {
        let removeBtn = document.querySelector('.image-remove-btn');
        if (!removeBtn) {
            removeBtn = document.createElement('button');
            removeBtn.className = 'image-remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', removeImage);
            imagePreview.parentElement.appendChild(removeBtn);
        }
        removeBtn.style.display = 'block';
    }

    function removeImage() {
        if (currentImage) {
            imagePreview.removeChild(currentImage);
            currentImage = null;
        }
        document.querySelector('.image-remove-btn').style.display = 'none';
        updateImagePoints(null);
    }

    // アイコン選択機能
    const selectIconBtn = document.getElementById('selectIconBtn');
    const iconModal = document.getElementById('iconModal');
    const closeBtn = iconModal.querySelector('.close');
    const iconGrid = document.getElementById('iconGrid');
    const moodIcon = document.getElementById('moodIcon');

    selectIconBtn.addEventListener('click', openIconModal);
    closeBtn.addEventListener('click', closeIconModal);

    function openIconModal() {
        iconModal.style.display = 'block';
        loadIcons();
    }

    function closeIconModal() {
        iconModal.style.display = 'none';
    }

    function loadIcons() {
        const iconCount = 40;

        iconGrid.innerHTML = '';
        for (let i = 1; i <= iconCount; i++) {
            const img = document.createElement('img');
            img.src = `/apps/static/img/icon/${i}.png`;
            img.alt = `アイコン ${i}`;
            img.className = 'icon-preview';
            img.addEventListener('click', () => selectIcon(i));
            iconGrid.appendChild(img);
        }
    }

    function selectIcon(iconNumber) {
        moodIcon.innerHTML = `<img src="/apps/static/img/icon/${iconNumber}.png" alt="アイコン ${iconNumber}" width="50" height="50">`;
        closeIconModal();
    }

    // ポイント計算機能
    const hashtagInput = document.getElementById('hashtagInput');
    const diaryContent = document.querySelector('.diary-content');
    const pointsContainer = document.getElementById('pointsContainer');
    const pointsTooltip = document.getElementById('pointsTooltip');
    const totalPointsElement = document.getElementById('totalPoints');

    let debounceTimer;

    function debounce(func, delay) {
        return function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
        }
    }

    async function updatePoints() {
        const hashtags = hashtagInput.value;
        const diary = diaryContent.value;

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `以下の日記内容とハッシュタグを分析し、ポイントを計算してください。
                                   日記内容: ${diary}
                                   ハッシュタグ: ${hashtags}
                                   
                                   結果は以下のJSON形式で返してください：
                                   {
                                     "hashtagPoints": 数値,
                                     "diaryPoints": 数値
                                   }`
                        }]
                    }]
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const result = JSON.parse(data.candidates[0].content.parts[0].text);

            document.getElementById('hashtagPoints').textContent = `ハッシュタグ: ${result.hashtagPoints}点`;
            document.getElementById('diaryPoints').textContent = `日記内容: ${result.diaryPoints}点`;
            updateTotalPoints();
        } catch (error) {
            console.error('ポイントの計算中にエラーが発生しました:', error);
        }
    }

    async function updateImagePoints(file) {
        if (!file) {
            document.getElementById('imagePoints').textContent = '画像: 0点';
            updateTotalPoints();
            return;
        }

        // 注意: Gemini APIは直接画像を処理できないため、
        // ここでは画像の説明を生成し、それに基づいてポイントを計算します
        try {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const base64Image = e.target.result.split(',')[1];
                
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GEMINI_API_KEY}`
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "この画像を分析し、0から100の間でポイントを付けてください。ポイントは画像の品質、構図、興味深さに基づいて決定してください。" },
                                { 
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const imagePoints = parseInt(data.candidates[0].content.parts[0].text);

                document.getElementById('imagePoints').textContent = `画像: ${imagePoints}点`;
                updateTotalPoints();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('画像分析中にエラーが発生しました:', error);
        }
    }

    async function updateTaskPoints() {
        const tasks = Array.from(taskList.querySelectorAll('.task-item')).map(task => ({
            text: task.querySelector('.task-text').textContent,
            deadline: task.querySelector('.task-deadline').textContent
        }));

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_API_KEY}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `以下のタスクリストを分析し、全体的な重要度と緊急度に基づいてポイントを計算してください。
                                   タスクリスト: ${JSON.stringify(tasks)}
                                   
                                   結果は以下のJSON形式で返してください：
                                   {
                                     "taskPoints": 数値
                                   }`
                        }]
                    }]
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const result = JSON.parse(data.candidates[0].content.parts[0].text);

            document.getElementById('taskPoints').textContent = `タスク: ${result.taskPoints}点`;
            updateTotalPoints();
        } catch (error) {
            console.error('タスク分析中にエラーが発生しました:', error);
        }
    }

    function updateTotalPoints() {
        const hashtagPoints = parseInt(document.getElementById('hashtagPoints').textContent.split(':')[1]) || 0;
        const diaryPoints = parseInt(document.getElementById('diaryPoints').textContent.split(':')[1]) || 0;
        const imagePoints = parseInt(document.getElementById('imagePoints').textContent.split(':')[1]) || 0;
        const taskPoints = parseInt(document.getElementById('taskPoints').textContent.split(':')[1]) || 0;

        const totalPoints = hashtagPoints + diaryPoints + imagePoints + taskPoints;
        totalPointsElement.textContent = totalPoints;
    }

    const debouncedUpdatePoints = debounce(updatePoints, 1000);

    hashtagInput.addEventListener('input', debouncedUpdatePoints);
    diaryContent.addEventListener('input', debouncedUpdatePoints);

    // ポイントのホバー表示
    pointsContainer.addEventListener('mouseenter', function (event) {
        pointsTooltip.style.display = 'block';
        requestAnimationFrame(() => {
            pointsTooltip.classList.add('visible');
        });
    });

    pointsContainer.addEventListener('mouseleave', function (event) {
        pointsTooltip.classList.remove('visible');
        pointsTooltip.addEventListener('transitionend', function hideTooltip() {
            pointsTooltip.style.display = 'none';
            pointsTooltip.removeEventListener('transitionend', hideTooltip);
        });
    });

    // デバッグ用のコード（問題が解決しない場合に使用）
    pointsContainer.addEventListener('mouseenter', function (event) {
        console.log('Mouse entered points container');
    });

    pointsContainer.addEventListener('mouseleave', function (event) {
        console.log('Mouse left points container');
    });

    // 初期化
    function init() {
        updatePoints();
        updateTaskPoints();
        if (currentImage) {
            updateImagePoints(currentImage);
        }
    }

    init();

    // ウィンドウクリックでモーダルを閉じる
    window.addEventListener('click', (event) => {
        if (event.target === iconModal) {
            closeIconModal();
        }
    });
});