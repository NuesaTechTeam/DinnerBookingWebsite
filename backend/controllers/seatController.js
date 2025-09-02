import { Seat } from "../models/seatModel.js";
import { Table } from "../models/tableModel.js";

//Get all seats with table info
export const getSeats = async (req, res) => {
  try {
    const seats = await Seat.find()
      .populate('table')
      .sort({ seatNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: seats
    });
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seats'
    });
  }
};

//Get available seats
export const getAvailableSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ 
      isBooked: false,
      $or: [
        { lockedUntil: { $exists: false } },
        { lockedUntil: null },
        { lockedUntil: { $lte: new Date() } }
      ]
    })
      .populate('table')
      .sort({ seatNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: seats
    });
  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available seats'
    });
  }
};

// Get seats by table
export const getSeatsByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const seats = await Seat.find({ table: tableId })
      .populate('table')
      .sort({ seatNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: seats
    });
  } catch (error) {
    console.error('Get seats by table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seats'
    });
  }
};

//Get seat status for a table
export const getSeatStatus = async (req, res) => {
  try {
    const { tableId } = req.body;
    
    const seats = await Seat.find({ table: tableId });
    
    const now = new Date();
    const bookedSeats = seats.filter(seat => seat.isBooked).map(seat => seat._id);
    const lockedSeats = seats.filter(seat => 
      !seat.isBooked && seat.lockedUntil && seat.lockedUntil > now
    ).map(seat => seat._id);
    
    res.status(200).json({
      success: true,
      bookedSeats,
      lockedSeats
    });
  } catch (error) {
    console.error('Get seat status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seat status'
    });
  }
};