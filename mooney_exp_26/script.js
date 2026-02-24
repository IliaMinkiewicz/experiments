// Define study
const study = lab.util.fromObject({
  "title": "root",
  "type": "lab.flow.Sequence",
  "parameters": {},
  "plugins": [
    {
      "type": "lab.plugins.Metadata",
      "path": undefined
    },
    {
      "type": "lab.plugins.Download",
      "filePrefix": "mooney",
      "path": undefined
    }
  ],
  "metadata": {
    "title": "mooney",
    "description": "",
    "repository": "",
    "contributors": ""
  },
  "files": {},
  "responses": {},
  "content": [
    {
      "type": "lab.flow.Sequence",
      "files": {},
      "responses": {
        "": ""
      },
      "parameters": {},
      "messageHandlers": {},
      "title": "Sequence",
      "plugins": [
        {
          "type": "fullscreen",
          "message": "Кликните, чтобы развернуть на весь экран",
          "hint": "",
          "path": "lab.plugins.Fullscreen"
        }
      ],
      "content": [
        {
          "type": "lab.html.Page",
          "items": [
            {
              "required": true,
              "type": "html",
              "content": "\u003Ccenter style=\"font-size: 34px\"\u003E\r\nЗдравствуйте!\u003Cbr\u003E Cпасибо, что согласились принять участие во втором этапе исследования.\r\n\u003Cbr\u003E\u003Cbr\u003E\r\n\u003Cbutton type=\"submit\" class=\"custom-btn btn-3\"\u003E\u003Cspan\u003EДалее\u003C\u002Fspan\u003E\u003C\u002Fbutton\u003E\r\n\u003C\u002Fcenter\u003E",
              "name": ""
            }
          ],
          "scrollTop": true,
          "submitButtonPosition": "hidden",
          "files": {},
          "responses": {
            "keydown(Enter)": "Enter"
          },
          "parameters": {},
          "messageHandlers": {
            "before:prepare": function anonymous(
) {
// Глобальный объект для размеров
window.sizes = {
  card_width_mm: 85.6, // Стандарт карты
  px_per_mm: 3.78,     // Значение по умолчанию (если калибровку пропустят)

  // Функция сохранения масштаба (вызывается на экране калибровки)
  set_scale: function(pixel_width) {
    this.px_per_mm = pixel_width / this.card_width_mm;
  },

  // Главная функция: СМ -> ПИКСЕЛИ (строкой '...px')
  cm: function(val_cm) {
    return (val_cm * 10 * this.px_per_mm) + 'px';
  }
};
}
          },
          "title": "Приветствие",
          "tardy": true,
          "plugins": []
        },
        {
          "type": "lab.html.Page",
          "items": [
            {
              "required": true,
              "type": "html",
              "content": "\u003Ccenter style=\"font-size: 24px\"\u003E\r\n\u003Cdiv class=\"detect_card\" style=\"text-align: left; width:700px; height: auto;\" \u003E\r\n\r\n\u003Clabel for=\"id\"\u003EВведите id:\u003C\u002Flabel\u003E\u003Cbr\u003E\r\n\u003Cinput type=\"number\" id=\"id\" name=\"id\" required autofocus\u003E\u003Cbr\u003E\r\n\r\n\u003Clabel for=\"sex\"\u003EПожалуйста, укажите свой пол:\u003C\u002Flabel\u003E\u003Cbr\u003E\r\n  \u003Cselect class=\"custom-btn custom_select\" name=\"sex\"\u003E\r\n  \u003Coption value=\"m\" selected\u003Eмужской\u003C\u002Foption\u003E\r\n  \u003Coption value=\"f\"\u003Eженский\u003C\u002Foption\u003E\r\n\u003C\u002Fselect\u003E\u003Cbr\u003E\r\n\r\n\u003Clabel for=\"age\"\u003EВведите возраст:\u003C\u002Flabel\u003E\u003Cbr\u003E\r\n\u003Cinput type=\"number\" id=\"age\" name=\"age\" min=\"10\" max=\"90\" required\u003E\u003Cbr\u003E\r\n\r\n\u003Clabel for=\"first_list\"\u003EFirst list (какой список будет первым):\u003C\u002Flabel\u003E\u003Cbr\u003E\r\n\u003Cselect class=\"custom-btn custom_select\" id=\"first_list\" name=\"first_list\" required\u003E\r\n  \u003Coption value=\"\" disabled selected\u003EВыберите...\u003C\u002Foption\u003E\r\n  \u003Coption value=\"1\"\u003EСписок 1\u003C\u002Foption\u003E\r\n  \u003Coption value=\"2\"\u003EСписок 2\u003C\u002Foption\u003E\r\n\u003C\u002Fselect\u003E\u003Cbr\u003E\r\n\u003Ccenter\u003E\r\n  \u003Cbutton type=\"submit\" class=\"custom-btn btn-3\"\u003E\u003Cspan\u003EОтправить\u003C\u002Fspan\u003E\u003C\u002Fbutton\u003E\r\n\u003C\u002Fcenter\u003E\r\n\r\n\u003C\u002Fdiv\u003E\r\n\u003C\u002Fcenter\u003E",
              "name": ""
            }
          ],
          "scrollTop": true,
          "submitButtonText": "Continue →",
          "submitButtonPosition": "hidden",
          "files": {},
          "responses": {
            "": ""
          },
          "parameters": {},
          "messageHandlers": {
            "run": function anonymous(
) {
const listSelect = document.getElementById('first_list');

// Как только участник выбирает значение, сохраняем его
listSelect.addEventListener('change', (e) => {
    window.first_list = e.target.value; 
});
}
          },
          "title": "Анкета"
        },
        {
          "type": "lab.html.Page",
          "items": [
            {
              "required": true,
              "type": "html",
              "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Ch2 style=\"text-align: center; margin-bottom: 20px;\"\u003EКалибровка экрана\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cp style=\"text-align: center; max-width: 600px; margin-bottom: 40px; font-size: 1.2em; line-height: 1.5;\"\u003E\r\n    Пожалуйста, приложите пластиковую карту стандартного размера (например, банковскую) к экрану.\u003Cbr\u003E\u003Cbr\u003E\r\n    Используйте стрелки \u003Cb\u003EВВЕРХ\u003C\u002Fb\u003E и \u003Cb\u003EВНИЗ\u003C\u002Fb\u003E на клавиатуре, чтобы изменить размер изображения карты на экране так, чтобы он в точности совпал с вашей пластиковой картой.\u003Cbr\u003E\u003Cbr\u003E\r\n    Нажмите \u003Cb\u003EПРОБЕЛ\u003C\u002Fb\u003E, когда размеры совпадут.\r\n  \u003C\u002Fp\u003E\r\n\r\n  \u003Cdiv id=\"card_rect\" style=\"width: 400px; height: 252px; background-color: #e6f3f5; border-radius: 12px; border: 2px solid #black; display: flex; justify-content: center; align-items: center; color: black; font-size: 1.5em; font-weight: bold; text-align: center; user-select: none;\"\u003E\r\n    ПРИЛОЖИТЕ КАРТУ\r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
              "name": ""
            }
          ],
          "scrollTop": true,
          "submitButtonText": "Continue →",
          "submitButtonPosition": "hidden",
          "files": {},
          "responses": {},
          "parameters": {},
          "messageHandlers": {
            "run": function anonymous(
) {
// Скрываем курсор мыши для всего документа
document.body.style.cursor = 'none';

const component = this;
const card = document.getElementById('card_rect');

// Начальная ширина (в пикселях) и соотношение сторон (Ширина / Высота карты)
let currentWidth = 400; 
const aspectRatio = 1.5857; 

// Флаги состояния клавиш
let isUpPressed = false;
let isDownPressed = false;

// 1. Отслеживаем НАЖАТИЕ клавиши
const keydownHandler = (e) => {
    if (e.key === 'ArrowUp') {
        isUpPressed = true;
        e.preventDefault(); // Отключаем прокрутку страницы
    }
    if (e.key === 'ArrowDown') {
        isDownPressed = true;
        e.preventDefault();
    }
    // Подтверждение размера пробелом
    if (e.code === 'Space') {
        e.preventDefault();
        finishCalibration();
    }
};

// 2. Отслеживаем ОТПУСКАНИЕ клавиши
const keyupHandler = (e) => {
    if (e.key === 'ArrowUp') isUpPressed = false;
    if (e.key === 'ArrowDown') isDownPressed = false;
};

document.addEventListener('keydown', keydownHandler);
document.addEventListener('keyup', keyupHandler);

// 3. Бесконечный цикл отрисовки (60 кадров в секунду)
let animationFrameId;

const resizeLoop = () => {
    const speed = 1.5; // Скорость изменения (пикселей за кадр). Можно менять.
    
    if (isUpPressed) {
        currentWidth += speed;
    }
    if (isDownPressed) {
        currentWidth -= speed;
        if (currentWidth < 50) currentWidth = 50; // Защита от схлопывания в 0
    }
    
    // Применяем новые размеры к элементу, если кнопка зажата
    if (isUpPressed || isDownPressed) {
        card.style.width = currentWidth + 'px';
        card.style.height = (currentWidth / aspectRatio) + 'px';
    }
    
    // Запрашиваем следующий кадр
    animationFrameId = requestAnimationFrame(resizeLoop);
};

// Запускаем цикл
animationFrameId = requestAnimationFrame(resizeLoop);

// 4. Завершение калибровки
const finishCalibration = () => {
    // Очищаем слушатели и останавливаем анимацию
    document.removeEventListener('keydown', keydownHandler);
    document.removeEventListener('keyup', keyupHandler);
    cancelAnimationFrame(animationFrameId);
    
    // Физическая ширина карты - 8.56 см. Вычисляем пиксели в 1 сантиметре
    const pxPerCm = currentWidth / 8.56;
    
    // Записываем результат в файл данных
    component.data.px_per_cm = pxPerCm;
    
    // Сохраняем глобальную функцию конвертации см -> px
    // (Именно эту функцию мы использовали в других компонентах: window.sizes.cm)
    if (!window.sizes) window.sizes = {};
    window.sizes.cm = function(cmValue) {
        return (cmValue * pxPerCm) + 'px';
    };
    
    // Переходим к следующему экрану
    component.end();
};
},
            "end": function anonymous(
) {
const slider = document.getElementById('calib-slider');
if (slider && window.sizes) {
  // Сохраняем масштаб в глобальный объект!
  window.sizes.set_scale(parseInt(slider.value));
}



}
          },
          "title": "Калибровка",
          "tardy": true
        },
        {
          "type": "lab.flow.Sequence",
          "files": {},
          "responses": {
            "": ""
          },
          "parameters": {},
          "messageHandlers": {},
          "title": "Инструкции",
          "content": [
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 704,
                  "height": 403.20000000000005,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"Instruction1_2.jpg\"] }",
                  "autoScale": false
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "Instruction1.JPG": "embedded\u002Fca0ab99016bd2daee9e32bb35bfee8dbb9d8802f9b1aa29b63e8d710afb18002.JPG",
                "Instruction1_2.jpg": "embedded\u002Fe49820dba0a52b88dcb53ed33b5fee4955ebaa97ac23526d4ac1833d973df980.jpg"
              },
              "responses": {
                "keydown(Space)": "space_inst1"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Инструкция1"
            },
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 704,
                  "height": 403.20000000000005,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"Instruction2_2.jpg\"] }",
                  "autoScale": false
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "Instruction1.JPG": "embedded\u002Fca0ab99016bd2daee9e32bb35bfee8dbb9d8802f9b1aa29b63e8d710afb18002.JPG",
                "Instruction2_2.jpg": "embedded\u002F23df2278b09048bff2ce8c75e8f461e3ec6b2d1fe2bcf3a20de0d83f4a3f238a.jpg"
              },
              "responses": {
                "keydown(Space)": "space_inst1"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Инструкция2"
            },
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 704,
                  "height": 403.20000000000005,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"Instruction3_2.jpg\"] }",
                  "autoScale": false
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "Instruction1.JPG": "embedded\u002Fca0ab99016bd2daee9e32bb35bfee8dbb9d8802f9b1aa29b63e8d710afb18002.JPG",
                "Instruction3_2.jpg": "embedded\u002Fa59b4d551d41ca29bc99e26c4e1f139aa9537ee48dd3ca4d9c0752f6459338b9.jpg"
              },
              "responses": {
                "keydown(Space)": "space_inst1"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Инструкция3"
            },
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 704,
                  "height": 403.20000000000005,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"Instruction4_2.jpg\"] }",
                  "autoScale": false
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "Instruction1.JPG": "embedded\u002Fca0ab99016bd2daee9e32bb35bfee8dbb9d8802f9b1aa29b63e8d710afb18002.JPG",
                "Instruction4_2.jpg": "embedded\u002F0f8d8fa5528933b2026cd2ef7be2034b453a8a44d4ac562c67f36a8fcb5d1258.jpg"
              },
              "responses": {
                "keydown(Space)": "space_inst1"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Инструкция4"
            },
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 704,
                  "height": 403.20000000000005,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"Instruction5_2.jpg\"] }",
                  "autoScale": false
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "Instruction1.JPG": "embedded\u002Fca0ab99016bd2daee9e32bb35bfee8dbb9d8802f9b1aa29b63e8d710afb18002.JPG",
                "Instruction5_2.jpg": "embedded\u002Fd0d1a7b7b1721ebc7dcd90bd0de9efb53ed37670e0da714b8eb6e2cb37794736.jpg"
              },
              "responses": {
                "keydown(Space)": "space_inst1"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Инструкция5"
            }
          ]
        },
        {
          "type": "lab.flow.Sequence",
          "files": {},
          "responses": {
            "": ""
          },
          "parameters": {},
          "messageHandlers": {
            "before:prepare": function anonymous(
) {
window.image_click = function(image) {
  window.image = image
  document.getElementsByClassName(image)[0].className = "select"
}
}
          },
          "title": "Основная часть",
          "tardy": true,
          "content": [
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 704,
                  "height": 403.20000000000005,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"tren_instr_2.jpg\"] }",
                  "autoScale": false
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "Instruction1.JPG": "embedded\u002Fca0ab99016bd2daee9e32bb35bfee8dbb9d8802f9b1aa29b63e8d710afb18002.JPG",
                "Instruction5_2.jpg": "embedded\u002Fd0d1a7b7b1721ebc7dcd90bd0de9efb53ed37670e0da714b8eb6e2cb37794736.jpg",
                "tren_instr_2.jpg": "embedded\u002F0650d50ac5336ffbd2735a2bc713b03b3db0f27027ac5bd090cb9f7debc4e951.jpg"
              },
              "responses": {
                "keydown(Space)": "space_inst1"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Инструкция о тренировке"
            },
            {
              "type": "lab.flow.Loop",
              "templateParameters": [
                {
                  "mooney": "403.jpg",
                  "mooney_gs": "403gs.jpg",
                  "answer": "бабочка",
                  "prob_id": "0"
                },
                {
                  "mooney": "442.jpg",
                  "mooney_gs": "442gs.jpg",
                  "answer": "кактус",
                  "prob_id": "1"
                },
                {
                  "mooney": "1301.jpg",
                  "mooney_gs": "1301gs.jpg",
                  "answer": "вертолёт",
                  "prob_id": "2"
                }
              ],
              "sample": {
                "mode": "draw-shuffle"
              },
              "files": {},
              "responses": {
                "": ""
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "trainingLoop",
              "shuffleGroups": [],
              "template": {
                "type": "lab.flow.Sequence",
                "files": {},
                "responses": {
                  "": ""
                },
                "parameters": {},
                "messageHandlers": {},
                "title": "Sequence",
                "content": [
                  {
                    "type": "lab.html.Screen",
                    "files": {},
                    "responses": {},
                    "parameters": {},
                    "messageHandlers": {},
                    "title": "Fixation_cross",
                    "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cspan style=\"font-size: 6em; color: #000000; font-family: Arial, sans-serif; user-select: none;\"\u003E\r\n    +\r\n  \u003C\u002Fspan\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                    "timeout": "500"
                  },
                  {
                    "type": "lab.html.Page",
                    "items": [
                      {
                        "required": true,
                        "type": "html",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cimg src=\"${ parameters.img }\" \r\n       style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto;\" \r\n       class=\"mooney-image\"\u003E\r\n  \r\n  \u003Cdiv id=\"space_prompt\" style=\"visibility: hidden; margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #000000; text-align: center;\"\u003E\r\n    Нажмите \"Пробел\" если поняли, что изображено\r\n  \u003C\u002Fdiv\u003E\r\n  \u003Cdiv id=\"countdown_timer\" style=\"position: absolute; top: 5%; right: 5%; font-size: 4em; font-family: 'Times New Roman', serif; color: #000000;\"\u003E\r\n  20\r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E\r\n\r\n",
                        "name": ""
                      }
                    ],
                    "scrollTop": true,
                    "submitButtonText": "Continue →",
                    "submitButtonPosition": "hidden",
                    "files": {
                      "1301.jpg": "embedded\u002Fa0a6ff8d55f95435cff398c7dcdb81d804698f649bb975f414e66a9f0522cc27.jpg",
                      "403.jpg": "embedded\u002F5b473037fd0af0263a700af5e14acd351c0f3fd15ce04d6a9718320077691ae4.jpg",
                      "442.jpg": "embedded\u002F2ca06434343d12fe2c3976afe8220d363c5a111e5e9114e6aaadbf2fce72d8ab.jpg"
                    },
                    "responses": {
                      "keypress(Space)": "space"
                    },
                    "parameters": {},
                    "messageHandlers": {
                      "before:prepare": function anonymous(
) {
this.parameters.img = this.files[this.parameters.mooney]

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(9.2593);
} else {
  this.parameters.grid_px = '170px';
}
},
                      "end": function anonymous(
) {
// Проверяем, записал ли lab.js ответ (нажатие пробела). 
// При тайм-ауте this.data.response обычно пустой или undefined.
if (this.data.response === 'space' || this.data.response) {
    // Пробел нажат
    this.data.skipped_trial = 0;       // Записываем в файл результатов (как в PsychoPy)
    window.skipped_trial = false;      // Глобальный флаг для следующего экрана
} else {
    // Время вышло
    this.data.skipped_trial = 1;       // Записываем в файл результатов
    window.skipped_trial = true;       // Глобальный флаг
}
},
                      "run": function anonymous(
) {
const timerElement = document.getElementById('countdown_timer');
const spacePrompt = document.getElementById('space_prompt'); // Находим нашу новую надпись
let timeLeft = 20; // Стартовое время

// Запускаем секундный таймер
const timerInterval = setInterval(() => {
  timeLeft--; 
  
  // Обновляем цифры в углу экрана
  if (timerElement) {
    timerElement.textContent = timeLeft;
  }
  
  // --- НОВОЕ УСЛОВИЕ ---
  // Если осталось 5 секунд или меньше, делаем надпись видимой
  if (timeLeft <= 5 && spacePrompt) {
    spacePrompt.style.visibility = 'visible';
  }
  // ----------------------
  
  // Если время вышло, останавливаем счетчик
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
  }
}, 1000);

// Очистка памяти при досрочном нажатии пробела
this.on('end', () => {
  clearInterval(timerInterval);
});
}
                    },
                    "title": "Stimuli_presentation",
                    "timeout": "20000"
                  },
                  {
                    "type": "lab.html.Page",
                    "items": [
                      {
                        "required": true,
                        "type": "html",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;\"\u003E\r\n  \r\n  \u003Ch2 style=\"margin-bottom: 30px; text-align: center;\"\u003EЧто изображено на картинке?\r\n    После ввода, нажмите ВВОД (Enter), чтобы подтвердить ответ.\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cinput type=\"text\" id=\"answer_input\" autocomplete=\"off\" placeholder=\"Введите ответ...\" \r\n         style=\"width: 80%; max-width: 800px; padding: 15px; font-size: 1.5em; text-align: center; border: 5px solid #000000; border-radius: 8px; text-transform: uppercase; outline: none; transition: border-color 0.3s;\"\u003E\r\n  \r\n\u003C\u002Fdiv\u003E",
                        "name": ""
                      }
                    ],
                    "scrollTop": true,
                    "submitButtonText": "Continue →",
                    "submitButtonPosition": "hidden",
                    "files": {},
                    "responses": {},
                    "parameters": {},
                    "messageHandlers": {
                      "run": function anonymous(
) {
// 1. Сбрасываем флаг (чтобы в каждой новой пробе он по умолчанию был false)
window.answer_provided = false;

// --- ПРОВЕРКА НА ПРОПУСК ---
if (window.skipped_trial === true) {
    this.end();
    return; 
}
// ----------------------------

const component = this;
const input = document.getElementById('answer_input');

// Автоматически ставим курсор в поле ввода
input.focus();

// Фильтрация ввода (только кириллица и пробелы)
input.addEventListener('input', function(e) {
  this.value = this.value.replace(/[^а-яА-ЯёЁ\s]/g, '');
});

// Обработка нажатия клавиши Enter
const keyHandler = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); 
    
    const finalAnswer = input.value.trim().toUpperCase();
    
    if (finalAnswer.length > 0) {
      // 2. ФИКСИРУЕМ УСПЕХ! (Без этой строчки Original_presentation не сработает)
      window.answer_provided = true;
      
      // Снимаем слушатель клавиатуры
      document.removeEventListener('keydown', keyHandler);
      
      // Записываем ответ в файл результатов
      component.data.final_answer = finalAnswer;
      
      // Завершаем экран
      component.end();
    }
  }
};

// Вешаем прослушку нажатий на весь документ
document.addEventListener('keydown', keyHandler);

// Возвращаем фокус в поле, если пользователь случайно кликнул мышкой мимо
document.addEventListener('click', () => input.focus());
}
                    },
                    "title": "Answer_response",
                    "timeout": "10000"
                  },
                  {
                    "type": "lab.html.Screen",
                    "files": {},
                    "responses": {},
                    "parameters": {},
                    "messageHandlers": {
                      "run": function anonymous(
) {
// --- ПРОВЕРКА НА ПРОПУСК ---
if (window.skipped_trial === true) {
    this.end();
    return;
}
// ----------------------------

const component = this;

const keyHandler = (e) => {
    let response = null;
    
    // В PsychoPy стрелки записываются именно этими словами
    if (e.key === 'ArrowLeft') response = 'left';
    if (e.key === 'ArrowDown') response = 'down';
    if (e.key === 'ArrowRight') response = 'right';

    // Если нажата одна из трех целевых кнопок
    if (response) {
        e.preventDefault();
        
        // Удаляем слушатель, чтобы он не сработал на следующем экране
        document.removeEventListener('keydown', keyHandler);
        
        // Записываем ответ точно в ту колонку, которую ожидает R-скрипт (key_source.keys)
        component.data['key_source.keys'] = response;
        
        // Завершаем экран
        component.end();
    }
};

// Вешаем прослушку на весь документ
document.addEventListener('keydown', keyHandler);
}
                    },
                    "title": "Source_monitoring",
                    "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Ch2 style=\"font-size: 2.5em; text-align: center; margin-bottom: 60px;\"\u003EКак Вы нашли ответ?\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cdiv style=\"display: flex; justify-content: space-between; width: 80%; max-width: 900px; text-align: center;\"\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EВспомнил\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003Eрешение\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&larr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EНе знаю\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; visibility: hidden;\"\u003E(пусто)\u003C\u002Fp\u003E \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&darr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EРаспознал\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003Eсейчас\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&rarr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                    "timeout": "10000"
                  },
                  {
                    "type": "lab.html.Page",
                    "items": [
                      {
                        "required": true,
                        "type": "html",
                        "content": "\u003Cdiv class=\"main-wrapper\" id=\"mooney_container\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;\"\u003E\r\n  \r\n  \u003Ch2 style=\"margin: 0 0 20px 0; text-align: center;\"\u003EПостарайтесь вспомнить, какого цвета была рамка вокруг замаскированного изображения на предыдущем этапе.\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cdiv class=\"grid-box\"\u003E\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[0] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[0] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[1] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[1] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[2] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[2] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[3] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[3] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[4] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[4] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[5] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[5] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[6] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[6] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[7] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[7] }\"\u003E\r\n  \u003C\u002Fdiv\u003E\r\n\r\n  \u003Cp id=\"space_instruction\" style=\"visibility: hidden; text-align: center; margin-top: 30px; font-size: 1.3em; font-weight: bold; color: #000;\"\u003E\r\n    После выбора цвета рамки, нажмите ПРОБЕЛ, чтобы подтвердить выбор.\r\n  \u003C\u002Fp\u003E\r\n  \r\n\u003C\u002Fdiv\u003E",
                        "name": ""
                      }
                    ],
                    "scrollTop": true,
                    "submitButtonText": "Continue →",
                    "submitButtonPosition": "hidden",
                    "files": {
                      "1301.jpg": "embedded\u002Fa0a6ff8d55f95435cff398c7dcdb81d804698f649bb975f414e66a9f0522cc27.jpg",
                      "403.jpg": "embedded\u002F5b473037fd0af0263a700af5e14acd351c0f3fd15ce04d6a9718320077691ae4.jpg",
                      "442.jpg": "embedded\u002F2ca06434343d12fe2c3976afe8220d363c5a111e5e9114e6aaadbf2fce72d8ab.jpg"
                    },
                    "responses": {},
                    "parameters": {},
                    "messageHandlers": {
                      "before:prepare": function anonymous(
) {
// 1. Цвета
let colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'pink'];
// Тасование (Fisher-Yates)
for (let i = colors.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [colors[i], colors[j]] = [colors[j], colors[i]];
}
this.parameters.mixed_colors = colors;

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(6);
} else {
  this.parameters.grid_px = '170px';
}

window.clicked = function(elem) {
  
}
},
                      "commit": function anonymous(
) {
this.state.color = window.image
window.image = ""
},
                      "run": function anonymous(
) {
// 1. ПОКАЗЫВАЕМ курсор при запуске этого экрана
document.body.style.cursor = 'default';

// 2. Гарантированно СКРЫВАЕМ курсор при завершении экрана.
// Событие 'end' сработает в любом случае: нажмет ли участник 
// пробел (завершив экран кодом this.end()) или выйдет время.
this.on('end', () => {
    document.body.style.cursor = 'none';
});

// Сохраняем ссылку на сам компонент lab.js, чтобы записывать в него данные
const component = this; 

const options = document.querySelectorAll('.mooney-option');
const instruction = document.querySelector('#space_instruction');

let lastSelected = null;
let isSelected = false; // Флаг: выбрана ли рамка

// 1. Обработка кликов по картинкам
options.forEach(opt => {
  opt.addEventListener('click', function(e) {
    // Сброс стилей у предыдущей выбранной картинки
    if (lastSelected) {
      lastSelected.style.transform = 'scale(1)';
    }
    
    // Выделение новой картинки
    this.style.transform = 'scale(1.1)';
    lastSelected = this;
    isSelected = true; // Разрешаем нажатие пробела
    
    // Показываем подсказку пользователю
    if (instruction) instruction.style.visibility = 'visible';
    
    // Правильная запись ответа в данные lab.js (в итоговый CSV)
    component.data.selected_frame_color = this.dataset.originalColor;
  });
});

// 2. Обработка нажатия пробела
const keyHandler = (e) => {
  // Реагируем ТОЛЬКО если нажат Пробел И картинка уже выбрана
  if (e.code === 'Space' && isSelected) {
    e.preventDefault(); // Чтобы страница не дергалась вниз при нажатии пробела
    
    // Обязательно удаляем слушатель клавиатуры перед выходом, 
    // чтобы он не сработал на следующих экранах
    document.removeEventListener('keydown', keyHandler); 
    
    // Завершаем этот экран и идем дальше
    component.end(); 
  }
};

// Вешаем слушатель клавиатуры на весь документ
document.addEventListener('keydown', keyHandler);
}
                    },
                    "title": "Grid_selection"
                  },
                  {
                    "type": "lab.html.Page",
                    "items": [
                      {
                        "required": true,
                        "type": "html",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cimg src=\"${ this.files[parameters.mooney_gs] }\" \r\n       style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto;\"\r\n       class=\"mooney-image\"\u003E\r\n  \r\n  \u003Cdiv id=\"dynamic_instruction\" style=\"margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #000; text-align: center;\"\u003E\r\n    \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                        "name": ""
                      },
                      {
                        "required": true,
                        "type": "text"
                      }
                    ],
                    "scrollTop": true,
                    "submitButtonText": "Continue →",
                    "submitButtonPosition": "hidden",
                    "files": {
                      "403gs.jpg": "embedded\u002F72f90dcd1b6f280b8505b2a2465c7d110f13d69ba93d4c2f8c4f9ce45a2299a2.jpg",
                      "442gs.jpg": "embedded\u002Fdefe3aaa0a794e304de5ea8133efda8df7ccca27ff3d59ceb38b689f3966935d.jpg",
                      "1301gs.jpg": "embedded\u002F47e905251a02f86c2059f9ccedbd16ec0b0d2741b44fd843e4765b9f4e3da5ed.jpg"
                    },
                    "responses": {},
                    "parameters": {},
                    "messageHandlers": {
                      "before:prepare": function anonymous(
) {
this.parameters.img = this.files[this.parameters.mooney]

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(9.2593);
} else {
  this.parameters.grid_px = '170px';
}
},
                      "run": function anonymous(
) {
const component = this;
const instructionEl = document.getElementById('dynamic_instruction');

// Проверяем, был ли успешно дан ответ:
// 1. Пробел на этапе картинки был нажат (skipped_trial === false)
// 2. И текст в поле ввода был введен (answer_provided === true)
const hasAnswer = (window.skipped_trial === false && window.answer_provided === true);

if (hasAnswer) {
    // =========================================================
    // СЦЕНАРИЙ 1: Участник успел нажать пробел и ввел ответ
    // =========================================================
    
    // Вставляем текст
    instructionEl.innerHTML = "Этот ли объект Вы увидели на замаскированном изображении?<br><br>(&larr; ДА &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; НЕТ &rarr;)";
    
    // Назначаем обработчик для стрелок "Влево" и "Вправо"
    const keyHandler = (e) => {
        let response = null;
        if (e.key === 'ArrowLeft') response = 'left';
        if (e.key === 'ArrowRight') response = 'right';
        
        if (response) {
            e.preventDefault();
            document.removeEventListener('keydown', keyHandler);
            
            // Сохраняем ответ в формате, идентичном PsychoPy (orig_resp.keys)
            component.data['orig_resp.keys'] = response;
            component.end();
        }
    };
    document.addEventListener('keydown', keyHandler);

} else {
    // =========================================================
    // СЦЕНАРИЙ 2: Тайм-аут (или пустое текстовое поле)
    // =========================================================
    
    // Вставляем альтернативный текст
    instructionEl.innerHTML = "Вот как выглядит объект, который был замаскирован.<br><br>(Нажмите ПРОБЕЛ, чтобы продолжить)";
    
    // Назначаем обработчик только для Пробела
    const keyHandler = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            document.removeEventListener('keydown', keyHandler);
            
            // Записываем пробел, чтобы в анализе было видно, что участник подтвердил просмотр
            component.data['orig_resp.keys'] = 'space'; 
            component.end();
        }
    };
    document.addEventListener('keydown', keyHandler);
}
}
                    },
                    "title": "Original_presentation",
                    "timeout": "10000"
                  }
                ]
              }
            },
            {
              "type": "lab.canvas.Screen",
              "content": [
                {
                  "type": "image",
                  "left": 0,
                  "top": 0,
                  "angle": 0,
                  "width": 806.4,
                  "height": 453.6,
                  "stroke": null,
                  "strokeWidth": 0,
                  "fill": "black",
                  "src": "${ this.files[\"main_phase_instr_2.jpg\"] }"
                }
              ],
              "viewport": [
                800,
                600
              ],
              "files": {
                "main_phase_instr_2.jpg": "embedded\u002F8200721d839bc5004b6cd2523196957a2dc4f9c95d6cdc3dc80db7de4cdd9d53.jpg"
              },
              "responses": {
                "keypress(Space)": "space"
              },
              "parameters": {},
              "messageHandlers": {},
              "title": "Начало основного этапа"
            },
            {
              "type": "lab.flow.Sequence",
              "files": {},
              "responses": {
                "": ""
              },
              "parameters": {},
              "messageHandlers": {
                "before:prepare": function anonymous(
) {
// Выводим в консоль браузера (F12) выбор участника для самопроверки
console.log("Выбранный список:", window.first_list);

// Если в анкете выбрали "2" (Список 2)
if (window.first_list === "2") {
    
    // Меняем порядок списков внутри Sequence
    this.options.content.reverse();
    
    console.log("Порядок изменен: сначала пойдет Список 2");
} else {
    console.log("Порядок оставлен по умолчанию: сначала Список 1");
}

// Записываем итоговый порядок в таблицу результатов для аналитики
this.data.actual_first_list = window.first_list;
}
              },
              "title": "Lists_Block",
              "tardy": true,
              "content": [
                {
                  "type": "lab.flow.Loop",
                  "templateParameters": [
                    {
                      "mooney": "007.jpg",
                      "mooney_gs": "007gs.jpg",
                      "corans": "лягушка",
                      "phase": "1",
                      "prob_id": "1"
                    },
                    {
                      "mooney": "026.jpg",
                      "mooney_gs": "026gs.jpg",
                      "corans": "граммофон",
                      "phase": "1",
                      "prob_id": "2"
                    },
                    {
                      "mooney": "052.jpg",
                      "mooney_gs": "052gs.jpg",
                      "corans": "кольцо",
                      "phase": "1",
                      "prob_id": "3"
                    },
                    {
                      "mooney": "1027.jpg",
                      "mooney_gs": "1027gs.jpg",
                      "corans": "корова",
                      "phase": "1",
                      "prob_id": "4"
                    },
                    {
                      "mooney": "1030.jpg",
                      "mooney_gs": "1030gs.jpg",
                      "corans": "пончики",
                      "phase": "1",
                      "prob_id": "5"
                    },
                    {
                      "mooney": "1044.jpg",
                      "mooney_gs": "1044gs.jpg",
                      "corans": "жираф",
                      "phase": "1",
                      "prob_id": "6"
                    },
                    {
                      "mooney": "105.jpg",
                      "mooney_gs": "105gs.jpg",
                      "corans": "скрепки",
                      "phase": "1",
                      "prob_id": "7"
                    },
                    {
                      "mooney": "1103.jpg",
                      "mooney_gs": "1103gs.jpg",
                      "corans": "бананы",
                      "phase": "1",
                      "prob_id": "8"
                    },
                    {
                      "mooney": "111.jpg",
                      "mooney_gs": "111gs.jpg",
                      "corans": "душ",
                      "phase": "1",
                      "prob_id": "9"
                    },
                    {
                      "mooney": "1140.jpg",
                      "mooney_gs": "1140gs.jpg",
                      "corans": "фигуристка",
                      "phase": "1",
                      "prob_id": "10"
                    },
                    {
                      "mooney": "1232.jpg",
                      "mooney_gs": "1232gs.jpg",
                      "corans": "голубь",
                      "phase": "1",
                      "prob_id": "11"
                    },
                    {
                      "mooney": "1248.jpg",
                      "mooney_gs": "1248gs.jpg",
                      "corans": "лев",
                      "phase": "1",
                      "prob_id": "12"
                    },
                    {
                      "mooney": "1254.jpg",
                      "mooney_gs": "1254gs.jpg",
                      "corans": "кролик",
                      "phase": "1",
                      "prob_id": "13"
                    },
                    {
                      "mooney": "1268.jpg",
                      "mooney_gs": "1268gs.jpg",
                      "corans": "белка",
                      "phase": "1",
                      "prob_id": "14"
                    },
                    {
                      "mooney": "1287.jpg",
                      "mooney_gs": "1287gs.jpg",
                      "corans": "велосипед",
                      "phase": "1",
                      "prob_id": "15"
                    },
                    {
                      "mooney": "1353.jpg",
                      "mooney_gs": "1353gs.jpg",
                      "corans": "перец",
                      "phase": "1",
                      "prob_id": "16"
                    },
                    {
                      "mooney": "1370.jpg",
                      "mooney_gs": "1370gs.jpg",
                      "corans": "бокал",
                      "phase": "1",
                      "prob_id": "17"
                    },
                    {
                      "mooney": "175.jpg",
                      "mooney_gs": "175gs.jpg",
                      "corans": "муха",
                      "phase": "1",
                      "prob_id": "18"
                    },
                    {
                      "mooney": "206.jpg",
                      "mooney_gs": "206gs.jpg",
                      "corans": "муравей",
                      "phase": "1",
                      "prob_id": "19"
                    },
                    {
                      "mooney": "319.jpg",
                      "mooney_gs": "319gs.jpg",
                      "corans": "ослы",
                      "phase": "1",
                      "prob_id": "20"
                    },
                    {
                      "mooney": "322.jpg",
                      "mooney_gs": "322gs.jpg",
                      "corans": "шляпа",
                      "phase": "1",
                      "prob_id": "21"
                    },
                    {
                      "mooney": "344.jpg",
                      "mooney_gs": "344gs.jpg",
                      "corans": "танк",
                      "phase": "1",
                      "prob_id": "22"
                    },
                    {
                      "mooney": "496.jpg",
                      "mooney_gs": "496gs.jpg",
                      "corans": "мопс",
                      "phase": "1",
                      "prob_id": "23"
                    },
                    {
                      "mooney": "511.jpg",
                      "mooney_gs": "511gs.jpg",
                      "corans": "медуза",
                      "phase": "1",
                      "prob_id": "24"
                    },
                    {
                      "mooney": "520.jpg",
                      "mooney_gs": "520gs.jpg",
                      "corans": "тигр",
                      "phase": "1",
                      "prob_id": "25"
                    },
                    {
                      "mooney": "522.jpg",
                      "mooney_gs": "522gs.jpg",
                      "corans": "кошка",
                      "phase": "1",
                      "prob_id": "26"
                    },
                    {
                      "mooney": "539.jpg",
                      "mooney_gs": "539gs.jpg",
                      "corans": "кит",
                      "phase": "1",
                      "prob_id": "27"
                    },
                    {
                      "mooney": "558.jpg",
                      "mooney_gs": "558gs.jpg",
                      "corans": "фламинго",
                      "phase": "1",
                      "prob_id": "28"
                    },
                    {
                      "mooney": "565.jpg",
                      "mooney_gs": "565gs.jpg",
                      "corans": "карты",
                      "phase": "1",
                      "prob_id": "29"
                    },
                    {
                      "mooney": "578.jpg",
                      "mooney_gs": "578gs.jpg",
                      "corans": "папоротник",
                      "phase": "1",
                      "prob_id": "30"
                    },
                    {
                      "mooney": "580.jpg",
                      "mooney_gs": "580gs.jpg",
                      "corans": "еноты",
                      "phase": "1",
                      "prob_id": "31"
                    },
                    {
                      "mooney": "598.jpg",
                      "mooney_gs": "598gs.jpg",
                      "corans": "улитка",
                      "phase": "1",
                      "prob_id": "32"
                    }
                  ],
                  "sample": {
                    "mode": "draw-shuffle"
                  },
                  "files": {},
                  "responses": {
                    "": ""
                  },
                  "parameters": {},
                  "messageHandlers": {},
                  "title": "first_list",
                  "shuffleGroups": [],
                  "template": {
                    "type": "lab.flow.Sequence",
                    "files": {},
                    "responses": {
                      "": ""
                    },
                    "parameters": {},
                    "messageHandlers": {},
                    "title": "Sequence",
                    "content": [
                      {
                        "type": "lab.html.Screen",
                        "files": {},
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {},
                        "title": "Fixation_cross",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cspan style=\"font-size: 6em; color: #000000; font-family: Arial, sans-serif; user-select: none;\"\u003E\r\n    +\r\n  \u003C\u002Fspan\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                        "timeout": "500"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cimg src=\"${ parameters.img }\" \r\n       style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto;\" \r\n       class=\"mooney-image\"\u003E\r\n  \r\n  \u003Cdiv id=\"space_prompt\" style=\"visibility: hidden; margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #000000; text-align: center;\"\u003E\r\n    Нажмите \"Пробел\" если поняли, что изображено\r\n  \u003C\u002Fdiv\u003E\r\n  \u003Cdiv id=\"countdown_timer\" style=\"position: absolute; top: 5%; right: 5%; font-size: 4em; font-family: 'Times New Roman', serif; color: #000000;\"\u003E\r\n  20\r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E\r\n\r\n",
                            "name": ""
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {
                          "539.jpg": "embedded\u002Fb2a3663cf800baff15a558a1d7cf8e9c1f56c6cbb19fdde16edd906f37710bb7.jpg",
                          "558.jpg": "embedded\u002Faaabf6abe53b96c2f8d553bb145931ee2b938c4a7ba28551ba0a764b691fa22c.jpg",
                          "565.jpg": "embedded\u002F577cdae29910dc8927b995d0fc3ea7adbb8b1ad26469a426d44da257aceb8768.jpg",
                          "578.jpg": "embedded\u002F0690b70ce145eb3fb156f4a55ad8e31bd56a99e5fb355af45be85e86ed6fc3ce.jpg",
                          "580.jpg": "embedded\u002F3a180476252c15a18f45fd92e00b594511d58b2696bc2d57b7539a9d3eea7cf3.jpg",
                          "598.jpg": "embedded\u002F2b31e78aa3c9f9eaef3bab90096185d89bae18322b0ad623065e5ff4ece9402f.jpg",
                          "1027.jpg": "embedded\u002F06fce4f87e8b350b013b1a8b9dc2065284c71255c0449cbbcdab5356a034f652.jpg",
                          "1030.jpg": "embedded\u002F5af6b0e5055d20c1cbb04dcc8be7babf1a559b8ef70540cc80c38d77c0c87088.jpg",
                          "1044.jpg": "embedded\u002Fe649a69b9d73dfd576dc0ac267a0efe30015ab3d1eef0315e794f5362e372815.jpg",
                          "1103.jpg": "embedded\u002F59ed30e21440422af394ceeab00841f86d48d1ea85af74ade96c529448e81190.jpg",
                          "1140.jpg": "embedded\u002F25702f04ef47a3e56021bbbae009528032d8006d10c7348ec1d7ccee12adcbee.jpg",
                          "1232.jpg": "embedded\u002F2b43d1a27c432e4bd752f690e005a4fa08adba70a9d12b16198d295caa98e7c7.jpg",
                          "1248.jpg": "embedded\u002Ff920d5e231e28be9363695c9ea9d14b1dd66c3e39849de301570a8f4b2ea27d4.jpg",
                          "1254.jpg": "embedded\u002Fbd5ba90a625c856221339b79184b9c9ad58bad72324d515b186f76edbb531d8c.jpg",
                          "1268.jpg": "embedded\u002F139b0fd651bc7cb57e2756f5adce91c3716f523cf269b0f53a50e5465558b9ef.jpg",
                          "1287.jpg": "embedded\u002Faad266d626e7b6f69183dbc64f0d0329dae8460c3d4024b0840636f7669a8c0c.jpg",
                          "1353.jpg": "embedded\u002F022fa0795989622a6d7d115a504c3081e1f9edd2c74e0d2e38f4b8dc93406f3f.jpg",
                          "1370.jpg": "embedded\u002Feae6ac427eeaa62e47340b8c3d265f98d3ad950370d16a5ed39d6661080d9cf0.jpg",
                          "007.jpg": "embedded\u002Ffe4387e356e94cffc8984fca6a6c9c9b61f95d10e665c98eeb0bb43f9d335c37.jpg",
                          "026.jpg": "embedded\u002Fa28335501bcff828590f9796243f294bc3bd668b90d96a0be27bbb01d5b41b03.jpg",
                          "052.jpg": "embedded\u002F0d563ca744566ff93a00d9bef3a1f9fd4ddae69b81a22c4a0a495f7204370f80.jpg",
                          "105.jpg": "embedded\u002F6040ae97f2a06808261089d728a9d7ca98652b19b552e16697227488782932ab.jpg",
                          "111.jpg": "embedded\u002F5684c271924f5c88832cbe13501bf79c50f7628daf343c00ef42035cf8b56874.jpg",
                          "175.jpg": "embedded\u002Fa99bdc97463f3d0e18f03c78f5da00e3c2b2ea957b7c985cb6868389d9457bb1.jpg",
                          "206.jpg": "embedded\u002F4945adf311e9ff62b0e262eb907b520079887ce69323870471f2680cc035a0bb.jpg",
                          "319.jpg": "embedded\u002Ffbcda2de4d5281af1df8bd3583ae69f1259c8a6676b52fb8bdcd4facb36337ee.jpg",
                          "322.jpg": "embedded\u002F596b9212c439316b06f1fdb49ab8e74395910d3fc839bea574a20cd1465b336d.jpg",
                          "344.jpg": "embedded\u002F9bad568ad42e63593214673231f21fdb64a92a8423334d04a87538ca0d10c167.jpg",
                          "496.jpg": "embedded\u002Fe6a360422511ff9d5a68afbace0033552ec580c9453509c9d1d137431403e7c5.jpg",
                          "511.jpg": "embedded\u002F14ed593f6473fb7765bd8d9ffc9342fa262b3d404b73295e9e2cfaee51c92137.jpg",
                          "520.jpg": "embedded\u002Fb4c8675f98dc964171efccb9eec89818d27bcb6353fa6c2286b4382d0fef5543.jpg",
                          "522.jpg": "embedded\u002F258e08e76ee5551b89a8c9ca32b699db9b9e3f56dc39d5b13fda2bd24c7beb13.jpg"
                        },
                        "responses": {
                          "keypress(Space)": "space"
                        },
                        "parameters": {},
                        "messageHandlers": {
                          "before:prepare": function anonymous(
) {
this.parameters.img = this.files[this.parameters.mooney]

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(9.2593);
} else {
  this.parameters.grid_px = '170px';
}
},
                          "end": function anonymous(
) {
// Проверяем, записал ли lab.js ответ (нажатие пробела). 
// При тайм-ауте this.data.response обычно пустой или undefined.
if (this.data.response === 'space' || this.data.response) {
    // Пробел нажат
    this.data.skipped_trial = 0;       // Записываем в файл результатов (как в PsychoPy)
    window.skipped_trial = false;      // Глобальный флаг для следующего экрана
} else {
    // Время вышло
    this.data.skipped_trial = 1;       // Записываем в файл результатов
    window.skipped_trial = true;       // Глобальный флаг
}
},
                          "run": function anonymous(
) {
const timerElement = document.getElementById('countdown_timer');
const spacePrompt = document.getElementById('space_prompt'); // Находим нашу новую надпись
let timeLeft = 20; // Стартовое время

// Запускаем секундный таймер
const timerInterval = setInterval(() => {
  timeLeft--; 
  
  // Обновляем цифры в углу экрана
  if (timerElement) {
    timerElement.textContent = timeLeft;
  }
  
  // --- НОВОЕ УСЛОВИЕ ---
  // Если осталось 5 секунд или меньше, делаем надпись видимой
  if (timeLeft <= 5 && spacePrompt) {
    spacePrompt.style.visibility = 'visible';
  }
  // ----------------------
  
  // Если время вышло, останавливаем счетчик
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
  }
}, 1000);

// Очистка памяти при досрочном нажатии пробела
this.on('end', () => {
  clearInterval(timerInterval);
});
}
                        },
                        "title": "Stimuli_presentation",
                        "timeout": "20000"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;\"\u003E\r\n  \r\n  \u003Ch2 style=\"margin-bottom: 30px; text-align: center;\"\u003EЧто изображено на картинке?\r\n    После ввода, нажмите ВВОД (Enter), чтобы подтвердить ответ.\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cinput type=\"text\" id=\"answer_input\" autocomplete=\"off\" placeholder=\"Введите ответ...\" \r\n         style=\"width: 80%; max-width: 800px; padding: 15px; font-size: 1.5em; text-align: center; border: 5px solid #000000; border-radius: 8px; text-transform: uppercase; outline: none; transition: border-color 0.3s;\"\u003E\r\n  \r\n\u003C\u002Fdiv\u003E",
                            "name": ""
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {},
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "run": function anonymous(
) {
// 1. Сбрасываем флаг (чтобы в каждой новой пробе он по умолчанию был false)
window.answer_provided = false;

// --- ПРОВЕРКА НА ПРОПУСК ---
if (window.skipped_trial === true) {
    this.end();
    return; 
}
// ----------------------------

const component = this;
const input = document.getElementById('answer_input');

// Автоматически ставим курсор в поле ввода
input.focus();

// Фильтрация ввода (только кириллица и пробелы)
input.addEventListener('input', function(e) {
  this.value = this.value.replace(/[^а-яА-ЯёЁ\s]/g, '');
});

// Обработка нажатия клавиши Enter
const keyHandler = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); 
    
    const finalAnswer = input.value.trim().toUpperCase();
    
    if (finalAnswer.length > 0) {
      // 2. ФИКСИРУЕМ УСПЕХ! (Без этой строчки Original_presentation не сработает)
      window.answer_provided = true;
      
      // Снимаем слушатель клавиатуры
      document.removeEventListener('keydown', keyHandler);
      
      // Записываем ответ в файл результатов
      component.data.final_answer = finalAnswer;
      
      // Завершаем экран
      component.end();
    }
  }
};

// Вешаем прослушку нажатий на весь документ
document.addEventListener('keydown', keyHandler);

// Возвращаем фокус в поле, если пользователь случайно кликнул мышкой мимо
document.addEventListener('click', () => input.focus());
}
                        },
                        "title": "Answer_response",
                        "timeout": "10000"
                      },
                      {
                        "type": "lab.html.Screen",
                        "files": {},
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "run": function anonymous(
) {
// --- ПРОВЕРКА НА ПРОПУСК ---
if (window.skipped_trial === true) {
    this.end();
    return;
}
// ----------------------------

const component = this;

const keyHandler = (e) => {
    let response = null;
    
    // В PsychoPy стрелки записываются именно этими словами
    if (e.key === 'ArrowLeft') response = 'left';
    if (e.key === 'ArrowDown') response = 'down';
    if (e.key === 'ArrowRight') response = 'right';

    // Если нажата одна из трех целевых кнопок
    if (response) {
        e.preventDefault();
        
        // Удаляем слушатель, чтобы он не сработал на следующем экране
        document.removeEventListener('keydown', keyHandler);
        
        // Записываем ответ точно в ту колонку, которую ожидает R-скрипт (key_source.keys)
        component.data['key_source.keys'] = response;
        
        // Завершаем экран
        component.end();
    }
};

// Вешаем прослушку на весь документ
document.addEventListener('keydown', keyHandler);
}
                        },
                        "title": "Source_monitoring",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Ch2 style=\"font-size: 2.5em; text-align: center; margin-bottom: 60px;\"\u003EКак Вы нашли ответ?\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cdiv style=\"display: flex; justify-content: space-between; width: 80%; max-width: 900px; text-align: center;\"\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EВспомнил\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003Eрешение\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&larr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EНе знаю\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; visibility: hidden;\"\u003E(пусто)\u003C\u002Fp\u003E \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&darr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EРаспознал\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003Eсейчас\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&rarr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                        "timeout": "10000"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" id=\"mooney_container\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;\"\u003E\r\n  \r\n  \u003Ch2 style=\"margin: 0 0 20px 0; text-align: center;\"\u003EПостарайтесь вспомнить, какого цвета была рамка вокруг замаскированного изображения на предыдущем этапе.\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cdiv class=\"grid-box\"\u003E\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[0] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[0] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[1] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[1] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[2] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[2] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[3] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[3] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[4] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[4] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[5] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[5] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[6] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[6] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[7] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[7] }\"\u003E\r\n  \u003C\u002Fdiv\u003E\r\n\r\n  \u003Cp id=\"space_instruction\" style=\"visibility: hidden; text-align: center; margin-top: 30px; font-size: 1.3em; font-weight: bold; color: #000;\"\u003E\r\n    После выбора цвета рамки, нажмите ПРОБЕЛ, чтобы подтвердить выбор.\r\n  \u003C\u002Fp\u003E\r\n  \r\n\u003C\u002Fdiv\u003E",
                            "name": ""
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {
                          "580.jpg": "embedded\u002F3a180476252c15a18f45fd92e00b594511d58b2696bc2d57b7539a9d3eea7cf3.jpg",
                          "598.jpg": "embedded\u002F2b31e78aa3c9f9eaef3bab90096185d89bae18322b0ad623065e5ff4ece9402f.jpg",
                          "1027.jpg": "embedded\u002F06fce4f87e8b350b013b1a8b9dc2065284c71255c0449cbbcdab5356a034f652.jpg",
                          "1030.jpg": "embedded\u002F5af6b0e5055d20c1cbb04dcc8be7babf1a559b8ef70540cc80c38d77c0c87088.jpg",
                          "1044.jpg": "embedded\u002Fe649a69b9d73dfd576dc0ac267a0efe30015ab3d1eef0315e794f5362e372815.jpg",
                          "1103.jpg": "embedded\u002F59ed30e21440422af394ceeab00841f86d48d1ea85af74ade96c529448e81190.jpg",
                          "1140.jpg": "embedded\u002F25702f04ef47a3e56021bbbae009528032d8006d10c7348ec1d7ccee12adcbee.jpg",
                          "1232.jpg": "embedded\u002F2b43d1a27c432e4bd752f690e005a4fa08adba70a9d12b16198d295caa98e7c7.jpg",
                          "1248.jpg": "embedded\u002Ff920d5e231e28be9363695c9ea9d14b1dd66c3e39849de301570a8f4b2ea27d4.jpg",
                          "1254.jpg": "embedded\u002Fbd5ba90a625c856221339b79184b9c9ad58bad72324d515b186f76edbb531d8c.jpg",
                          "1268.jpg": "embedded\u002F139b0fd651bc7cb57e2756f5adce91c3716f523cf269b0f53a50e5465558b9ef.jpg",
                          "1287.jpg": "embedded\u002Faad266d626e7b6f69183dbc64f0d0329dae8460c3d4024b0840636f7669a8c0c.jpg",
                          "1353.jpg": "embedded\u002F022fa0795989622a6d7d115a504c3081e1f9edd2c74e0d2e38f4b8dc93406f3f.jpg",
                          "1370.jpg": "embedded\u002Feae6ac427eeaa62e47340b8c3d265f98d3ad950370d16a5ed39d6661080d9cf0.jpg",
                          "007.jpg": "embedded\u002Ffe4387e356e94cffc8984fca6a6c9c9b61f95d10e665c98eeb0bb43f9d335c37.jpg",
                          "026.jpg": "embedded\u002Fa28335501bcff828590f9796243f294bc3bd668b90d96a0be27bbb01d5b41b03.jpg",
                          "052.jpg": "embedded\u002F0d563ca744566ff93a00d9bef3a1f9fd4ddae69b81a22c4a0a495f7204370f80.jpg",
                          "105.jpg": "embedded\u002F6040ae97f2a06808261089d728a9d7ca98652b19b552e16697227488782932ab.jpg",
                          "111.jpg": "embedded\u002F5684c271924f5c88832cbe13501bf79c50f7628daf343c00ef42035cf8b56874.jpg",
                          "175.jpg": "embedded\u002Fa99bdc97463f3d0e18f03c78f5da00e3c2b2ea957b7c985cb6868389d9457bb1.jpg",
                          "206.jpg": "embedded\u002F4945adf311e9ff62b0e262eb907b520079887ce69323870471f2680cc035a0bb.jpg",
                          "319.jpg": "embedded\u002Ffbcda2de4d5281af1df8bd3583ae69f1259c8a6676b52fb8bdcd4facb36337ee.jpg",
                          "322.jpg": "embedded\u002F596b9212c439316b06f1fdb49ab8e74395910d3fc839bea574a20cd1465b336d.jpg",
                          "344.jpg": "embedded\u002F9bad568ad42e63593214673231f21fdb64a92a8423334d04a87538ca0d10c167.jpg",
                          "496.jpg": "embedded\u002Fe6a360422511ff9d5a68afbace0033552ec580c9453509c9d1d137431403e7c5.jpg",
                          "511.jpg": "embedded\u002F14ed593f6473fb7765bd8d9ffc9342fa262b3d404b73295e9e2cfaee51c92137.jpg",
                          "520.jpg": "embedded\u002Fb4c8675f98dc964171efccb9eec89818d27bcb6353fa6c2286b4382d0fef5543.jpg",
                          "522.jpg": "embedded\u002F258e08e76ee5551b89a8c9ca32b699db9b9e3f56dc39d5b13fda2bd24c7beb13.jpg",
                          "539.jpg": "embedded\u002Fb2a3663cf800baff15a558a1d7cf8e9c1f56c6cbb19fdde16edd906f37710bb7.jpg",
                          "558.jpg": "embedded\u002Faaabf6abe53b96c2f8d553bb145931ee2b938c4a7ba28551ba0a764b691fa22c.jpg",
                          "565.jpg": "embedded\u002F577cdae29910dc8927b995d0fc3ea7adbb8b1ad26469a426d44da257aceb8768.jpg",
                          "578.jpg": "embedded\u002F0690b70ce145eb3fb156f4a55ad8e31bd56a99e5fb355af45be85e86ed6fc3ce.jpg"
                        },
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "before:prepare": function anonymous(
) {
// 1. Цвета
let colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'pink'];
// Тасование (Fisher-Yates)
for (let i = colors.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [colors[i], colors[j]] = [colors[j], colors[i]];
}
this.parameters.mixed_colors = colors;

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(6);
} else {
  this.parameters.grid_px = '170px';
}

