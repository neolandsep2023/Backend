let testEmailSend = false;

const setSendEmail = (dataBoolean) => {
  testEmailSend = dataBoolean;
};

const getSendEmail = () => {
  return testEmailSend;
};

module.exports = {
  getSendEmail,
  setSendEmail,
};
