const Transaction = require("../Model/Transaction");
const Wallet = require("../Model/Wallet");
const WithdrawalRequest = require("../Model/WithdrawalRequest");

async function getAllRequests(req, res) {
  try {
    const requests = await WithdrawalRequest.find({ status: 'pending' });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateRequest(req, res) {
  const { requestId } = req.params;
  const { status, transactionId } = req.body;
  try {
    const originalRequest = await WithdrawalRequest.findById(requestId);
    if (!originalRequest) return res.status(404).json({ success: false, message: "Withdraw request not found" });

    const updatedDetails = await WithdrawalRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true, runValidators: true }
    );

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status: status === 'approved' ? 'completed' : 'failed' },
      { new: true, runValidators: true }
    );

    // If the new status is "rejected" and it wasn't already rejected,
    // refund the amount back to the user's wallet.
    if (status === 'rejected' && originalRequest.status !== 'rejected') {
      const userWallet = await Wallet.findOne({ combineId: updatedDetails.userId });
      if (userWallet) {
        userWallet.balance = Number(userWallet.balance) + Number(updatedDetails.amount);
        await userWallet.save();
      }
    }

    return res.status(200).json({ success: true, message: "Withdraw request updated successfully", data: updatedDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
  getAllRequests,
  updateRequest,
};