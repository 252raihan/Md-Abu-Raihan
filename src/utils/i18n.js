import { STATUS } from './constants'

// Sentinel for keys that have no translation (e.g. `t(undefined)` in a badge
// that was rendered before its data resolved). Returning the key name itself
// would leak "undefined" onto the screen.
const NO_TRANSLATION = '__missing__'

/**
 * Translation system.
 *
 * A single flat dictionary keyed by language. `t(key, params)` performs
 * `{placeholder}` interpolation, so counts and document names can be injected
 * without string concatenation in components.
 */

const en = {
  // ---- App shell -------------------------------------------------------
  appName: 'TenderPack',
  appTagline: 'Tender Document Package Builder',
  appSubtitle: 'Assemble, verify and order your tender submission — 100% in your browser.',
  languageLabel: 'Language',
  langEnglish: 'English',
  langBangla: 'বাংলা',
  reset: 'Reset',
  resetConfirmTitle: 'Start over?',
  resetConfirmBody: 'Loaded requirements and uploaded files will be cleared from this page.',
  cancel: 'Cancel',
  confirm: 'Confirm',
  close: 'Close',

  // ---- Privacy strip ---------------------------------------------------
  privacyTitle: 'Your documents never leave this computer',
  privacyBody:
    'All parsing, checking and merging happens locally in your browser. Nothing is uploaded to any server.',

  // ---- Requirement loader ---------------------------------------------
  loadTitle: 'Load Tender Requirements',
  loadDescription:
    'Select the requirements.json file issued for this tender. It defines every document that must be included in the package.',
  loadDropTitle: 'Drag & drop requirements.json here',
  loadDropHint: 'The file is read locally in your browser - nothing is uploaded.',
  loadButton: 'Select requirements.json',
  loadFailed: 'This file could not be used',
  loading: 'Reading file...',
  hideFormat: 'Hide expected format',
  showFormat: 'Show expected format',
  privacyNote: 'Validated locally with the Web FileReader API',
  selectJson: 'Select requirements.json',
  chooseFile: 'Choose file',
  changeFile: 'Change file',
  dropJsonHint: 'Drag & drop requirements.json here',
  orBrowse: 'or',
  browse: 'browse',
  replaceJson: 'Replace requirements.json',
  jsonLoaded: 'requirements.json loaded',
  invalidFile: 'This file is not valid',
  tenderId: 'Tender ID',
  tenderTitle: 'Tender Title',
  tenderProcuringEntity: 'Procuring Entity',
  bidder: 'Bidder',
  submissionDeadline: 'Submission Deadline',
  deadlineNotSpecified: 'Not specified',
  deadlineUnparseable: 'Unrecognised date format',
  daysRemaining: '{days} days remaining',
  deadlineToday: 'Deadline is today',
  deadlinePassed: '{days} days past the deadline',
  requirementsLoaded: '{count} requirements loaded',
  sortedByOrder: 'Sorted by submission order',
  andMoreErrors: '…and {count} more issue(s).',
  formatHint: 'Expected format: a JSON object with a "tender" object and a "requirements" array.',
  readingFile: 'Reading file…',

  // ---- Section headings -------------------------------------------------
  tenderInformation: 'Tender Information',
  tenderInfoTitle: 'Tender Information',
  tenderInfoDescription: 'Details declared in the loaded requirements file.',
  procuringEntity: 'Procuring Entity',
  requirementsTitle: 'Required Documents',
  requirementsDescription:
    'Every document the package must contain, listed in submission order.',
  requirementsEmptyTitle: 'No requirements loaded yet',
  requirementsEmptyHint: 'Load a requirements.json file to see the document checklist.',
  requirementsEmptyBody:
    'Use the Load Tender Requirements panel above to select the file issued for this tender.',
  totalLabel: 'Total',
  blockingNotice:
    'Some mandatory documents are still unresolved. These must be fixed before the package can be generated.',
  noBlockingNotice: 'All mandatory documents are resolved.',
  uploadTitle: 'Upload PDF Files',
  uploadDropTitle: 'Drag & drop PDF files here',
  uploadButton: 'Browse Files',
  uploadRules: 'PDF only · up to {maxFiles} files · up to {maxSize} each',
  uploadEmptyState: 'No PDF files added yet.',
  uploadNextStepNote:
    'Documents are hashed locally to spot duplicates. Matching each file to a requirement arrives in the next build.',
  pagesPending: 'Pages pending',
  pagesCount: '{count} pages',
  duplicateLabel: 'Duplicate',
  uniqueLabel: 'Unique',
  summaryTitle: 'Package Summary',
  summaryBlockingCount: '{count} blocking issue(s) remain',
  summaryAllClear: 'All mandatory documents are resolved.',
  statusLabel_OK: 'OK',
  statusLabel_MISSING: 'Missing',
  statusLabel_EXPIRY_NEEDED: 'Expiry date needed',
  statusLabel_EXPIRED: 'Expired',
  statusLabel_NOT_PROVIDED: 'Not provided',
  uploadPdfs: 'Upload PDF Files',
  packageSummary: 'Package Summary',

  // ---- Requirements table ----------------------------------------------
  colOrder: 'Order',
  colDocument: 'Document',
  colRequirement: 'Requirement',
  colExpiry: 'Expiry',
  colStatus: 'Status',
  colActions: 'Actions',
  noRequirements: 'No requirements found in the file.',
  documentCount: '{count} document(s)',
  expiryRequired: 'Expiry required',
  expiryNotRequired: 'Expiry not required',
  searchPlaceholder: 'Search documents…',
  filterByStatus: 'Filter by status',
  filterAll: 'All statuses',
  noSearchResults: 'No documents match your search.',

  // ---- Status labels ----------------------------------------------------
  statusOK: 'OK',
  statusMissing: 'Missing',
  statusExpiryNeeded: 'Expiry date needed',
  statusExpired: 'Expired',
  statusNotProvided: 'Not provided',
  statusShortOK: 'OK',
  statusShortMissing: 'Missing',
  statusShortExpiryNeeded: 'Expiry needed',
  statusShortExpired: 'Expired',
  statusShortNotProvided: 'Not provided',

  // ---- Requirement type -------------------------------------------------
  mandatory: 'Mandatory',
  optional: 'Optional',
  yes: 'Yes',
  no: 'No',

  // ---- Summary ----------------------------------------------------------
  summaryTotal: 'Total documents',
  summaryMandatory: 'Mandatory',
  summaryOptional: 'Optional',
  summaryReady: 'Ready',
  summaryBlocking: 'Blocking issues',
  summaryBlockingHint: 'Mandatory documents that are not yet satisfied.',
  allClear: 'All mandatory documents are resolved. The package is ready to generate.',

  // ---- Upload -----------------------------------------------------------
  uploadDescription:
    'Add every supporting PDF. Files are read locally and matched to the requirements above.',
  dragDropPdfs: 'Drag & drop PDF files here',
  browseFiles: 'Browse Files',
  uploadLimits: 'PDF only · maximum {maxFiles} files · maximum {maxSizePerFile} per file',
  filesUploaded: 'Files added',
  fileName: 'File',
  filePages: 'Pages',
  fileHash: 'SHA-256',
  fileStatus: 'Status',
  duplicate: 'Duplicate',
  unique: 'Unique',
  remove: 'Remove',
  clearAll: 'Clear all',
  emptyUpload: 'No PDF files added yet.',
  matchedTo: 'Matched to {id}',
  unmatched: 'Not matched',
  duplicateFile: 'Identical file already added',

  // ---- Generate ---------------------------------------------------------
  generatePackage: 'Generate Package',
  generateHint: 'Resolve all blocking issues before generating the package.',
  generating: 'Generating…',
  generateBlocked: '{count} blocking issue(s) remain.',
  generateReady: 'Ready to generate {count} document(s).',

  // ---- Misc -------------------------------------------------------------
  buildLabel: 'Build 1 · Foundation',
  localBadge: 'Local only',
  errorTitle: 'Could not load requirements.json',

  // ---- Page shell -------------------------------------------------------
  pageHeading: 'Tender Document Package Builder',
  pageSubtitle:
    'Load the tender requirements, add the supporting PDFs and build one correctly ordered submission package. Everything runs offline in this browser tab.',
  footerNote:
    'TenderPack runs entirely in your browser. No document is uploaded, transmitted or stored on any server.',

  // ---- Generate panel ---------------------------------------------------
  generateTitle: 'Generate Package',
  generateAction: 'Generate Package',
  generateHint: 'Resolve all blocking issues before generating the package.',
  generateBlockedCount: '{count} mandatory document(s) still need attention.',
  generateReadyNote: 'All {documents} mandatory document(s) are ready across {files} file(s).',
}

