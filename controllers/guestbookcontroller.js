require("dotenv").config();  // env 연결
const crypto = require('crypto');
const guestbookModel = require("../models/guestbookModel");

const getGuestbook = async (req, res) => {
    try {
        const viewguestbook = await guestbookModel.find();
        res.render("guestbook", {
            title: "방명록",
            guestbookData : viewguestbook
        });
    } catch (error) {
        console.error("방명록 오류 발생:", error);

        // 오류가 발생하면 'error.ejs'를 렌더링하고 오류 메시지를 전달
        res.status(500).render('error', {
            title: '오류 발생',
            errorMessage: error.message || '알 수 없는 오류가 발생했습니다.'
        });
    }
}

const postGuestbook = async (req, res) => {
    try {
        console.log(req.body);
        const { name, password, article } = req.body;

        if (!password || !article) {
            throw new Error("비밀번호 또는 내용이 없습니다.");
        }

        const guestName = (name && name.trim() !== '') ? name : "익명의 사람"; // name이 공백이거나 없으면 "익명의 사람"으로 설정

        // 비밀번호 암호화 (SHA-256 해시 사용)
        const hash = crypto.createHash('sha256');
        hash.update(password);  // 비밀번호 업데이트
        const hashedPassword = hash.digest('hex');  // 해시된 비밀번호 얻기

        const inputGuestbook = new guestbookModel({
            name: guestName, password : hashedPassword, article
        });

        await inputGuestbook.save(); 

        console.log("방명록 추가 성공!");

        res.redirect("/guestbook");  // 새로고침

    } catch (error) {
        console.error("방명록 추가 중 오류 발생:", error);

        res.status(500).render('error', {
            title: '오류 발생',
            errorMessage: error.message || '알 수 없는 오류가 발생했습니다.'
        });
    }
}

const deleteGuestbook = async (req, res) => {
    try {
        const { guestbookId, password } = req.body;

        // 방명록 항목 찾기
        const guestbookItem = await guestbookModel.findById(guestbookId);
        if (!guestbookItem) {
            throw new Error("방명록 항목을 찾을 수 없습니다.");
        }

        // 입력된 비밀번호 암호화
        const hash = crypto.createHash('sha256');
        hash.update(password);
        const hashedPassword = hash.digest('hex');
        const masterpassword = crypto.createHash('sha256').update(process.env.MASTER_PASSWORD).digest('hex');

        // masterpassword와 입력된 비밀번호가 일치하거나, guestbookItem의 비밀번호가 일치하면 삭제
        if (hashedPassword === masterpassword || guestbookItem.password === hashedPassword) {
            await guestbookModel.findByIdAndDelete(guestbookId);
            console.log("방명록 삭제 성공!");
            return res.json({ success: true, message: "방명록 항목이 삭제되었습니다." });
        }

        // 비밀번호가 일치하지 않으면 에러
        throw new Error("비밀번호가 일치하지 않습니다.");
        
    } catch (error) {
        console.error("방명록 삭제 중 오류 발생:", error);

        res.status(500).render('error', {
            title: '오류 발생',
        });
    }
}

module.exports = {
    getGuestbook,
    postGuestbook,
    deleteGuestbook
};