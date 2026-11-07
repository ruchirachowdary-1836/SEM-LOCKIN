// Day-wise study plan from 7 to 23 November 2026, the default timetable,
// and the special routines for preparation and examination days.

import type { SubjectId } from "./syllabus";

export type Priority = "high" | "medium" | "low";
export type BlockKind = "study" | "revision" | "prep";

export interface PlanBlock {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string;
  subject: SubjectId | null;
  units: string[]; // unit ids, e.g. ["dl-1"]
  title: string;
  concepts: string[];
  priority: Priority;
  kind: BlockKind;
  custom?: boolean;
}

export type RowType = "routine" | "meal" | "break" | "study" | "sleep" | "exam";

export interface TimetableRow {
  id: string;
  start: string;
  end: string;
  label: string;
  type: RowType;
}

export const DEFAULT_TIMETABLE: TimetableRow[] = [
  { id: "t1", start: "06:30", end: "07:00", label: "Wake up and freshen up", type: "routine" },
  { id: "t2", start: "07:00", end: "08:00", label: "Breakfast", type: "meal" },
  { id: "t3", start: "08:00", end: "10:30", label: "Study Session 1", type: "study" },
  { id: "t4", start: "10:30", end: "10:45", label: "Short break", type: "break" },
  { id: "t5", start: "10:45", end: "13:00", label: "Study Session 2", type: "study" },
  { id: "t6", start: "13:00", end: "14:00", label: "Lunch", type: "meal" },
  { id: "t7", start: "14:00", end: "17:00", label: "Study Session 3", type: "study" },
  { id: "t8", start: "17:00", end: "17:30", label: "Tea break", type: "meal" },
  { id: "t9", start: "17:30", end: "20:00", label: "Study Session 4", type: "study" },
  { id: "t10", start: "20:00", end: "21:00", label: "Dinner", type: "meal" },
  { id: "t11", start: "21:00", end: "23:00", label: "Study Session 5", type: "study" },
  { id: "t12", start: "23:00", end: "06:30", label: "Sleep", type: "sleep" },
];

export const PLAN_START = "2026-11-07";
export const PLAN_END = "2026-11-23";

let seq = 0;
function b(
  date: string,
  start: string,
  end: string,
  subject: SubjectId | null,
  units: string[],
  title: string,
  concepts: string[],
  priority: Priority = "high",
  kind: BlockKind = "study",
): PlanBlock {
  seq += 1;
  return { id: `b${String(seq).padStart(3, "0")}-${date.slice(5)}-${start.replace(":", "")}`, date, start, end, subject, units, title, concepts, priority, kind };
}

const D = (d: number) => `2026-11-${String(d).padStart(2, "0")}`;