const bn = {
  // ---- App shell -------------------------------------------------------
  appName: 'টেন্ডারপ্যাক',
  appTagline: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
  appSubtitle: 'টেন্ডার জমা সাজান, যাচাই করুন ও সঠিক ক্রমে সাজান — সম্পূর্ণ আপনার ব্রাউজারেই।',
  languageLabel: 'ভাষা',
  langEnglish: 'English',
  langBangla: 'বাংলা',
  reset: 'রিসেট',
  resetConfirmTitle: 'নতুন করে শুরু করবেন?',
  resetConfirmBody: 'লোড করা তথ্য এবং আপলোড করা ফাইল এই পাতার মেমোরি থেকে মুছে যাবে।',
  cancel: 'বাতিল',
  confirm: 'নিশ্চিত করুন',
  close: 'বন্ধ করুন',

  // ---- Privacy strip ---------------------------------------------------
  privacyTitle: 'আপনার ডকুমেন্ট কখনো এই কম্পিউটার ছেড়ে যায় না',
  privacyBody:
    'সব পড়া, যাচাই ও একত্রীকরণ আপনার ব্রাউজারেই ঘটে। কোনো সার্ভারে কিছু আপলোড হয় না।',

  // ---- Requirement loader ---------------------------------------------
  loadTitle: 'প্রয়োজনীয় টেন্ডার তথ্য লোড করুন',
  loadDescription:
    'এই টেন্ডারের জন্য দেওয়া requirements.json ফাইলটি নির্বাচন করুন। এতে প্যাকেজে যা যা থাকতে হবে সব নির্ধারিত থাকে।',
  loadDropTitle: 'requirements.json ফাইল এখানে ড্র্যাগ করুন',
  loadDropHint: 'ফাইলটি আপনার ব্রাউজারেই পড়া হয় - কোথাও আপলোড হয় না।',
  loadButton: 'requirements.json নির্বাচন করুন',
  loadFailed: 'এই ফাইলটি ব্যবহার করা যায়নি',
  loading: 'ফাইল পড়া হচ্ছে...',
  hideFormat: 'প্রত্যাশিত ফরম্যাট লুকান',
  showFormat: 'প্রত্যাশিত ফরম্যাট দেখুন',
  privacyNote: 'ব্রাউজারের FileReader API দিয়ে লোকালভাবেই যাচাই করা হয়',
  selectJson: 'requirements.json নির্বাচন করুন',
  chooseFile: 'ফাইল নির্বাচন',
  changeFile: 'ফাইল পরিবর্তন',
  dropJsonHint: 'requirements.json ফাইল এখানে ড্র্যাগ করুন',
  orBrowse: 'অথবা',
  browse: 'ব্রাউজ করুন',
  replaceJson: 'requirements.json পরিবর্তন করুন',
  jsonLoaded: 'requirements.json লোড হয়েছে',
  invalidFile: 'এই ফাইলটি সঠিক নয়',
  tenderId: 'টেন্ডার আইডি',
  tenderTitle: 'টেন্ডারের শিরোনাম',
  tenderProcuringEntity: 'ক্রয়কারী প্রতিষ্ঠান',
  bidder: 'দরদাতা',
  submissionDeadline: 'জমা দেওয়ার শেষ তারিখ',
  deadlineNotSpecified: 'উল্লেখ করা হয়নি',
  deadlineUnparseable: 'তারিখের ফরম্যাট বোঝা যায়নি',
  daysRemaining: '{days} দিন বাকি',
  deadlineToday: 'আজই শেষ তারিখ',
  deadlinePassed: 'শেষ তারিখের {days} দিন পরে',
  requirementsLoaded: '{count}টি প্রয়োজনীয়তা লোড হয়েছে',
  sortedByOrder: 'জমার ক্রম অনুযায়ী সাজানো',
  andMoreErrors: '…আরও {count}টি সমস্যা।',
  formatHint: 'প্রত্যাশিত ফরম্যাট: "tender" অবজেক্ট ও "requirements" অ্যারে সম্বলিত একটি JSON।',
  readingFile: 'ফাইল পড়া হচ্ছে…',

  // ---- Section headings -------------------------------------------------
  tenderInformation: 'টেন্ডারের তথ্য',
  tenderInfoTitle: 'টেন্ডারের তথ্য',
  tenderInfoDescription: 'লোড করা প্রয়োজনীয়তা ফাইলে ঘোষিত তথ্য।',
  procuringEntity: 'ক্রয়কারী প্রতিষ্ঠান',
  requirementsTitle: 'প্রয়োজনীয় ডকুমেন্ট',
  requirementsDescription:
    'প্যাকেজে যে সব ডকুমেন্ট থাকতে হবে, জমার ক্রম অনুযায়ী সাজানো।',
  requirementsEmptyTitle: 'এখনো কোনো প্রয়োজনীয়তা লোড হয়নি',
  requirementsEmptyHint: 'ডকুমেন্টের তালিকা দেখতে একটি requirements.json ফাইল লোড করুন।',
  requirementsEmptyBody:
    'উপরের “প্রয়োজনীয় টেন্ডার তথ্য লোড করুন” অংশ থেকে এই টেন্ডারের ফাইলটি নির্বাচন করুন।',
  totalLabel: 'মোট',
  blockingNotice:
    'কিছু বাধ্যতামূলক ডকুমেন্ট এখনো অসম্পূর্ণ। প্যাকেজ তৈরির আগে এগুলো সমাধান করতে হবে।',
  noBlockingNotice: 'সব বাধ্যতামূলক ডকুমেন্ট সম্পন্ন হয়েছে।',
  uploadTitle: 'PDF ফাইল আপলোড করুন',
  uploadDropTitle: 'PDF ফাইল এখানে ড্র্যাগ করুন',
  uploadButton: 'ফাইল ব্রাউজ করুন',
  uploadRules: 'শুধু PDF · সর্বোচ্চ {maxFiles}টি ফাইল · প্রতিটি সর্বোচ্চ {maxSize}',
  uploadEmptyState: 'এখনো কোনো PDF ফাইল যোগ করা হয়নি।',
  uploadNextStepNote:
    'নকল শনাক্ত করতে ফাইলগুলো লোকালভাবেই হ্যাশ করা হয়। প্রতিটি ফাইল প্রয়োজনীয়তার সাথে মেলানো পরের ধাপে আসবে।',
  pagesPending: 'পৃষ্ঠা গণনা pending',
  pagesCount: '{count} পৃষ্ঠা',
  duplicateLabel: 'নকল',
  uniqueLabel: 'অনন্য',
  summaryTitle: 'প্যাকেজের সারসংক্ষেপ',
  summaryBlockingCount: 'আরও {count}টি অবরোধকারী সমস্যা বাকি',
  summaryAllClear: 'সব বাধ্যতামূলক ডকুমেন্ট সম্পন্ন হয়েছে।',
  statusLabel_OK: 'ঠিক আছে',
  statusLabel_MISSING: 'অনুপস্থিত',
  statusLabel_EXPIRY_NEEDED: 'মেয়াদ শেষ হওয়ার তারিখ প্রয়োজন',
  statusLabel_EXPIRED: 'মেয়াদ শেষ',
  statusLabel_NOT_PROVIDED: 'দেওয়া হয়নি',
  uploadPdfs: 'PDF ফাইল আপলোড করুন',
  packageSummary: 'প্যাকেজের সারসংক্ষেপ',

  // ---- Requirements table ----------------------------------------------
  colOrder: 'ক্রম',
  colDocument: 'ডকুমেন্ট',
  colRequirement: 'প্রয়োজনীয়তা',
  colExpiry: 'মেয়াদ',
  colStatus: 'অবস্থা',
  colActions: 'কার্যক্রম',
  noRequirements: 'ফাইলে কোনো প্রয়োজনীয়তা পাওয়া যায়নি।',
  documentCount: '{count}টি ডকুমেন্ট',
  expiryRequired: 'মেয়াদ প্রয়োজন',
  expiryNotRequired: 'মেয়াদ প্রয়োজন নেই',
  searchPlaceholder: 'ডকুমেন্ট খুনুন…',
  filterByStatus: 'অবস্থা অনুযায়ী ফিল্টার',
  filterAll: 'সব অবস্থা',
  noSearchResults: 'আপনার খোঁজের সাথে কোনো ডকুমেন্ট মিলছে না।',

  // ---- Status labels ----------------------------------------------------
  statusOK: 'ঠিক আছে',
  statusMissing: 'অনুপস্থিত',
  statusExpiryNeeded: 'মেয়াদ শেষ হওয়ার তারিখ প্রয়োজন',
  statusExpired: 'মেয়াদ শেষ',
  statusNotProvided: 'দেওয়া হয়নি',
  statusShortOK: 'ঠিক আছে',
  statusShortMissing: 'অনুপস্থিত',
  statusShortExpiryNeeded: 'মেয়াদ প্রয়োজন',
  statusShortExpired: 'মেয়াদ শেষ',
  statusShortNotProvided: 'দেওয়া হয়নি',

  // ---- Requirement type -------------------------------------------------
  mandatory: 'বাধ্যতামূলক',
  optional: 'ঐচ্ছিক',
  yes: 'হ্যাঁ',
  no: 'না',

  // ---- Summary ----------------------------------------------------------
  summaryTotal: 'মোট ডকুমেন্ট',
  summaryMandatory: 'বাধ্যতামূলক',
  summaryOptional: 'ঐচ্ছিক',
  summaryReady: 'প্রস্তুত',
  summaryBlocking: 'অবরোধকারী সমস্যা',
  summaryBlockingHint: 'যেসব বাধ্যতামূলক ডকুমেন্ট এখনো মেলানো হয়নি।',
  allClear: 'সব বাধ্যতামূলক ডকুমেন্ট সম্পন্ন। প্যাকেজ তৈরি করা যেতে পারে।',

  // ---- Upload -----------------------------------------------------------
  uploadDescription:
    'প্রতিটি সহায়ক PDF যোগ করুন। ফাইলগুলো আপনার কম্পিউটারেই পড়া হয় এবং উপরের প্রয়োজনীয়তার সাথে মেলানো হয়।',
  dragDropPdfs: 'PDF ফাইল এখানে ড্র্যাগ করুন',
  browseFiles: 'ফাইল ব্রাউজ করুন',
  uploadLimits: 'শুধু PDF · সর্বোচ্চ {maxFiles}টি ফাইল · প্রতি ফাইল সর্বোচ্চ {maxSizePerFile}',
  filesUploaded: 'ফাইল যোগ হয়েছে',
  fileName: 'ফাইল',
  filePages: 'পৃষ্ঠা',
  fileHash: 'SHA-256',
  fileStatus: 'অবস্থা',
  duplicate: 'নকল',
  unique: 'অনন্য',
  remove: 'মুছুন',
  clearAll: 'সব মুছুন',
  emptyUpload: 'এখনো কোনো PDF ফাইল যোগ করা হয়নি।',
  matchedTo: '{id} এর সাথে মিলেছে',
  unmatched: 'মেলানো হয়নি',
  duplicateFile: 'একই ফাইল আগেই যোগ করা হয়েছে',

  // ---- Generate ---------------------------------------------------------
  generatePackage: 'প্যাকেজ তৈরি করুন',
  generateHint: 'প্যাকেজ তৈরি করার আগে সব অবরোধকারী সমস্যা সমাধান করুন।',
  generating: 'তৈরি হচ্ছে…',
  generateBlocked: 'আরও {count}টি অবরোধকারী সমস্যা বাকি।',
  generateReady: '{count}টি ডকুমেন্ট তৈরি করার জন্য প্রস্তুত।',

  // ---- Misc -------------------------------------------------------------
  buildLabel: 'বিল্ড ১ · ভিত্তি',
  localBadge: 'শুধু লোকাল',
  errorTitle: 'requirements.json লোড করা যায়নি',

  // ---- Page shell -------------------------------------------------------
  pageHeading: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
  pageSubtitle:
    'টেন্ডারের প্রয়োজনীয়তা লোড করুন, সহায়ক PDF যোগ করুন এবং সঠিক ক্রমে একটি জমার প্যাকেজ তৈরি করুন। সবকিছু এই ব্রাউজার ট্যাবেই চলে।',
  footerNote:
    'টেন্ডারপ্যাক সম্পূর্ণ আপনার ব্রাউজারে চলে। কোনো ডকুমেন্ট কোনো সার্ভারে আপলোড, প্রেরণ یا সংরক্ষণ করা হয় না।',

  // ---- Generate panel ---------------------------------------------------
  generateTitle: 'প্যাকেজ তৈরি করুন',
  generateAction: 'প্যাকেজ তৈরি করুন',
  generateHint: 'প্যাকেজ তৈরি করার আগে সব অবরোধকারী সমস্যা সমাধান করুন।',
  generateBlockedCount: 'আরও {count}টি বাধ্যতামূলক ডকুমেন্টে নজর দেওয়া প্রয়োজন।',
  generateReadyNote: 'সব {documents}টি বাধ্যতামূলক ডকুমেন্ট {files}টি ফাইলে প্রস্তুত।',
}

