const mongoose = require("mongoose");

const Lunchmenu = new mongoose.Schema( {
    name: {
        type : String,
        required : [true, "이름 작성 필요"]
    },
    explanation : {
        type : String,
        required : [true, "설명 작성 필요"]
    }
},
{
    timestamps : true
})

const menu = mongoose.model("menu", Lunchmenu);

module.exports = menu;