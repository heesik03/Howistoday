const express = require("express");
const router = express.Router();
const {getAPIDate} = require("../controllers/maincontroller");
const getMeauAndMoive = require("../controllers/oneulcontroller");
const {getGuestbook, postGuestbook, deleteGuestbook} = require("../controllers/guestbookcontroller");

router.route("/")
    .get(getAPIDate)  

router.get("/about", (req, res) => {
    res.render("about", {title: "소개"});
})

router.route("/oneulmwohaji")
    .get(getMeauAndMoive)


router.get("/service1", (req, res) => {
    res.render("service1", {title: "구현 중..."});
})

router.route("/guestbook")
    .get(getGuestbook)
    .post(postGuestbook)
    .delete(deleteGuestbook)

module.exports = router;