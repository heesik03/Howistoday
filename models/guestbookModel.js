const mongoose = require("mongoose");
const {DateTime} = require('luxon');

const GuestbookSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [15, "닉네임은 15자를 초과할 수 없습니다."]
    },
    password: {
        type: String,
        required: [true, "비밀번호 작성 필요"],
    },
    article: {
        type: String,
        required: [true, "내용 작성 필요"],
        maxlength: [300, "내용은 최대 300글자까지 입력 가능합니다."]
    }, 
    createdAt: {
        type: String,
        default: () => {
            const koreaTime = DateTime.now().setZone('Asia/Seoul');
            const formattedTime = koreaTime.toFormat('yyyy-LL-dd HH:mm:ss');

            return formattedTime;
        }
    }
});

const Guestbook = mongoose.model("Guestbook", GuestbookSchema);

module.exports = Guestbook;
