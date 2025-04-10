const mongoose= require ("mongoose");


const imageScgema= new mongoose.Schema({
    id:{type:String, required:true},
    url:{type:String, required:true},
    description:{type:String, required:true},
    created_at:{type:String, required:true},
    updated_at:{type:String, required:true},
    author:{type:String, required:true},
    alt_description:{type:String, required:true}
});

module.exports=mongoose.model("Image",imageScgema);