export const DEFAULT_PLAN: PlanBlock[] = [
  // ── 7 Nov · Saturday — preparation
  b(D(7), "20:00", "21:30", null, [], "Gather and organise study materials", [
    "Gather Professional Practice Units I–III notes",
    "Gather Electronic Sensors Units I–III notes",
    "Organise PPTs and textbooks",
    "Prepare study materials for tomorrow",
  ], "medium", "prep"),

  // ── 8 Nov · Sunday — Professional Practice + Electronic Sensors
  b(D(8), "08:00", "10:30", "pp", ["pp-1"], "Unit I — Professional Practice and Ethics", [
    "Definition of ethics", "Professional ethics", "Engineering ethics and personal ethics", "Code of ethics",
    "Professionalism and responsibility", "Conflict of interest", "Gift vs bribery", "Negligence",
    "Whistleblowing and protected disclosures", "GST stakeholders",
  ]),
  b(D(8), "10:45", "13:00", "pp", ["pp-2"], "Unit II — Law of Contract", [
    "Essential elements of valid contract", "Offer and acceptance", "Consideration", "Capacity and free consent",
    "Legality of object", "Unlawful agreements", "Contingent contracts",
  ]),
  b(D(8), "14:00", "17:00", "es", ["es-1"], "Unit I — Sensors and Transducers", [
    "Principles and classification of sensors", "Parameters and characteristics", "Environmental parameters",
    "Resistive potentiometer", "Strain gauges", "Inductive sensors", "Capacitive sensors",
  ]),
  b(D(8), "17:30", "20:00", "es", ["es-2"], "Unit II — Thermal Sensors", [
    "Gas thermometric sensors", "Thermal expansion sensors", "Acoustic temperature sensors",
    "Resistance change sensors", "Thermo-emf sensors", "Semiconductor sensors",
  ]),
  b(D(8), "21:00", "23:00", "pp", ["pp-3"], "Unit III — Arbitration, Conciliation and ADR", [
    "Arbitration meaning, scope and types", "Arbitration Acts 1940 vs 1996", "UNCITRAL Model Law",
    "Arbitration agreement", "Arbitration tribunal", "Conciliation, mediation and negotiation",
    "Lok Adalats and Dispute Resolution Boards",
  ]),

  // ── 9 Nov · Monday — Deep Learning
  b(D(9), "08:00", "10:30", "dl", ["dl-1"], "Unit I — Machine learning basics", [
    "Machine learning basics", "Learning algorithms", "Capacity", "Overfitting and underfitting",
    "Hyperparameters and validation sets", "Estimators", "Bias and variance",
  ]),
  b(D(9), "10:45", "13:00", "dl", ["dl-1"], "Unit I — Estimation and optimisation", [
    "Maximum likelihood estimation", "Bayesian statistics", "Stochastic gradient descent",
    "Building ML algorithms", "Challenges motivating deep learning",
  ]),
  b(D(9), "14:00", "17:00", "dl", ["dl-1"], "Unit I — Deep feed-forward networks", [
    "Learning XOR", "Gradient-based learning", "Hidden units", "Architecture design", "Backpropagation",
    "Differentiation algorithms",
  ]),
  b(D(9), "17:30", "20:00", "dl", ["dl-2"], "Unit II — Regularization (part 1)", [
    "Parameter norm penalties", "Constrained optimization", "Dataset augmentation", "Noise robustness",
    "Semi-supervised learning", "Multitask learning", "Early stopping", "Parameter sharing",
  ]),
  b(D(9), "21:00", "23:00", "dl", ["dl-2"], "Unit II — Regularization (part 2)", [
    "Sparse representations", "Bagging and ensemble methods", "Dropout", "Adversarial training",
    "Tangent distance", "Tangent Prop", "Manifold Tangent Classifier", "Optimization challenges",
  ]),

  // ── 10 Nov · Tuesday — Deep Learning
  b(D(10), "08:00", "10:30", "dl", ["dl-3"], "Unit III — Convolution basics", [
    "Convolution operation", "Motivation", "Pooling", "Convolution as a prior", "Variants of convolution",
  ]),
  b(D(10), "10:45", "13:00", "dl", ["dl-3"], "Unit III — Advanced convolution", [
    "Structured outputs", "Data types", "Efficient convolution algorithms", "Random or unsupervised features",
  ]),
  b(D(10), "14:00", "17:00", "dl", ["dl-4"], "Unit IV — Recurrent networks", [
    "Unfolding computational graphs", "Recurrent neural networks", "Bidirectional RNN",
    "Encoder-decoder architectures", "Deep recurrent networks", "Recursive neural networks",
  ]),
  b(D(10), "17:30", "20:00", "dl", ["dl-4"], "Unit IV — Long-term dependencies", [
    "Long-term dependencies", "Echo State Networks", "Leaky units", "LSTM and gated RNNs",
    "Optimization for long-term dependencies", "Explicit memory",
  ]),
  b(D(10), "21:00", "22:00", "dl", ["dl-5"], "Unit V — Practical methodology and applications", [
    "Performance metrics", "Hyperparameter selection", "Debugging strategies", "Computer vision",
    "Speech recognition", "NLP", "Multi-digit number recognition",
  ]),
  b(D(10), "22:00", "23:00", "dl", ["dl-1", "dl-2", "dl-3", "dl-4", "dl-5"], "Full Deep Learning revision", [
    "Full Deep Learning revision", "Important diagrams and equations", "Recall all five units",
  ], "high", "revision"),

  // ── 11 Nov · Wednesday — DL exam, then Professional Practice
  b(D(11), "14:00", "16:30", "pp", ["pp-4"], "Unit IV — Negotiable Instruments Act", [
    "Promissory notes", "Bills of exchange", "Cheques", "Parties to negotiable instruments", "Endorsements",
    "Holder and holder in due course", "Dishonour and discharge",
  ]),
  b(D(11), "17:30", "20:00", "pp", ["pp-5"], "Unit V — Intellectual Property and Company Law", [
    "Copyright", "Patents", "Trademarks", "Designs", "Internet piracy", "Infringement", "Company formation", "Directors",
  ]),
  b(D(11), "21:00", "23:00", "pp", ["pp-4", "pp-5"], "Units IV and V revision", [
    "Negotiable instruments: definitions and differences", "Endorsement types; holder vs holder in due course",
    "IPR: copyright, patents, trademarks, designs", "Company formation and directors",
  ], "high", "revision"),

  // ── 12 Nov · Thursday — Professional Practice full revision
  b(D(12), "08:00", "10:30", "pp", ["pp-1"], "Revision — Unit I Professional Practice and Ethics", [
    "Ethics definitions and code of ethics", "Conflict of interest, gift vs bribery", "Negligence and whistleblowing", "GST stakeholders",
  ], "high", "revision"),
  b(D(12), "10:45", "13:00", "pp", ["pp-2"], "Revision — Unit II Law of Contract", [
    "Essentials of a valid contract", "Offer, acceptance and consideration", "Capacity, free consent, legality", "Unlawful and contingent contracts",
  ], "high", "revision"),
  b(D(12), "14:00", "17:00", "pp", ["pp-3"], "Revision — Unit III Arbitration and ADR", [
    "Types of arbitration; 1940 vs 1996 Acts", "UNCITRAL Model Law", "Agreement and tribunal", "Conciliation, mediation, negotiation, Lok Adalats, DRBs",
  ], "high", "revision"),
  b(D(12), "17:30", "20:00", "pp", ["pp-4"], "Revision — Unit IV Negotiable Instruments", [
    "Promissory note vs bill vs cheque", "Parties and endorsements", "Holder in due course", "Dishonour and discharge",
  ], "high", "revision"),
  b(D(12), "21:00", "23:00", "pp", ["pp-1", "pp-2", "pp-3", "pp-4", "pp-5"], "Revision — Unit V and complete syllabus recall", [
    "IPR and company law", "Recall all five units", "Write key definitions from memory",
  ], "high", "revision"),

  // ── 13 Nov · Friday — PPLE exam, then NIC
  b(D(13), "14:00", "17:00", "nic", ["nic-1"], "NIC Unit I — Evolutionary Computing", [
    "From nature to natural computing", "Hill climbing and simulated annealing", "Evolutionary biology basics",
    "Standard evolutionary algorithm", "Genetic algorithm operators",
  ]),
  b(D(13), "17:30", "20:00", "nic", ["nic-2"], "NIC Unit II — Neuro Computing", [
    "Biological vs artificial neuron", "McCulloch–Pitts model", "Learning rules: Hebbian, perceptron, delta",
    "Multi-layer perceptron and back-propagation",
  ]),
  b(D(13), "21:00", "23:00", "nic", ["nic-3"], "NIC Unit III — Swarm Intelligence", [
    "Collective behaviour and stigmergy", "Ant Colony Optimization", "Particle Swarm Optimization",
  ]),

  // ── 14 Nov · Saturday — NIC
  b(D(14), "08:00", "10:30", "nic", ["nic-1"], "NIC Unit I — Evolutionary Computing in depth", [
    "Representation and fitness functions", "Selection: roulette wheel, tournament, rank", "Crossover and mutation operators",
    "Evolution strategies and evolutionary programming",
  ]),
  b(D(14), "10:45", "13:00", "nic", ["nic-1"], "Evolutionary algorithms and applications", [
    "Genetic programming", "Worked GA example step by step", "Applications of evolutionary algorithms",
  ]),
  b(D(14), "14:00", "17:00", "nic", ["nic-2"], "NIC Unit II — Neural Networks", [
    "Network architectures", "Single-layer perceptron and limitations", "Back-propagation algorithm",
    "Kohonen self-organising maps", "Hopfield networks",
  ]),
  b(D(14), "17:30", "20:00", "nic", ["nic-3"], "NIC Unit III — Swarm Intelligence", [
    "Double-bridge ant experiment", "ACO for TSP", "Ant clustering", "PSO velocity and position update",
    "Swarm robotics and social adaptation of knowledge",
  ]),
  b(D(14), "21:00", "23:00", "nic", ["nic-1", "nic-2", "nic-3"], "Units I–III diagrams and algorithms", [
    "GA flowchart and crossover diagrams", "MLP and SOM diagrams", "ACO and PSO algorithms in pseudo-code",
  ], "high", "revision"),

  // ── 15 Nov · Sunday — NIC
  b(D(15), "08:00", "10:30", "nic", ["nic-4"], "NIC Unit IV — Immune Computing", [
    "Natural immune system: innate and adaptive", "Artificial immune systems", "Representation and affinity measures",
    "Bone-marrow models", "Immune network models",
  ]),
  b(D(15), "10:45", "13:00", "nic", ["nic-4"], "Negative selection and clonal selection", [
    "Negative selection algorithm", "Clonal selection algorithm (CLONALG)", "Applications of AIS",
  ]),
  b(D(15), "14:00", "17:00", "nic", ["nic-5"], "NIC Unit V — Bioinformatics", [
    "Central dogma", "Global and local sequence alignment", "BLAST and FASTA", "Phylogenetic trees", "DNA computing",
  ]),
  b(D(15), "17:30", "20:00", "nic", ["nic-1", "nic-2", "nic-3"], "Revise Units I–III", [
    "Evolutionary computing", "Neuro computing", "Swarm intelligence",
  ], "high", "revision"),
  b(D(15), "21:00", "23:00", "nic", ["nic-4", "nic-5"], "Revise Units IV–V", [
    "Immune computing algorithms", "Bioinformatics alignment and DNA computing",
  ], "high", "revision"),

  // ── 16 Nov · Monday — NIC exam, then Cloud
  b(D(16), "14:00", "16:30", "cc", ["cc-1"], "Cloud Unit I — Computing Paradigms and Fundamentals", [
    "High-performance, parallel, distributed computing", "Cluster and grid computing", "Bio, mobile, quantum, optical, nano computing",
    "Cloud definitions and five essential characteristics",
  ]),
  b(D(16), "16:30", "17:00", "cc", ["cc-1"], "Unit I recall", [
    "Recall paradigms comparison", "Recall essential characteristics",
  ], "medium", "revision"),
  b(D(16), "17:30", "20:00", "cc", ["cc-2"], "Cloud Unit II — Deployment and Service Models", [
    "Private, public, community and hybrid cloud", "IaaS, PaaS, SaaS", "Other service models", "Cloud architecture layers",
  ]),
  b(D(16), "21:00", "23:00", "cc", ["cc-3"], "Cloud Unit III — Virtualization basics", [
    "Virtualization concept, VM and VMM", "Full, para and hardware-assisted virtualization", "Type 1 vs Type 2 hypervisors",
  ]),

  // ── 17 Nov · Tuesday — Cloud
  b(D(17), "08:00", "10:30", "cc", ["cc-3"], "Cloud Unit III — Virtualization", [
    "CPU, memory and I/O virtualization", "Live migration", "Benefits and drawbacks of virtualization",
  ]),
  b(D(17), "10:45", "13:00", "cc", ["cc-3"], "MapReduce, Cloud Haskell and software development", [
    "MapReduce model and word-count example", "Hadoop overview", "Cloud Haskell", "Software development in the cloud",
  ]),
  b(D(17), "14:00", "17:00", "cc", ["cc-4"], "Cloud Unit IV — Data center networking", [
    "Data center requirements", "Three-tier and fat-tree topologies", "VL2, BCube and DCell",
  ]),
  b(D(17), "17:30", "20:00", "cc", ["cc-4"], "Transport layer and cloud service providers", [
    "TCP incast and DCTCP", "AWS, Azure, Google Cloud", "IBM and Salesforce",
  ]),
  b(D(17), "21:00", "23:00", "cc", ["cc-5"], "Cloud Unit V — Security and advanced concepts", [
    "CIA triad and cloud threats", "Data security and IAM", "Virtualization security and SLAs", "Fog/edge, serverless, containers",
  ]),

  // ── 18 Nov · Wednesday — Cloud exam, then Sensors
  b(D(18), "14:00", "16:30", "es", ["es-4"], "Electronic Sensors Unit IV — Radiation Sensors", [
    "Basic characteristics of radiation", "Photosensors and photodetectors", "X-ray and nuclear radiation sensors",
    "Fibre-optic sensors", "Electroanalytic sensors",
  ]),
  b(D(18), "16:30", "17:00", "es", ["es-4"], "Recall", ["Recall photosensor types", "Recall electrochemical cell"], "medium", "revision"),
  b(D(18), "17:30", "20:00", "es", ["es-5"], "Electronic Sensors Unit V — Smart Sensors", [
    "Smart sensor architecture", "Excitation, amplification, filters, converters", "Compensation and data communication",
    "Interface standards", "Automotive, home, aerospace, medical and environmental applications",
  ]),
  b(D(18), "21:00", "23:00", "es", ["es-4", "es-5"], "Units IV and V revision", [
    "Radiation sensors diagrams", "Smart sensor block diagram", "Application examples",
  ], "high", "revision"),

  // ── 19 Nov · Thursday — Sensors
  b(D(19), "08:00", "10:30", "es", ["es-1"], "Sensors Unit I — Sensors and Transducers", [
    "Classification and characteristics", "Resistive potentiometer", "Strain gauges and gauge factor",
  ], "high", "revision"),
  b(D(19), "10:45", "13:00", "es", ["es-1"], "Electromechanical sensors", [
    "Inductive sensors and LVDT", "Capacitive sensors", "Quartz resonator force sensors", "Ultrasonic sensors",
  ]),
  b(D(19), "14:00", "17:00", "es", ["es-2"], "Unit II — Thermal sensors", [
    "RTD and thermistor", "Thermocouples and laws", "Semiconductor junction sensors", "Thermal radiation and heat-flux sensors",
  ], "high", "revision"),
  b(D(19), "17:30", "20:00", "es", ["es-3"], "Unit III — Magnetic sensors", [
    "Magnetoresistive sensors", "Hall effect sensors", "Eddy-current sensors", "Synchros and resolvers",
    "Electromagnetic flowmeter and SQUID",
  ]),
  b(D(19), "21:00", "23:00", "es", ["es-4", "es-5"], "Units IV and V revision", [
    "Radiation sensors", "Smart sensors and applications",
  ], "high", "revision"),

  // ── 20 Nov · Friday — Sensors exam, then Semantic Web
  b(D(20), "14:00", "16:30", "sw", ["sw-1"], "Semantic Web Unit I — Introduction", [
    "What is the Semantic Web", "Limitations of today's web", "Smart-data continuum", "Semantic Web stack", "Business case",
  ]),
  b(D(20), "16:30", "17:00", "sw", ["sw-1"], "Recall", ["Recall the layer cake", "Recall the business case"], "medium", "revision"),
  b(D(20), "17:30", "20:00", "sw", ["sw-2"], "Semantic Web Unit II — Web Services", [
    "SOAP, WSDL, UDDI", "ebXML", "Orchestration", "Web-service security", "Semantic web services",
  ]),
  b(D(20), "21:00", "23:00", "sw", ["sw-3"], "Unit III — RDF and XML introduction", [
    "RDF triples, URIs, literals, blank nodes", "RDF/XML syntax", "XML and XML Schema basics",
  ]),

  // ── 21 Nov · Saturday — Semantic Web
  b(D(21), "08:00", "10:30", "sw", ["sw-3"], "Semantic Web Unit III — RDF", [
    "RDF data model in depth", "RDF Schema", "Capturing knowledge with RDF",
  ]),
  b(D(21), "10:45", "13:00", "sw", ["sw-3"], "XPath, XSL and XSLT", ["XPath expressions", "XSL", "XSLT transformations"]),
  b(D(21), "14:00", "17:00", "sw", ["sw-3"], "XQuery, XLink, XPointer and XInclude", ["XQuery", "XLink", "XPointer", "XInclude"]),
  b(D(21), "17:30", "20:00", "sw", ["sw-3"], "XMLBase, XHTML, XForms and SVG", ["XMLBase", "XHTML", "XForms", "SVG"]),
  b(D(21), "21:00", "23:00", "sw", ["sw-4"], "Unit IV — Taxonomies and Ontologies", ["Taxonomies", "Thesauri", "Ontologies: definition and role"]),

  // ── 22 Nov · Sunday — Semantic Web
  b(D(22), "08:00", "10:30", "sw", ["sw-4"], "Unit IV — Ontology spectrum and topic maps", ["Ontology spectrum", "Topic maps"]),
  b(D(22), "10:45", "13:00", "sw", ["sw-4"], "Ontology syntax, structure, semantics and knowledge representation", [
    "Ontology syntax", "Structure", "Semantics", "Knowledge representation and OWL",
  ]),
  b(D(22), "14:00", "17:00", "sw", ["sw-5"], "Unit V — Applications and search technology", [
    "Semantic Web applications", "Search engines and PageRank", "Semantic search and web search agents",
    "Latent semantic indexing", "TAP and Swoogle",
  ]),
  b(D(22), "17:30", "20:00", "sw", ["sw-1", "sw-2", "sw-3"], "Units I, II and III revision", [
    "Semantic Web vision", "Web services", "RDF and the XML family",
  ], "high", "revision"),
  b(D(22), "21:00", "23:00", "sw", ["sw-4", "sw-5"], "Units IV and V revision", ["Taxonomies and ontologies", "Applications and search"], "high", "revision"),

  // ── 23 Nov · Monday — Semantic Web exam at 2 PM
  b(D(23), "08:00", "10:30", "sw", ["sw-1", "sw-2"], "Units I and II recall", ["Semantic Web stack", "Web services standards"], "high", "revision"),
  b(D(23), "10:45", "12:00", "sw", ["sw-3", "sw-4", "sw-5"], "Units III, IV and V key concepts", [
    "RDF and XML family", "Ontology spectrum and topic maps", "Semantic search",
  ], "high", "revision"),
  b(D(23), "13:00", "14:00", "sw", ["sw-1", "sw-2", "sw-3", "sw-4", "sw-5"], "Exam preparation", [
    "Final glance at diagrams", "Hall ticket and stationery check", "Calm breathing before the exam",
  ], "medium", "revision"),
];

