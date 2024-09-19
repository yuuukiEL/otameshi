document.addEventListener('DOMContentLoaded', function () {
    // DOM要素の取得
    const prevDateBtn = document.getElementById('prevDay');
    const nextDateBtn = document.getElementById('nextDay');
    const currentDateElem = document.getElementById('currentDate');
    const calendarBtn = document.getElementById('calendarBtn');
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    const imagePreview = document.getElementById('imagePreview');
    const diaryContent = document.getElementById('diaryContent');
    const taskList = document.getElementById('taskList');
    const addTaskBtn = document.querySelector('.add-task-icon');
    const locationBtn = document.getElementById('locationBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveBtn = document.getElementById('saveBtn');

    let currentDate = new Date();

    // 日付表示の更新
    function updateDateDisplay() {
        currentDateElem.textContent = currentDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // 前の日へ
    prevDateBtn.addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
    });

    // 次の日へ
    nextDateBtn.addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
    });

    // カレンダーボタン
    calendarBtn.addEventListener('click', function () {
        const newDate = prompt('日付を入力してください (YYYY-MM-DD):',
            currentDate.toISOString().split('T')[0]);
        if (newDate) {
            currentDate = new Date(newDate);
            updateDateDisplay();
        }
    });

    // 画像アップロード
    imageUploadBtn.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    imagePreview.innerHTML = '';
                    imagePreview.appendChild(img);
                    updatePoints();
                }
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // タスク追加機能
    if (addTaskBtn && taskList) {
        addTaskBtn.addEventListener('click', function() {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <input type="text" class="task-input" placeholder="タスク内容を入力">
                <button class="task-delete-btn">
                    <img src="/static/img/feather/trash-2.svg" alt="Delete" class="task-delete-icon">
                </button>
            `;

            const deleteBtn = taskItem.querySelector('.task-delete-btn');
            deleteBtn.addEventListener('click', function() {
                taskItem.remove();
            });

            taskList.appendChild(taskItem);
        });
    } else {
        console.error('addTaskBtn or taskList element not found');
    }

    // 付箋の切り替え機能
    function initStickyNotes() {
        const stickyNotes = document.querySelectorAll('.sticky-note');
        const contents = document.querySelectorAll('.task-mood-content');

        stickyNotes.forEach(note => {
            note.addEventListener('click', function() {
                const target = this.dataset.target;
                
                stickyNotes.forEach(n => n.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                this.classList.add('active');
                document.getElementById(target).classList.add('active');

                if (target === 'location') {
                    initMap();
                }
            });
        });
    }

    initStickyNotes();

    // ポイント計算
    async function updatePoints() {
        try {
            const result = await calculateDiaryPoints(
                diaryContent.textContent,
                [],  // ハッシュタグ機能を削除したため、空の配列を渡す
                imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : null,
                Array.from(document.querySelectorAll('.task-item')).map(item => item.textContent)
            );
            
            document.getElementById('hashtagPoints').textContent = `ハッシュタグ: ${result.hashtagPoints}点`;
            document.getElementById('diaryPoints').textContent = `日記内容: ${result.diaryPoints}点`;
            document.getElementById('imagePoints').textContent = `画像: ${result.imagePoints}点`;
            document.getElementById('taskPoints').textContent = `タスク: ${result.taskPoints}点`;
            totalPointsElement.textContent = result.totalPoints;
        } catch (error) {
            console.error('Error updating points:', error);
        }
    }

    // ポイントのツールチップ表示
    pointsContainer.addEventListener('mouseenter', function () {
        const rect = this.getBoundingClientRect();
        pointsTooltip.style.display = 'block';
        pointsTooltip.style.top = `${rect.top + window.scrollY - pointsTooltip.offsetHeight - 10}px`;
        pointsTooltip.style.left = `${rect.left + window.scrollX + (rect.width - pointsTooltip.offsetWidth) / 2}px`;
    });

    pointsContainer.addEventListener('mouseleave', function () {
        pointsTooltip.style.display = 'none';
    });

    // 初期化
    function init() {
        updateDateDisplay();
        updatePoints();
    }

    init();

    // イベントリスナーの追加
    diaryContent.addEventListener('input', updatePoints);

    // ウィンドウクリックでモーダルを閉じる
    window.addEventListener('click', (event) => {
        if (event.target === iconModal) {
            iconModal.style.display = 'none';
        }
    });

    // 日記編集ツールバー
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const command = this.dataset.command;
            switch (command) {
                case 'fontSize':
                    const size = prompt('フォントサイズを入力してください（1-7）:', '3');
                    document.execCommand('fontSize', false, size);
                    break;
                case 'foreColor':
                case 'hiliteColor':
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.onchange = function () {
                        document.execCommand(command, false, this.value);
                    };
                    input.click();
                    break;
                case 'insertText':
                    const tag = prompt('ハッシュタグを入力してください:', '');
                    document.execCommand('insertText', false, '#' + tag + ' ');
                    break;
                default:
                    document.execCommand(command, false, null);
            }
        });
    });

    // プレースホルダーの動作を模倣
    diaryContent.addEventListener('focus', function () {
        if (this.textContent === this.getAttribute('placeholder')) {
            this.textContent = '';
        }
        this.style.backgroundPosition = '0 1.5em';
    });
    diaryContent.addEventListener('blur', function () {
        if (this.textContent === '') {
            this.textContent = this.getAttribute('placeholder');
            this.style.backgroundPosition = '0 1.5em';
        }
    });
    diaryContent.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertParagraph', false);
        }
    });

    // 位置情報の設定
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            console.log('位置情報を設定');
        });
    }

    // 設定画面を開く
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            console.log('設定画面を開く');
        });
    }

    // 保存
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            console.log('保存');
        });
    }
});

function initMap() {
    if (typeof google !== 'undefined') {
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 35.6895, lng: 139.6917 },
            zoom: 8
        });
    } else {
        console.error('Google Maps API not loaded');
    }
}