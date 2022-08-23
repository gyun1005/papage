// Node.js, Express FW를 활용하여 간단한 Backend 서버 구성

const express = require('express'); // express 패키지 import

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const request = require('request');

// express의 static 미들웨어 활용
app.use(express.static('public')); // express한테 static 파일들의 경로가 어디에 있는지 명시

// express의 json 미들웨어 활용
app.use(express.json());

app.get('/', (req, res) => {
    // root url, 즉 메인 페이지로 접속했을 때, 우리가 만든 Node 서버는 papago의 메인 화면인 public/index.html을 응답해줘야 함
    res.sendFile('index.html');
});

// localhost:3000/detectLangs 경로로 요청했을 때
app.post('/detectLangs', (req, res) => {
    console.log('/detectLangs로 요청됨');
    console.log(req.body);

    // text프로퍼티에 있는 값을 query라는 이름의 변수에 담고 싶고, targetLanguage는 그 이름 그대로 동일한 이름의 변수로 담고 싶음
    const { text:query, targetLanguage } = req.body;

    console.log(query, targetLanguage); // query: 입력한 텍스트, targetLanguage: en, ko 등

    // 실제 papago 서버에 요청 전송
    const url = 'https://openapi.naver.com/v1/papago/detectLangs'; // 택배를 보낼 주소

    const options = { // options: 택배를 보낼 물건
        url,
        form: { query: query },
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        }, 
    };

    // 실제 언어감지 서비스 요청 부분
    // options라는 변수에 요청 전송 시 필요한 데이터 및 보낼 주소를 동봉한다(enclose)
    // () => {}: 요청에 따른 응답 정보를 확인하는 부분
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) { // 응답이 성공적으로 완료되었을 경우
            // body를 parsing처리
            const parsedData = JSON.parse(body); // {"langCode":"ko"}
            
            // papago 번역 url('/translate')로 redirect(요청 재지정)
            res.redirect(`translate?lang=${parsedData['langCode']}&targetLanguage=${targetLanguage}&query=${query}`);

        } else { // 응답이 실패했을 경우
            console.log(`error = ${response.statusCode}`);
        }
    });
    
});

// papago 번역 요청 부분
app.get('/translate', (req, res) => {
    const url = 'https://openapi.naver.com/v1/papago/n2mt';
    console.log(req.query); // target-language

    const options = { // options: 택배를 보낼 물건
        url,
        form: { // 서버로 보낼 파라미터를 작성하는 부분
            source: req.query.lang, // 원본 언어 코드
            target: req.query.targetLanguage, // 번역하고자 하는 언어의 코드 req.query['target-language']
            text: req.query.query, // 번역하고자 하는 텍스트
        },
        headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
        }, 
    };

    // 실제 번역 요청 전송부분
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.send(body); // front에 해당하는 app.js에 papago로부터 받은 응답 데이터(body)를 app.js로 응답함
        }
    });
});

app.listen(3000, () => console.log('http://127.0.0.1:3000/ app listening on port 3000'));