// Non-study rows for days that do not follow the normal timetable.
// Study blocks and exams are merged in at runtime.
export const SPECIAL_DAYS: Record<string, TimetableRow[]> = {
  [D(7)]: [
    { id: "s7a", start: "21:30", end: "22:30", label: "Wind down — sleep early", type: "routine" },
    { id: "s7b", start: "22:30", end: "06:30", label: "Sleep", type: "sleep" },
  ],
};

function examMorning(date: string): TimetableRow[] {
  return [
    { id: `${date}-x1`, start: "06:30", end: "07:00", label: "Wake up and freshen up", type: "routine" },
    { id: `${date}-x2`, start: "07:00", end: "08:00", label: "Breakfast", type: "meal" },
    { id: `${date}-x3`, start: "08:00", end: "09:30", label: "Get ready, hall ticket and travel", type: "routine" },
    { id: `${date}-x4`, start: "09:30", end: "10:00", label: "Settle in at the exam hall", type: "routine" },
    { id: `${date}-x5`, start: "13:00", end: "14:00", label: "Lunch", type: "meal" },
    { id: `${date}-x7`, start: "20:00", end: "21:00", label: "Dinner", type: "meal" },
    { id: `${date}-x8`, start: "23:00", end: "06:30", label: "Sleep", type: "sleep" },
  ];
}

