                                                                                            

DESIGN AND DEVELOPMENT OF A DIGITAL REFERRAL MANAGEMENT PLATFORM WITH REAL-TIME CAPACITY MONITORING BETWEEN DISTRICT AND REFERRAL HOSPITALS IN RWANDA                      
                                      By,
IRAGUHA Alain
Registration Number: 217038786
A research proposal submitted to

University of Rwanda
College of Medicine and Health Sciences
Centre of Excellence in Biomedical Engineering and E-health
Master of Sciences in Health Informatics
Supervisor: Dr MUGISHA Emmy
Co-supervisor: Mr RUGAMBA RUGERO Fiacre
February, 2026

APPROVAL

We, Dr MUGISHA Emmy and Mr RUGAMBA RUGERO Fiacre, supervised Mr IRAGUHA Alain, in the development of the research proposal, and we hereby authorize him/her to submit the research proposal to the program coordination office and Institution Review Board (IRB) for ethical clearance and approval before data collection.

Supervisor’s Names: Dr MUGISHA Emmy

Date: .......... /......... /.........    Signature: ..............................


Co-supervisor’s Names: Mr RUGAMBA RUGERO Fiacre

Date: .......... /......... /.........    Signature: ..............................


TABLE OF CONTENTS

APPROVAL	2
LIST OF TABLES	5
ACRONYMS AND ABBREVIATIONS:	6
ABSTRACT	7
CHAPTER 1: INTRODUCTION	8
1.1. Background of the Study	8
1.1.1. Global Perspective	8
1.1.2. Regional Perspective	8
1.1.3. Local Perspective	8
1.2. Problem Statement	9
1.3 Aims and Objectives	10
1.3.1 General Objective	10
1.3.2 Specific Objectives	10
1.5. Research Questions	11
1.6. Scope of the Study	11
1.6.1. Time Scope	11
1.6.2. Content Scope	11
1.6.3. Geographical Scope	12
1.7. Significance of the Study	12
1.7.1. To the Community	12
1.7.2. To the Researcher	13
1.7.3. To the Scholars	13
CHAPTER 2: LITERATURE REVIEW	14
2.1. Introduction	14
2.2. Concepts of the Study	14
2.2.1. Understanding the Referral System: Definition, Classification, and Significance	14
2.2.2. Referral Network and Referral Classification	14
2.2.3. Referral Feedback, Counter-Referral, and the Referral Loop	14
2.2.4. Digital Referral and Transfer Management System	15
2.2.5. Inter-Facility Coordination and Referral Turnaround Time	15
2.3. Theoretical Review	15
2.3.1. Technology Acceptance Model (TAM)	15
2.3.2. Systems Theory	15
2.4. Empirical Review	16
2.4.1. Referral Workflows and Coordination Challenges	16
2.4.2. Design of Digital Referral Systems	16
2.4.3. Evaluation of Digital Health Systems in Referral Management	16
2.5. Conceptual Framework	18
2.5.1. Technology Acceptance Model (TAM)	18
2.5.2. Systems Theory	18
2.5.3. Integrated Conceptual Framework	19
2.6. Research Gap	19
CHAPTER 3: RESEARCH METHODOLOGY	20
3.1 Introduction	20
3.2 Research Design	20
3.3 Development Methodology: Agile	20
3.3.1 Overview of Agile Methodology	20
3.3.2 Agile Framework: Scrum	20
3.3.3 Application of Agile to This Project	21
3.4 Design Analysis Method: Object-Oriented Design Method (OODM)	21
3.4.1 Choice of Design Analysis Method	21
3.4.2 Application of OODM to This Project	21
3.4.3 Real-Time Bed and Specialist Dashboard	21
3.5 Study Population	23
3.6 Sampling Technique and Sample Size	23
3.7 Data Collection Methods	23
3.7.1 Instruments/Tools	24
3.7.2 Validation and Reliability of Research Instruments	24
3.8 Data Processing	24
3.9 Data Analysis	24
3.10 Limitations	25
3.11 Ethical Considerations	25
APPENDIX 1: ENGLISH CONSENT FORM	26
APPENDIX 2: QUESTIONNAIRE FOR HEALTHCARE STAFF	27
APPENDIX 3: BUDGET	28
APPENDIX 4: WORK PLAN	29
REFERENCES	30


LIST OF TABLES
Table 1 : Summary of Studies on Evaluation of Digital Referral Systems – Contributions, Gaps, and This Study’s Contribution	18
Table 2 APPENDIX 3: BUDGET	28
Table 3APPENDIX 4: WORK PLAN	29



ACRONYMS AND ABBREVIATIONS:

CHUK	Centre Hospitalier Universitaire de Kigali
HMIS		Health Management Information System
INHSRG	Integrated National Health Sector Referral Guidelines
IRB		Institution Review Board
MoH		Ministry of Health
RMH		Rwanda Military Hospital
RNEC		Rwanda National Ethics Committee
SAMU		Service d’Aide Médicale d’Urgence
SUS		System Usability Scale
SPSS		Statistical Package for the Social Sciences
TAM		Technology Acceptance Model
WHO		World Health Organization
OODM           Object-Oriented Design Method
SADM            Structured Analysis and Design Method

                                           ABSTRACT
Patient referrals and transfers are essential components of Rwanda's healthcare delivery system. Rwanda's hierarchical pathway directs patients from health centres to district hospitals and, when necessary, to national referral hospitals such as CHUK and RMH. This system promotes efficient use of limited resources and ensures patients requiring specialised care are managed in facilities with the necessary expertise. However, specialised services remain concentrated at referral hospitals, increasing the demand for patient transfers from district level.
Despite an organised referral pathway, patient transfers remain largely manual and fragmented. Communication between referring and receiving hospitals is often limited and referral documentation incomplete or delayed. Clinicians frequently struggle to confirm specialist availability or bed capacity, leading to delays in treatment, duplication of diagnostic tests, and poor care continuity particularly for patients requiring urgent surgical or medical attention.
This study aims to design and develop a digital referral and transfer management system to improve coordination between Nyamata, Masaka, and Nyarugenge District Hospitals and CHUK and RMH. A mixed-methods approach will be used, with data gathered through interviews, questionnaires, and document reviews involving clinicians, emergency staff, referral coordinators, and hospital administrators. Findings will guide development of a web-based platform incorporating electronic referral forms, automated notifications, referral tracking, and real-time dashboards for specialist availability and bed capacity.
The proposed system is expected to improve inter-facility communication, reduce referral delays, and enhance patient transfer management. By improving access to timely information and reducing manual coordination burden, the system may decrease unnecessary investigations and support faster clinical decision-making. The findings may provide a scalable model for improving referral coordination in other resource-limited settings.








