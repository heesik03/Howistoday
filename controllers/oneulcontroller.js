require("dotenv").config();  // env 연결
const axios = require('axios');
const { DateTime } = require('luxon');
const crypto = require('crypto');
const menu = require("../models/menuModel");
const oneulmwohajiKAKAOKEY = process.env.KAKAO_JAVASCRIPT_KEY; //카카오 javascript 키
const kofickey = process.env.KOFIC_KEY;
const kmdbkey = process.env.KMDB_KEY;
let movierandomInt = 0;
let menurandomInt = 0;

// 점심메뉴 리스트 https://cjhong.tistory.com/645

const getMeauAndMoive = async (req, res) => {
    try {
        const base_date = DateTime.now().setZone('Asia/Seoul').minus({ days: 1 }).toFormat('yyyyMMdd'); // 오늘 날짜에서 하루를 뺀 뒤 형식 변환환
        console.log("base_date : " + base_date);
        const koficapiURI = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${kofickey}&targetDt=${base_date}`;

        function getDailyRandomNumber() {
            const today = new Date();
            console.log(today);
            const dateString = today.toISOString().slice(0, 10);
        
            // 날짜를 해시로 변환 (SHA256 해시를 사용)
            const hash = crypto.createHash('sha256').update(dateString).digest('hex');
            
            // 해시값을 숫자로 변환 (16진수를 10진수로 변환) 및 범위 설정
            movierandomInt = parseInt(hash, 16) % 10; 
            menurandomInt = parseInt(hash, 16) % 60; 
        }
        getDailyRandomNumber();

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 랜덤 점심식사 메뉴 출력
        const getRandomMenu = async () => {
            const randomIndex = Math.floor(menurandomInt); // 랜덤 인덱스 생성
            const randomMenu = await menu.findOne().skip(randomIndex); // 랜덤 메뉴 조회
            return randomMenu; // 랜덤으로 선택된 메뉴 반환
        }
        // 랜덤 점심 메뉴 조회
        const randomMenu = await getRandomMenu();
        let menuData = [randomMenu.name, randomMenu.explanation];

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 일일 박스오피스 데이터
        const responsekofic = await axios.get(koficapiURI);
        if (responsekofic.status !== 200) {
            throw new Error(`일일 박스오피스 API 요청 오류: ${responsekofic.status} - ${responsekofic.statusText}`);
        }

        const koifcValue = responsekofic.data.boxOfficeResult.dailyBoxOfficeList;
        if (!koifcValue) {
            throw new Error(`API 응답 오류: 유효한 일일 박스오피스 데이터가 없습니다.`);
        }

        const randomMovieName = koifcValue[movierandomInt].movieNm; // 랜덤으로 나온 영화 제목
        const randomMoiveDay = koifcValue[movierandomInt].openDt.split('-').join(''); //랜덤으로 나온 영화 개봉일

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 영화 상세정보 데이터
        const kmdbapiURI = `https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2&ServiceKey=${kmdbkey}&detail=Y&title=${randomMovieName}&releaseDts=${randomMoiveDay}`

        const responsekmdb = await axios.get(kmdbapiURI);

        if (responsekmdb.status !== 200) {
            throw new Error(`영화 상세정보 API 요청 오류: ${responsekmdb.status} - ${responsekmdb.statusText}`);
        }

        const kmdbValue = responsekmdb.data.Data
        if (!kmdbValue || kmdbValue.TotalCount === 0) {
            throw new Error(`영화 상세 정보 검색 실패`);
        }
        
        let moiveDetailData = [];
        moiveDetailData[0] = randomMovieName;
        moiveDetailData[1] = kmdbValue[0].Result[0].plots.plot[0].plotText; // 줄거리
        moiveDetailData[2] = kmdbValue[0].Result[0].directors.director[0].directorNm // 감독
        moiveDetailData[3] = kmdbValue[0].Result[0].actors.actor[0].actorNm; //주연배우
        moiveDetailData[4] = kmdbValue[0].Result[0].actors.actor[1].actorNm;
        moiveDetailData[5] = kmdbValue[0].Result[0].genre; // 장르
        moiveDetailData[6] = kmdbValue[0].Result[0].rating; // 관람등급
        moiveDetailData[7] = koifcValue[movierandomInt].rank; // 박스오피스 순위
        moiveDetailData[8] = koifcValue[movierandomInt].openDt; // 개봉일
        moiveDetailData[9] = koifcValue[movierandomInt].audiAcc; // 누적관객수

        res.render("oneulmwohaji", { 
            title: "오늘 뭐하지?",
            apikey : oneulmwohajiKAKAOKEY,
            menuData : menuData,
            movieData : moiveDetailData,
            posterURI: kmdbValue[0].Result[0].posters.split('|'),
            day : new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10), // 어제 날짜 yyyy-mm-dd 형식으로
        });

    } catch (error) {
        console.error("오류 발생:", error);

        // 오류가 발생하면 'error.ejs'를 렌더링하고 오류 메시지를 전달
        res.status(500).render('error', {
            title: '오류 발생',
        });
    }
}

module.exports = getMeauAndMoive;