import { Table } from "../models/tableModel.js";

//Get all tables
export const getTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .populate('seats')
      .sort({ type: 1, tableNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables'
    });
  }
};

// Get a single table
export const getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('seats');
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch table'
    });
  }
};

// Get tables by type
export const getTablesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const tables = await Table.find({ type: type.toUpperCase() })
      .populate('seats')
      .sort({ tableNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error('Get tables by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables'
    });
  }
};