CHAPTER 1: INTRODUCTION

1.1. Background of the Study
1.1.1. Global Perspective
The efficient management of patient referrals is a cornerstone of effective healthcare
delivery systems worldwide. Globally, healthcare systems are increasingly recognizing
the critical role of referral networks in ensuring continuity of care, reducing mortality,
and optimizing the use of specialized medical resources. According to the World Health
Organization (1), a well-functioning referral system is fundamental to
achieving Universal Health Coverage (UHC), as it connects primary care with specialized
services and ensures patients receive the appropriate level of care in a timely manner. 
Numerous studies have documented significant challenges within referral systems across
LMICs, including fragmented communication, inadequate infrastructure, lack of real-time
data sharing, and delays in approvals and transfers. A systematic review of referral
system challenges conducted across LMICs by (2) , covering literature from 2010 to 2021, concluded that human resource constraints, financial limitations, non-compliance, and communication failures are the dominant factors undermining referral systems. These inefficiencies are not inconsequential: research has shown that efficient referral can reduce neonatal deaths by 18%, stillbirths by 27%, and maternal deaths by as much as 50% when quality referral standards are met. The digitalization of health services has been identified as a transformative strategy to address these systemic gaps.

1.1.2. Regional Perspective

In Sub-Saharan Africa, referral systems are characterised by poor coordination, limited infrastructure, and over-reliance on paper-based or telephone-based communication. Studies across Kenya, Tanzania, and Uganda document significant delays in referral processing and high rates of inappropriate referrals (3). Rwanda, as a regional leader in digital health, has made notable progress in health information systems, yet gaps remain in integrating referral management into digital frameworks between district hospitals and national referral centres.

1.1.3. Local Perspective

Rwanda's healthcare system is organized as a pyramidal structure consisting of three levels: the primary level (community health workers, health posts, and health centres), the secondary level (district hospitals), and the tertiary level (provincial, referral, and teaching hospitals) (4). According to the Integrated National Health Sector Referral Guidelines (5), referral in Rwanda is a two-way process that ensures continuity of care for patients and involves not only direct patient care but also support services including transportation and communication. District hospitals are mandated to transfer clients to provincial hospitals, referral hospitals, or directly to teaching hospitals, and may also conduct counter-referrals to lower-level facilities for follow-up and continuity of care.

The structural weaknesses in Rwanda's referral system are well documented. (6) analysed 2,304 referral letters from eleven facilities in Kigali and found that standard referral forms were completed at only 46.0% on average, with counter-referral information absent in several facilities. Despite Rwanda's significant progress in digital health, digital tools have not yet been systematically integrated into referral workflows between district and national hospitals (7).

The consequences of these systemic inefficiencies are well documented at CHUK. (8), tracking 86 emergency general surgery referrals over three months, documented a 12% mortality rate and delays at every stage of the referral chain, including theatre unavailability, laboratory gaps, and insurance-related transfer delays.


Within Kigali and its surroundings, Nyamata, Masaka, and Nyarugenge District Hospitals serve as critical intermediate-level facilities. Nyamata alone serves over 350,000 residents in Bugesera District, while Masaka and Nyarugenge serve densely populated communities within Kigali. Clinicians rely on phone calls and physical referral letters to coordinate transfers, causing delays in specialist confirmation and bed verification underscoring the urgent need for a digitally integrated referral system.

1.2. Problem Statement

Rwanda's referral healthcare system faces persistent operational inefficiencies in coordination between Nyamata, Masaka, and Nyarugenge District Hospitals and the national referral hospitals CHUK and RMH. (5) acknowledges that referral forms are not standardised at the facility level, resulting in inadequate documentation and transmission of patient information. The absence of a standardised referral register has further produced under-reporting and gaps in patient data across the referral chain.
Although these five facilities collectively manage thousands of referral cases annually including emergency surgery, intensive care, and obstetric care their coordination processes remain predominantly paper-based and telephone-dependent. Contrary to (5) requirements, referral focal persons at district hospitals lack real-time access to bed occupancy, specialist availability, or ICU capacity at CHUK and RMH. Consequently, patients are transferred without prior confirmation of receiving facility readiness, resulting in refused admissions, re-referrals, prolonged waiting times, and duplication of diagnostic investigations.
The human cost of these inefficiencies is well documented. (8) reported a 12% mortality rate among emergency surgical referrals reaching CHUK, with delays at every stage of the referral chain. further documented that over 40% of referrals were delayed by more than two hours due to communication failures and the absence of coordinated transfer protocols.
Global evidence confirms that electronic referral systems offer measurable solutions. eReferral systems consistently improve referral processing workflows, reduce waiting times, and enhance data completeness. Rwanda's National Digital Health Strategic Plan (2020–2025) explicitly commits the Government to expanding digital health tools and strengthening health information system interoperability (5). Despite this enabling policy environment, referral management between district and national hospitals remains excluded from Rwanda's digital health architecture.
To address these gaps, this study proposes to design and develop a web-based digital referral and transfer management system enabling real-time communication, resource visibility, and streamlined coordination between the three district hospitals and CHUK and RMH. By digitising the referral workflow in direct alignment with INHSRG guidelines and Rwanda's national digital health strategy, the proposed system aims to reduce referral delays, improve transfer appropriateness, and enhance patient outcomes across the referral chain.

1.3 Aims and Objectives

1.3.1 General Objective
To design and develop a web-based digital referral and transfer management system that improves coordination between Nyamata, Masaka, and Nyarugenge District Hospitals and the national referral hospitals (CHUK and RMH) in Rwanda.

1.3.2 Specific Objectives
The following specific objectives will guide this study:
    1. To assess the current referral and transfer workflow, coordination challenges, and baseline referral performance indicators at Nyamata, Masaka, and Nyarugenge District Hospitals and CHUK and RMH, in alignment with INHSRG (2020) standards.
    2. To design and develop a web-based digital referral and transfer management system incorporating electronic referral forms, a real-time bed and specialist availability dashboard, automated notifications, and referral tracking and counter-referral functionalities, guided by user-centered design principles and INHSRG minimum data requirements.

