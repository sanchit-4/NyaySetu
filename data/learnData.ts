
import React from 'react';
import { LearningModule, Lesson, QuizQuestion } from '../types';
import { 
    BookOpenIcon, QuizIcon, UserGroupIcon, ShieldCheckIcon, ScaleIcon, GlobeAltIcon,
    ChatBubbleLeftRightIcon, BuildingLibraryIcon, BriefcaseIcon, HandRaisedIcon 
} from '../components/icons';
import { BanknotesIcon } from '../components/icons/BanknotesIcon'; 

// --- Helper Types for Structured Content ---
type ParagraphItem = { type: 'paragraph'; content: string };
type HeadingItem = { type: 'heading'; level: 2 | 3; content: string };
type ListItem = { type: 'list'; ordered: boolean; items: string[] };
export type StructuredContentItem = ParagraphItem | HeadingItem | ListItem;


// --- Helper Functions for Content Creation (Simplified for easier potential translation) ---
const createParagraph = (text: string): ParagraphItem => ({ type: 'paragraph', content: text });
const createHeading = (level: 2 | 3, text: string): HeadingItem => ({ type: 'heading', level, content: text });
const createList = (items: string[], ordered: boolean = false): ListItem => ({ type: 'list', ordered, items });

// Function to render structured content to JSX (used by LessonDisplay)
export const renderStructuredContent = (content: StructuredContentItem | StructuredContentItem[] | string | React.ReactNode): React.ReactNode => {
  if (React.isValidElement(content)) return content; // Already JSX
  if (typeof content === 'string') return React.createElement('p', {className: "mb-3 leading-relaxed"}, content); // Simple string

  if (Array.isArray(content)) {
    // Explicitly type item and index, and ensure key is a unique string
    return content.map((item: StructuredContentItem, index: number) =>
      React.createElement(React.Fragment, { key: `sc-item-${index}` }, renderStructuredContent(item))
    );
  }
  if (typeof content === 'object' && content !== null && 'type' in content) {
    const item = content as StructuredContentItem; // Type assertion
    switch (item.type) {
      case 'paragraph':
        return React.createElement('p', { className: "mb-3 leading-relaxed" }, item.content);
      case 'heading':
        const Tag = `h${item.level}` as keyof JSX.IntrinsicElements;
        const className = item.level === 2 ? "text-xl font-semibold text-primary-dark mt-4 mb-2" : "text-lg font-medium text-darktext mt-3 mb-1";
        return React.createElement(Tag, { className }, item.content);
      case 'list':
        const ListTag = item.ordered ? 'ol' : 'ul';
        return React.createElement(ListTag, { className: `list-inside space-y-1.5 pl-5 mb-3 ${item.ordered ? 'list-decimal' : 'list-disc'}` }, 
          item.items.map((text: string, idx: number) => React.createElement('li', { key: `li-${idx}` }, text))
        );
      default:
        // Optional: handle cases where 'type' might not be one of the expected values if the type system isn't strict enough
        // console.warn('Unknown structured content type:', (item as any).type);
        return null; 
    }
  }
  return null;
};

// Wrapper for lessons to use the renderer
const createLessonContent = (structuredContent: StructuredContentItem[]): React.ReactNode => {
  return renderStructuredContent(structuredContent);
};


// --- Content Definitions ---

