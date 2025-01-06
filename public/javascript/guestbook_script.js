function handleFormSubmit(event) {
    // 'name' 입력값 가져오기
    const name = document.getElementById('name').value;

    // 'name'이 빈 문자열일 경우 null로 처리
    if (name.trim() === '') {
        document.getElementById('name').value = null;
    }
}

function deleteGuestbook(event, guestbookId) {
    event.preventDefault(); // 폼 제출을 방지합니다.

    // 비밀번호 입력 값 가져오기
    const delPassword = document.getElementById('delpassword-' + guestbookId).value.trim();

    // DELETE 요청 보내기
    fetch('/guestbook', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            guestbookId: guestbookId, 
            password: delPassword     
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('방명록 항목이 삭제되었습니다.');
            location.reload();  // 페이지 새로 고침 
        } else {
            alert('비밀번호가 틀렸습니다.' + error);
        }
    })
    .catch(error => {
        console.error('삭제 요청 오류:', error);
        alert('삭제에 실패했습니다.');
    });
}

const textarea = document.getElementById('article');
const charCount = document.getElementById('charCount');

textarea.addEventListener('input', function() {
    const textLength = textarea.value.length;     // textarea의 입력된 글자 수 계산
    
    charCount.textContent = textLength; // 글자 수 업데이트
});