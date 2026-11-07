// Complete syllabus for all six subjects — 30 units.
// Each unit carries its key topics, diagrams to practise and 10-mark answer prompts
// so the Syllabus and Exam Mode pages work from the same source.

export type SubjectId = "dl" | "pp" | "nic" | "cc" | "es" | "sw";

export interface Unit {
  id: string; // e.g. "dl-1"
  subject: SubjectId;
  n: number;
  title: string;
  topics: string[];
  diagrams: string[];
  questions: string[];
}

export interface Exam {
  date: string; // YYYY-MM-DD (IST)
  start: string; // HH:MM 24h IST
  end: string;
  label: string; // human timing
}

export interface Subject {
  id: SubjectId;
  name: string;
  short: string;
  color: string; // identity dot / bar colour
  exam: Exam;
  units: Unit[];
}

type UnitSeed = Omit<Unit, "id" | "subject" | "n">;

function build(id: SubjectId, units: UnitSeed[]): Unit[] {
  return units.map((u, i) => ({ ...u, id: `${id}-${i + 1}`, subject: id, n: i + 1 }));
}

export const SUBJECTS: Subject[] = [
  {
    id: "dl",
    name: "Deep Learning",
    short: "DL",
    color: "#6E8A62",
    exam: { date: "2026-11-11", start: "10:00", end: "13:00", label: "10 AM – 1 PM" },
    units: build("dl", [
      {
        title: "Machine Learning and Deep Feed Forward Networks",
        topics: [
          "Learning algorithms, capacity, overfitting and underfitting",
          "Hyperparameters and validation sets",
          "Estimators, bias and variance",
          "Maximum likelihood estimation and Bayesian statistics",
          "Stochastic gradient descent",
          "Challenges motivating deep learning",
          "Learning XOR, gradient-based learning, hidden units",
          "Architecture design, back-propagation and differentiation algorithms",
        ],
        diagrams: [
          "Underfitting vs overfitting vs capacity curve",
          "Bias–variance trade-off graph",
          "XOR network with one hidden layer",
          "Computational graph for back-propagation",
        ],
        questions: [
          "Explain overfitting and underfitting with the capacity curve and how validation sets help.",
          "Derive the back-propagation algorithm for a feed-forward network.",
          "Explain bias and variance of estimators and the trade-off between them.",
          "Explain how a feed-forward network learns XOR, with architecture and activations.",
        ],
      },
      {
        title: "Regularization for Deep Learning",
        topics: [
          "Parameter norm penalties (L2, L1)",
          "Norm penalties as constrained optimization",
          "Dataset augmentation and noise robustness",
          "Semi-supervised and multitask learning",
          "Early stopping and parameter tying/sharing",
          "Sparse representations, bagging and ensembles",
          "Dropout and adversarial training",
          "Tangent distance, Tangent Prop, Manifold Tangent Classifier",
          "Challenges in neural network optimization",
        ],
        diagrams: [
          "L2 vs L1 constraint regions (circle vs diamond)",
          "Early stopping — training vs validation loss",
          "Dropout sub-network ensemble",
          "Multitask learning shared layers",
        ],
        questions: [
          "Explain L1 and L2 parameter norm penalties with their effect on weights.",
          "Describe dropout and explain why it acts as an ensemble method.",
          "Explain early stopping as a regularizer with a neat diagram.",
          "Discuss dataset augmentation, noise robustness and adversarial training.",
        ],
      },
      {
        title: "Convolution Networks",
        topics: [
          "The convolution operation",
          "Motivation: sparse interactions, parameter sharing, equivariance",
          "Pooling",
          "Convolution and pooling as an infinitely strong prior",
          "Variants of the basic convolution function (stride, padding, tiled, locally connected)",
          "Structured outputs and data types",
          "Efficient convolution algorithms",
          "Random or unsupervised features",
        ],
        diagrams: [
          "2-D convolution with kernel and feature map",
          "Max pooling over a region",
          "Typical CNN layer: convolution → detector → pooling",
          "Valid vs same vs full padding",
        ],
        questions: [
          "Explain the convolution operation and the three motivations behind CNNs.",
          "Explain pooling and why it gives invariance to small translations.",
          "Describe variants of the basic convolution function with diagrams.",
          "Explain efficient convolution algorithms and random/unsupervised features.",
        ],
      },
      {
        title: "Recurrent and Recursive Networks",
        topics: [
          "Unfolding computational graphs",
          "Recurrent neural networks and teacher forcing",
          "Bidirectional RNNs",
          "Encoder–decoder sequence-to-sequence architectures",
          "Deep recurrent networks and recursive neural networks",
          "The challenge of long-term dependencies",
          "Echo State Networks and leaky units",
          "LSTM and other gated RNNs (GRU)",
          "Optimization for long-term dependencies (gradient clipping)",
          "Explicit memory",
        ],
        diagrams: [
          "Unfolded RNN computational graph",
          "Bidirectional RNN",
          "Encoder–decoder architecture",
          "LSTM cell with forget, input and output gates",
        ],
        questions: [
          "Explain unfolding of computational graphs and the design patterns of RNNs.",
          "Draw and explain the LSTM cell and how it handles long-term dependencies.",
          "Explain the encoder–decoder sequence-to-sequence architecture.",
          "Discuss bidirectional RNNs and recursive neural networks.",
        ],
      },
      {
        title: "Practical Methodology and Applications",
        topics: [
          "Performance metrics (precision, recall, F-score, coverage)",
          "Default baseline models",
          "Deciding whether to gather more data",
          "Selecting hyperparameters (manual, grid, random search)",
          "Debugging strategies",
          "Example: multi-digit number recognition",
          "Applications: large-scale deep learning, computer vision, speech recognition, NLP",
        ],
        diagrams: [
          "Precision–recall curve",
          "Grid search vs random search",
          "Street View multi-digit recognition pipeline",
        ],
        questions: [
          "Explain the practical design process and performance metrics in deep learning.",
          "Compare manual, grid and random hyperparameter search.",
          "Describe debugging strategies for deep learning models.",
          "Explain applications of deep learning in computer vision, speech and NLP.",
        ],
      },
    ]),
  },
  {
    id: "pp",
    name: "Professional Practice, Law & Ethics",
    short: "PPLE",
    color: "#B57F76",
    exam: { date: "2026-11-13", start: "10:00", end: "13:00", label: "10 AM – 1 PM" },
    units: build("pp", [
      {
        title: "Professional Practice and Ethics",
        topics: [
          "Definition of ethics and professional ethics",
          "Engineering ethics vs personal ethics",
          "Code of ethics, professionalism and responsibility",
          "Conflict of interest; gift vs bribery",
          "Negligence",
          "Whistleblowing and protected disclosures",
          "GST and its stakeholders",
        ],
        diagrams: ["Stakeholders of GST flow chart", "Types of whistleblowing (internal/external)"],
        questions: [
          "Define professional ethics and explain the code of ethics for engineers.",
          "Explain conflict of interest and distinguish between a gift and a bribe.",
          "What is whistleblowing? Explain protected disclosures with examples.",
          "Explain GST and the roles of its stakeholders.",
        ],
      },
      {
        title: "Law of Contract",
        topics: [
          "Essential elements of a valid contract",
          "Offer and acceptance",
          "Consideration",
          "Capacity to contract and free consent",
          "Legality of object",
          "Unlawful and illegal agreements",
          "Contingent contracts",
        ],
        diagrams: ["Essentials of a valid contract chart", "Types of contracts classification"],
        questions: [
          "Explain the essential elements of a valid contract under the Indian Contract Act, 1872.",
          "Explain the rules regarding a valid offer and acceptance.",
          "What is consideration? Explain 'no consideration, no contract' and its exceptions.",
          "Explain free consent and the factors that vitiate it.",
        ],
      },
      {
        title: "Arbitration, Conciliation and ADR",
        topics: [
          "Arbitration — meaning, scope and types",
          "Arbitration Act 1940 vs Arbitration and Conciliation Act 1996",
          "UNCITRAL Model Law",
          "Arbitration agreement and arbitral tribunal",
          "Conciliation, mediation and negotiation",
          "Lok Adalats",
          "Dispute Resolution Boards",
        ],
        diagrams: ["ADR methods comparison table", "Arbitration procedure flow"],
        questions: [
          "Explain the types of arbitration and compare the 1940 and 1996 Acts.",
          "Explain the essentials of an arbitration agreement and constitution of the tribunal.",
          "Distinguish between conciliation, mediation and negotiation.",
          "Explain Lok Adalats and Dispute Resolution Boards.",
        ],
      },
      {
        title: "Negotiable Instruments Act",
        topics: [
          "Promissory notes",
          "Bills of exchange",
          "Cheques and crossing",
          "Parties to negotiable instruments",
          "Endorsements and their types",
          "Holder and holder in due course",
          "Dishonour and discharge of negotiable instruments",
        ],
        diagrams: ["Parties to a bill of exchange", "Promissory note vs bill vs cheque table"],
        questions: [
          "Define a promissory note, bill of exchange and cheque and distinguish them.",
          "Explain the kinds of endorsement.",
          "Distinguish between a holder and a holder in due course.",
          "Explain dishonour of a negotiable instrument and modes of discharge.",
        ],
      },
      {
        title: "Intellectual Property and Company Law",
        topics: [
          "Copyright",
          "Patents",
          "Trademarks",
          "Industrial designs",
          "Internet piracy and infringement",
          "Formation of a company",
          "Directors — appointment, powers and duties",
        ],
        diagrams: ["Types of IPR chart", "Stages of company formation"],
        questions: [
          "Explain patents: patentability criteria and the procedure to obtain a patent.",
          "Explain copyright and its infringement including internet piracy.",
          "Explain trademarks and industrial designs.",
          "Explain the formation of a company and the role of directors.",
        ],
      },
    ]),
  },
  {
    id: "nic",
    name: "Nature Inspired Computing",
    short: "NIC",
    color: "#7F93AF",
    exam: { date: "2026-11-16", start: "10:00", end: "13:00", label: "10 AM – 1 PM" },
    units: build("nic", [
      {
        title: "Evolutionary Computing",
        topics: [
          "From nature to natural computing; philosophy and branches",
          "Problem solving as search: hill climbing, simulated annealing",
          "Evolutionary biology: Darwin, genetics, natural selection",
          "Standard evolutionary algorithm",
          "Genetic algorithms: representation, selection, crossover, mutation, fitness",
          "Evolution strategies, evolutionary programming, genetic programming",
          "Applications of evolutionary algorithms",
        ],
        diagrams: [
          "Flowchart of a genetic algorithm",
          "Single-point and two-point crossover",
          "Roulette-wheel selection",
          "Hill climbing vs simulated annealing search landscape",
        ],
        questions: [
          "Explain the standard genetic algorithm with its operators and a flowchart.",
          "Compare hill climbing and simulated annealing.",
          "Explain evolution strategies, evolutionary programming and genetic programming.",
          "Discuss applications of evolutionary computing.",
        ],
      },
      {
        title: "Neuro Computing",
        topics: [
          "Biological neuron and the nervous system",
          "Artificial neuron and the McCulloch–Pitts model",
          "Network architectures and learning approaches",
          "Hebbian, perceptron and delta learning rules",
          "Single-layer perceptron and multi-layer perceptron with back-propagation",
          "Self-organising maps (Kohonen)",
          "Hopfield networks and associative memory",
          "Applications of neural networks",
        ],
        diagrams: [
          "Biological neuron vs artificial neuron",
          "Multi-layer perceptron architecture",
          "Kohonen SOM grid",
          "Hopfield network",
        ],
        questions: [
          "Compare the biological neuron with the artificial neuron model.",
          "Explain the perceptron learning rule and its limitations.",
          "Explain the back-propagation algorithm for a multi-layer perceptron.",
          "Explain self-organising maps with the training algorithm.",
        ],
      },
      {
        title: "Swarm Intelligence",
        topics: [
          "Swarm intelligence: principles of collective behaviour",
          "Ant colonies: foraging, stigmergy, pheromone trails",
          "Ant Colony Optimization (ACO) and the travelling-salesman problem",
          "Ant clustering algorithm",
          "Particle Swarm Optimization (PSO): velocity and position update",
          "Swarm robotics",
          "Social adaptation of knowledge",
        ],
        diagrams: [
          "Double-bridge ant experiment",
          "ACO flowchart",
          "PSO particle velocity update vectors",
        ],
        questions: [
          "Explain Ant Colony Optimization with its algorithm and an application to TSP.",
          "Explain Particle Swarm Optimization with update equations.",
          "Explain the ant clustering algorithm.",
          "Discuss swarm robotics and social adaptation of knowledge.",
        ],
      },
      {
        title: "Immune Computing",
        topics: [
          "Natural immune system: innate and adaptive immunity",
          "Artificial immune systems (AIS) and their scope",
          "Representation, affinity measures and shape space",
          "Bone-marrow models",
          "Negative selection algorithm",
          "Clonal selection algorithm (CLONALG)",
          "Immune network models",
          "Applications of AIS",
        ],
        diagrams: [
          "Layered structure of the immune system",
          "Negative selection algorithm flow",
          "Clonal selection algorithm flow",
        ],
        questions: [
          "Explain the natural immune system and how AIS are inspired by it.",
          "Explain the negative selection algorithm with an example.",
          "Explain the clonal selection algorithm.",
          "Explain immune network models and applications of AIS.",
        ],
      },
      {
        title: "Bioinformatics",
        topics: [
          "DNA, RNA, proteins and the central dogma",
          "Sequence alignment: pairwise, global (Needleman–Wunsch), local (Smith–Waterman)",
          "Database search tools: BLAST and FASTA",
          "Phylogenetic trees",
          "Protein structure prediction",
          "DNA computing (Adleman's experiment)",
          "Nature-inspired algorithms applied in bioinformatics",
        ],
        diagrams: [
          "Central dogma of molecular biology",
          "Dynamic-programming alignment matrix",
          "Phylogenetic tree",
        ],
        questions: [
          "Explain global and local sequence alignment with dynamic programming.",
          "Explain DNA computing with Adleman's Hamiltonian path experiment.",
          "Explain BLAST and FASTA.",
          "Discuss the role of nature-inspired computing in bioinformatics.",
        ],
      },
    ]),
  },
  {
    id: "cc",
    name: "Cloud Computing",
    short: "CC",
    color: "#B89A57",
    exam: { date: "2026-11-18", start: "10:00", end: "13:00", label: "10 AM – 1 PM" },
    units: build("cc", [
      {
        title: "Computing Paradigms and Fundamentals",
        topics: [
          "High-performance, parallel, distributed, cluster and grid computing",
          "Cloud, bio, mobile, quantum, optical and nano computing",
          "Motivation and need for cloud computing",
          "Definitions: cloud as a service and as a platform",
          "Principles: five essential characteristics",
          "Cloud ecosystem, requirements for cloud services",
          "Benefits and drawbacks of cloud computing",
        ],
        diagrams: ["Evolution of computing paradigms", "NIST cloud definition model"],
        questions: [
          "Compare cluster, grid and cloud computing.",
          "Explain the five essential characteristics of cloud computing.",
          "Explain the need for and benefits of cloud computing.",
        ],
      },
      {
        title: "Cloud Deployment Models and Service Models",
        topics: [
          "Private, public, community and hybrid cloud",
          "Infrastructure as a Service (IaaS)",
          "Platform as a Service (PaaS)",
          "Software as a Service (SaaS)",
          "Other models: DaaS, NaaS, STaaS",
          "Cloud architecture layers and anatomy of the cloud",
          "Suitability and issues of each model",
        ],
        diagrams: [
          "Four deployment models",
          "SPI service stack (IaaS / PaaS / SaaS)",
          "Layered cloud architecture",
        ],
        questions: [
          "Explain the cloud deployment models with advantages and disadvantages.",
          "Compare IaaS, PaaS and SaaS with examples.",
          "Explain the cloud architecture and its layers.",
        ],
      },
      {
        title: "Virtualization and Programming Models",
        topics: [
          "Virtualization: concept, benefits, VM and VMM",
          "Full, para and hardware-assisted virtualization",
          "Type 1 and Type 2 hypervisors",
          "CPU, memory and I/O virtualization; live migration",
          "MapReduce programming model and Hadoop",
          "Cloud Haskell",
          "Software development in the cloud",
        ],
        diagrams: [
          "Type 1 vs Type 2 hypervisor",
          "MapReduce data flow (map → shuffle → reduce)",
          "Full vs para virtualization",
        ],
        questions: [
          "Explain the types of virtualization and hypervisors with diagrams.",
          "Explain the MapReduce programming model with a word-count example.",
          "Explain Cloud Haskell and software development on the cloud.",
        ],
      },
      {
        title: "Networking for Cloud Computing",
        topics: [
          "Data center networking: three-tier, fat-tree, VL2, BCube, DCell",
          "Requirements of data center networks",
          "Transport layer issues: TCP incast, DCTCP",
          "Cloud service providers: AWS, Microsoft Azure, Google Cloud, IBM, Salesforce",
        ],
        diagrams: ["Three-tier data center topology", "Fat-tree topology"],
        questions: [
          "Explain data center network architectures with diagrams.",
          "Explain transport-layer challenges in cloud data centers.",
          "Compare the major cloud service providers.",
        ],
      },
      {
        title: "Security in Cloud Computing",
        topics: [
          "Cloud security fundamentals and the CIA triad",
          "Security risks and threats; multi-tenancy",
          "Data security and encryption",
          "Identity and access management",
          "Virtualization security",
          "SLA, compliance and trust",
          "Advanced concepts: fog/edge computing, serverless, containers, IoT and green cloud",
        ],
        diagrams: ["Cloud security architecture", "Shared responsibility model", "Fog/edge/cloud layers"],
        questions: [
          "Explain the security challenges in cloud computing and their mitigation.",
          "Explain identity and access management in the cloud.",
          "Explain fog computing and serverless computing.",
        ],
      },
    ]),
  },
  {
    id: "es",
    name: "Electronic Sensors",
    short: "ES",
    color: "#937FA3",
    exam: { date: "2026-11-20", start: "10:00", end: "13:00", label: "10 AM – 1 PM" },
    units: build("es", [
      {
        title: "Sensors and Transducers",
        topics: [
          "Principles and classification of sensors",
          "Parameters and characteristics (static and dynamic)",
          "Environmental parameters and characterization",
          "Mechanical and electromechanical sensors",
          "Resistive potentiometer",
          "Strain gauges: resistance and semiconductor",
          "Inductive sensors: sensitivity and linearity, LVDT",
          "Capacitive sensors and electrostatic transducers",
          "Force/stress sensors using quartz resonators; ultrasonic sensors",
        ],
        diagrams: ["Resistive potentiometer", "Bonded strain gauge", "LVDT construction", "Parallel-plate capacitive sensor"],
        questions: [
          "Explain the classification and characteristics of sensors.",
          "Explain strain gauges and derive the gauge factor.",
          "Explain inductive sensors with LVDT.",
          "Explain capacitive sensors and their types.",
        ],
      },
      {
        title: "Thermal Sensors",
        topics: [
          "Gas thermometric sensors",
          "Thermal expansion type thermometric sensors",
          "Acoustic temperature sensors",
          "Dielectric-constant and refractive-index thermosensors",
          "Resistance change type sensors: RTD and thermistor",
          "Thermo-emf sensors: thermocouples",
          "Semiconductor (junction) temperature sensors",
          "Thermal radiation sensors, heat-flux sensors",
        ],
        diagrams: ["Thermocouple circuit (Seebeck effect)", "RTD bridge circuit", "Bimetallic strip"],
        questions: [
          "Explain resistance-change thermometric sensors (RTD and thermistor).",
          "Explain thermo-emf sensors and the laws of thermocouples.",
          "Explain gas thermometric and thermal expansion sensors.",
          "Explain semiconductor temperature sensors.",
        ],
      },
      {
        title: "Magnetic Sensors",
        topics: [
          "Principles behind magnetic sensors",
          "Magnetoresistive and anisotropic magnetoresistive sensing",
          "Semiconductor magnetoresistors",
          "Hall effect and Hall sensors",
          "Inductance and eddy-current sensors",
          "Angular/rotary movement transducers: synchros and resolvers",
          "Electromagnetic flowmeter",
          "Switching magnetic sensors and SQUID sensors",
        ],
        diagrams: ["Hall effect sensor", "Synchro transmitter–receiver", "Electromagnetic flowmeter"],
        questions: [
          "Explain the Hall effect and Hall-effect sensors.",
          "Explain magnetoresistive sensors.",
          "Explain synchros and resolvers.",
          "Explain eddy-current sensors and the electromagnetic flowmeter.",
        ],
      },
      {
        title: "Radiation Sensors",
        topics: [
          "Basic characteristics of radiation",
          "Photosensors: photoconductive, photovoltaic, photodiodes, phototransistors",
          "X-ray and nuclear radiation sensors (GM counter, scintillation)",
          "Fibre-optic sensors",
          "Electroanalytic sensors: electrochemical cell, cell potential",
          "Standard hydrogen electrode, reference and sensor electrodes",
          "Polarization and electroceramics in gas media",
        ],
        diagrams: ["Photodiode characteristics", "Geiger–Müller counter", "Fibre-optic sensor"],
        questions: [
          "Explain the types of photosensors with characteristics.",
          "Explain X-ray and nuclear radiation sensors.",
          "Explain fibre-optic sensors.",
          "Explain electroanalytic sensors and the electrochemical cell.",
        ],
      },
      {
        title: "Smart Sensors",
        topics: [
          "Smart sensors: primary sensor, excitation, amplification",
          "Filters, converters and compensation",
          "Information coding/processing and data communication",
          "Standards for smart sensor interfaces",
          "Automotive on-board sensors",
          "Home appliance, aerospace and manufacturing sensors",
          "Medical diagnostic and environmental monitoring sensors",
        ],
        diagrams: ["Smart sensor block diagram", "Automotive sensor placement"],
        questions: [
          "Explain the architecture of a smart sensor with a block diagram.",
          "Explain sensor applications in automobiles and home appliances.",
          "Explain sensors for medical diagnostics and environmental monitoring.",
        ],
      },
    ]),
  },
  {
    id: "sw",
    name: "Semantic Web",
    short: "SW",
    color: "#5F918C",
    exam: { date: "2026-11-23", start: "14:00", end: "17:00", label: "2 PM – 5 PM" },
    units: build("sw", [
      {
        title: "Introduction to Semantic Web",
        topics: [
          "What is the Semantic Web and why it matters",
          "Information overload, stovepipe systems, poor content aggregation",
          "Limitations of today's web; the next-generation web",
          "Making data smarter: the smart-data continuum",
          "The Semantic Web vision and stack (layer cake)",
          "Business case: decision support, B2B, enterprise information integration",
          "Ontologies, inference engines and software agents",
        ],
        diagrams: ["Semantic Web layer cake", "Smart-data continuum"],
        questions: [
          "Explain the Semantic Web vision and its layered architecture.",
          "Explain the limitations of the current web and the need for the Semantic Web.",
          "Explain the business case for the Semantic Web.",
        ],
      },
      {
        title: "Web Services",
        topics: [
          "What web services are and why they matter",
          "SOAP",
          "WSDL",
          "UDDI",
          "ebXML",
          "Orchestration of web services",
          "Web-service security: XML Signature, XML Encryption, SAML, XKMS",
          "Semantic web services and OWL-S",
        ],
        diagrams: ["Web services stack (SOAP–WSDL–UDDI)", "Publish–find–bind triangle"],
        questions: [
          "Explain the basic layers of web services: SOAP, WSDL and UDDI.",
          "Explain web-service security standards.",
          "Explain orchestration and semantic web services.",
        ],
      },
      {
        title: "Resource Description Framework",
        topics: [
          "RDF: capturing knowledge as triples",
          "URIs, literals and blank nodes; RDF/XML syntax",
          "RDF Schema",
          "XML introduction and XML Schema",
          "XPath, XSL and XSLT",
          "XQuery, XLink, XPointer and XInclude",
          "XMLBase, XHTML, XForms and SVG",
        ],
        diagrams: ["RDF triple graph", "RDF/XML vs graph representation", "XSLT transformation flow"],
        questions: [
          "Explain RDF with its data model and syntax, with examples.",
          "Explain RDF Schema.",
          "Explain XPath, XSLT and XQuery.",
          "Explain the XML family: XLink, XPointer, XInclude, XForms and SVG.",
        ],
      },
      {
        title: "Taxonomies and Ontologies",
        topics: [
          "Taxonomies and thesauri",
          "Ontologies: definition and role",
          "The ontology spectrum",
          "Topic maps",
          "Ontology syntax, structure and semantics",
          "Knowledge representation and OWL",
        ],
        diagrams: ["Ontology spectrum", "Topic map structure", "Taxonomy tree"],
        questions: [
          "Compare taxonomy, thesaurus and ontology.",
          "Explain the ontology spectrum.",
          "Explain topic maps and their components.",
          "Explain ontology syntax, structure and semantics.",
        ],
      },
      {
        title: "Semantic Web Applications and Search Technology",
        topics: [
          "Semantic Web applications and services",
          "e-Learning, semantic bioinformatics, enterprise application integration",
          "Knowledge bases",
          "Search engines and Google PageRank",
          "Semantic search technology and web search agents",
          "Semantic methods; latent semantic indexing",
          "TAP and Swoogle",
        ],
        diagrams: ["Semantic search architecture", "PageRank link graph"],
        questions: [
          "Explain semantic search technology and web search agents.",
          "Explain applications of the Semantic Web.",
          "Explain latent semantic indexing and Swoogle.",
        ],
      },
    ]),
  },
];

export const SUBJECT_MAP: Record<SubjectId, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, Subject>;

export const ALL_UNITS: Unit[] = SUBJECTS.flatMap((s) => s.units);

export function unitById(id: string): Unit | undefined {
  return ALL_UNITS.find((u) => u.id === id);
}

// Exams in chronological order.
export const EXAMS = [...SUBJECTS].sort((a, b) => a.exam.date.localeCompare(b.exam.date));
