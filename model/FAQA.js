const mongoose=require('mongoose');

const faqaschema=new mongoose.Schema({
    question :{
        type: String
    },
    answer :{
        type: String
    }
});

module.exports=mongoose.model('faqa',faqaschema);