// Foundations of Indian Law (existing, slightly adapted to new structure if needed)
const introContent = createLessonContent([
  createParagraph("India boasts a rich and complex legal tapestry, woven from diverse threads including ancient religious laws (like Hindu and Islamic personal laws), customary practices, English common law (a significant colonial legacy), and principles of civil law. The modern Indian legal system, however, is predominantly anchored in the English common law tradition, a direct consequence of nearly two centuries of British colonial administration."),
  createParagraph("This common law foundation means that judicial precedents (decisions of higher courts) play a crucial role in interpreting laws and guiding future judgments. The Constitution of India, adopted in 1950, stands as the paramount law, and all other legislations must conform to its provisions."),
  createHeading(2, "Key Features of the Indian Legal System:"),
  createList([
    "Written Constitution: The Constitution of India is a comprehensive document that lays down the framework for governance, fundamental rights, directive principles, and the powers and duties of various state organs. It is the supreme (grundnorm) of the land.",
    "Federal Structure with Unitary Bias: India has a federal system, with legislative and executive powers divided between the Union (Central) government and State governments. However, the Constitution also exhibits a strong unitary bias, with the Union government having overriding powers in certain circumstances (e.g., during emergencies).",
    "Independent Judiciary: The Constitution establishes an independent judiciary to interpret laws, settle disputes, and act as a guardian of the Constitution and fundamental rights. The judiciary is hierarchical, with the Supreme Court at its apex.",
    "Parliamentary System of Government: India follows a parliamentary model (both at the Union and State levels) where the executive is drawn from and responsible to the legislature.",
    "Rule of Law: The principle of 'Rule of Law' is a cornerstone, implying that no one is above the law, and all are subject to the ordinary laws of the land administered through ordinary courts.",
    "Secularism: India is a secular state, meaning the state does not have its own religion and treats all religions equally."
  ])
]);
// ... (adapt other existing content similarly: fundamentalRightsContent, courtsStructureContent, etc.)
const fundamentalRightsContent = createLessonContent([
    createParagraph("Part III (Articles 12 to 35) of the Indian Constitution enshrines Fundamental Rights..."),
    createHeading(2, "Major Categories of Fundamental Rights:"),
    createList([
        "Right to Equality (Articles 14-18): This includes equality before the law...",
        "Right to Freedom (Articles 19-22): Article 19 guarantees six freedoms...",
        // ... more rights
    ]),
]);
const courtsStructureContent = createLessonContent([
    createParagraph("The Indian judicial system is a unified and hierarchical structure..."),
    createHeading(2, "Hierarchy of Courts:"),
    createList([
        "Supreme Court of India: Located in New Delhi, it is the highest court...",
        "High Courts: Each state generally has a High Court...",
        // ... more court types
    ]),
]);
const pilContent = createLessonContent([
    createParagraph("Public Interest Litigation (PIL) is a significant innovation..."),
    createHeading(2, "Evolution and Purpose:"),
    createParagraph("PIL emerged in the late 1970s..."),
    createHeading(2, "Key Aspects of PIL:"),
    createList([
        "Relaxation of Locus Standi: The traditional rule that only a person whose own rights are violated can sue is relaxed.",
        "Epistolary Jurisdiction: Courts have even treated letters or postcards from aggrieved persons as writ petitions.",
        // ... more aspects
    ]),
]);
const ipcIntroContent = createLessonContent([
    createParagraph("The Indian Penal Code (IPC), 1860, is the principal criminal code of India..."),
    // ... more details
]);
const firContent = createLessonContent([
    createParagraph("A First Information Report (FIR) is a written document prepared by the police..."),
    // ... more details
]);
const bailContent = createLessonContent([createParagraph('Bail, in law, means procurement of release from prison of a person awaiting trial or an appeal, by the deposit of security to ensure his submission at the required time to legal authority. This lesson explains different types of bail and the conditions for granting it.')]);
const consumerIntroContent = createLessonContent([
    createParagraph("The Consumer Protection Act, 2019 (which replaced the Act of 1986) is a landmark legislation..."),
    // ... more details
]);
const consumerDisputeRedressalContent = createLessonContent([
    createParagraph("The Consumer Protection Act, 2019 establishes a three-tier quasi-judicial machinery..."),
    // ... more details
]);

// --- NEW MODULES CONTENT ---

