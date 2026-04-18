import bankAccountModel from "../../DB/models/bankAccount.model.js";
import * as db_service from "../../DB/db.service.js"
import transactionModel from "../../DB/models/transaction.model.js";
import successResponse from "../../common/utils/success-response/successResponse.js";
import moment from "moment";


export const deposit = async (req, res) => {
    const { amount } = req.body;

const account = await db_service.findOne({ model : bankAccountModel, 
    check:{ userId: req.user._id }
});

account.balance += amount;
await account.save();

const transaction = await db_service.create({
    model:transactionModel,
    data:{
    toAccount: account._id,
    amount,
    type: "deposit",
    }
});
successResponse({res, message: "Deposit successful", balance: account.balance })

};


export const withdraw = async (req, res) => {
const { amount } = req.body;

const account = await db_service.findOne({ model : bankAccountModel, 
    check:{ userId: req.user._id }
});

if (account.balance < amount) {
    throw new Error("Insufficient balance" , {cause:400});
    
}

account.balance -= amount;
await account.save();

const transaction = await db_service.create({
    model:transactionModel,
    data:{
    fromAccount: account._id,
    amount,
    type: "withdraw",
    }
});

return res.json({ message: "Withdraw successful", balance: account.balance });
};



export const transfer = async (req, res, next) => {
    const { fromAccountId, toAccountId, amount } = req.body;

    
    const fromAccount = await bankAccountModel.findById(fromAccountId);

    if (!fromAccount) {
        throw new Error("Sender account not found", { cause: 404 });
    }

    if (fromAccount._id.toString() === toAccountId) {
    throw new Error("You cannot transfer to yourself");
    }

    
    const toAccount = await bankAccountModel.findById(toAccountId);

    if (!toAccount) {
        throw new Error("Receiver not found", { cause: 404 });
    }

    
    if (fromAccount.balance < amount) {
        throw new Error("Insufficient balance", { cause: 400 });
    }

 
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

   
    await db_service.create({
        model: transactionModel,
        data: {
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            type: "transfer"
        }
    });

    return successResponse({
        res,
        message: "Transfer successful",
        data: {
            fromBalance: fromAccount.balance,
            toBalance: toAccount.balance
        }
    });
};

export const getTransactions = async (req, res, next) => {
    
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

       
        const account = await bankAccountModel.findOne({
            userId: req.user._id
        });

        if (!account) {
            throw new Error("Account not found", { cause: 404 });
        }

        
        const transactions = await transactionModel.find({
            $or: [
                { fromAccount: account._id },
                { toAccount: account._id }
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      
        const total = await transactionModel.countDocuments({
            $or: [
                { fromAccount: account._id },
                { toAccount: account._id }
            ]
        });

        return successResponse({
            res,
            message: "Transactions fetched successfully",
            data: {
                transactions,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / limit),
                    totalTransactions: total,
                    hasNextPage: skip + transactions.length < total
                }
            }
        });

   
};




export const getOneTransaction = async (req, res, next) => {
    
        const { id } = req.params;

        
        const account = await bankAccountModel.findOne({
            userId: req.user._id
        });

        if (!account) {
            throw new Error("Account not found", { cause: 404 });
        }

        const transaction = await transactionModel.findById(id)
            .populate("fromAccount", "accountNumber balance currency")
            .populate("toAccount", "accountNumber balance currency");

        if (!transaction) {
            throw new Error("Transaction not found", { cause: 404 });
        }

        const isOwner =
            transaction.fromAccount?._id?.toString() === account._id.toString() ||
            transaction.toAccount?._id?.toString() === account._id.toString();

        if (!isOwner) {
            throw new Error("Not allowed to view this transaction", { cause: 403 });
        }

        return successResponse({
            res,
            message: "Transaction fetched successfully",
            data: transaction
        });
};



export const getAccountSummary = async (req, res, next) => {
    

        const account = await bankAccountModel.findOne({
            userId: req.user._id
        });

        if (!account) {
            throw new Error("Account not found", { cause: 404 });
        }

        const deposits = await transactionModel.aggregate([
            {
                $match: {
                    toAccount: account._id,
                    type: "deposit"
                }
            },
            {
                $group: {
                    _id: null,
                    totalDeposits: { $sum: "$amount" }
                }
            }
        ]);

        const withdrawals = await transactionModel.aggregate([
            {
                $match: {
                    fromAccount: account._id,
                    type: "withdraw"
                }
            },
            {
                $group: {
                    _id: null,
                    totalWithdrawals: { $sum: "$amount" }
                }
            }
        ]);

        const totalDeposits = deposits[0]?.totalDeposits || 0;
        const totalWithdrawals = withdrawals[0]?.totalWithdrawals || 0;

        const currentBalance = account.balance;

        return successResponse({
            res,
            message: "Account summary fetched successfully",
            data: {
                totalDeposits,
                totalWithdrawals,
                currentBalance
            }
        });

};


export const getStatement = async (req, res, next) => {
    

        const { from, to, page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const account = await bankAccountModel.findOne({
            userId: req.user._id
        });

        if (!account) {
            throw new Error("Account not found", { cause: 404 });
        }

        const dateFilter = {};

if (from || to) {
    dateFilter.createdAt = {};

    if (from) {
        dateFilter.createdAt.$gte = moment(from).startOf("day").toDate();
    }

    if (to) {
        dateFilter.createdAt.$lte = moment(to).endOf("day").toDate();
    }
}
        const transactions = await transactionModel.find({
            $and: [
                {
                    $or: [
                        { fromAccount: account._id },
                        { toAccount: account._id }
                    ]
                },
                dateFilter
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

        const total = await transactionModel.countDocuments({
            $and: [
                {
                    $or: [
                        { fromAccount: account._id },
                        { toAccount: account._id }
                    ]
                },
                dateFilter
            ]
        });

        return successResponse({
            res,
            message: "Statement fetched successfully",
            data: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit),
                transactions
            }
        });

};