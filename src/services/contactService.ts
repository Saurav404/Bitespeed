import { Op } from 'sequelize';
import Contact from '../models/Contact';

export const handleIdentify = async (email: string, phoneNumber: string) => {
  // OR condition in case any one email/phoneNumber is null
  const orConditions = [];
  if (email) orConditions.push({ email });
  if (phoneNumber) orConditions.push({ phoneNumber });

  const contacts = await Contact.findAll({
    where: {
      [Op.or]: orConditions,
    },
    order: [['createdAt', 'ASC']],
  });

  if (contacts.length === 0) {
    // Create new primary contact
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

  // Get all contacts for the incoming email/phoneNumber + their primary contacts
  const contactIds = new Set();

  contacts.forEach(contact => {
    contactIds.add(contact?.id);
    if (contact.linkedId) {
      contactIds.add(contact?.linkedId);
    }
  });

  const linkedPrimaryContacts = await Contact.findAll({
    where: {
      id: {
        [Op.in]: [...contactIds],
      },
    },
  });

  // Finding the first "primary" contact
  const primaries = linkedPrimaryContacts.filter(c => c.linkPrecedence === 'primary');
  const [primaryContact, otherPrimary] = primaries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Add the contact to DB if combination of both phoneNumber and email is new.
  if (email && phoneNumber) {
    //If there is only one primary contact, add the incoming contact as new secondary contact.
    if (!otherPrimary) {
      const contactExist = await Contact.findOne({
        where: { email, phoneNumber },
      });

      if (!contactExist) {
        await Contact.create({
          email,
          phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id,
        });
      }
    } else {
      // Convert the other primary contact to oldest primary contact's secondary.
      // Get all the the secondary contacts for the other primary and link them to the primary contact
      const secondaryContacts = await Contact.findAll({
        where: { linkedId: otherPrimary.id, linkPrecedence: 'secondary' },
      });

      await Contact.update(
        {
          linkedId: primaryContact.id,
        },
        {
          where: { id: { [Op.in]: secondaryContacts.map(item => item.id) } },
        },
      );

      //Link the other primary to the first primary contact
      await Contact.update({ linkedId: primaryContact.id, linkPrecedence: 'secondary' }, { where: { id: otherPrimary.id } });
    }
  }


  // Get all contact and return the result object
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
      emails: [...emails],
      phoneNumbers: [...phoneNumbers],
      secondaryContactIds,
    },
  };
};
