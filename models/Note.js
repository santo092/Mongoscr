// mongoose
var mongoose = require("mongoose");

// schema
var Schema = mongoose.Schema;

// note schema
var NoteSchema = new Schema({
    body: {
        type: String
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: "Article"
    }
});

// note model w mongoose
var Note = mongoose.model("Note", NoteSchema);


module.exports = Note;