1.5. Research Questions
The following research questions guide this study and are derived directly from the specific objectives stated in Section 1.3.2:
    1. What are the current referral and transfer workflows, coordination challenges, and baseline referral performance indicators at Nyamata, Masaka, and Nyarugenge District Hospitals and CHUK and RMH, as measured against INHSRG (2020) standards?
    2. What system design, features, and data requirements are necessary for a web-based digital referral and transfer management system to effectively support electronic referral submission, real-time bed and specialist availability, automated notifications, and referral tracking in compliance with INHSRG minimum data requirements?
    3. How can the digital referral and transfer management system be developed and deployed as a functional web-based platform, accessible to clinicians, referral focal persons, and administrators across the five study facilities, using Agile (Scrum) methodology and Object-Oriented Design Method?
    4. What is the impact of the digital referral and transfer management system on referral turnaround time, counter-referral rate, inter-facility communication efficiency, and user satisfaction across the five study facilities, as assessed using the INHSRG (2020) core monitoring indicators?

1.6. Scope of the Study
1.6.1. Time Scope
This study will be conducted between January 2026 and June 2026, spanning a total of six months. The first phase, covering January to March 2026, will be dedicated to research proposal writing and finalisation, needs assessment, baseline data collection, and ethical clearance. The second phase, from March to May 2026, will focus on system design, development, and iterative testing of the digital referral platform across seven Agile sprints. The third phase, covering May to June 2026, will involve system deployment, pre-post evaluation of referral performance indicators, and final report writing and submission.

1.6.2. Content Scope
This study focuses on the design, development, and evaluation of a web-based digital referral and transfer management system. The content scope encompasses: inter-facility referral workflows and coordination between district and national referral hospitals; electronic referral documentation aligned with INHSRG (2020) minimum data requirements; real-time bed availability and specialist on-duty status at CHUK and RMH; automated referral notifications and tracking; counter-referral and feedback mechanisms; and user acceptance measured through TAM and the System Usability Scale (SUS). The five INHSRG core monitoring indicators referral rate, counter-referral rate, waiting time at receiving facility, time between referral decision and departure, and client satisfaction serve as the primary outcome variables. The study excludes referrals below district hospital level, clinical treatment protocols, and financial barriers to referral compliance.
The study does not cover referrals occurring below the district hospital level, such as those from health centres or community health workers to district hospitals, nor does it extend to facilities outside the five selected study sites. Clinical decision-making processes, treatment protocols, and patient clinical outcomes beyond the referral and transfer coordination process are also excluded from the scope of this study. Financial and insurance-related barriers to referral compliance, while acknowledged in the literature, are not addressed as design variables of the proposed system.
1.6.3. Geographical Scope
This study is geographically focused on five healthcare facilities located in the City of Kigali and Bugesera District, Eastern Province, Rwanda. The three referring district hospitals are Nyamata District Hospital in Bugesera District, Masaka District Hospital in Kicukiro District, and Nyarugenge District Hospital in Nyarugenge District. The two national referral hospitals are Centre Hospitalier Universitaire de Kigali (CHUK) and Rwanda Military Hospital (RMH), both located in Kigali City.
These five facilities were selected because they represent Rwanda's highest-volume district-to-national referral corridor. Nyamata District Hospital alone serves over 350,000 residents, while CHUK and RMH are the primary national referral destinations for emergency surgery and intensive care from all three district hospitals. Their geographic proximity to Kigali City ensures logistical feasibility within the six-month study timeline, and the mortality evidence from this corridor (8) confirms the urgency of a coordinated digital intervention.
1.7. Significance of the Study
1.7.1. To the Community
The primary beneficiaries are the patients served by the three district hospitals. By reducing referral delays and ensuring prior confirmation of receiving facility readiness, the proposed system directly addresses the 12% surgical referral mortality documented by (8). The system further reduces diagnostic duplication, decreases unnecessary re-referrals, and frees clinicians from manual coordination burden. For the broader population, this contributes to Rwanda's commitment to universal health coverage and digital health integration (5).
1.7.2. To the Researcher

This study provides significant academic and professional development. Platform development builds competencies in web-based system design, Agile project management, OODM, and health information systems architecture, while the mixed-methods design strengthens skills in SPSS, NVivo, TAM, and Systems Theory. Academically, the study fulfils requirements for the MSc in Health Informatics at the University of Rwanda. Professionally, it positions the researcher as a practitioner in digital health system design and development.
1.7.3. To the Scholars
This study fills a documented gap: no published work has designed and evaluated an integrated digital referral system linking district hospitals to national referral centres in Rwanda with real-time resource dashboards aligned with INHSRG standards. Empirical findings on feasibility, usability, and impact will be disseminated through peer-reviewed publication, contributing to e-referral evidence in Sub-Saharan Africa and providing future researchers with a validated design, tested evaluation framework, and replicable methodology. The study also extends TAM theory to a multi-facility e-referral context in an LMIC setting.
CHAPTER 2: LITERATURE REVIEW

2.1. Introduction
This chapter presents a review of existing literature relevant to the design and development of digital referral and transfer management systems. It begins with definitions of key concepts, followed by a theoretical review, empirical review organized around the specific objectives, a conceptual framework, and a discussion of the research gap that this study intends to fill.

2.2. Concepts of the Study
2.2.1. Understanding the Referral System: Definition, Classification, and Significance
A referral is the process of directing or transferring a patient from a facility of lower clinical capacity to one with greater specialist or diagnostic capability (5). (1) identifies a well-functioning referral system as essential to Universal Health Coverage, ensuring patients receive the right care at the right level. When referral standards are consistently met, outcomes improve measurably: reductions in maternal and neonatal mortality have been directly linked to effective referral (9). Conversely, referral system failures in LMICs contribute to preventable deaths, particularly where surgical emergencies represent up to 30% of the disease burden (10).

(5) classifies referrals by direction and urgency. By direction: horizontal (same-level, within an institution), vertical (between levels in the health hierarchy), or diagonal (bypassing intermediate levels to a specialist facility). By urgency: emergency (life-threatening conditions requiring immediate specialist care) or routine (second opinions, advanced diagnostics, or elective care). In Rwanda, referrals from district hospitals to CHUK and RMH are predominantly emergency and vertical the categories with the most severe consequences for delay, as documented by (8) and confirmed by the 46.0% form completion rate found by (6).

2.2.2. Referral Network and Referral Classification
(11) defines a referral network as the interconnected group of service providers among whom referrals are made. In Rwanda, this spans community health workers, health centres, district hospitals, provincial hospitals, and referral hospitals. Despite this structure, (6) found all referral form types completed below 47.5% across Kigali facilities, with counter-referral completion reaching 0.0% at several facilities empirical confirmation that non-standardised implementation has produced systemic under-reporting and patient data gaps, as INHSRG (2020) acknowledges.

