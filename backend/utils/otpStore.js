const otpStore = {};

export const saveOtp = (email, otp) => {
    otpStore[email] = { otp, expires: Date.now() + 15 * 60 * 1000 };
};

export const getOtp = (email) => {
    const record = otpStore[email];
    if (record && record.expires > Date.now()) return record.otp;
    delete otpStore[email];
    return null;
};

export const deleteOtp = (email) => {
    delete otpStore[email];
};