// 1. Family Law
const marriageLawsContent = createLessonContent([
  createHeading(2, "Marriage Laws in India"),
  createParagraph("Marriage in India is governed by a complex web of personal laws based on religion, as well as secular laws. The primary objective is to provide a legal framework for marital relationships, rights, and obligations."),
  createHeading(3, "Key Legislations:"),
  createList([
    "Hindu Marriage Act, 1955: Applies to Hindus, Buddhists, Jains, and Sikhs. It codifies the law relating to marriage and divorce among these communities. It lays down conditions for a valid Hindu marriage, ceremonies, registration, restitution of conjugal rights, judicial separation, and divorce.",
    "Special Marriage Act, 1954: A secular law that allows for civil marriages irrespective of religion. It also provides for registration of marriages performed under other personal laws.",
    "Indian Christian Marriage Act, 1872: Governs marriages among Christians.",
    "Muslim Personal Law (Shariat) Application Act, 1937: While not a marriage act per se, it makes Sharia law applicable to Muslims in family matters, including marriage (Nikah), divorce (Talaq), and dower (Mahr).",
    "Parsi Marriage and Divorce Act, 1936: Applies to Parsis."
  ]),
  createHeading(3, "Common Conditions for a Valid Marriage (varies by Act):"),
  createList([
    "Monogamy (bigamy is an offense under most laws).",
    "Minimum age (generally 21 for males, 18 for females).",
    "Soundness of mind (parties should be capable of giving valid consent).",
    "Parties should not be within prohibited degrees of relationship (e.g., close blood relatives)."
  ])
]);
const divorceLawsContent = createLessonContent([
  createHeading(2, "Divorce and Separation"),
  createParagraph("Divorce laws in India also vary based on personal laws. The grounds for divorce typically include cruelty, adultery, desertion, conversion to another religion, unsoundness of mind, virulent and incurable forms of leprosy, venereal disease in a communicable form, and presumption of death."),
  createHeading(3, "Key Concepts:"),
  createList([
    "Mutual Consent Divorce: Most personal laws and the Special Marriage Act allow for divorce by mutual consent, where both parties agree to dissolve the marriage. This usually requires a period of separation (e.g., one year) before filing the petition and a 'cooling-off' period before the final decree.",
    "Contested Divorce: Where one party seeks divorce on specific grounds, and the other party may oppose it.",
    "Judicial Separation: A legal process where the parties live separately but the marriage is not dissolved. It can be a step before divorce or an alternative.",
    "Restitution of Conjugal Rights: A remedy available if one spouse has withdrawn from the society of the other without reasonable excuse."
  ]),
  createHeading(3, "Maintenance and Alimony:"),
  createParagraph("Provisions for maintenance (financial support) for a spouse (usually the wife) and children exist under various laws, including Section 125 of the Code of Criminal Procedure (CrPC), which is a secular provision, and personal laws. Alimony can be interim (during proceedings) or permanent.")
]);

// 2. Property Law
const propertyTypesContent = createLessonContent([
    createHeading(2, "Types of Property"),
    createParagraph("Property law deals with the rights and interests people have in things that can be owned. In India, property is broadly classified into movable and immovable property."),
    createList([
        "Immovable Property: Generally includes land, buildings, benefits arising out of land (like a right to collect rent), and things attached to the earth or permanently fastened to anything attached to the earth. Examples: Houses, agricultural land, shops.",
        "Movable Property: Includes all other kinds of property that are not immovable. Examples: Vehicles, jewelry, furniture, money, books."
    ]),
    createHeading(3, "Other Classifications:"),
    createList([
      "Tangible Property: Property that has a physical existence (e.g., a car, a house).",
      "Intangible Property: Property that does not have a physical form but represents value (e.g., intellectual property like copyrights, patents; shares in a company)."
    ])
]);
const transferOfPropertyContent = createLessonContent([
    createHeading(2, "Transfer of Property Act, 1882"),
    createParagraph("The Transfer of Property Act (TPA), 1882, is the primary legislation governing the transfer of immovable property in India between living persons (inter vivos). It does not apply to transfers by operation of law (e.g., inheritance, insolvency) or testamentary succession (wills)."),
    createHeading(3, "Key Modes of Transfer under TPA:"),
    createList([
        "Sale: Transfer of ownership in exchange for a price. A sale of immovable property of value ₹100 or more must be made by a registered instrument.",
        "Mortgage: Transfer of an interest in specific immovable property for the purpose of securing the payment of money advanced or to be advanced by way of loan.",
        "Lease: Transfer of a right to enjoy such property, made for a certain time, in consideration of a price paid or promised (rent).",
        "Exchange: When two persons mutually transfer the ownership of one thing for the ownership of another.",
        "Gift: Transfer of certain existing movable or immovable property made voluntarily and without consideration. A gift of immovable property must be effected by a registered instrument signed by or on behalf of the donor and attested by at least two witnesses."
    ])
]);

