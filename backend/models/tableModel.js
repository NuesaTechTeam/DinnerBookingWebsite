import mongoose from "mongoose";


const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        enum: ["VVIP", "VIP", "SILVER", "REGULAR"],
        required: true,
    },
    shape: {
        type: String,
        enum: ["ROUND", "LONG"],
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    pricePerSeat: {
        type: Number,
        required: true,
    },
    seats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
    }]
}, {timestamps: true})

export const Table = mongoose.model("Table", tableSchema)