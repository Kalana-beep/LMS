const generateSigmaId = async (UserModel, name) => {
  const base = name.toLowerCase().replace(/\s/g, '');
  let uniqueId = `Sigma${base}${Math.floor(Math.random() * 10000)}`;
  let exists = await UserModel.findOne({ SigmaId: uniqueId });
  while (exists) {
    uniqueId = `Sigma${base}${Math.floor(Math.random() * 10000)}`;
    exists = await UserModel.findOne({ SigmaId: uniqueId });
  }
  return uniqueId;
};

module.exports = generateSigmaId;