// 3. Right to Information (RTI)
const rtiIntroContent = createLessonContent([
  createHeading(2, "Introduction to RTI Act, 2005"),
  createParagraph("The Right to Information (RTI) Act, 2005 is a revolutionary legislation that empowers Indian citizens to access information under the control of public authorities. Its objective is to promote transparency and accountability in the working of every public authority."),
  createHeading(3, "Key Provisions:"),
  createList([
    "Definition of 'Information': Includes records, documents, memos, e-mails, opinions, advices, press releases, circulars, orders, logbooks, contracts, reports, papers, samples, models, data material held in any electronic form.",
    "Definition of 'Public Authority': Includes bodies of self-government established under the Constitution, by any other law made by Parliament or State Legislature, and bodies owned, controlled or substantially financed by the government.",
    "Proactive Disclosure: Public authorities are required to suo motu disclose certain information (e.g., particulars of its organization, functions, duties, directory of officers).",
    "Role of Public Information Officers (PIOs): Designated in all administrative units to provide information to citizens."
  ])
]);
const rtiFilingProcessContent = createLessonContent([
  createHeading(2, "How to File an RTI Application"),
  createParagraph("Any citizen can request information by making a written application (or through electronic means) to the PIO of the concerned public authority. The application should specify the particulars of the information sought."),
  createList([
    "Fee: A nominal application fee is usually required (e.g., ₹10). No fee for persons below poverty line.",
    "Time Limit for Response: Generally, information must be provided within 30 days. If the information concerns the life or liberty of a person, it must be provided within 48 hours.",
    "Exemptions: Section 8 and 9 of the Act list certain categories of information that are exempt from disclosure (e.g., information affecting sovereignty and integrity of India, trade secrets, personal information with no public interest).",
    "Appeals: If information is denied or not provided within the time limit, an appeal can be filed with a First Appellate Authority within the public authority, and a second appeal can be filed with the Central or State Information Commission."
  ])
]);

// 4. Environmental Law
const envLawIntroContent = createLessonContent([
    createHeading(2, "Introduction to Environmental Law in India"),
    createParagraph("Environmental law in India encompasses a set of laws and regulations aimed at protecting the environment from pollution and degradation, and promoting sustainable development. The Constitution of India also casts a duty on the State and citizens to protect and improve the environment."),
    createHeading(3, "Constitutional Provisions:"),
    createList([
        "Article 21 (Right to Life): Interpreted by the Supreme Court to include the right to a healthy environment.",
        "Article 48A (Directive Principle): Directs the State to protect and improve the environment and safeguard forests and wildlife.",
        "Article 51A(g) (Fundamental Duty): Makes it a duty of every citizen to protect and improve the natural environment."
    ]),
    createHeading(3, "Key Environmental Legislations:"),
    createList([
        "The Water (Prevention and Control of Pollution) Act, 1974",
        "The Air (Prevention and Control of Pollution) Act, 1981",
        "The Environment (Protection) Act, 1986 (an umbrella act)",
        "The Wildlife Protection Act, 1972",
        "The Forest (Conservation) Act, 1980",
        "The National Green Tribunal Act, 2010 (establishes the NGT for effective and expeditious disposal of environmental cases)."
    ])
]);

