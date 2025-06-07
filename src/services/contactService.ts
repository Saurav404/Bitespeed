import { Op } from 'sequelize';
import Contact from '../models/Contact';

export const handleIdentify = async (email: string, phoneNumber: string) => {
   const contacts = await Contact.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
    order: [['createdAt', 'ASC']],
  });
  return contacts;
};