2.2.3. Referral Feedback, Counter-Referral, and the Referral Loop
The referral feedback report is the process by which the receiving facility communicates services provided back to the initiating facility. Counter-referral returns the patient to the initiating facility with follow-up instructions, completing the referral loop (11). These mechanisms are central to continuity of care, yet represent the most consistently documented failure point in Rwanda: (6) found counter-referral completion rates of 0.0% at multiple Kigali facilities, confirming that the referral loop is functionally broken.

2.2.4. Digital Referral and Transfer Management System
A digital referral and transfer management system electronically automates referral processes, incorporating real-time dashboards, automated notifications, digital forms aligned with INHSRG minimum data requirements, and interoperable data exchange. (5) explicitly identifies IT-enabled e-referrals as a key component of a well-functioning health information system. Evidence for their effectiveness is growing: (12) found that the SIPILINK platform in France achieved 93% response-time compliance, with universal satisfaction among general practitioners. Countries including the UK, Denmark, New Zealand, and Australia have adopted eReferral systems with consistent reductions in phone volumes, improved data completeness, and reduced clinical workload.

2.2.5. Inter-Facility Coordination and Referral Turnaround Time
In Rwanda, (8) documented that over 40% of referrals between district and national hospitals were delayed by more than two hours due to communication failures and the absence of coordinated transfer protocols the baseline against which the proposed system will be evaluated.

2.3. Theoretical Review
2.3.1. Technology Acceptance Model (TAM)
The Technology Acceptance Model, developed by Davis (1989) and extensively validated in healthcare contexts, posits that adoption of an information system is determined by Perceived Usefulness (PU) and Perceived Ease of Use (PEOU). (13) confirmed through a review of 287 articles that TAM remains the dominant framework for explaining healthcare technology acceptance. TAM provides the theoretical basis for evaluating end-user acceptance among clinicians, referral coordinators, and administrators across the five facilities. INHSRG (2020) mandates that referral focal persons use IT tools for coordination and data management roles aligning directly with the PU construct making TAM a particularly applicable framework for this evaluation.

2.3.2. Systems Theory
Systems Theory conceptualises healthcare organisations as complex adaptive systems in which inputs, processes, outputs, and feedback loops are dynamically interconnected. INHSRG (2020) reflects this by identifying six interdependent health system building blocks for effective referrals: quality health services, a well-performing health workforce, a well-functioning health information system, essential technologies, health financing, and leadership and governance. When any building block is weakened particularly the health information system overall referral performance degrades. The proposed digital platform directly strengthens the HIS building block and, through it, the health workforce and service quality across the five study facilities.


2.4. Empirical Review
2.4.1. Referral Workflows and Coordination Challenges
Studies across Sub-Saharan Africa consistently document significant inter-facility referral inefficiencies. INHSRG (2020) acknowledges that non-standardised forms in Rwanda lead to inadequate documentation, while (14) identify absent feedback mechanisms and lack of referral registries as barriers in South Africa. In Rwanda, (8) found that 42% of emergency referrals to CHUK were delayed by over two hours due to manual communication and absent bed availability data gaps INHSRG (2020) identifies as addressable through IT-enabled e-referrals.

2.4.2. Design of Digital Referral Systems
Several studies document the design of digital referral platforms. (15) evaluated a mobile-based platform in Ethiopia that improved documentation completeness from 54% to 89% within six months, with iterative user-centered design identified as the key success factor. INHSRG (2020) specifies minimum data elements for referral forms client identification, date and time, reason for transfer, diagnosis, pre-transfer treatment, transport type, vital signs, and referral feedback directly informing the database design of the proposed platform and ensuring regulatory compliance.

2.4.3. Evaluation of Digital Health Systems in Referral Management
Evaluation studies of digital referral systems have grown significantly in the last decade, employing mixed quantitative and qualitative methodologies to assess system impact on referral workflows, communication efficiency, documentation completeness, and user satisfaction. The following studies are particularly relevant to this research.

(12) SIPILINK, France. Evaluation of the SIPILINK e-referral platform found that receiving hospitals met the response time in 93% of cases, with high practitioner satisfaction and reduced telephone dependency. Limitation: high-resource, single-country setting with stable internet infrastructure limits direct applicability to Rwanda.

(16) SMARC, Saudi Arabia. A nationwide evaluation across 755,145 referrals found acceptance rates rising from 74.13% to 90.19%, demonstrating scalability of centralised e-referral systems. Limitation: focused on acceptance rates only — no turnaround time, counter-referral, or patient-level outcomes reported; single nationally-integrated infrastructure.

(15) Mobile-Based Referral Platform, Ethiopia. An evaluation of a mobile-based referral platform in Ethiopia found that referral documentation completeness improved from 54% to 89% within six months of implementation. The study identified user-centered design, iterative prototyping, and stakeholder co-design workshops as critical success factors. A key limitation was that the study was conducted at a single comprehensive specialized hospital, limiting its applicability to multi-facility coordination systems. The mobile platform also did not incorporate real-time bed or specialist availability features, meaning coordination prior to transfer remained partially manual.
(17) Scoping Review, International. E-referral systems across the UK, Denmark, New Zealand, Australia, and others consistently demonstrated reduced phone volumes, improved data completeness, shorter waiting times, and reduced clinical workload, with structured forms, automated routing, and real-time tracking as shared success features. Limitation: no evidence from Sub-Saharan Africa or multi-level district-to-national referral contexts.

(6) Paper-Based Referrals, Rwanda. Analysis of 2,304 referral letters from eleven Kigali facilities found standard form completion at only 46.0% and counter-referral completion at 0.0% across multiple facilities, providing the most directly relevant Rwandan baseline for this study. Limitation: descriptive and retrospective; did not examine district-to-national coordination, turnaround time, or test a digital intervention.

The following table summarizes the key contributions, gaps, and implications of these studies for the present research.