window.clicked = function(elem) {
  
}
},
                          "commit": function anonymous(
) {
this.state.color = window.image
window.image = ""
},
                          "run": function anonymous(
) {
// 1. ПОКАЗЫВАЕМ курсор при запуске этого экрана
document.body.style.cursor = 'default';

// 2. Гарантированно СКРЫВАЕМ курсор при завершении экрана.
// Событие 'end' сработает в любом случае: нажмет ли участник 
// пробел (завершив экран кодом this.end()) или выйдет время.
this.on('end', () => {
    document.body.style.cursor = 'none';
});

// Сохраняем ссылку на сам компонент lab.js, чтобы записывать в него данные
const component = this; 

const options = document.querySelectorAll('.mooney-option');
const instruction = document.querySelector('#space_instruction');

let lastSelected = null;
let isSelected = false; // Флаг: выбрана ли рамка

// 1. Обработка кликов по картинкам
options.forEach(opt => {
  opt.addEventListener('click', function(e) {
    // Сброс стилей у предыдущей выбранной картинки
    if (lastSelected) {
      lastSelected.style.transform = 'scale(1)';
    }
    
    // Выделение новой картинки
    this.style.transform = 'scale(1.1)';
    lastSelected = this;
    isSelected = true; // Разрешаем нажатие пробела
    
    // Показываем подсказку пользователю
    if (instruction) instruction.style.visibility = 'visible';
    
    // Правильная запись ответа в данные lab.js (в итоговый CSV)
    component.data.selected_frame_color = this.dataset.originalColor;
  });
});

// 2. Обработка нажатия пробела
const keyHandler = (e) => {
  // Реагируем ТОЛЬКО если нажат Пробел И картинка уже выбрана
  if (e.code === 'Space' && isSelected) {
    e.preventDefault(); // Чтобы страница не дергалась вниз при нажатии пробела
    
    // Обязательно удаляем слушатель клавиатуры перед выходом, 
    // чтобы он не сработал на следующих экранах
    document.removeEventListener('keydown', keyHandler); 
    
    // Завершаем этот экран и идем дальше
    component.end(); 
  }
};

// Вешаем слушатель клавиатуры на весь документ
document.addEventListener('keydown', keyHandler);
}
                        },
                        "title": "Grid_selection"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cimg src=\"${ this.files[parameters.mooney_gs] }\" \r\n       style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto;\"\r\n       class=\"mooney-image\"\u003E\r\n  \r\n  \u003Cdiv id=\"dynamic_instruction\" style=\"margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #000; text-align: center;\"\u003E\r\n    \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                            "name": ""
                          },
                          {
                            "required": true,
                            "type": "text"
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {
                          "1353gs.jpg": "embedded\u002Fdc6e4c4b72504658521120fc99125a267076ba4fba6a7055c6c288eb7d2e74e9.jpg",
                          "1370gs.jpg": "embedded\u002Fede5a024f8e034281698f78d9f790d81979a3f8ba9b2f429571f1d6e0808f768.jpg",
                          "007gs.jpg": "embedded\u002F45b27636b944cf1e5aa1b5a8185ef4cc7061715f0965106f5a69501ff7e68f2f.jpg",
                          "026gs.jpg": "embedded\u002F55fa3c4c5207f8426129060daaf141f83141608225ebd84ad8ced7c7eb7dd275.jpg",
                          "052gs.jpg": "embedded\u002Fe5114be34d66d4a6936315eb40559e3d76c4039f176eb615c3ccdc5134661872.jpg",
                          "105gs.jpg": "embedded\u002Fd51230f925742e2746be806f65dbdddf3d950c934297c8ddfec896e79ab52af3.jpg",
                          "111gs.jpg": "embedded\u002F0bb82c2f5fcae19bcc50300104355af89b30748e8625edbd9ba1d7f01948ad56.jpg",
                          "175gs.jpg": "embedded\u002Fb8c908214f0c755d6b59f7280b79e6fe52b75156672caf85fdaf6349d51d4b4d.jpg",
                          "206gs.jpg": "embedded\u002Fc247e60e577aabee3eb081447676f506ee393d3deac906e89010eb4bd11b26fc.jpg",
                          "319gs.jpg": "embedded\u002F4085aee7d6be9c4861314ef6c27ac47bd17f3dde1625a35ae8b81dbbc6b18f18.jpg",
                          "322gs.jpg": "embedded\u002Fbf605670cf1ccdcd379e4efe08633c2342ed99d757b9cfdfc234e1947bd7be69.jpg",
                          "344gs.jpg": "embedded\u002Fd8b75fc32b72baf6744ea3f19da61c01cce8ece9003d6b3b369664ae90fceba1.jpg",
                          "496gs.jpg": "embedded\u002F3bf446775fb6435b18ef1c081e714b826f894ee4eb3c28386b9227f36bb25fb6.jpg",
                          "511gs.jpg": "embedded\u002F4a142da09bf0a4294e0fb49cb6ecb37913fa3036fede54e394ae07c0e1a80fd8.jpg",
                          "520gs.jpg": "embedded\u002F24d66ed85f807e82349f4cec905dc5552460217f11b48ad90a9f0943cb983b38.jpg",
                          "522gs.jpg": "embedded\u002F109036dd9da99335728e538c346845bd4723c8609a4a32fc53dd1686407f43ce.jpg",
                          "539gs.jpg": "embedded\u002F1951be6560c82e48bf9e67320cb07b62cf9dd3f8e2e0312afe93e0fdf0eddead.jpg",
                          "558gs.jpg": "embedded\u002F384fb17f714908d84a213d75dcc944fbf67363d45aa563c7d34c9b0c0ef486f9.jpg",
                          "565gs.jpg": "embedded\u002F0f78881460d0608cb9dfa975fa746b82e86b3472034a9c6c5b32746ef96071b4.jpg",
                          "578gs.jpg": "embedded\u002F9b06c503ce977644b686f57e06fa32ffee3f632eaeca09799f53b947c2e3539a.jpg",
                          "580gs.jpg": "embedded\u002F49214ad19f06a7e49dfe7f207b1f81505f8f4a8f18697d20c32ee110f661973a.jpg",
                          "598gs.jpg": "embedded\u002Fa8c197b4f08326154bf0ee0152dd4d421241fd9a18543e632317c72459fccf61.jpg",
                          "1027gs.jpg": "embedded\u002Fe076e8c2a766c58084765ef73044ab20020191d33126c095bc04d344d69f073f.jpg",
                          "1030gs.jpg": "embedded\u002F6d03393f619f225aa41db1ef5b1de1fe38114484669b01efede43a891bf4509e.jpg",
                          "1044gs.jpg": "embedded\u002Fce538c219145d400c59a4242b976563c5955c59c0a3710cec6d2e8d6b98542dc.jpg",
                          "1103gs.jpg": "embedded\u002Fba4a2e9db98cb09caeb394a551e580c1121913e1c2ab2ffa99e13b6a79f589a7.jpg",
                          "1140gs.jpg": "embedded\u002Fdce000e83ec43efe4f39dd9146bab87f7e4d3bffcf009d73dcd73f6a537108f3.jpg",
                          "1232gs.jpg": "embedded\u002F8326ba1e2b215511124322cc73c04f377caaf7e17ad7779161c6178d9975c5db.jpg",
                          "1248gs.jpg": "embedded\u002F4dfb73d2850ae6aa7b23944be0d5302d1d9d328c8759ef1da08a9e9fb59b86f7.jpg",
                          "1254gs.jpg": "embedded\u002Fd167700cdc57921b2e53660561c0c3fc93957f1064a3a1e79a5c8fa27d7cace3.jpg",
                          "1268gs.jpg": "embedded\u002F742dd52034ccae1dc421fd492d877715bc4bb0f81682cfd2707fbcc7cb0e5030.jpg",
                          "1287gs.jpg": "embedded\u002F732f026c825806bddd02604e2d3619fab93daa2f8b051da4bfb36a8c78a90542.jpg"
                        },
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "before:prepare": function anonymous(
) {
this.parameters.img = this.files[this.parameters.mooney]

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(9.2593);
} else {
  this.parameters.grid_px = '170px';
}
},
                          "run": function anonymous(
) {
const component = this;
const instructionEl = document.getElementById('dynamic_instruction');

// Проверяем, был ли успешно дан ответ:
// 1. Пробел на этапе картинки был нажат (skipped_trial === false)
// 2. И текст в поле ввода был введен (answer_provided === true)
const hasAnswer = (window.skipped_trial === false && window.answer_provided === true);

if (hasAnswer) {
    // =========================================================
    // СЦЕНАРИЙ 1: Участник успел нажать пробел и ввел ответ
    // =========================================================
    
    // Вставляем текст
    instructionEl.innerHTML = "Этот ли объект Вы увидели на замаскированном изображении?<br><br>(&larr; ДА &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; НЕТ &rarr;)";
    
    // Назначаем обработчик для стрелок "Влево" и "Вправо"
    const keyHandler = (e) => {
        let response = null;
        if (e.key === 'ArrowLeft') response = 'left';
        if (e.key === 'ArrowRight') response = 'right';
        
        if (response) {
            e.preventDefault();
            document.removeEventListener('keydown', keyHandler);
            
            // Сохраняем ответ в формате, идентичном PsychoPy (orig_resp.keys)
            component.data['orig_resp.keys'] = response;
            component.end();
        }
    };
    document.addEventListener('keydown', keyHandler);

} else {
    // =========================================================
    // СЦЕНАРИЙ 2: Тайм-аут (или пустое текстовое поле)
    // =========================================================
    
    // Вставляем альтернативный текст
    instructionEl.innerHTML = "Вот как выглядит объект, который был замаскирован.<br><br>(Нажмите ПРОБЕЛ, чтобы продолжить)";
    
    // Назначаем обработчик только для Пробела
    const keyHandler = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            document.removeEventListener('keydown', keyHandler);
            
            // Записываем пробел, чтобы в анализе было видно, что участник подтвердил просмотр
            component.data['orig_resp.keys'] = 'space'; 
            component.end();
        }
    };
    document.addEventListener('keydown', keyHandler);
}
}
                        },
                        "title": "Original_presentation",
                        "timeout": "10000"
                      }
                    ]
                  }
                },
                {
                  "type": "lab.canvas.Screen",
                  "content": [
                    {
                      "type": "image",
                      "left": 0,
                      "top": 0,
                      "angle": 0,
                      "width": 806.4,
                      "height": 453.6,
                      "stroke": null,
                      "strokeWidth": 0,
                      "fill": "black",
                      "src": "${ this.files[\"break_instr.jpg\"] }"
                    }
                  ],
                  "viewport": [
                    800,
                    600
                  ],
                  "files": {
                    "main_phase_instr_2.jpg": "embedded\u002F8200721d839bc5004b6cd2523196957a2dc4f9c95d6cdc3dc80db7de4cdd9d53.jpg",
                    "break_instr.jpg": "embedded\u002F4b02c6fd55e817ae7aa26635bac3ae8d3bdbf9a1e9a1fa879a2078e663e1518a.jpg"
                  },
                  "responses": {
                    "keypress(Space)": "space"
                  },
                  "parameters": {},
                  "messageHandlers": {},
                  "title": "Перерыв"
                },
                {
                  "type": "lab.flow.Loop",
                  "templateParameters": [
                    {
                      "mooney": "031.jpg",
                      "mooney_gs": "031gs.jpg",
                      "corans": "медведь",
                      "phase": "2",
                      "prob_id": "1"
                    },
                    {
                      "mooney": "035.jpg",
                      "mooney_gs": "035gs.jpg",
                      "corans": "водопад",
                      "phase": "2",
                      "prob_id": "2"
                    },
                    {
                      "mooney": "036.jpg",
                      "mooney_gs": "036gs.jpg",
                      "corans": "молния",
                      "phase": "2",
                      "prob_id": "3"
                    },
                    {
                      "mooney": "055.jpg",
                      "mooney_gs": "055gs.jpg",
                      "corans": "седло",
                      "phase": "2",
                      "prob_id": "4"
                    },
                    {
                      "mooney": "073.jpg",
                      "mooney_gs": "073gs.jpg",
                      "corans": "рюкзак",
                      "phase": "2",
                      "prob_id": "5"
                    },
                    {
                      "mooney": "074.jpg",
                      "mooney_gs": "074gs.jpg",
                      "corans": "ананас",
                      "phase": "2",
                      "prob_id": "6"
                    },
                    {
                      "mooney": "078.jpg",
                      "mooney_gs": "078gs.jpg",
                      "corans": "виноград",
                      "phase": "2",
                      "prob_id": "7"
                    },
                    {
                      "mooney": "082.jpg",
                      "mooney_gs": "082gs.jpg",
                      "corans": "попугаи",
                      "phase": "2",
                      "prob_id": "8"
                    },
                    {
                      "mooney": "091.jpg",
                      "mooney_gs": "091gs.jpg",
                      "corans": "ящерица",
                      "phase": "2",
                      "prob_id": "9"
                    },
                    {
                      "mooney": "1012.jpg",
                      "mooney_gs": "1012gs.jpg",
                      "corans": "лошади",
                      "phase": "2",
                      "prob_id": "10"
                    },
                    {
                      "mooney": "118.jpg",
                      "mooney_gs": "118gs.jpg",
                      "corans": "стул",
                      "phase": "2",
                      "prob_id": "11"
                    },
                    {
                      "mooney": "121.jpg",
                      "mooney_gs": "121gs.jpg",
                      "corans": "кенгуру",
                      "phase": "2",
                      "prob_id": "12"
                    },
                    {
                      "mooney": "123.jpg",
                      "mooney_gs": "123gs.jpg",
                      "corans": "портфель",
                      "phase": "2",
                      "prob_id": "13"
                    },
                    {
                      "mooney": "135.jpg",
                      "mooney_gs": "135gs.jpg",
                      "corans": "унитаз",
                      "phase": "2",
                      "prob_id": "14"
                    },
                    {
                      "mooney": "140.jpg",
                      "mooney_gs": "140gs.jpg",
                      "corans": "вилки",
                      "phase": "2",
                      "prob_id": "15"
                    },
                    {
                      "mooney": "141.jpg",
                      "mooney_gs": "141gs.jpg",
                      "corans": "носорог",
                      "phase": "2",
                      "prob_id": "16"
                    },
                    {
                      "mooney": "182.jpg",
                      "mooney_gs": "182gs.jpg",
                      "corans": "ванна",
                      "phase": "2",
                      "prob_id": "17"
                    },
                    {
                      "mooney": "204.jpg",
                      "mooney_gs": "204gs.jpg",
                      "corans": "жук",
                      "phase": "2",
                      "prob_id": "18"
                    },
                    {
                      "mooney": "239.jpg",
                      "mooney_gs": "239gs.jpg",
                      "corans": "кеды",
                      "phase": "2",
                      "prob_id": "19"
                    },
                    {
                      "mooney": "243.jpg",
                      "mooney_gs": "243gs.jpg",
                      "corans": "зонт",
                      "phase": "2",
                      "prob_id": "20"
                    },
                    {
                      "mooney": "273.jpg",
                      "mooney_gs": "273gs.jpg",
                      "corans": "брекеты",
                      "phase": "2",
                      "prob_id": "21"
                    },
                    {
                      "mooney": "297.jpg",
                      "mooney_gs": "297gs.jpg",
                      "corans": "арбуз",
                      "phase": "2",
                      "prob_id": "22"
                    },
                    {
                      "mooney": "299.jpg",
                      "mooney_gs": "299gs.jpg",
                      "corans": "лебедь",
                      "phase": "2",
                      "prob_id": "23"
                    },
                    {
                      "mooney": "307.jpg",
                      "mooney_gs": "307gs.jpg",
                      "corans": "черепаха",
                      "phase": "2",
                      "prob_id": "24"
                    },
                    {
                      "mooney": "312.jpg",
                      "mooney_gs": "312gs.jpg",
                      "corans": "ракушка",
                      "phase": "2",
                      "prob_id": "25"
                    },
                    {
                      "mooney": "329.jpg",
                      "mooney_gs": "329gs.jpg",
                      "corans": "осьминог",
                      "phase": "2",
                      "prob_id": "26"
                    },
                    {
                      "mooney": "372.jpg",
                      "mooney_gs": "372gs.jpg",
                      "corans": "труба",
                      "phase": "2",
                      "prob_id": "27"
                    },
                    {
                      "mooney": "400.jpg",
                      "mooney_gs": "400gs.jpg",
                      "corans": "ножи",
                      "phase": "2",
                      "prob_id": "28"
                    },
                    {
                      "mooney": "409.jpg",
                      "mooney_gs": "409gs.jpg",
                      "corans": "чайник",
                      "phase": "2",
                      "prob_id": "29"
                    },
                    {
                      "mooney": "416.jpg",
                      "mooney_gs": "416gs.jpg",
                      "corans": "страусы",
                      "phase": "2",
                      "prob_id": "30"
                    },
                    {
                      "mooney": "438.jpg",
                      "mooney_gs": "438gs.jpg",
                      "corans": "змея",
                      "phase": "2",
                      "prob_id": "31"
                    },
                    {
                      "mooney": "448.jpg",
                      "mooney_gs": "448gs.jpg",
                      "corans": "кузнечик",
                      "phase": "2",
                      "prob_id": "32"
                    }
                  ],
                  "sample": {
                    "mode": "draw-shuffle"
                  },
                  "files": {},
                  "responses": {
                    "": ""
                  },
                  "parameters": {},
                  "messageHandlers": {},
                  "title": "second_list",
                  "shuffleGroups": [],
                  "template": {
                    "type": "lab.flow.Sequence",
                    "files": {},
                    "responses": {
                      "": ""
                    },
                    "parameters": {},
                    "messageHandlers": {},
                    "title": "Sequence",
                    "content": [
                      {
                        "type": "lab.html.Screen",
                        "files": {},
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {},
                        "title": "Fixation_cross",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; justify-content: center; align-items: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cspan style=\"font-size: 6em; color: #000000; font-family: Arial, sans-serif; user-select: none;\"\u003E\r\n    +\r\n  \u003C\u002Fspan\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                        "timeout": "500"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cimg src=\"${ parameters.img }\" \r\n       style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto;\"\r\n       class=\"mooney-image\"\u003E\r\n  \r\n  \u003Cdiv id=\"space_prompt\" style=\"visibility: hidden; margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #000000; text-align: center;\"\u003E\r\n    Нажмите \"Пробел\" если поняли, что изображено\r\n  \u003C\u002Fdiv\u003E\r\n  \u003Cdiv id=\"countdown_timer\" style=\"position: absolute; top: 5%; right: 5%; font-size: 4em; font-family: 'Times New Roman', serif; color: #000000;\"\u003E\r\n  20\r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E\r\n\r\n",
                            "name": ""
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {
                          "135.jpg": "embedded\u002Fbb283d08079e131fd40f8dde27dbe6c49ab639aa75b6634b21da444b5f415e45.jpg",
                          "140.jpg": "embedded\u002F5f70f3eb535570883996e83222af88e8ec55c7a7ee3a0fc1986bcd626b96d383.jpg",
                          "141.jpg": "embedded\u002Fea73260660ab23de59e5cad97b3c7edc51f7e3330cc13106d72280e5674d9f36.jpg",
                          "182.jpg": "embedded\u002F2cfed16fb45a37146e0d93fea98dfb184a9b87503a32d5f8dc185fb8b400ac2b.jpg",
                          "204.jpg": "embedded\u002Ff0ffd7307e72483437e18539a897dbf8f80f2627c68d36c2a726881eea497e90.jpg",
                          "239.jpg": "embedded\u002Fb96475601210e4c6ac68de1ac6c925430deea0a9147d5a25038e00650a33941a.jpg",
                          "243.jpg": "embedded\u002Fb62b676fe4f6362c96ec24846a229cffb907784ad02329941ac05294a21d354a.jpg",
                          "273.jpg": "embedded\u002F1fef6d5416ea8b1583149d0048b63f2def88076fbe01fb965fd4c8dbfdf99656.jpg",
                          "297.jpg": "embedded\u002F4f5dc4076fac8fdb36112ba72f001f665a1571ea13c79b8ead8a45b2cbb746e2.jpg",
                          "299.jpg": "embedded\u002F349cd38bb9f096d29912db379043bf7f298d7d65c902e813a65666d59581c2b8.jpg",
                          "307.jpg": "embedded\u002Fe4ab0c299c4186976a1ec5f6660706790cda972944c20dbd3651c6d7d9ad7111.jpg",
                          "312.jpg": "embedded\u002F9bead599ab6c3dc56233f2d7c5cfef5970b7b60edb80e79b12a6098e9e6d8cf1.jpg",
                          "329.jpg": "embedded\u002F5ad29465df782afb3041824ebd8469bc7903ea87460e3c96941215de98bc1702.jpg",
                          "372.jpg": "embedded\u002Ff4f9002dab3a21c1ad797083fcc961f5bd0160a946c7e45fab5da9ce7a0dc5ae.jpg",
                          "400.jpg": "embedded\u002F29cfd287301162b6ad575c612e21b90870925e5e8736a6c04391477975416466.jpg",
                          "409.jpg": "embedded\u002F22169f7fb15ddb8f2aa5392b4636255a6197a70d8fa18b9fe27d91ba21810bb9.jpg",
                          "416.jpg": "embedded\u002Fe9bcb136534680d807fd4d2f7f5283b0c4ac7a6fbc9ec1a3aef6a3b453a2ef39.jpg",
                          "438.jpg": "embedded\u002F8ca8dc3fa556092b214f791ef7dd6846e8197c8417a8f9e20a226caa33f0f19e.jpg",
                          "448.jpg": "embedded\u002F083192420a913ad5584a7e0eec16f813bbe3418ea6678919b5f048634f23ffdb.jpg",
                          "1012.jpg": "embedded\u002F166014ed0365d898dab5b614d165e56b1ed007a05b12730b9add2b7e2c4af5db.jpg",
                          "031.jpg": "embedded\u002F117e7fd2192d8d195c1274db7558843adf0895b8de93709fc57ef672917aeb7a.jpg",
                          "035.jpg": "embedded\u002F11d81651b14cb729d4a35a0a6b69071a4fad620fabf6b0d5f5622d782b10cc8a.jpg",
                          "036.jpg": "embedded\u002F7078aa20aec8db6fd53bbb184e26077d463d71f362c71cd4b204f2cef8132f06.jpg",
                          "055.jpg": "embedded\u002F6bef18610695e412bdfb98abb03eabed36b528294e1129a0ba64ed3aa03df206.jpg",
                          "073.jpg": "embedded\u002Fcdfd657642d8c82fe9f03ed239c4626bb01393d746b46c6cd81aa8b319676acd.jpg",
                          "074.jpg": "embedded\u002Fff5b17b5e8d573c2e493a9a85092c15da3b24919d2a9569553f13b658089872a.jpg",
                          "078.jpg": "embedded\u002F6e5ca1997b6fb92da900150dffee518116e3ded7f1cd39c680de1abe8c81e7a2.jpg",
                          "082.jpg": "embedded\u002Fe8f789e06a08464fc1b51d260797a807dc7508f67845171205deb8240cf3c74c.jpg",
                          "091.jpg": "embedded\u002Fa97f9448562fbd9fe5a76e6b378f9f2046fcf52951bbb488775d693603bc0055.jpg",
                          "118.jpg": "embedded\u002F55f6da72fed6c91af25f7082e4a1c20936648de0ab98a9d99a3778a7bfa1efec.jpg",
                          "121.jpg": "embedded\u002Fea59f737cb903e0d0dc1b78789eb21b2360f0bb492ea452afab24fface9d448e.jpg",
                          "123.jpg": "embedded\u002F9b56deff0c49ec23c63bd7de94b57832387ad29e07032c0885a8943b75ba6a6c.jpg"
                        },
                        "responses": {
                          "keypress(Space)": "space"
                        },
                        "parameters": {},
                        "messageHandlers": {
                          "before:prepare": function anonymous(
) {
this.parameters.img = this.files[this.parameters.mooney]

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(9.2593);
} else {
  this.parameters.grid_px = '170px';
}
},
                          "end": function anonymous(
) {
// Проверяем, записал ли lab.js ответ (нажатие пробела). 
// При тайм-ауте this.data.response обычно пустой или undefined.
if (this.data.response === 'space' || this.data.response) {
    // Пробел нажат
    this.data.skipped_trial = 0;       // Записываем в файл результатов (как в PsychoPy)
    window.skipped_trial = false;      // Глобальный флаг для следующего экрана
} else {
    // Время вышло
    this.data.skipped_trial = 1;       // Записываем в файл результатов
    window.skipped_trial = true;       // Глобальный флаг
}
},
                          "run": function anonymous(
) {
const timerElement = document.getElementById('countdown_timer');
const spacePrompt = document.getElementById('space_prompt'); // Находим нашу новую надпись
let timeLeft = 20; // Стартовое время

// Запускаем секундный таймер
const timerInterval = setInterval(() => {
  timeLeft--; 
  
  // Обновляем цифры в углу экрана
  if (timerElement) {
    timerElement.textContent = timeLeft;
  }
  
  // --- НОВОЕ УСЛОВИЕ ---
  // Если осталось 5 секунд или меньше, делаем надпись видимой
  if (timeLeft <= 5 && spacePrompt) {
    spacePrompt.style.visibility = 'visible';
  }
  // ----------------------
  
  // Если время вышло, останавливаем счетчик
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
  }
}, 1000);

// Очистка памяти при досрочном нажатии пробела
this.on('end', () => {
  clearInterval(timerInterval);
});
}
                        },
                        "title": "Stimuli_presentation",
                        "timeout": "20000"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;\"\u003E\r\n  \r\n  \u003Ch2 style=\"margin-bottom: 30px; text-align: center;\"\u003EЧто изображено на картинке?\r\n    После ввода, нажмите ВВОД (Enter), чтобы подтвердить ответ.\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cinput type=\"text\" id=\"answer_input\" autocomplete=\"off\" placeholder=\"Введите ответ...\" \r\n         style=\"width: 80%; max-width: 800px; padding: 15px; font-size: 1.5em; text-align: center; border: 5px solid #000000; border-radius: 8px; text-transform: uppercase; outline: none; transition: border-color 0.3s;\"\u003E\r\n  \r\n\u003C\u002Fdiv\u003E",
                            "name": ""
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {},
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "run": function anonymous(
) {
// 1. Сбрасываем флаг (чтобы в каждой новой пробе он по умолчанию был false)
window.answer_provided = false;

// --- ПРОВЕРКА НА ПРОПУСК ---
if (window.skipped_trial === true) {
    this.end();
    return; 
}
// ----------------------------

const component = this;
const input = document.getElementById('answer_input');

// Автоматически ставим курсор в поле ввода
input.focus();

// Фильтрация ввода (только кириллица и пробелы)
input.addEventListener('input', function(e) {
  this.value = this.value.replace(/[^а-яА-ЯёЁ\s]/g, '');
});

// Обработка нажатия клавиши Enter
const keyHandler = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); 
    
    const finalAnswer = input.value.trim().toUpperCase();
    
    if (finalAnswer.length > 0) {
      // 2. ФИКСИРУЕМ УСПЕХ! (Без этой строчки Original_presentation не сработает)
      window.answer_provided = true;
      
      // Снимаем слушатель клавиатуры
      document.removeEventListener('keydown', keyHandler);
      
      // Записываем ответ в файл результатов
      component.data.final_answer = finalAnswer;
      
      // Завершаем экран
      component.end();
    }
  }
};

