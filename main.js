const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const service = express();
const dbConnect = require("./config/dbConnect");
require("dotenv").config();  // env 연결

const port = process.env.PORT || 8080; // env 파일에 환경변수 PORT가 설정 안 된 경우 8080번으로

dbConnect();

// json, URL 인코딩된 데이터 파싱
service.use(express.json()); 
service.use(express.urlencoded({extended: false})); 

// routes 파일, public 폴더 연결
service.use("/", require("./routes/main_routes")); 
service.use(express.static("public")); 

// express-ejs-layouts 사용 설정
service.use(expressLayouts);
service.set("view engine", "ejs");
service.set("views", "./views");

service.listen(port, () => {
    console.log(`Main listening on port ${port}`);
})