Author / Study	Key Contribution	Gap Identified	This Study's Contribution
(12)	Demonstrated 93% response-time compliance, high practitioner satisfaction, reduced phone dependency	High-resource, single-country HIS; no real-time bed/specialist dashboard; not applicable to LMICs	This study adds real-time resource dashboards and designs for low-connectivity environments in Rwanda
(16)	Showed referral acceptance rates rising from 74% to 90% across 755,145 referrals; proved scalability	Focused on acceptance rates only; no turnaround time or patient outcome data; single national HIS	This study evaluates turnaround time, counter-referral rate, and patient-level INHSRG indicators
(15)	Documentation completeness improved from 54% to 89%; validated user-centered iterative design approach	Single-facility; no real-time resource visibility; mobile-only platform; pre-transfer coordination still manual	This study integrates documentation, real-time dashboards, and counter-referral in a web-based multi-facility system
(17)	Identified shared success features: structured forms, automated routing, real-time tracking; proved global evidence	No Sub-Saharan African evidence; no multi-level (district-to-national) coordination system reviewed	This study is the first to apply these design principles in a district-to-national referral corridor in Rwanda
(6)	Documented 46% referral form completion and 0% counter-referral rate across Kigali facilities	Descriptive only; no digital intervention; did not examine turnaround time or coordination between DH and RH	This study directly addresses the documentation and coordination gaps Kalume et al. identified

Table 1 : Summary of Studies on Evaluation of Digital Referral Systems – Contributions, Gaps, and This Study’s Contribution

2.5. Conceptual Framework
The conceptual framework integrates the Technology Acceptance Model (TAM) and Systems Theory within Rwanda's INHSRG (2020) policy framework, together explaining the technical adoption of the platform and its systemic health impact.
2.5.1. Technology Acceptance Model (TAM)
Davis (1989) developed TAM to explain information system adoption through two primary beliefs: Perceived Usefulness (PU) and Perceived Ease of Use (PEOU), which determine behavioural intention and actual system use. In this study, TAM frames evaluation of end-user acceptance among clinicians, referral focal persons, and administrators. Users who perceive the platform as improving referral coordination (PU) and find it easy to operate (PEOU) are predicted to adopt it consistently a prerequisite for delivering the intended referral outcome improvements.

Technology Acceptance Model (TAM) Applied in This Study

[ External Variables (digital literacy, INHSRG mandate, internet connectivity) ] → [ Perceived Ease of Use (PEOU) ] → [ Perceived Usefulness (PU) ] → [ Behavioural Intention to Use ] → [ Actual System Use ]
PEOU also connects directly to PU with a secondary arrow.

External variables in this study include prior HMIS experience, digital literacy level, and the INHSRG organisational mandate for IT use. PU maps to beliefs that the platform reduces referral delays, improves bed and specialist visibility, and reduces manual workload. PEOU maps to interface intuitiveness, form clarity, and dashboard accessibility. These constructs will be measured using a validated TAM-based questionnaire in the post-implementation evaluation phase.

2.5.2. Systems Theory
Systems Theory conceptualizes healthcare organizations as complex adaptive systems in which inputs, processes, outputs, and feedback loops are dynamically interconnected. INHSRG (2020) reflects this perspective by identifying six interdependent health system building blocks for effective referrals: quality health services, a well-performing health workforce, a well-functioning HIS, essential products and technologies, health financing, and leadership and governance. When any block is weakened such as an absent or dysfunctional HIS overall referral performance degrades. The proposed digital platform directly strengthens the HIS building block and, through it, the health workforce (by reducing coordination burden) and service quality (by reducing referral delays).


Systems Theory Framework Applied to the Digital Referral System

[ INPUTS: Referral request, patient data, bed/specialist status, user roles ] → [ PROCESS: Digital platform — referral submission, dashboard update, notification dispatch, status tracking ] → [ OUTPUTS: Accepted referral, patient admitted, counter-referral issued ] → [ FEEDBACK LOOP: INHSRG performance metrics, user satisfaction scores ] → back to INPUTS

Inputs include the referral request, real-time resource status at CHUK/RMH, patient clinical data, and user roles as defined by INHSRG. The Process is mediated by the platform: it receives submissions, updates the dashboard, dispatches notifications, and tracks status. Outputs are the operational results: a referral decision, patient transfer and admission, and counter-referral feedback. The Feedback Loop consists of performance metrics captured for pre-post evaluation using INHSRG core indicators, informing continuous improvement of both the system and workflow.

2.5.3. Integrated Conceptual Framework
The two models are integrated into a unified framework. The independent variable is the Digital Referral and Transfer Management System comprising electronic referral forms, the real-time dashboard, automated notifications, and counter-referral functionalities. The dependent variables are referral turnaround time, counter-referral rate, inter-facility communication efficiency, and user satisfaction, corresponding to INHSRG (2020) core monitoring indicators. Moderating variables include SUS score, organisational readiness, digital literacy, availability of INHSRG-mandated referral focal persons, and internet connectivity. TAM explains the adoption pathway; Systems Theory explains how adoption translates into improved institutional referral performance.

2.6. Research Gap

While (11) identifies persistent implementation gaps, non-standardised forms, absent registers, and the need for IT-enabled e-referrals, no published study has designed and evaluated an integrated digital referral platform linking district hospitals to national referral centres in Rwanda with real-time bed and specialist dashboards aligned with INHSRG standards. Most studies address single-facility systems and do not capture multi-facility coordination complexity. This study addresses these gaps by designing, implementing, and evaluating a comprehensive digital referral system for the three district hospitals and their referral relationship with CHUK and RMH, in compliance with INHSRG (2020).





CHAPTER 3: RESEARCH METHODOLOGY

3.1 Introduction
This chapter presents the methodology for designing, developing, and evaluating the web-based digital referral and transfer management system. It is organised into two parts: (1) the development methodology, covering Agile/Scrum and OODM including the real-time dashboard architecture; and (2) the research methodology, covering mixed-methods design, study population, sampling, data collection and validation, data analysis, limitations, and ethical considerations.

3.2 Research Design
This study will adopt a mixed-methods research design, integrating both quantitative and qualitative approaches to comprehensively address the research objectives. The mixed-methods approach is appropriate for this study because it allows for the triangulation of findings from different data sources, thereby enhancing the validity and depth of the results. The study will follow three sequential phases: (1) a baseline needs assessment using qualitative and quantitative data collection; (2) the design and development of the digital referral platform using user-centered design principles; and (3) a pre-post evaluation of the system's impact on key referral outcomes. This design aligns with the study objectives and reflects best practices in health informatics research and digital health system evaluation.

3.3 Development Methodology: Agile
3.3.1 Overview of Agile Methodology
Agile is a flexible, iterative approach to software development, born from the 2001 Agile Manifesto. It prioritises working software delivered in incremental cycles, enabling rapid response to changing requirements. Its four core values individuals over processes, working software over documentation, customer collaboration over contract negotiation, and responding to change over following a fixed plan make it well-suited for web-based platform development where user requirements evolve throughout the project.

