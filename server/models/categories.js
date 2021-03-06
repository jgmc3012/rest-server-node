const mongoose = require('mongoose')

const Schema = mongoose.Schema

const categorySchema = new Schema({
    description: {
        type: String,
        unique: true,
        required: [true, "El campo categoria es requerido"]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model("Category", categorySchema)