const DICTIONARIES = { en, bn }

/** Human readable, translated label for a package status. */
export const STATUS_LABEL_KEY = {
  [STATUS.OK]: 'statusOK',
  [STATUS.MISSING]: 'statusMissing',
  [STATUS.EXPIRY_NEEDED]: 'statusExpiryNeeded',
  [STATUS.EXPIRED]: 'statusExpired',
  [STATUS.NOT_PROVIDED]: 'statusNotProvided',
}

/** Compact variant for badges in dense rows. */
export const STATUS_SHORT_LABEL_KEY = {
  [STATUS.OK]: 'statusShortOK',
  [STATUS.MISSING]: 'statusShortMissing',
  [STATUS.EXPIRY_NEEDED]: 'statusShortExpiryNeeded',
  [STATUS.EXPIRED]: 'statusShortExpired',
  [STATUS.NOT_PROVIDED]: 'statusShortNotProvided',
}

/**
 * Translation errors raised by the validator are yielded as machine keys +
 * params, and rendered here. Keeping them out of the dictionary avoids
 * duplicating dynamic values inside strings.
 */
export const VALIDATION_MESSAGES = {
  FILE_READ: {
    en: 'The file could not be read. Please try selecting it again.',
    bn: 'ফাইলটি পড়া যায়নি। অনুগ্রহ করে আবার নির্বাচন করুন।',
  },
  INVALID_JSON: {
    en: 'The file is not valid JSON. Check for a missing comma or bracket.',
    bn: 'ফাইলটি সঠিক JSON নয়। কোনো কমা বা বন্ধনী বাদ পড়েছে কিনা দেখুন।',
  },
  ROOT_NOT_OBJECT: {
    en: 'The JSON root must be an object containing "tender" and "requirements".',
    bn: 'JSON এর মূল অংশটি একটি অবজেক্ট হতে হবে যাতে "tender" ও "requirements" থাকবে।',
  },
  MISSING_TENDER: {
    en: 'The required "tender" object is missing.',
    bn: 'প্রয়োজনীয় "tender" অবজেক্টটি নেই।',
  },
  TENDER_NOT_OBJECT: {
    en: '"tender" must be an object.',
    bn: '"tender" একটি অবজেক্ট হতে হবে।',
  },
  MISSING_TENDER_FIELD: {
    en: 'Tender field "{field}" is missing or empty.',
    bn: 'টেন্ডারের "{field}" ঘরটি নেই অথবা খালি।',
  },
  INVALID_DEADLINE: {
    en: '"submission_deadline" is not a recognised date (use YYYY-MM-DD).',
    bn: '"submission_deadline" তারিখ হিসেবে বোঝা যাচ্ছে না (YYYY-MM-DD ব্যবহার করুন)।',
  },
  MISSING_REQUIREMENTS: {
    en: 'The required "requirements" array is missing.',
    bn: 'প্রয়োজনীয় "requirements" অ্যারে নেই।',
  },
  REQUIREMENTS_NOT_ARRAY: {
    en: '"requirements" must be an array.',
    bn: '"requirements" একটি অ্যারে হতে হবে।',
  },
  EMPTY_REQUIREMENTS: {
    en: 'The "requirements" array is empty. There is nothing to package.',
    bn: '"requirements" অ্যারে খালি। প্যাকেজ করার মতো কিছু নেই।',
  },
  REQUIREMENT_NOT_OBJECT: {
    en: 'Requirement at position {index} must be an object.',
    bn: '{index} নম্বর প্রয়োজনীয়তাটি একটি অবজেক্ট হতে হবে।',
  },
  REQUIREMENT_MISSING_FIELD: {
    en: 'Requirement "{id}" is missing the field "{field}".',
    bn: '"{id}" প্রয়োজনীয়তায় "{field}" ঘরটি নেই।',
  },
  REQUIREMENT_INVALID_FIELD: {
    en: 'Requirement "{id}" has an invalid value for "{field}" ({expected}).',
    bn: '"{id}" প্রয়োজনীয়তায় "{field}" এর মান সঠিক নয় ({expected})।',
  },
  DUPLICATE_REQUIREMENT_ID: {
    en: 'Duplicate requirement id "{id}". Every requirement must have a unique id.',
    bn: 'একই "{id}" আইডি দুইবার আছে। প্রতিটি প্রয়োজনীয়তার আইডি অনন্য হতে হবে।',
  },
  DUPLICATE_REQUIREMENT_ORDER: {
    en: 'Duplicate order value {order}. Each requirement needs a distinct order.',
    bn: 'একই ক্রম সংখ্যা {order} দুইবার আছে। প্রতিটি প্রয়োজনীয়তার ক্রম আলাদা হতে হবে।',
  },
}