3.3.2 Agile Framework: Scrum
Scrum is the specific Agile framework adopted for this project. It organises development into fixed-length sprints (two to four weeks), each producing a deployable increment. Scrum defines three roles: Product Owner (stakeholder interests and backlog), Scrum Master (facilitating processes), and Development Team (designers, developers, testers). Each sprint follows a cycle of Planning, Daily Stand-ups, Sprint Review, and Retrospective, ensuring continuous delivery and stakeholder feedback throughout development.


3.3.3 Application of Agile to This Project
Development will be organised into seven sprints over fourteen weeks. Sprint 1: requirements gathering, backlog, wireframes, and system architecture. Sprint 2: database and backend setup, API structure, and authentication. Sprint 3: core frontend responsive UI, navigation, and login. Sprint 4: primary features referral forms, real-time dashboard, and automated notifications. Sprint 5: secondary features — referral tracking, counter-referral workflows, admin panel, and INHSRG reporting. Sprint 6: testing and quality assurance including UAT and bug fixes. Sprint 7: deployment, documentation, and handover. Each sprint includes review by clinicians, referral coordinators, and administrators from the five facilities.

3.4 Design Analysis Method: Object-Oriented Design Method (OODM)
3.4.1 Choice of Design Analysis Method
Two design analysis methods were considered: OODM (Object-Oriented Design Method) and SAADM (Structured Analysis and Design Method). SAADM is sequential and Waterfall-aligned, fundamentally incompatible with Agile/Scrum. OODM models systems using objects, classes, and UML notation, is inherently iterative and Agile-compatible, and is the industry standard for modern web-based development. OODM is therefore selected for this project.

3.4.2 Application of OODM to This Project
OODM will be applied using a full suite of UML diagrams: Use Case Diagrams to identify actors (referring clinicians, referral focal persons, receiving administrators, system administrators) and their platform interactions; Class Diagrams to model entities including Patient, Referral, Hospital, Specialist, BedCapacity, and Notification; Sequence Diagrams to illustrate referral initiation, notification dispatch, and counter-referral flows; Activity Diagrams to depict the end-to-end workflow aligned with INHSRG; and ER Diagrams to guide relational database design. This produces a modular, reusable architecture that maps directly onto the web development frameworks used, facilitating seamless transition from design to implementation.

3.4.3 Real-Time Bed and Specialist Dashboard
A central feature of the proposed digital referral and transfer management system is the real-time bed and specialist dashboard, accessible to referral focal persons and clinicians at all five study facilities. This dashboard directly addresses the core operational gap identified by (11), whereby referral focal persons at district hospitals currently lack real-time access to bed occupancy, specialist availability, and intensive care capacity at CHUK and RMH prior to initiating a transfer. The dashboard will display the following information in real time:

(i) Bed Availability by Ward and Facility. The dashboard will display the current number of available beds at CHUK and RMH, disaggregated by ward type: general medical ward, surgical ward, intensive care unit (ICU), high dependency unit (HDU), maternity and obstetric ward, and paediatric ward. Each bed category will be shown with a colour-coded occupancy indicator (available, limited, full) that updates automatically as bed status changes are entered by receiving facility administrators. This enables referring clinicians to confirm bed availability before initiating a transfer, in direct compliance with (11) pre-transfer communication requirements.

(ii) Specialist Availability by Discipline. The dashboard will display the on-duty and on-call status of specialists at CHUK and RMH, organized by clinical discipline, including general surgery, orthopaedic surgery, obstetrics and gynaecology, internal medicine, paediatrics, neurology, anaesthesia, and intensive care. Each specialist’s current status will be shown as available, in theatre, on call, or unavailable. Referring clinicians will be able to filter by discipline to immediately identify whether the required specialist is available to receive a referral before transfer is initiated, eliminating the reliance on phone calls for specialist confirmation that currently causes delays.

(iii) ICU and HDU Capacity Indicators. Given that a significant proportion of referrals from the three district hospitals involve critically ill patients requiring intensive care, the dashboard will provide a dedicated real-time display of ICU and HDU capacity at both CHUK and RMH. This will include total capacity, current occupancy, and the number of immediately available ICU and HDU beds, displayed as a dynamic gauge updated at regular intervals by the receiving facility’s nursing or administrative staff.

(iv) Active Referral Status Tracker. The dashboard will include a live referral tracking panel displaying all pending, in-transit, and recently completed referrals originating from the logged-in facility. Each referral entry will show the patient identifier, referral urgency level (emergency or routine), receiving facility, time elapsed since referral submission, current status (submitted, accepted, patient in transit, admitted, or rejected), and the name of the receiving specialist or ward. This panel allows referral focal persons to monitor the full referral cycle in real time without relying on telephone follow-up, directly supporting compliance with (11) requirements for referral tracking and feedback.

(v) Referral Performance Metrics. For hospital administrators and referral coordinators, the dashboard will display aggregate performance indicators aligned with (11) core monitoring benchmarks: referral rate, counter-referral rate, average referral turnaround time, average waiting time at receiving facility for emergency referrals, and the proportion of referrals accepted versus rejected or re-referred. These metrics will be displayable by facility, time period, and clinical department, enabling ongoing performance monitoring and supporting the data analysis objectives of this study.

(vi) Automated Alert Notifications. The dashboard will integrate an automated notification system that alerts relevant personnel at the receiving facility when a new referral is submitted, and notifies the referring facility when the referral status is updated (accepted, admitted, or counter-referred). Alerts will be displayed as in-platform notifications and, where internet connectivity is available, as SMS notifications to the designated referral focal person, ensuring that critical status changes are communicated promptly even when users are not actively logged into the platform.

The dashboard will be designed to be role-sensitive, meaning that the information displayed will be tailored to the user’s role and facility. Referring clinicians and referral focal persons at Nyamata, Masaka, and Nyarugenge District Hospitals will have a view focused on resource availability at CHUK and RMH and the status of their outgoing referrals. Receiving facility administrators and specialists at CHUK and RMH will have a view focused on incoming referral requests, their own bed and specialist status management panel, and counter-referral submission tools. Hospital administrators across all five facilities will have access to the full performance metrics dashboard. All data displayed on the dashboard will be drawn from the system’s central database, updated in real time by authorised users, and stored with full audit trail functionality to support data integrity and evaluation purposes.

