require("dotenv").config();  // env 연결
const axios = require('axios');
const serviceKey = process.env.WEATHER_KEY;  // 환경 변수로 가져오기
const bankKey = process.env.BANKOFKOREA_KEY;
const kakaoKey = process.env.KAKAO_KEY;
const weatherapiURI = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
const bankapiURI = `http://ecos.bok.or.kr/api/KeyStatisticList/${encodeURIComponent(bankKey)}/json/kr/1/10`
const airapiURI = `http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureLIst?itemCode=PM10&dataGubun=HOUR&pageNo=1&numOfRows=1&returnType=json&serviceKey=${encodeURIComponent(serviceKey)}` 
const pm25airapiURI = `http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureLIst?itemCode=PM25&dataGubun=HOUR&pageNo=1&numOfRows=1&returnType=json&serviceKey=${encodeURIComponent(serviceKey)}` 
const today = new Date(); // 오늘의 날짜
const base_date = today.toLocaleDateString('en-CA').replace(/-/g, ''); // 'yyyy-mm-dd' → 'yyyymmdd'
let base_time = today.getHours().toString().padStart(2, '0') + today.getMinutes().toString().padStart(2, '0'); // 오늘 시간 (HHmm) 형식
let addressInfo = "서울";
let gridX = 60;
let gridY = 127;

const cities = {
    서울: 'seoul',
    부산: 'busan',
    대구: 'daegu',
    인천: 'incheon',
    광주: 'gwangju',
    대전: 'daejeon',
    울산: 'ulsan',
    경기: 'gyeonggi',
    강원: 'gangwon',
    충북: 'chungbuk',
    충남: 'chungnam',
    전북: 'jeonbuk',
    전남: 'jeonnam',
    경북: 'gyeongbuk',
    경남: 'gyeongnam',
    제주: 'jeju',
    세종특별자치시: 'sejong'
};

const weathercities = [
    { "지역": "서울", "격자 X": 60, "격자 Y": 127 },
    { "지역": "부산", "격자 X": 98, "격자 Y": 76 },
    { "지역": "대구", "격자 X": 89, "격자 Y": 90 },
    { "지역": "인천", "격자 X": 55, "격자 Y": 124 },
    { "지역": "광주", "격자 X": 58, "격자 Y": 74 },
    { "지역": "대전", "격자 X": 67, "격자 Y": 100 },
    { "지역": "울산", "격자 X": 102, "격자 Y": 84 },
    { "지역": "세종특별자치도", "격자 X": 66, "격자 Y": 103 },
    { "지역": "경기", "격자 X": 60, "격자 Y": 120 },
    { "지역": "충북", "격자 X": 69, "격자 Y": 107 },
    { "지역": "충남", "격자 X": 68, "격자 Y": 100 },
    { "지역": "전남", "격자 X": 51, "격자 Y": 67 },
    { "지역": "경북", "격자 X": 87, "격자 Y": 106 },
    { "지역": "경남", "격자 X": 91, "격자 Y": 77 },
    { "지역": "제주", "격자 X": 52, "격자 Y": 38 },
    { "지역": "강원", "격자 X": 73, "격자 Y": 134 },
    { "지역": "전북", "격자 X": 63, "격자 Y": 89 }
  ]

  const allowedCategories = ["PTY", "PCP", "REH", "SNO", "WSD", "RN1", "T1H"];

  const getAPIDate = async (req, res) => {
    const { longitude, latitude } = req.query;
    const kakaoapiURI = `https://dapi.kakao.com/v2/local/geo/coord2address.json?input_coord=WGS84&x=${longitude}&y=${latitude}`;
    
    // 기상청 API 오류 대처용 코드
    if (parseInt(base_time.slice(0, 2)) === 0 && parseInt(base_time.slice(2, 4)) <= 8) {
        base_time = '23' + base_time.slice(2, 4);
    } else if (parseInt(base_time.slice(2, 4)) <= 8) {
        let hour = parseInt(base_time.slice(0, 2)) - 1;
        base_time = hour.toString().padStart(2, '0') + base_time.slice(2, 4);
    }

    try {
        // 카카오 API 요청
        const kakaoResponse = await axios.get(kakaoapiURI, {
            headers: { Authorization: `KakaoAK ${kakaoKey}` },
        });

        if (kakaoResponse.data && kakaoResponse.data.meta && kakaoResponse.data.meta.total_count !== undefined) {
            if (kakaoResponse.data.documents && kakaoResponse.data.documents.length > 0) {
                const addressData = kakaoResponse.data.documents[0];
                addressInfo = addressData.address.region_1depth_name;
            } else {
                console.error('documents 배열에 데이터가 없습니다.');
            }
        }
        const aircities = cities[addressInfo];
        const location = weathercities.find(loc => loc.지역 === addressInfo);
        if (location) {
            gridX = location["격자 X"];
            gridY = location["격자 Y"];
        }

        let queryParams = `?serviceKey=${encodeURIComponent(serviceKey)}`;
        queryParams += `&pageNo=1&numOfRows=10&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${gridX}&ny=${gridY}`;

        // 병렬 요청
        const [weatherResponse, airResponse, pm25Response, bankResponse] = await Promise.all([
            axios.get(weatherapiURI + queryParams),
            axios.get(airapiURI),
            axios.get(pm25airapiURI),
            axios.get(bankapiURI),
        ]);

        // 날씨 정보
        const weatherData = weatherResponse.data;
        if (!weatherData.response || !weatherData.response.body || !weatherData.response.body.items || !weatherData.response.body.items.item) {
            throw new Error("API 응답 오류: 유효한 날씨 데이터가 없습니다.");
        }
        let weatherInfo = weatherData.response.body.items.item;
        weatherInfo = weatherInfo.filter(item => allowedCategories.includes(item.category)); // allowedCategories 배열의 값으로 배열 정리 

        // 미세먼지 정보
        const airInfo = airResponse.data.response.body.items;
        if (!airInfo || airInfo.length === 0) {
            throw new Error("API 응답 오류: 유효한 미세먼지 데이터가 없습니다.");
        }
        let cityAirValue = airInfo.find(item => item[aircities] !== undefined)[aircities];
        if(cityAirValue===null) {
            cityAirValue = "측정 오류";
        }

        // 초미세먼지 정보
        const pm25airInfo = pm25Response.data.response.body.items;
        if (!pm25airInfo || pm25airInfo.length === 0) {
            throw new Error("API 응답 오류: 유효한 초미세먼지 데이터가 없습니다.");
        }
        let pm25cityAirValue = pm25airInfo.find(item => item[aircities] !== undefined)[aircities];
        if(pm25cityAirValue===null) {
            pm25cityAirValue = "측정 오류";
        }

        // 한국은행 정보
        const bankInfo = bankResponse.data.KeyStatisticList.row;
        if (!bankInfo || bankInfo.length === 0) {
            throw new Error("API 응답 오류: 유효한 한국은행 데이터가 없습니다.");
        }

        // 템플릿에 데이터 전달
        res.render("mainpage", {
            title: "오늘은 어때?",
            area: addressInfo,
            mapdata: addressInfo,
            weatherData: weatherInfo,
            airData: cityAirValue,
            pm25airData: pm25cityAirValue,
            bankData: bankInfo,
        });
    } catch (error) {
        console.error("오류 발생:", error);
        res.status(500).render('error', {
            title: '오류 발생',
        });
    }
};

module.exports = {
    getAPIDate
};
