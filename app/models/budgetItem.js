const mongoose = require('mongoose')

const budgetItemSchema = new mongoose.Schema({
  transaction: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    requred: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('BudgetItem', budgetItemSchema)
