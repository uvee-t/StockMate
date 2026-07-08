import bcrypt from 'bcrypt';

const generateHash = async (plainText) => {
    return await bcrypt.hash(plainText, Number(process.env.HASH_ROUND) || 12);
};

const validateHash = async (plainText, hashText) => {
    return await bcrypt.compare(plainText, hashText);
};

export { generateHash, validateHash };