/**
 * Resolves a loader error definition into a translated, interpolated string.
 */
export const translateValidationError = (error, language = 'en') => {
  if (!error) return ''
  const entry = VALIDATION_MESSAGES[error.code]
  const template = entry ? entry[language] ?? entry.en : error.fallback ?? error.code
  return interpolate(template, error.params)
}

/** Replaces `{name}` tokens with values from `params`. Missing values stay literal. */
export const interpolate = (template, params) => {
  if (!template) return ''
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    params[key] === undefined || params[key] === null ? match : String(params[key]),
  )
}

/**
 * Creates a translator bound to a language.
 *
 * Returns `t(key, params)`; unknown keys fall back to English, then to the key.
 * Missing keys resolve to an empty string rather than the literal "undefined",
 * so a nullable status can never print raw debug text into the UI.
 */
export const createTranslator = (language) => {
  const dictionary = DICTIONARIES[language] ?? DICTIONARIES.en
  return (key, params) => {
    if (key === undefined || key === null || key === NO_TRANSLATION) return ''
    const template = dictionary[key] ?? DICTIONARIES.en[key] ?? key
    return interpolate(template, params)
  }
}

/** Picks the correct document title for the active language. */
export const getDocumentTitle = (requirement, language) => {
  if (!requirement) return ''
  const preferred = language === 'bn' ? requirement.title_bn : requirement.title_en
  // Never show an empty cell: fall back to the other language if one is blank.
  return preferred || requirement.title_en || requirement.title_bn || requirement.id
}

export const TRANSLATIONS = DICTIONARIES
