const generateOtp = () => {
  try {
    // taking  urrrent time
    const currentTime = new Date().getTime();
    // shuffling the time
    const shuffledTime = currentTime
      .toString()
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    // generating 6 digit otp
    const otp = shuffledTime.slice(0, 6);
    return otp;
  } catch (error) {
    throw new Error("Failed to generate OTP: " + error.message);
  }
}