// Вешаем прослушку нажатий на весь документ
document.addEventListener('keydown', keyHandler);

// Возвращаем фокус в поле, если пользователь случайно кликнул мышкой мимо
document.addEventListener('click', () => input.focus());
}
                        },
                        "title": "Answer_response",
                        "timeout": "10000"
                      },
                      {
                        "type": "lab.html.Screen",
                        "files": {},
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "run": function anonymous(
) {
// --- ПРОВЕРКА НА ПРОПУСК ---
if (window.skipped_trial === true) {
    this.end();
    return;
}
// ----------------------------

const component = this;

const keyHandler = (e) => {
    let response = null;
    
    // В PsychoPy стрелки записываются именно этими словами
    if (e.key === 'ArrowLeft') response = 'left';
    if (e.key === 'ArrowDown') response = 'down';
    if (e.key === 'ArrowRight') response = 'right';

    // Если нажата одна из трех целевых кнопок
    if (response) {
        e.preventDefault();
        
        // Удаляем слушатель, чтобы он не сработал на следующем экране
        document.removeEventListener('keydown', keyHandler);
        
        // Записываем ответ точно в ту колонку, которую ожидает R-скрипт (key_source.keys)
        component.data['key_source.keys'] = response;
        
        // Завершаем экран
        component.end();
    }
};

// Вешаем прослушку на весь документ
document.addEventListener('keydown', keyHandler);
}
                        },
                        "title": "Source_monitoring",
                        "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Ch2 style=\"font-size: 2.5em; text-align: center; margin-bottom: 60px;\"\u003EКак Вы нашли ответ?\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cdiv style=\"display: flex; justify-content: space-between; width: 80%; max-width: 900px; text-align: center;\"\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EВспомнил\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003Eрешение\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&larr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EНе знаю\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; visibility: hidden;\"\u003E(пусто)\u003C\u002Fp\u003E \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&darr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n    \u003Cdiv style=\"flex: 1;\"\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003EРаспознал\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin: 0; font-size: 1.5em; font-weight: bold;\"\u003Eсейчас\u003C\u002Fp\u003E\r\n      \u003Cp style=\"margin-top: 15px; font-size: 2.5em; color: #000;\"\u003E&rarr;\u003C\u002Fp\u003E \u003C\u002Fdiv\u003E\r\n    \r\n  \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                        "timeout": "10000"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" id=\"mooney_container\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;\"\u003E\r\n  \r\n  \u003Ch2 style=\"margin: 0 0 20px 0; text-align: center;\"\u003EПостарайтесь вспомнить, какого цвета была рамка вокруг замаскированного изображения на предыдущем этапе.\u003C\u002Fh2\u003E\r\n  \r\n  \u003Cdiv class=\"grid-box\"\u003E\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[0] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[0] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[1] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[1] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[2] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[2] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[3] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[3] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[4] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[4] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[5] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[5] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[6] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[6] }\"\u003E\r\n\r\n    \u003Cimg src=\"${ this.files[parameters.mooney] }\" class=\"mooney-option\"\r\n         style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto; border-color: ${ parameters.mixed_colors[7] };\"\r\n         data-original-color=\"${ parameters.mixed_colors[7] }\"\u003E\r\n  \u003C\u002Fdiv\u003E\r\n\r\n  \u003Cp id=\"space_instruction\" style=\"visibility: hidden; text-align: center; margin-top: 30px; font-size: 1.3em; font-weight: bold; color: #000;\"\u003E\r\n    После выбора цвета рамки, нажмите ПРОБЕЛ, чтобы подтвердить выбор.\r\n  \u003C\u002Fp\u003E\r\n  \r\n\u003C\u002Fdiv\u003E",
                            "name": ""
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {
                          "135.jpg": "embedded\u002Fbb283d08079e131fd40f8dde27dbe6c49ab639aa75b6634b21da444b5f415e45.jpg",
                          "140.jpg": "embedded\u002F5f70f3eb535570883996e83222af88e8ec55c7a7ee3a0fc1986bcd626b96d383.jpg",
                          "141.jpg": "embedded\u002Fea73260660ab23de59e5cad97b3c7edc51f7e3330cc13106d72280e5674d9f36.jpg",
                          "182.jpg": "embedded\u002F2cfed16fb45a37146e0d93fea98dfb184a9b87503a32d5f8dc185fb8b400ac2b.jpg",
                          "204.jpg": "embedded\u002Ff0ffd7307e72483437e18539a897dbf8f80f2627c68d36c2a726881eea497e90.jpg",
                          "239.jpg": "embedded\u002Fb96475601210e4c6ac68de1ac6c925430deea0a9147d5a25038e00650a33941a.jpg",
                          "243.jpg": "embedded\u002Fb62b676fe4f6362c96ec24846a229cffb907784ad02329941ac05294a21d354a.jpg",
                          "273.jpg": "embedded\u002F1fef6d5416ea8b1583149d0048b63f2def88076fbe01fb965fd4c8dbfdf99656.jpg",
                          "297.jpg": "embedded\u002F4f5dc4076fac8fdb36112ba72f001f665a1571ea13c79b8ead8a45b2cbb746e2.jpg",
                          "299.jpg": "embedded\u002F349cd38bb9f096d29912db379043bf7f298d7d65c902e813a65666d59581c2b8.jpg",
                          "307.jpg": "embedded\u002Fe4ab0c299c4186976a1ec5f6660706790cda972944c20dbd3651c6d7d9ad7111.jpg",
                          "312.jpg": "embedded\u002F9bead599ab6c3dc56233f2d7c5cfef5970b7b60edb80e79b12a6098e9e6d8cf1.jpg",
                          "329.jpg": "embedded\u002F5ad29465df782afb3041824ebd8469bc7903ea87460e3c96941215de98bc1702.jpg",
                          "372.jpg": "embedded\u002Ff4f9002dab3a21c1ad797083fcc961f5bd0160a946c7e45fab5da9ce7a0dc5ae.jpg",
                          "400.jpg": "embedded\u002F29cfd287301162b6ad575c612e21b90870925e5e8736a6c04391477975416466.jpg",
                          "409.jpg": "embedded\u002F22169f7fb15ddb8f2aa5392b4636255a6197a70d8fa18b9fe27d91ba21810bb9.jpg",
                          "416.jpg": "embedded\u002Fe9bcb136534680d807fd4d2f7f5283b0c4ac7a6fbc9ec1a3aef6a3b453a2ef39.jpg",
                          "438.jpg": "embedded\u002F8ca8dc3fa556092b214f791ef7dd6846e8197c8417a8f9e20a226caa33f0f19e.jpg",
                          "448.jpg": "embedded\u002F083192420a913ad5584a7e0eec16f813bbe3418ea6678919b5f048634f23ffdb.jpg",
                          "1012.jpg": "embedded\u002F166014ed0365d898dab5b614d165e56b1ed007a05b12730b9add2b7e2c4af5db.jpg",
                          "031.jpg": "embedded\u002F117e7fd2192d8d195c1274db7558843adf0895b8de93709fc57ef672917aeb7a.jpg",
                          "035.jpg": "embedded\u002F11d81651b14cb729d4a35a0a6b69071a4fad620fabf6b0d5f5622d782b10cc8a.jpg",
                          "036.jpg": "embedded\u002F7078aa20aec8db6fd53bbb184e26077d463d71f362c71cd4b204f2cef8132f06.jpg",
                          "055.jpg": "embedded\u002F6bef18610695e412bdfb98abb03eabed36b528294e1129a0ba64ed3aa03df206.jpg",
                          "073.jpg": "embedded\u002Fcdfd657642d8c82fe9f03ed239c4626bb01393d746b46c6cd81aa8b319676acd.jpg",
                          "074.jpg": "embedded\u002Fff5b17b5e8d573c2e493a9a85092c15da3b24919d2a9569553f13b658089872a.jpg",
                          "078.jpg": "embedded\u002F6e5ca1997b6fb92da900150dffee518116e3ded7f1cd39c680de1abe8c81e7a2.jpg",
                          "082.jpg": "embedded\u002Fe8f789e06a08464fc1b51d260797a807dc7508f67845171205deb8240cf3c74c.jpg",
                          "091.jpg": "embedded\u002Fa97f9448562fbd9fe5a76e6b378f9f2046fcf52951bbb488775d693603bc0055.jpg",
                          "118.jpg": "embedded\u002F55f6da72fed6c91af25f7082e4a1c20936648de0ab98a9d99a3778a7bfa1efec.jpg",
                          "121.jpg": "embedded\u002Fea59f737cb903e0d0dc1b78789eb21b2360f0bb492ea452afab24fface9d448e.jpg",
                          "123.jpg": "embedded\u002F9b56deff0c49ec23c63bd7de94b57832387ad29e07032c0885a8943b75ba6a6c.jpg"
                        },
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "before:prepare": function anonymous(
) {
// 1. Цвета
let colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'pink'];
// Тасование (Fisher-Yates)
for (let i = colors.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [colors[i], colors[j]] = [colors[j], colors[i]];
}
this.parameters.mixed_colors = colors;

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(6);
} else {
  this.parameters.grid_px = '170px';
}

