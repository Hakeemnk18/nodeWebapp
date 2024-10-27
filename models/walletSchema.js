const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
    },
    type: {
        type: String, // 'deposit' or 'withdrawal'
    },
    date: {
        type: Date,
    },
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referralBonus: {
        type: Number,
        default: 0
    },
    refunds: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [transactionSchema]  
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