for (const d of [11, 13, 16, 18, 20]) {
  const date = D(d);
  const rows = examMorning(date);
  // Tea break fills the gap between the afternoon and evening blocks.
  rows.push(
    d === 11
      ? { id: `${date}-x6`, start: "16:30", end: "17:30", label: "Tea break", type: "meal" }
      : { id: `${date}-x6`, start: "17:00", end: "17:30", label: "Tea break", type: "meal" },
  );
  SPECIAL_DAYS[date] = rows;
}

SPECIAL_DAYS[D(23)] = [
  { id: "s23a", start: "06:30", end: "07:00", label: "Wake up and freshen up", type: "routine" },
  { id: "s23b", start: "07:00", end: "08:00", label: "Breakfast", type: "meal" },
  { id: "s23c", start: "10:30", end: "10:45", label: "Short break", type: "break" },
  { id: "s23d", start: "12:00", end: "13:00", label: "Lunch", type: "meal" },
  { id: "s23e", start: "17:00", end: "20:00", label: "Semester complete — rest and reset", type: "routine" },
  { id: "s23f", start: "20:00", end: "21:00", label: "Dinner", type: "meal" },
  { id: "s23g", start: "23:00", end: "06:30", label: "Sleep", type: "sleep" },
];

export const QUOTES: { text: string; by: string }[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", by: "Will Durant" },
  { text: "It always seems impossible until it's done.", by: "Nelson Mandela" },
  { text: "Discipline is choosing between what you want now and what you want most.", by: "Abraham Lincoln (attributed)" },
  { text: "The secret of getting ahead is getting started.", by: "Mark Twain (attributed)" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", by: "Robert Collier" },
  { text: "Concentrate all your thoughts upon the work at hand.", by: "Alexander Graham Bell" },
  { text: "Arise, awake, and stop not till the goal is reached.", by: "Swami Vivekananda" },
  { text: "Dream is not that which you see while sleeping, it is something that does not let you sleep.", by: "A. P. J. Abdul Kalam" },
  { text: "You don't have to see the whole staircase, just take the first step.", by: "Martin Luther King Jr." },
  { text: "Quality is not an act, it is a habit.", by: "Aristotle (paraphrased)" },
  { text: "Focus on being productive instead of busy.", by: "Tim Ferriss" },
  { text: "The expert in anything was once a beginner.", by: "Helen Hayes" },
  { text: "Small daily improvements are the key to staggering long-term results.", by: "Robin Sharma" },
  { text: "Do the hard work, especially when you don't feel like it.", by: "Seth Godin" },
  { text: "Learning never exhausts the mind.", by: "Leonardo da Vinci" },
  { text: "There are no shortcuts to any place worth going.", by: "Beverly Sills" },
  { text: "Push yourself, because no one else is going to do it for you.", by: "Unknown" },
];
