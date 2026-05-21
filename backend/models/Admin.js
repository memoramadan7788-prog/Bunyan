const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is Required"],
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
    },
    password: {
        type: string,
        required: [true, "Password is Required"],
        minlength: 6,
        select: false,
    },
}, {timestamps: true});

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = async function (matchedPassword) {
    return await bcrypt.compare(matchedPassword, this.password);
}