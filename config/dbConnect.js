require("dotenv").config();
const mongoose = require("mongoose");

// 점심 메뉴 DB 연결 함수
const dbConnect = async () => { 
	try { 
		const connect = await mongoose.connect(process.env.DB_CONNECT); 
		console.log(`MONGO DB 연결 성공!`); 
	} catch(err) { 
		console.log("DB error : " + err); 
} }

module.exports = dbConnect;