// 5. Intellectual Property Rights (IPR)
const iprIntroContent = createLessonContent([
    createHeading(2, "Understanding Intellectual Property Rights"),
    createParagraph("Intellectual Property (IP) refers to creations of the mind, such as inventions; literary and artistic works; designs; and symbols, names, and images used in commerce. IPRs protect these creations, granting exclusive rights to creators or owners for a certain period."),
    createHeading(3, "Main Types of IPR in India:"),
    createList([
        "Copyrights: Protects original literary, dramatic, musical, and artistic works, cinematograph films, and sound recordings. (Copyright Act, 1957)",
        "Patents: Granted for new, useful, and non-obvious inventions. Provides exclusive right to make, use, sell the invention. (Patents Act, 1970)",
        "Trademarks: Protects words, symbols, logos, or a combination thereof used to identify goods or services of one party from those of others. (Trade Marks Act, 1999)",
        "Designs: Protects the ornamental or aesthetic aspects of an article. (Designs Act, 2000)",
        "Geographical Indications (GIs): Protects goods originating in a specific geographical area, where a given quality, reputation or other characteristic is essentially attributable to its geographical origin (e.g., Darjeeling Tea). (Geographical Indications of Goods (Registration and Protection) Act, 1999)"
    ])
]);


// --- Learning Modules Array ---
export const learningModules: LearningModule[] = [
  {
    id: 'foundations-indian-law',
    title: 'Foundations of Indian Law',
    description: 'Understand the basics of the Indian legal system, its history, key features, and the Constitution.',
    longDescription: 'This module provides a comprehensive introduction to the Indian legal system. You will learn about its historical evolution, the core principles enshrined in the Constitution, the structure of the government, fundamental rights, and the role of the judiciary. It sets the stage for understanding more specific areas of Indian law.',
    icon: ScaleIcon, 
    coverImage: 'https://images.unsplash.com/photo-1589994246430-5975303487f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kaWFuJTIwbGF3fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'l1-intro', title: 'Introduction to the Indian Legal System', content: introContent },
      { id: 'l1-fr', title: 'Fundamental Rights in the Indian Constitution', content: fundamentalRightsContent },
      { id: 'l1-courts', title: 'Structure of Courts in India', content: courtsStructureContent },
      { id: 'l1-pil', title: 'Public Interest Litigation (PIL)', content: pilContent },
    ],
    quiz: [ /* Existing quiz questions */
      { id: 'q1-1', questionText: 'What is the supreme law of India?', options: [{ id: 'o1', text: 'IPC' },{ id: 'o2', text: 'Constitution' }], correctOptionId: 'o2' },
      // ... more quiz questions for this module
    ],
  },
  {
    id: 'criminal-law-basics',
    title: 'Basics of Criminal Law',
    description: 'Learn about fundamental concepts in Indian criminal law, the IPC, FIR, and bail procedures.',
    longDescription: 'This module introduces essential concepts of criminal law in India. You will explore the definition of crime, different types of offenses under the Indian Penal Code (IPC), the criminal justice process starting with a First Information Report (FIR), and the concept of bail. Understanding these basics is crucial for navigating any interaction with the criminal justice system.',
    icon: ShieldCheckIcon, 
    coverImage: 'https://images.unsplash.com/photo-1508700929628-666d8434de0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y291cnRyb29tfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    lessons: [
       { id: 'l2-ipc', title: 'Introduction to Indian Penal Code (IPC)', content: ipcIntroContent },
       { id: 'l2-fir', title: 'First Information Report (FIR)', content: firContent },
       { id: 'l2-bail', title: 'Understanding Bail in India', content: bailContent },
    ],
    quiz: [ /* Existing quiz questions */
       { id: 'q2-1', questionText: 'What is IPC?', options: [{ id: 'o1', text: 'Code' },{ id: 'o2', text: 'Law' }], correctOptionId: 'o1' },
      // ... more quiz questions for this module
    ],
  },
  {
    id: 'consumer-protection-law',
    title: 'Consumer Protection Law',
    description: 'Understand your rights as a consumer and the mechanisms for grievance redressal in India.',
    longDescription: 'This module explains the Consumer Protection Act, 2019. Learn about who qualifies as a consumer, the fundamental rights granted to consumers, the structure of consumer dispute redressal commissions (District, State, and National), and key concepts like product liability and e-commerce regulations for consumer protection.',
    icon: UserGroupIcon, 
    coverImage: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y3VzdG9tZXIlMjBzZXJ2aWNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'l3-cpa-intro', title: 'Introduction to Consumer Protection Act, 2019', content: consumerIntroContent },
      { id: 'l3-cpa-redressal', title: 'Consumer Dispute Redressal Mechanism', content: consumerDisputeRedressalContent },
    ],
    quiz: [ /* Existing quiz questions */
       { id: 'q3-1', questionText: 'What is CPA?', options: [{ id: 'o1', text: 'Act' },{ id: 'o2', text: 'Rule' }], correctOptionId: 'o1' },
      // ... more quiz questions for this module
    ],
  },
  
  // --- NEW MODULES ---
  {
    id: 'family-law',
    title: 'Family Law in India',
    description: 'Explore laws related to marriage, divorce, maintenance, and adoption.',
    longDescription: 'Family law in India is a complex area governed by various personal laws based on religion, alongside secular legislation. This module covers key aspects such as marriage solemnization, conditions for validity, grounds for divorce, processes for judicial separation, maintenance rights for spouses and children, and adoption procedures.',
    icon: HandRaisedIcon, 
    coverImage: 'https://images.unsplash.com/photo-1542037104857-e806ac299595?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZmFtaWx5JTIwbGF3fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'fl-l1-marriage', title: 'Marriage Laws in India', content: marriageLawsContent },
      { id: 'fl-l2-divorce', title: 'Divorce, Separation, and Maintenance', content: divorceLawsContent },
      // Add more lessons: Adoption, Guardianship etc.
    ],
    quiz: [
      { id: 'fl-q1', questionText: 'The Special Marriage Act, 1954 is a:', options: [{id: 'o1', text: 'Religious law'}, {id: 'o2', text: 'Secular law'}], correctOptionId: 'o2', explanation: 'The Special Marriage Act allows for civil marriages irrespective of religion.' },
      { id: 'fl-q2', questionText: 'Which section of CrPC provides a secular provision for maintenance?', options: [{id: 'o1', text: 'Section 100'}, {id: 'o2', text: 'Section 125'}], correctOptionId: 'o2', explanation: 'Section 125 of CrPC is a secular provision for maintenance of wives, children, and parents.' },
    ]
  },
  {
    id: 'property-law',
    title: 'Property Law Essentials',
    description: 'Learn about types of property and the Transfer of Property Act.',
    longDescription: 'This module introduces the fundamental concepts of property law in India. It distinguishes between movable and immovable property and delves into the Transfer of Property Act, 1882, covering key modes of transfer like sale, mortgage, lease, gift, and exchange.',
    icon: BuildingLibraryIcon, 
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvcGVydHklMjBsYXd8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'pl-l1-types', title: 'Types of Property', content: propertyTypesContent },
      { id: 'pl-l2-tpa', title: 'Transfer of Property Act, 1882', content: transferOfPropertyContent },
    ],
    quiz: [
      { id: 'pl-q1', questionText: 'A house is an example of:', options: [{id: 'o1', text: 'Movable Property'}, {id: 'o2', text: 'Immovable Property'}], correctOptionId: 'o2' },
      { id: 'pl-q2', questionText: 'Transfer of ownership for a price is called:', options: [{id: 'o1', text: 'Lease'}, {id: 'o2', text: 'Sale'}], correctOptionId: 'o2' },
    ]
  },
  {
    id: 'rti-act',
    title: 'Right to Information (RTI) Act',
    description: 'Understand how to use the RTI Act to access information from public authorities.',
    longDescription: 'The Right to Information Act, 2005, is a powerful tool for citizens. This module explains what constitutes "information" and "public authority" under the Act, the process of filing an RTI application, time limits for responses, exemptions, and the appeal mechanism.',
    icon: BriefcaseIcon, 
    coverImage: 'https://images.unsplash.com/photo-1589829518337-29cf9a38997e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9sZGVyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'rti-l1-intro', title: 'Introduction to RTI Act, 2005', content: rtiIntroContent },
      { id: 'rti-l2-filing', title: 'How to File an RTI Application', content: rtiFilingProcessContent },
    ],
    quiz: [
      { id: 'rti-q1', questionText: 'What is the general time limit for a PIO to provide information under RTI?', options: [{id: 'o1', text: '15 days'}, {id: 'o2', text: '30 days'}], correctOptionId: 'o2' },
      { id: 'rti-q2', questionText: 'Can personal information be obtained under RTI?', options: [{id: 'o1', text: 'Yes, always'}, {id: 'o2', text: 'Generally no, unless public interest is involved'}], correctOptionId: 'o2' },
    ]
  },
  {
    id: 'environmental-law',
    title: 'Environmental Law Basics',
    description: 'Get an overview of key environmental laws and constitutional provisions in India.',
    longDescription: 'This module provides an introduction to environmental jurisprudence in India. It covers constitutional mandates for environmental protection, significant legislations like the Environment (Protection) Act, Water Act, Air Act, and the role of the National Green Tribunal (NGT).',
    icon: GlobeAltIcon,
    coverImage: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZW52aXJvbm1lbnRhbCUyMGxhd3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'env-l1-intro', title: 'Introduction to Environmental Law', content: envLawIntroContent },
      // Add more: NGT, Pollution Control Boards etc.
    ],
    quiz: [
      { id: 'env-q1', questionText: 'Which Article of the Constitution includes Right to a Healthy Environment?', options: [{id: 'o1', text: 'Article 14'}, {id: 'o2', text: 'Article 21'}], correctOptionId: 'o2' },
      { id: 'env-q2', questionText: 'The Environment (Protection) Act was enacted in:', options: [{id: 'o1', text: '1972'}, {id: 'o2', text: '1986'}], correctOptionId: 'o2' },
    ]
  },
  {
    id: 'ipr-law',
    title: 'Intellectual Property Rights (IPR)',
    description: 'Learn about Copyrights, Patents, Trademarks, and other forms of IPR in India.',
    longDescription: 'Intellectual Property Rights are crucial in the modern economy. This module introduces various types of IPR recognized in India, including copyrights for creative works, patents for inventions, trademarks for brand protection, designs for aesthetic features, and geographical indications for origin-specific products.',
    icon: BanknotesIcon, 
    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZWxsZWN0dWFsJTIwcHJvcGVydHl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    lessons: [
      { id: 'ipr-l1-intro', title: 'Understanding Intellectual Property Rights', content: iprIntroContent },
      // Add more: Registration processes, Infringement etc.
    ],
    quiz: [
      { id: 'ipr-q1', questionText: 'Which IPR protects literary and artistic works?', options: [{id: 'o1', text: 'Patent'}, {id: 'o2', text: 'Copyright'}], correctOptionId: 'o2' },
      { id: 'ipr-q2', questionText: 'A brand logo is typically protected as a:', options: [{id: 'o1', text: 'Design'}, {id: 'o2', text: 'Trademark'}], correctOptionId: 'o2' },
    ]
  },
  // Add more modules: ADR, Contract Law...
];

export const getModuleById = (moduleId: string): LearningModule | undefined => {
  return learningModules.find(module => module.id === moduleId);
};
