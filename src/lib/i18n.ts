export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Header
  committeeName: {
    en: 'Vikas Sahayog Samiti',
    hi: 'विकास सहयोग समिति'
  },
  committeeTagline: {
    en: 'Public Money for Public Work | 100% Transparent Community Ledger',
    hi: 'सार्वजनिक कार्य हेतु जन सहयोग | 100% पारदर्शी एवं सच्चा हिसाब'
  },
  transparencyBadge: {
    en: '100% Transparent Community Fund',
    hi: '100% पारदर्शी सार्वजनिक कोष'
  },
  availableBalance: {
    en: 'Available In Hand',
    hi: 'कुल उपलब्ध कोष'
  },
  bankCashBalance: {
    en: 'Verified in Bank / Cash',
    hi: 'बैंक / नकद में सुरक्षित राशि'
  },
  totalCollected: {
    en: 'Total Fund Raised',
    hi: 'कुल एकत्रित सहयोग'
  },
  coreCollections: {
    en: 'Core Monthly Funds',
    hi: 'कोर मासिक अंशदान'
  },
  publicDonations: {
    en: 'Jan Sahayog (Public)',
    hi: 'जन सहयोग (स्वैच्छिक)'
  },
  totalSpent: {
    en: 'Total Public Works Spent',
    hi: 'सार्वजनिक कार्यों पर खर्च'
  },
  viewExpenses: {
    en: 'View work expenses →',
    hi: 'खर्च का विवरण देखें →'
  },
  coreMembersCount: {
    en: 'Core Members (₹1k/mo)',
    hi: 'कोर सदस्य (₹1,000/माह)'
  },
  publicSupportersCount: {
    en: 'Public Contributors',
    hi: 'सार्वजनिक सहयोगी'
  },

  // Navigation Tabs
  tabOverview: {
    en: 'Overview',
    hi: 'कोष विवरण'
  },
  tabJanSahayog: {
    en: 'Jan Sahayog',
    hi: 'जन सहयोग'
  },
  tabMatrix: {
    en: '12-Mo Matrix',
    hi: '12-मासिक रिकॉर्ड'
  },
  tabPay: {
    en: 'Contribute / Pay',
    hi: 'सहयोग करें'
  },
  tabLedger: {
    en: 'My Receipts',
    hi: 'मेरी रसीदें'
  },
  tabExpenses: {
    en: 'Public Works',
    hi: 'सार्वजनिक कार्य'
  },
  tabAdmin: {
    en: 'Admin Panel',
    hi: 'व्यवस्थापक कक्ष'
  },

  // CTA Buttons
  btnContributeNow: {
    en: 'Make a Contribution (UPI)',
    hi: 'सहयोग राशि दें (UPI)'
  },
  btnViewMatrix: {
    en: '12-Month Matrix',
    hi: '12-मासिक सूची'
  },
  btnViewWorks: {
    en: 'Public Works Ledger',
    hi: 'कार्य खर्च विवरण'
  },

  // Payment Modal
  payModalTitle: {
    en: 'Committee Contribution & Donation',
    hi: 'समिति सहयोग एवं अंशदान'
  },
  payModalSubtitle: {
    en: 'Zero transaction fee. Directly credited to committee public account.',
    hi: 'शून्य अतिरिक्त शुल्क। सीधे समिति के सार्वजनिक खाते में जमा।'
  },
  typeCoreMember: {
    en: 'Core Member Monthly (₹1,000)',
    hi: 'कोर सदस्य मासिक अंशदान (₹1,000)'
  },
  typePublicSeva: {
    en: 'Jan Sahayog / Open Donation (Any Amount)',
    hi: 'जन सहयोग / स्वैच्छिक दान (इच्छानुसार राशि)'
  },
  selectMember: {
    en: 'Select Member Name *',
    hi: 'सदस्य का नाम चुनें *'
  },
  selectMonth: {
    en: 'Contribution For Month *',
    hi: 'किस माह का अंशदान *'
  },
  contributorName: {
    en: 'Your Full Name *',
    hi: 'सहयोगी का पूरा नाम *'
  },
  contributorPhone: {
    en: 'Mobile Number *',
    hi: 'मोबाइल नंबर *'
  },
  contributionAmount: {
    en: 'Contribution Amount (₹) *',
    hi: 'सहयोग राशि (₹) *'
  },
  purposeLabel: {
    en: 'Cause / Purpose for Public Work (Optional)',
    hi: 'सार्वजनिक कार्य का उद्देश्य (वैकल्पिक)'
  },
  purposePlaceholder: {
    en: 'e.g. Street lighting, road repair, drinking water, community seva',
    hi: 'जैसे: स्ट्रीट लाइट, सड़क मरम्मत, पेयजल, पार्क सफाई, समाज कल्याण'
  },
  scanQrToPay: {
    en: 'Scan QR with Any UPI App',
    hi: 'किसी भी UPI ऐप से QR कोड स्कैन करें'
  },
  openUpiApp: {
    en: 'Pay with GPay / PhonePe / Paytm / BHIM',
    hi: 'GPay / PhonePe / Paytm से सीधे भुगतान करें'
  },
  copyUpiId: {
    en: 'Copy UPI ID',
    hi: 'UPI ID कॉपी करें'
  },
  copied: {
    en: 'Copied!',
    hi: 'कॉपी हो गया!'
  },
  enterUtrLabel: {
    en: '12-Digit UPI Reference / UTR Number *',
    hi: '12-अंकों का UPI UTR / Reference नंबर *'
  },
  utrHelpText: {
    en: 'Found in Google Pay, PhonePe, or Paytm transaction details after payment.',
    hi: 'भुगतान के बाद Google Pay, PhonePe या Paytm के रसीद में 12 अंकों का UTR नंबर मिलता है।'
  },
  btnSubmitProof: {
    en: 'Submit Payment Details',
    hi: 'भुगतान विवरण जमा करें'
  },
  submitting: {
    en: 'Submitting...',
    hi: 'जमा हो रहा है...'
  },
  paymentSubmittedSuccess: {
    en: 'Payment proof submitted! It will appear as verified once approved by organizer.',
    hi: 'भुगतान सफलतापूर्वक जमा हुआ! व्यवस्थापक द्वारा सत्यापन के बाद रसीद जारी होगी।'
  },

  // Matrix
  matrixTitle: {
    en: 'Core Members: 12-Month Contribution Tracker',
    hi: 'कोर सदस्य: 12-मासिक अंशदान विवरण'
  },
  matrixSubtitle: {
    en: 'Monthly ₹1,000 recurring contributions from committed committee members for year',
    hi: 'वर्ष के लिए समर्पित समिति सदस्यों द्वारा ₹1,000 मासिक नियमित अंशदान'
  },
  searchMember: {
    en: 'Search member name or phone...',
    hi: 'सदस्य का नाम या मोबाइल खोजें...'
  },
  allMembers: {
    en: 'All Members',
    hi: 'सभी सदस्य'
  },
  pendingOnly: {
    en: 'Due / Pending',
    hi: 'बकाया'
  },
  paidOnly: {
    en: 'Paid',
    hi: 'जमा'
  },
  statusPaid: {
    en: 'Paid (₹1,000)',
    hi: 'जमा (₹1,000)'
  },
  statusPendingApproval: {
    en: 'In Review',
    hi: 'जांच में'
  },
  statusDue: {
    en: 'Due (₹1,000)',
    hi: 'बाकी (₹1,000)'
  },
  totalPaid: {
    en: 'Total Paid',
    hi: 'कुल जमा'
  },
  totalDue: {
    en: 'Total Due',
    hi: 'कुल बाकी'
  },
  viewReceipt: {
    en: 'View Receipt',
    hi: 'रसीद देखें'
  },
  payNow: {
    en: 'Pay Now',
    hi: 'अभी दें'
  },

  // Jan Sahayog Ledger
  janSahayogTitle: {
    en: 'Jan Sahayog: Open Community Contributions',
    hi: 'जन सहयोग: खुला सार्वजनिक योगदान'
  },
  janSahayogSubtitle: {
    en: 'Public money contributed voluntarily by residents and well-wishers for community welfare.',
    hi: 'मोहल्लेवासियों और शुभचिंतकों द्वारा सार्वजनिक विकास कार्यों हेतु अपनी इच्छानुसार दिया गया सहयोग।'
  },
  noPublicContributionsYet: {
    en: 'No public contributions recorded yet. Be the first to contribute!',
    hi: 'अभी तक कोई सार्वजनिक सहयोग दर्ज नहीं हुआ है। सबसे पहले सहयोग दें!'
  },
  contributeAnyAmountNotice: {
    en: 'Open for all. Every single rupee is utilized transparently for neighborhood improvement.',
    hi: 'सभी के लिए खुला है। प्रत्येक रुपये का उपयोग मोहल्ले के विकास में पूरी ईमानदारी से होता है।'
  },

  // Fund Utilization / Expenses
  expensesTitle: {
    en: 'Public Works & Expense Ledger',
    hi: 'सार्वजनिक कार्य एवं खर्च विवरण'
  },
  expensesSubtitle: {
    en: 'Transparent record of how public money is utilized for community projects.',
    hi: 'सार्वजनिक कोष का पाई-पाई का हिसाब और विकास कार्यों का विवरण।'
  },
  logNewExpense: {
    en: 'Log New Expense',
    hi: 'नया खर्च दर्ज करें'
  },
  allCategories: {
    en: 'All Categories',
    hi: 'सभी श्रेणियां'
  },

  // Receipts
  receiptTitleCore: {
    en: 'Official Monthly Contribution Receipt',
    hi: 'आधिकारिक मासिक अंशदान रसीद'
  },
  receiptTitlePublic: {
    en: 'Public Welfare & Jan Sahayog Receipt',
    hi: 'जन कल्याण एवं सार्वजनिक सहयोग रसीद'
  },
  receiptNumber: {
    en: 'Receipt No:',
    hi: 'रसीद क्रमांक:'
  },
  receivedFrom: {
    en: 'Received with thanks from:',
    hi: 'सहयोग दाता का नाम:'
  },
  amountPaid: {
    en: 'Amount Paid:',
    hi: 'प्राप्त धनराशि:'
  },
  paymentMethod: {
    en: 'Payment Method:',
    hi: 'भुगतान माध्यम:'
  },
  utrRef: {
    en: 'Bank UTR / Ref No:',
    hi: 'बैंक UTR / संदर्भ संख्या:'
  },
  purposeOfContribution: {
    en: 'Purpose / Cause:',
    hi: 'कार्य / सेवा उद्देश्य:'
  },
  dateOfPayment: {
    en: 'Date & Time:',
    hi: 'दिनांक एवं समय:'
  },
  verifiedStamp: {
    en: 'VERIFIED & CREDITED TO TREASURY',
    hi: 'सत्यापित एवं कोष में जमा'
  },
  authorizedSignatory: {
    en: 'Authorized Organizer / President',
    hi: 'अधिकृत व्यवस्थापक / अध्यक्ष'
  },
  printReceipt: {
    en: 'Print / Save PDF',
    hi: 'प्रिंट / PDF डाउनलोड'
  },
  shareWhatsApp: {
    en: 'Share on WhatsApp',
    hi: 'व्हाट्सएप पर भेजें'
  },

  // Admin Portal
  adminPortalTitle: {
    en: 'Committee Organizer Administration',
    hi: 'समिति व्यवस्थापक कक्ष'
  },
  pendingQueue: {
    en: 'Pending Verifications',
    hi: 'सत्यापन हेतु लंबित'
  },
  recordOfflineCash: {
    en: 'Record Cash / Offline Payment',
    hi: 'नकद सहयोग दर्ज करें'
  },
  membersDirectory: {
    en: 'All Registered Members',
    hi: 'सभी पंजीकृत सदस्य'
  },
  addNewMember: {
    en: 'Add New Member',
    hi: 'नया सदस्य जोड़ें'
  },
  settingsBackup: {
    en: 'Settings & Clean Slate',
    hi: 'सेटिंग्स एवं बैकअप'
  },
  approve: {
    en: 'Approve & Verify',
    hi: 'स्वीकृत करें'
  },
  reject: {
    en: 'Reject',
    hi: 'अस्वीकार करें'
  },
  coreMemberBadge: {
    en: 'Core Member (₹1k/mo)',
    hi: 'कोर सदस्य (₹1,000/माह)'
  },
  publicContributorBadge: {
    en: 'Public Contributor',
    hi: 'सार्वजनिक सहयोगी'
  },
  adminBadge: {
    en: 'Admin / President',
    hi: 'व्यवस्थापक / अध्यक्ष'
  },
  logout: {
    en: 'Log Out',
    hi: 'लॉग आउट'
  },
  languageToggle: {
    en: 'हिन्दी',
    hi: 'English'
  }
};

export const MONTHS_LOCALE = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  hi: [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ]
};

export const MONTHS_SHORT_LOCALE = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिसं']
};