3.5 Study Population
The target population for this study comprises all healthcare workers and administrators directly involved in the referral and transfer management process at the five study sites: Nyamata, Masaka, and Nyarugenge District Hospitals, and CHUK and RMH. This includes clinicians (doctors and nurses), emergency department staff, referral focal persons, hospital managers, and information technology officers. Based on institutional records, the estimated total population across the five facilities is approximately 500 staff members directly engaged in referral-related activities. This population is relevant to the study as these individuals represent the primary users and stakeholders of the proposed digital referral system.

3.6 Sampling Technique and Sample Size
A stratified purposive sampling technique will be used to select participants for the needs assessment phase, ensuring representation from all five facilities and all key staff categories (clinicians, referral coordinators, nurses, administrators, and IT staff). For the survey component, Yamane's (1967) formula will be applied to calculate the sample size from the total population of 500:

n = N / (1 + N(e²)) = 500 / (1 + 500(0.05²)) = 500 / (1 + 2.125) ≈ 160 participants

For qualitative components (interviews and focus group discussions), a purposive sample of approximately 30 key informants will be selected based on their roles and experience in referral management. The final sample size will be confirmed following the completion of the needs assessment.

3.7 Data Collection Methods
Three data collection methods will be employed in this study. First, structured questionnaire surveys will be administered to clinical and administrative staff across all five facilities to quantitatively assess current referral workflows, challenges, and outcomes relative to INHSRG (2020) standards. Second, in-depth interviews and focus group discussions will be conducted with referral focal persons, hospital managers, and senior clinicians to obtain qualitative insights into coordination barriers and user requirements for the digital platform. Third, document review of existing referral records, logbooks, and hospital administrative data will be used to establish baseline referral performance indicators, including the five core INHSRG indicators: referral rate, counter-referral rate, waiting time at receiving facility, time between referral decision and departure, and client satisfaction.

3.7.1 Instruments/Tools
A structured questionnaire will be developed in English and Kinyarwanda, organized into four sections: (1) demographic information; (2) current referral workflow assessment, informed by INHSRG (2020) framework for referral management roles and responsibilities at the health facility level; (3) perceived challenges in inter-facility coordination, including communication prior to transfer, availability of referral tools, and feedback mechanisms as required by the INHSRG; and (4) technology readiness and digital literacy. An interview guide will be designed for in-depth interviews and focus group discussions, covering themes related to referral coordination challenges, compliance with INHSRG communication and documentation standards, and user requirements for a digital system. A document review checklist will systematically extract data from existing referral registers and HMIS reports, guided by the minimum data elements specified in (11), including client identification, date and time of transfer, reason for referral, diagnosis, pre-transfer treatment, transport type, and referral feedback. All instruments will be aligned with the specific objectives of the study and reviewed for consistency with INHSRG guidelines.

3.7.2 Validation and Reliability of Research Instruments
Content validity will be ensured through expert review of all instruments by a panel of health informatics specialists, public health researchers, and clinicians with referral management experience, including verification of alignment with (11) standards and Rwanda's HMIS reporting requirements. Face validity will be assessed by five healthcare workers from non-study facilities. A pilot study will be conducted at a district hospital outside the study sites involving 20 participants to test instrument reliability. Internal consistency of the questionnaire will be assessed using Cronbach's alpha coefficient, with a threshold of 0.70 considered acceptable.

3.8 Data Processing
Completed questionnaires will be reviewed for completeness and consistency immediately after collection. Data will be coded and entered into SPSS version 27.0 for quantitative analysis. Qualitative data from interviews and focus group discussions will be transcribed verbatim and imported into NVivo 12 for thematic analysis. All data will be stored in a password-protected computer accessible only to the principal researcher.

3.9 Data Analysis
Quantitative data will be analyzed using descriptive statistics (frequencies, means, standard deviations) to characterize the study population and baseline referral outcomes. Pre- and post-intervention comparisons of referral performance will be conducted using paired t-tests and Wilcoxon signed-rank tests, with analysis centered on the five (11) core monitoring indicators: referral rate, counter-referral rate, waiting time at receiving facility for emergency referrals, time between referral decision and departure from referring facility, and client satisfaction. Qualitative data from interviews and focus group discussions will be analyzed using thematic analysis to identify patterns related to coordination challenges, compliance with INHSRG communication and documentation requirements, and user requirements for the digital platform. System usability will be evaluated using the System Usability Scale (SUS), and user satisfaction will be assessed using a validated questionnaire. Analysis will be conducted using SPSS version 27.0 for quantitative data and NVivo 12 for qualitative data, with results triangulated to produce a comprehensive understanding of system impact in relation to INHSRG standards.

3.10 Limitations
Several limitations are anticipated in this study. First, the pilot evaluation will be conducted over a limited time period, which may not be sufficient to fully capture the long-term impact of the system on referral outcomes. To mitigate this, performance indicators will be monitored over a minimum of three months post-implementation. Second, internet connectivity constraints at some district hospitals may affect real-time functionality of the platform. The system will be designed with offline capabilities to address this limitation. Third, response bias may affect survey results. Anonymous data collection and assurance of confidentiality will be employed to minimize this risk. Fourth, the study is limited to five facilities in Kigali and Bugesera District, which may limit the generalizability of findings to other regions of Rwanda.



3.11 Ethical Considerations

This study will be conducted in full compliance with ethical principles governing human subjects research. Ethical clearance will be obtained from the University of Rwanda College of Medicine and Health Sciences Institutional Review Board (IRB) and the Rwanda National Ethics Committee (RNEC) prior to data collection. Permission to conduct the study at each facility will be sought from the respective hospital directors. All participants will provide written informed consent before participating in the study. Participation will be entirely voluntary, and participants will be free to withdraw at any time without consequences. Confidentiality and anonymity will be maintained through the use of coded identifiers in place of personal names. All data will be stored securely and will be accessible only to authorized members of the research team.




APPENDIX 1: ENGLISH CONSENT FORM
I ...............................................................................................(name initials), consent to participate in the study on the Design and Development of a Digital Referral and Transfer Management System to Improve Coordination Between Nyamata, Masaka, and Nyarugenge District Hospitals and CHUK and RMH in Rwanda. I have understood the nature of this study and wish to participate in it. I understand that my participation in the study is voluntary, and that I am free to withdraw at any time. I am informed that all information taken from the study will be coded to protect each subject’s identity. No names or other identifying information will be used when discussing or reporting data. The researcher will safely keep all files and data collected in a secured computer with a strong password. Once the data has been fully analyzed, it will be destroyed.
Tick if you agree to participate:    ☐ I agree to participate

If you have any problem, call:  0786556975