window.clicked = function(elem) {
  
}
},
                          "commit": function anonymous(
) {
this.state.color = window.image
window.image = ""
},
                          "run": function anonymous(
) {
// 1. ПОКАЗЫВАЕМ курсор при запуске этого экрана
document.body.style.cursor = 'default';

// 2. Гарантированно СКРЫВАЕМ курсор при завершении экрана.
// Событие 'end' сработает в любом случае: нажмет ли участник 
// пробел (завершив экран кодом this.end()) или выйдет время.
this.on('end', () => {
    document.body.style.cursor = 'none';
});

// Сохраняем ссылку на сам компонент lab.js, чтобы записывать в него данные
const component = this; 

const options = document.querySelectorAll('.mooney-option');
const instruction = document.querySelector('#space_instruction');

let lastSelected = null;
let isSelected = false; // Флаг: выбрана ли рамка

// 1. Обработка кликов по картинкам
options.forEach(opt => {
  opt.addEventListener('click', function(e) {
    // Сброс стилей у предыдущей выбранной картинки
    if (lastSelected) {
      lastSelected.style.transform = 'scale(1)';
    }
    
    // Выделение новой картинки
    this.style.transform = 'scale(1.1)';
    lastSelected = this;
    isSelected = true; // Разрешаем нажатие пробела
    
    // Показываем подсказку пользователю
    if (instruction) instruction.style.visibility = 'visible';
    
    // Правильная запись ответа в данные lab.js (в итоговый CSV)
    component.data.selected_frame_color = this.dataset.originalColor;
  });
});

// 2. Обработка нажатия пробела
const keyHandler = (e) => {
  // Реагируем ТОЛЬКО если нажат Пробел И картинка уже выбрана
  if (e.code === 'Space' && isSelected) {
    e.preventDefault(); // Чтобы страница не дергалась вниз при нажатии пробела
    
    // Обязательно удаляем слушатель клавиатуры перед выходом, 
    // чтобы он не сработал на следующих экранах
    document.removeEventListener('keydown', keyHandler); 
    
    // Завершаем этот экран и идем дальше
    component.end(); 
  }
};

// Вешаем слушатель клавиатуры на весь документ
document.addEventListener('keydown', keyHandler);
}
                        },
                        "title": "Grid_selection"
                      },
                      {
                        "type": "lab.html.Page",
                        "items": [
                          {
                            "required": true,
                            "type": "html",
                            "content": "\u003Cdiv class=\"main-wrapper\" style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100vh;\"\u003E\r\n  \r\n  \u003Cimg src=\"${ this.files[parameters.mooney_gs] }\" \r\n       style=\"max-width: ${ parameters.grid_px }; max-height: ${ parameters.grid_px }; width: auto; height: auto;\"\r\n       class=\"mooney-image\"\u003E\r\n  \r\n  \u003Cdiv id=\"dynamic_instruction\" style=\"margin-top: 30px; font-size: 1.5em; font-weight: bold; color: #000; text-align: center;\"\u003E\r\n    \u003C\u002Fdiv\u003E\r\n\r\n\u003C\u002Fdiv\u003E",
                            "name": ""
                          },
                          {
                            "required": true,
                            "type": "text"
                          }
                        ],
                        "scrollTop": true,
                        "submitButtonText": "Continue →",
                        "submitButtonPosition": "hidden",
                        "files": {
                          "448gs.jpg": "embedded\u002F1a338b4a69a710f6858b98a63ca7cd6c99e32ae3e2b9ecd9c1e504d519c34e52.jpg",
                          "1012gs.jpg": "embedded\u002Fbd6053ce683032b5316097c63a32c3fc9772eb80f5b9907e831bc3c736366a42.jpg",
                          "031gs.jpg": "embedded\u002F13c7d09d34025adcd1bbcb574c0b3e98149830fd652ad199d4127cab8115ae22.jpg",
                          "035gs.jpg": "embedded\u002F8c92be0b5ef68d407e57468e8c3e03e50f1aff00b4e20ff7b8e0f90991216832.jpg",
                          "036gs.jpg": "embedded\u002F62bdecc49161426fa72852f23d1b5dea5bd604803d2e33fb7c2788cef1c88c3c.jpg",
                          "055gs.jpg": "embedded\u002F5828b4f259aaa9de952ab4d96658892c8d3d76e33a7791653a250af9d1787b8d.jpg",
                          "073gs.jpg": "embedded\u002Fc374107935ebf5ae6cf3cc106160f73296ebdd35afda6e47c5bfb06edebc926c.jpg",
                          "074gs.jpg": "embedded\u002F55443cd87c8948319bc28d319b41ab0b3d8dbabf31f0da2379b42e480ecca62d.jpg",
                          "078gs.jpg": "embedded\u002F3c6046d5c6ce8205a60cf8b6288abc86efb6044775ac2d5a7ede316271d1ace5.jpg",
                          "082gs.jpg": "embedded\u002F1f5a66b60d4c9ad08a4d990b3de5c4e3be5388c8af6b680cfe46b29fccdf845c.jpg",
                          "091gs.jpg": "embedded\u002F21ee77cc6b5dab97f73dcbf47db938fa90cd6fe3646ea2bb6619f8ce91538658.jpg",
                          "118gs.jpg": "embedded\u002Fb135dde806d7e9154d2f7c504112ffe559b57d008d8077dd80dde89799699086.jpg",
                          "121gs.jpg": "embedded\u002F7f723a3f477717d26016e6c5e0aa3f6d7acb29fa46aa32269f0fc6c2164d1914.jpg",
                          "123gs.jpg": "embedded\u002F1d34e09ade610695291388b93668d77862aeabb44f82c9d2cd1c73afba3e0427.jpg",
                          "135gs.jpg": "embedded\u002F9362d7936e161f8a8d91bd0c0b7cb0ae0a8d6364c90412820f2da7152e7051c7.jpg",
                          "140gs.jpg": "embedded\u002F84be0a2a7f5ed6eb4b12ece30405c7d43d241b0b27468a880c0480fb5fca787a.jpg",
                          "141gs.jpg": "embedded\u002Fa937e0b5b38fb0605be11bf94757567bc6e5764f0c1beffa6f33c0e2bf4274e7.jpg",
                          "182gs.jpg": "embedded\u002F2c51e969b060460a4db3cc786d32beb8efaee2bd111acdfadd4cab30c7d411d9.jpg",
                          "204gs.jpg": "embedded\u002F9d72f1b3e0827d5380251a8cfa0ef262a81accdc2f1e20f58725cef4343bd15c.jpg",
                          "239gs.jpg": "embedded\u002F94c6d640c011929a77ec2474115155825b45838ab162881a17db86ff0940dff3.jpg",
                          "243gs.jpg": "embedded\u002F484a705c2745486eaf2f1c0238189189aea7390c0d480cc9aa980c3ee9531bab.jpg",
                          "273gs.jpg": "embedded\u002F18e383237caf83d66101c6d6dc112019723c4e20a83c27c85d9c1f313267c476.jpg",
                          "297gs.jpg": "embedded\u002F4071fd2df1ab07cc847a33b3a51adce59b44bbd44eb12dc6594c7751b7ee5fa2.jpg",
                          "299gs.jpg": "embedded\u002F14d609de6cd2d31f18c5c31313228dc013617cbc93193396cebfa24e70f0e15a.jpg",
                          "307gs.jpg": "embedded\u002Ff2e310bac0ec74da9d1704bc0c14d435d03ac8786f3175beb90ac9af10cd494d.jpg",
                          "312gs.jpg": "embedded\u002F4b8d6360872c3181d27db2292975ffb1c6e9aec931be22e427ecbf1f161185e5.jpg",
                          "329gs.jpg": "embedded\u002F0dec8742ce8987b82663bcc00659f11444c96f6184771afcdbf8469c2ce3302a.jpg",
                          "372gs.jpg": "embedded\u002F3dceda04a77779022f15274bfa90c126de2285a935d458d382e18514001585f9.jpg",
                          "400gs.jpg": "embedded\u002F24873ca1bfea58f39015f0bf9980c93722e30316cd0d01186f07475bc6e708d1.jpg",
                          "409gs.jpg": "embedded\u002F3df047c629331bd85670a9fa0a1fed6bb7f709f56f131f6c7baf9c6b3737abfc.jpg",
                          "416gs.jpg": "embedded\u002Faf1dc2d23ff7361e42e6c823d49c5429dc7beb8742bb35ae6cd8ad701f101172.jpg",
                          "438gs.jpg": "embedded\u002F50f9f0684632f4c4672df24625d066795202c72a0ed18fae5be76e5a609a8236.jpg"
                        },
                        "responses": {},
                        "parameters": {},
                        "messageHandlers": {
                          "before:prepare": function anonymous(
) {
this.parameters.img = this.files[this.parameters.mooney]

// 2. Размеры
if (window.sizes) {
  this.parameters.grid_px = window.sizes.cm(9.2593);
} else {
  this.parameters.grid_px = '170px';
}
},
                          "run": function anonymous(
) {
const component = this;
const instructionEl = document.getElementById('dynamic_instruction');

// Проверяем, был ли успешно дан ответ:
// 1. Пробел на этапе картинки был нажат (skipped_trial === false)
// 2. И текст в поле ввода был введен (answer_provided === true)
const hasAnswer = (window.skipped_trial === false && window.answer_provided === true);

if (hasAnswer) {
    // =========================================================
    // СЦЕНАРИЙ 1: Участник успел нажать пробел и ввел ответ
    // =========================================================
    
    // Вставляем текст
    instructionEl.innerHTML = "Этот ли объект Вы увидели на замаскированном изображении?<br><br>(&larr; ДА &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; НЕТ &rarr;)";
    
    // Назначаем обработчик для стрелок "Влево" и "Вправо"
    const keyHandler = (e) => {
        let response = null;
        if (e.key === 'ArrowLeft') response = 'left';
        if (e.key === 'ArrowRight') response = 'right';
        
        if (response) {
            e.preventDefault();
            document.removeEventListener('keydown', keyHandler);
            
            // Сохраняем ответ в формате, идентичном PsychoPy (orig_resp.keys)
            component.data['orig_resp.keys'] = response;
            component.end();
        }
    };
    document.addEventListener('keydown', keyHandler);

} else {
    // =========================================================
    // СЦЕНАРИЙ 2: Тайм-аут (или пустое текстовое поле)
    // =========================================================
    
    // Вставляем альтернативный текст
    instructionEl.innerHTML = "Вот как выглядит объект, который был замаскирован.<br><br>(Нажмите ПРОБЕЛ, чтобы продолжить)";
    
    // Назначаем обработчик только для Пробела
    const keyHandler = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            document.removeEventListener('keydown', keyHandler);
            
            // Записываем пробел, чтобы в анализе было видно, что участник подтвердил просмотр
            component.data['orig_resp.keys'] = 'space'; 
            component.end();
        }
    };
    document.addEventListener('keydown', keyHandler);
}
}
                        },
                        "title": "Original_presentation",
                        "timeout": "10000"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "lab.canvas.Screen",
      "content": [
        {
          "type": "image",
          "left": 0,
          "top": 0,
          "angle": 0,
          "width": 806.4,
          "height": 453.6,
          "stroke": null,
          "strokeWidth": 0,
          "fill": "black",
          "src": "${ this.files[\"end_instr.jpg\"] }"
        }
      ],
      "viewport": [
        800,
        600
      ],
      "files": {
        "main_phase_instr_2.jpg": "embedded\u002F8200721d839bc5004b6cd2523196957a2dc4f9c95d6cdc3dc80db7de4cdd9d53.jpg",
        "end_instr.jpg": "embedded\u002Ffc17e102bfe4a15b52108ab361b9e40b786bb9e44ceebc6ae0071f921c9d3b80.jpg"
      },
      "responses": {
        "keypress(Space)": "space"
      },
      "parameters": {},
      "messageHandlers": {
        "run": function anonymous(
) {
// Возвращаем курсор по завершении исследования
document.body.style.cursor = 'default';
}
      },
      "title": "Конец эксперимента"
    }
  ]
})

// Let's go!
study.run()