import { Op } from 'sequelize';
import Contact from '../models/Contact';

export const handleIdentify = async (email: string, phoneNumber: string) => {
  const contacts = await Contact.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
    order: [['createdAt', 'ASC']],
  });

  if (contacts.length === 0) {
    // create new primary contact
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: 'primary',
      linkedId: null,
    });

    return {
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email].filter(Boolean),
        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
        secondaryContactIds: [],
      },
    };
  }

  // finding the first "primary" contact
  const primaries = contacts.filter(c => c.linkPrecedence === 'primary');
  const [primaryContact, ...otherPrimaries] = primaries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // if more than one primary then convert the other primary to secondary
  const secondaryUpdates = [];

  for (const other of otherPrimaries) {
    secondaryUpdates.push(
      Contact.update(
        {
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id,
        },
        { where: { id: other.id } }
      ),
      Contact.update(
        {
          linkedId: primaryContact.id,
        },
        { where: { linkedId: other.id } }
      )
    );
  }

  await Promise.all(secondaryUpdates);

  // create new secondary if new info (email/phone) not matched yet
  const alreadyExists = contacts.find(c => c.email === email && c.phoneNumber === phoneNumber);

  if (!alreadyExists) {
    await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: 'secondary',
    });
  }

  // get all related contacts (primary + secondaries)
  const allContacts = await Contact.findAll({
    where: {
      [Op.or]: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
    },
    order: [['createdAt', 'ASC']],
  });

  const emails = new Set();
  const phoneNumbers = new Set();
  const secondaryContactIds = [];

  for (const contact of allContacts) {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    if (contact.linkPrecedence === 'secondary') {
      secondaryContactIds.push(contact.id);
    }
  }

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails: [primaryContact.email, ...[...emails].filter(e => e !== primaryContact.email)],
      phoneNumbers: [primaryContact.phoneNumber, ...[...phoneNumbers].filter(p => p !== primaryContact.phoneNumber)],
      secondaryContactIds,
    },
  };
};