APPENDIX 2: QUESTIONNAIRE FOR HEALTHCARE STAFF
SECTION A: DEMOGRAPHIC INFORMATION
1. Which facility do you work at?
    • Nyamata District Hospital
    • Masaka District Hospital
    • Nyarugenge District Hospital
    • CHUK
    • RMH
2. What is your professional role?
    • Clinician (Doctor/Nurse)
    • Referral Focal Person
    • Hospital Administrator
    • IT Officer
    • Other (specify): _______________
3. How many years of experience do you have in your current role?
    • Less than 2 years
    • 2–5 years
    • More than 5 years

SECTION B: CURRENT REFERRAL WORKFLOW ASSESSMENT

4. How are referrals currently initiated between your facility and referral hospitals? (Select all that apply)
    • Phone calls
    • Physical referral letters
    • Email
    • Electronic Medical Records (EMR) system
    • Other (specify): _______________
5. On average, how long does it take to obtain approval for an emergency referral? (hours)
6. How frequently do referred patients experience delays due to unavailability of beds or specialists at the receiving hospital?
    • Always
    • Often
    • Sometimes
    • Rarely
    • Never

APPENDIX 3: BUDGET

ITEM	QUANTITY	UNIT COST (RWF)	TOTAL COST (RWF)
Research assistant fees	3	100,000	300,000
Stationery and printing	1 lot	50,000	50,000
Data collection transport	5 sites x 10 visits	20,000	200,000
Software licenses and hosting	1 year	300,000	300,000
Data analysis software (SPSS/NVivo)	1	500,000	500,000
Communication and internet	6 months	40,000	240,000
Binding and report production	10 copies	15,000	150,000
Miscellaneous	1 lot	300,000	300,000
TOTAL	2,040,000


Table 2 APPENDIX 3: BUDGET
APPENDIX 4: WORK PLAN

Task	Jan 2026	Feb 2026	M 2026	Apr 2026	May 2026	June 2026
1: Research proposal writing 	*	*	*			
2: Presentation of the proposal 			*			
3: Finalizing the research proposal 			*	*		
4: Submission of the research proposal 				*		
5: Data collection 				*		
6: Data analysis and report 				*	*	
7: Final presentation of the research project 						*


Table 3APPENDIX 4: WORK PLAN









REFERENCES
1.	WHO. Tracking universal health coverage 2023 global monitoring report. 2023. Report No.
2.	Nakayuki M, Basaza A, Namatovu H. Challenges Affecting Health Referral Systems in Low-And Middle-Income Countries: A Systematic Literature Review. Eur J Health Sci. 2021 Oct 3;6(3):33–44. doi:10.47672/ejhs.809
3.	Ameyaw EK, Njue C, Tran NT, Dawson A. Quality and women’s satisfaction with maternal referral practices in sub-Saharan African low and lower-middle income countries: a systematic review. BMC Pregnancy Childbirth. 2020 Dec;20(1):682. doi:10.1186/s12884-020-03339-3
4.	MoH. Health Sector Strategic Plan V July 2024 – June 2029. 2024. Report No.
5.	MoH. Integrated National Health Sector Referral Guidelines (INHSRG). 2020. Report No.
6.	Kalume Z, Jansen B, Nyssen M, Cornelis J, Verbeke F, Niyoyita JP. Assessment of formats and completeness of paper-based referral letters among urban hospitals in Rwanda: a retrospective baseline study. BMC Health Serv Res. 2022 Nov 28;22(1):1436. doi:10.1186/s12913-022-08845-y
7.	Bananeza R, Uwamahoro J, Basingize A, Shuaibu MS, Mohamed AM, Abayneh LM, et al. Revolutionizing Digital Health in Rwanda: Progress Toward Universal Health Coverage. Vol. 1. 2025;1.
8.	Mpirimbanyi C, Abahuje E, Hirwa AD, Gasakure M, Rwagahirima E, Niyonzima C, et al. Defining the Three Delays in Referral of Surgical Emergencies from District Hospitals to University Teaching Hospital of Kigali, Rwanda. World J Surg. 2019 Aug 15;43(8):1871–9. doi:10.1007/s00268-019-04991-3
9.	Gondwe MJ, Mhango JM, Desmond N, Aminu M, Allen S. Approaches, enablers, barriers and outcomes of implementing facility-based stillbirth and neonatal death audit in LMICs: a systematic review. BMJ Open Qual. 2021 Mar;10(1):e001266. doi:10.1136/bmjoq-2020-001266
10.	PaedSurg Africa Research Collaboration. Paediatric surgical outcomes in sub-Saharan Africa: a multicentre, international, prospective cohort study. BMJ Glob Health. 2021 Sep;6(9):e004406. doi:10.1136/bmjgh-2020-004406
11.	MOH. Integrated National Health Sector Referral Guidelines (INHSRG). ministry of health rwanda; 2020. Report No.
12.	Nun A, Tropeano AI, Flamarion E, Roumy A, Azais H, Dehghani Kelishadi L, et al. Real-life implementation and evaluation of the e-referral system SIPILINK. Int J Med Inf. 2025 Feb;194:105605. doi:10.1016/j.ijmedinf.2024.105605
13.	Stoumpos AI, Kitsios F, Talias MA. Digital Transformation in Healthcare: Technology Acceptance and Its Applications. Int J Environ Res Public Health. 2023 Feb 15;20(4):3407. doi:10.3390/ijerph20043407
14.	Matolengwe A, Murray D, Okafor U. The Challenges of Implementing a Health Referral System in South Africa: A Qualitative Study. Risk Manag Healthc Policy. 2024 Apr;Volume 17:855–64. doi:10.2147/RMHP.S450998
15.	Abera B, Yasin T, Gizaw H, Adem YF. Quality of referral system and associated factors among referred clients referred to dessie comprehensive specialized hospital, Northeast, Ethiopia. Berhe TT, editor. PLOS One. 2025 Dec 8;20(12):e0337715. doi:10.1371/journal.pone.0337715
16.	Alharbi AA, Alqassim AY, Binhotan MS, Muaddi MA, Alsultan AK, Arafat MS, et al. Saudi Medical Appointments and Referrals Center (SMARC) Performance Dynamic: A Comparative National Analysis of 2023–2024 Against Baseline Metrics. Healthcare. 2025 Aug 8;13(16):1945. doi:10.3390/healthcare13161945
17.	Azamar-Alonso A, Costa AP, Huebner LA, Tarride JE. Electronic referral systems in health care: a scoping review. Clin Outcomes Res. 2019 May;Volume 11:325–33. doi:10.2147/CEOR.S195597















