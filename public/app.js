const textAreaArray = document.getElementsByClassName('Card__body__content');
const [sourceTextArea, targetTextArea] = textAreaArray;
const [sourceSelect, targetSelect] = document.getElementsByClassName('form-select');

let targetLanguage = 'en';

targetSelect.addEventListener('change', () => { 
    const targetValue = targetSelect.value;
    targetLanguage = targetValue;
});

let debouncer;
sourceTextArea.addEventListener('input', (event) => {
    if(debouncer) {
        clearTimeout(debouncer);
    }

    debouncer = setTimeout(() => {
        const text = event.target.value;

        // ajax 활용하여 비동기 HTTP 요청 전송
        const xhr = new XMLHttpRequest();

        const url = '/detectLangs'; // node 서버의 특정 url 주소

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // 최종적으로 papago가 번역해준 번역된 텍스트 결과를 받는 부분(추후 작성) - 서버의 응답 결과 확인하는 부분
                const parsedData = JSON.parse(xhr.responseText);
                console.log(parsedData);
                
                const result = parsedData.message.result;

                const options = sourceSelect.options;

                for (let i = 0; i < options.length; i++) {
                    if(options[i].value === result.srcLangType) {
                        sourceSelect.selectedIndex = i;
                    }
                }

                targetTextArea.value = result.translatedText;
            }
        };

        // 요청 준비
        xhr.open('POST', url);

        // 요청을 보낼 때 동봉할 객체(object)
        const requestData = {
            text, // text: text // 프로퍼티와 변수명이 동일할 경우 하나만 써도 됨
            targetLanguage, // targetLanguage: targetLanguage와 같음
        };

        // 클라이언트가 서버에게 보내는 요청 데이터의 형식이 json 형식임을 명시
        xhr.setRequestHeader('Content-type', 'application/json'); // text/html 등 여러가지가 있음, header: 제품의 설명서

        // 보내기 전에 해야 할 일, JS object를 JSON으로 변환(직렬화)
        const jsonData = JSON.stringify(requestData);

        // 실제 요청 전송
        xhr.send(jsonData);

    }, 3000);
});