const longitude = 126.86815833256443;
const latitude = 37.50103355333582;

const sendLocationToServer = () => {
    // 위치 정보를 수집하는 함수
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // 위치 정보 수집 성공
                const longitude = position.coords.longitude;
                const latitude = position.coords.latitude;

                // 위치 정보를 서버로 전송
                sendLocationToNode(longitude, latitude);
                // 위치 정보가 전송된 후 카카오 맵을 갱신
                updateKakaoMap(longitude, latitude);
            },
            (error) => {
                // 위치 정보 수집 실패
                console.error("Error getting location:", error);
                // 기본값으로 서버에 전송
                sendLocationToNode(longitude, latitude);
                // 기본값으로 카카오 맵을 갱신
                updateKakaoMap(longitude, latitude);
            }
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
        // 기본값으로 서버에 전송
        sendLocationToNode(longitude, latitude);
        // 기본값으로 카카오 맵을 갱신
        updateKakaoMap(longitude, latitude);
    }
};

// 위치 정보를 서버로 전송하는 함수
const sendLocationToNode = async (longitude, latitude) => {
    try {
        // 위치 정보를 / 경로로 전송 (쿼리 파라미터 포함)
        const response = await fetch(`/?longitude=${longitude}&latitude=${latitude}`, {
            method: 'GET'
        });

        // 서버로부터의 응답 처리
        const result = await response.json();
        console.log(result); // 서버에서 받은 응답
    } catch (error) {
        console.error('Error sending location:', error);
    }
};

// 카카오 맵을 갱신하는 함수
const updateKakaoMap = (longitude, latitude) => {
    // 카카오 맵을 업데이트하는 부분
    var infowindow = new kakao.maps.InfoWindow({zIndex:1});

    var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
        mapOption = {
            center: new kakao.maps.LatLng(latitude, longitude), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

    // 지도를 생성합니다    
    var map = new kakao.maps.Map(mapContainer, mapOption);

    // 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places(); 

    // 키워드로 장소를 검색합니다
    ps.keywordSearch(menuName, placesSearchCB, {
        radius : 1500,
        location: new kakao.maps.LatLng(latitude, longitude)
    });

    // 키워드 검색 완료 시 호출되는 콜백함수입니다
    function placesSearchCB (data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            var bounds = new kakao.maps.LatLngBounds();

            for (var i=0; i<data.length; i++) {
                displayMarker(data[i]);    
                bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
            }       

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
        }
    }

    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place) {
        // 마커를 생성하고 지도에 표시합니다
        var marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(place.y, place.x) 
        });

        // 마커에 클릭이벤트를 등록합니다
        kakao.maps.event.addListener(marker, 'click', function() {
            // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
            infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
            infowindow.open(map, marker);
        });
    }
};

// 함수 호출
sendLocationToServer();

