"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubControl_1 = __importDefault(require("../app/models/SubControl"));
const subControlsToImport = [
    {
        subControlId: '1-1-P-1-1',
        name: "Cybersecurity roles and RACI assignment for all stakeholders of the cloudservices including Authorizing Official's roles and responsibilities",
        controlId: '1-1-P-1',
        mainDomainId: 1,
        subDomainId: '1-1',
    },
    {
        subControlId: '1-1-T-1-1',
        name: "Cybersecurity roles and RACI assignment for all stakeholders of the cloudservices including Authorizing Official's roles and responsibilities",
        controlId: '1-1-T-1',
        mainDomainId: 1,
        subDomainId: '1-1',
    },
    {
        subControlId: '1-2-P-1-1',
        name: 'Defining acceptable risk levels for the cloud services, and clarifying them to the CST if they are related to the CST',
        controlId: '1-2-P-1',
        mainDomainId: 1,
        subDomainId: '1-2',
    },
    {
        subControlId: '1-2-P-1-2',
        name: 'Considering data and information classification in cybersecurity risk management methodology',
        controlId: '1-2-P-1',
        mainDomainId: 1,
        subDomainId: '1-2',
    },
    {
        subControlId: '1-2-P-1-3',
        name: 'Developing cybersecurity risk register for cloud services, and monitoring it periodically according to the risks',
        controlId: '1-2-P-1',
        mainDomainId: 1,
        subDomainId: '1-2',
    },
    {
        subControlId: '1-2-T-1-1',
        name: 'Defining acceptable risk levels for the cloud services',
        controlId: '1-2-T-1',
        mainDomainId: 1,
        subDomainId: '1-2',
    },
    {
        subControlId: '1-2-T-1-2',
        name: 'Considering data and information classification accredited by CST in cybersecurity risk management methodology',
        controlId: '1-2-T-1',
        mainDomainId: 1,
        subDomainId: '1-2',
    },
    {
        subControlId: '1-2-T-1-3',
        name: 'Developing cybersecurity risk register for cloud services, and monitoring it periodically according to the risks',
        controlId: '1-2-T-1',
        mainDomainId: 1,
        subDomainId: '1-2',
    },
    {
        subControlId: '1-3-P-1-1',
        name: 'Continuous compliance with all laws, regulations, instructions, decisions, regulatory frameworks and controls, and mandates regarding cybersecurity in KSA',
        controlId: '1-3-P-1',
        mainDomainId: 1,
        subDomainId: '1-3',
    },
    {
        subControlId: '1-3-T-1-1',
        name: 'Continuous or real-time compliance monitoring of the CSP with relevant cybersecurity legislation and contract clauses',
        controlId: '1-3-T-1',
        mainDomainId: 1,
        subDomainId: '1-3',
    },
    {
        subControlId: '1-4-P-1-1',
        name: "Positions of cybersecurity functions in CSP's data centers within the KSA must be filled with qualified and suitable Saudi nationals",
        controlId: '1-4-P-1',
        mainDomainId: 1,
        subDomainId: '1-4',
    },
    {
        subControlId: '1-4-P-1-2',
        name: 'Screening or vetting candidates of personnel working inside KSA who have access to Cloud Technology Stack, periodically',
        controlId: '1-4-P-1',
        mainDomainId: 1,
        subDomainId: '1-4',
    },
    {
        subControlId: '1-4-P-1-3',
        name: 'Cybersecurity policies as a prerequisite to access to Cloud Technology Stack, signed and appropriately approved',
        controlId: '1-4-P-1',
        mainDomainId: 1,
        subDomainId: '1-4',
    },
    {
        subControlId: '1-4-P-2-1',
        name: 'Assurance that assets owned by the organization (especially those with security exposure) are accounted for and returned upon termination',
        controlId: '1-4-P-2',
        mainDomainId: 1,
        subDomainId: '1-4',
    },
    {
        subControlId: '1-4-T-1-1',
        name: 'Screening or vetting candidates of personnel with access to Cloud Service sensitive functions (Key Management, Service Administration, Access Control)',
        controlId: '1-4-T-1',
        mainDomainId: 1,
        subDomainId: '1-4',
    },
    {
        subControlId: '1-5-P-3-1',
        name: 'Processes and procedures to securely implement changes (planned works) in production systems, with priority given to cybersecurity observations',
        controlId: '1-5-P-3',
        mainDomainId: 1,
        subDomainId: '1-5',
    },
    {
        subControlId: '1-5-P-3-2',
        name: 'Process for the implementation of cybersecurity exceptional changes (e.g.: changes during incident restoration)',
        controlId: '1-5-P-3',
        mainDomainId: 1,
        subDomainId: '1-5',
    },
    {
        subControlId: '2-1-P-1-1',
        name: 'Inventory of all information and technology assets using suitable techniques such as Configuration Management Database (CMDB) or similar capability containing an inventory of all technical assets',
        controlId: '2-1-P-1',
        mainDomainId: 2,
        subDomainId: '2-1',
    },
    {
        subControlId: '2-1-P-1-2',
        name: 'Identifying assets owners and involving them in the asset management lifecycle',
        controlId: '2-1-P-1',
        mainDomainId: 2,
        subDomainId: '2-1',
    },
    {
        subControlId: '2-1-T-1-1',
        name: 'Inventory of all cloud services and information and technology assets related to the cloud services',
        controlId: '2-1-T-1',
        mainDomainId: 2,
        subDomainId: '2-1',
    },
    {
        subControlId: '2-2-P-1-1',
        name: 'Identity and access management of generic accounts credentials for accountability cannot be assigned for a specific individual',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-2',
        name: 'Secure session management, including session authenticity, session lockout, and session timeout termination',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-3',
        name: 'Multi-factor authentication for privileged users, and candidates of personnel with access to Cloud Technology Stack',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-4',
        name: 'Formal process to detect and prevent unauthorized access (e.g. unsuccessful login attempt threshold)',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-5',
        name: 'Utilizing secure methods and algorithms for saving and processing passwords, such as: Secure Hashing functions',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-6',
        name: "Secure management of third party personnel's accounts",
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-7',
        name: 'Access control enforced to management systems, administrative consoles',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-8',
        name: 'Masking of displayed authentication inputs, especially passwords, to prevent shoulder surfing',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-9',
        name: "Getting CST's approval before accessing any CST-related asset by the CSP or CSP's third parties",
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-10',
        name: 'Capability to immediately interrupt a remote access session and prevent any future access for a user',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-11',
        name: 'Provision to CSTs of Multi-factor authentication services for privileged cloud users',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-P-1-12',
        name: 'Assurance of restricted and controlled access to storage systems and means (such as Storage Area Network (SAN))',
        controlId: '2-2-P-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-T-1-1',
        name: 'Identity and access management for all cloud credentials along their full lifecycle',
        controlId: '2-2-T-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-T-1-2',
        name: 'Confidentiality of cloud user identification, cloud credential and cloud access rights information, including the requirement on users to keep them private (for employed, third party and CST personnel)',
        controlId: '2-2-T-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-T-1-3',
        name: 'Secure session management, including session authenticity, session lockout, and session timeout termination on the cloud',
        controlId: '2-2-T-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-T-1-4',
        name: 'Multi-factor authentication for privileged cloud users',
        controlId: '2-2-T-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-2-T-1-5',
        name: 'Formal process to detect and prevent unauthorized access to cloud (such as a threshold of unsuccessful login attempts)',
        controlId: '2-2-T-1',
        mainDomainId: 2,
        subDomainId: '2-2',
    },
    {
        subControlId: '2-3-P-1-1',
        name: "Ensuring that all configurations are applied in accordance to CSP's cybersecurity standards",
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-2',
        name: 'Assurance of separation and isolation of data, environments and information systems across CSTs, to prevent data commingling',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-3',
        name: 'Adopting of cybersecurity principles for technical system configurations adhering to the minimum functionality principle',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-4',
        name: 'Ability of the Cloud Technology Stacks to securely handle input validation, exceptions and failure',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-5',
        name: 'Full isolation of security functions and applications from other functions and applications in the Cloud Technology Stack',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-6',
        name: 'Notification to CSTs with cybersecurity requirements provided by the CSP that are useable by the CST',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-7',
        name: 'Detection and prevention of unauthorized changes to softwares, and systems',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-8',
        name: 'Complete isolation and protection of multiple guest environments',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-9',
        name: 'The community cloud services provided to CSTs (government organizations and CNI organizations) shall be isolated from any other cloud computing provided to organizations outside the scope of work',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-10',
        name: 'Provide cloud computing services from within the KSA, including systems used for storage, processing, and disaster recovery centers',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-11',
        name: 'Provide cloud computing services from within the KSA, including systems used for monitoring, and support',
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-P-1-12',
        name: "Modern technologies, such as Endpoint Detection and Response (EDR) technologies, to ensure that the information servers and devices of CSP's information processing systems and devices of are ready for rapid response to incidents",
        controlId: '2-3-P-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-3-T-1-1',
        name: 'Verifying that the CSP isolates the community cloud services provided to CSTs (government organizations and CNI organizations) from any other cloud computing provided to organizations outside the scope of work',
        controlId: '2-3-T-1',
        mainDomainId: 2,
        subDomainId: '2-3',
    },
    {
        subControlId: '2-4-P-1-1',
        name: 'Monitoring of traffic across the external and internal networks to detect anomalies',
        controlId: '2-4-P-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-4-P-1-2',
        name: 'Network isolation and protection of Cloud Technology Stack network from other internal and external networks',
        controlId: '2-4-P-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-4-P-1-3',
        name: 'Protection from denial of service attacks (including Distributed Denial of Service (DDoS))',
        controlId: '2-4-P-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-4-P-1-4',
        name: 'Protection of data transmitted through the network; from and to the Cloud Technology Stack network using cryptography primitives; for management and administrative access',
        controlId: '2-4-P-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-4-P-1-5',
        name: 'Access control between different network segments',
        controlId: '2-4-P-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-4-P-1-6',
        name: 'Isolation between cloud service delivery network, cloud management network and CSP enterprise network',
        controlId: '2-4-P-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-4-T-1-1',
        name: 'Protecting the connection channel with CSP',
        controlId: '2-4-T-1',
        mainDomainId: 2,
        subDomainId: '2-4',
    },
    {
        subControlId: '2-5-P-1-1',
        name: 'Inventory of all end user and mobile devices',
        controlId: '2-5-P-1',
        mainDomainId: 2,
        subDomainId: '2-5',
    },
    {
        subControlId: '2-5-P-1-2',
        name: 'Centralized mobile device security management',
        controlId: '2-5-P-1',
        mainDomainId: 2,
        subDomainId: '2-5',
    },
    {
        subControlId: '2-5-P-1-3',
        name: 'Screen locking for end user devices',
        controlId: '2-5-P-1',
        mainDomainId: 2,
        subDomainId: '2-5',
    },
    {
        subControlId: '2-5-P-1-4',
        name: 'Data sanitation and secure disposal for end-user devices, especially for those with exposure to the Cloud Technology Stack',
        controlId: '2-5-P-1',
        mainDomainId: 2,
        subDomainId: '2-5',
    },
    {
        subControlId: '2-5-T-1-1',
        name: 'Data sanitation and secure disposal for end-user devices with access to the cloud services',
        controlId: '2-5-T-1',
        mainDomainId: 2,
        subDomainId: '2-5',
    },
    {
        subControlId: '2-6-P-1-1',
        name: "Prohibiting the use of Cloud Technology Stack's data in any environment other than production environment, except after applying strict controls for protecting that data, such as: data masking or data scrambling techniques",
        controlId: '2-6-P-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-6-P-1-2',
        name: 'Provision to CSTs of securely data storage processes, procedures, and technologies to comply with related legal and regulatory requirements',
        controlId: '2-6-P-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-6-P-1-3',
        name: "Disposal of CST's data should be performed in a secure manner on termination or expiry of the contract with the CSP",
        controlId: '2-6-P-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-6-P-1-4',
        name: "Commitment to maintain the confidentiality of the CST's data and information, according to related legal and regulatory requirements",
        controlId: '2-6-P-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-6-P-1-5',
        name: 'Providing CSTs with secure means to export and transfer data and virtual infrastructure',
        controlId: '2-6-P-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-6-T-1-1',
        name: 'Exit Strategy to ensure means for secure disposal of data on termination or expiry of the contract with the CSP',
        controlId: '2-6-T-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-6-T-1-2',
        name: 'Using secure means to export and transfer data and virtual infrastructure',
        controlId: '2-6-T-1',
        mainDomainId: 2,
        subDomainId: '2-6',
    },
    {
        subControlId: '2-7-P-1-1',
        name: 'Technical mechanisms and cryptographic primitives for strong encryption, in according to the advanced level in the National Cryptographic Standards (NCS-1:2020)',
        controlId: '2-7-P-1',
        mainDomainId: 2,
        subDomainId: '2-7',
    },
    {
        subControlId: '2-7-P-1-2',
        name: 'Certification authority and issuance capability in a secure manner, or usage of certificates from a trusted certification authority',
        controlId: '2-7-P-1',
        mainDomainId: 2,
        subDomainId: '2-7',
    },
    {
        subControlId: '2-7-T-1-1',
        name: 'Technical mechanisms and cryptographic primitives for strong encryption, in according to the advanced level in the National Cryptographic Standards (NCS-1:2020)',
        controlId: '2-7-T-1',
        mainDomainId: 2,
        subDomainId: '2-7',
    },
    {
        subControlId: '2-7-T-1-2',
        name: 'Encryption of data and information transferred to or transferred out of the cloud according to the relevant law and regulatory requirements',
        controlId: '2-7-T-1',
        mainDomainId: 2,
        subDomainId: '2-7',
    },
    {
        subControlId: '2-8-P-1-1',
        name: "Securing access, storage and transfer of CST's data backups and its mediums, and protecting it against damage, amendment or unauthorized access",
        controlId: '2-8-P-1',
        mainDomainId: 2,
        subDomainId: '2-8',
    },
    {
        subControlId: '2-8-P-1-2',
        name: 'Securing access, storage and transfer of Cloud Technology Stack backups and its mediums, and protecting it against damage, amendment or unauthorized access',
        controlId: '2-8-P-1',
        mainDomainId: 2,
        subDomainId: '2-8',
    },
    {
        subControlId: '2-9-P-1-1',
        name: 'Assessing and remediating vulnerabilities on external components of Cloud Technology Stack at least once every month, and at least once every three months for internal components of Cloud Technology Stack',
        controlId: '2-9-P-1',
        mainDomainId: 2,
        subDomainId: '2-9',
    },
    {
        subControlId: '2-9-P-1-2',
        name: 'Notification to CSTs of identified vulnerabilities that may affecting them, and safeguards in place',
        controlId: '2-9-P-1',
        mainDomainId: 2,
        subDomainId: '2-9',
    },
    {
        subControlId: '2-9-T-1-1',
        name: 'Assessing and remediating vulnerabilities cloud services and at least once every three months',
        controlId: '2-9-T-1',
        mainDomainId: 2,
        subDomainId: '2-9',
    },
    {
        subControlId: '2-9-T-1-2',
        name: 'Management of CSP-notified vulnerabilities safeguards in place',
        controlId: '2-9-T-1',
        mainDomainId: 2,
        subDomainId: '2-9',
    },
    {
        subControlId: '2-10-P-1-1',
        name: 'Scope of penetration tests must cover Cloud Technology Stack and must be conducted at least once every six months',
        controlId: '2-10-P-1',
        mainDomainId: 2,
        subDomainId: '2-10',
    },
    {
        subControlId: '2-11-P-1-1',
        name: 'Activating and protecting event logs and audit trails of Cloud Technology Stack',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-2',
        name: 'Activating and collecting of login attempts history',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-3',
        name: 'Activating and protecting all event logs of activities and operations performed by the CSP at the tenant level in order to support forensic analysis',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-4',
        name: 'Protecting cybersecurity event logs from alteration, disclosure, destruction and unauthorized access and unauthorized release, in accordance with regulatory, or law requirements',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-5',
        name: 'Continuous cybersecurity events monitoring using SIEM technique covering the full Cloud Technology Stack',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-6',
        name: 'Reviewing cybersecurity event logs and audit trails periodically, covering CSP events in the Cloud Technology Stack',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-7',
        name: 'Automated monitoring and logging of remote access sessions event logs',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-P-1-8',
        name: 'Secure handling of user-related data found in the audit trails and the cybersecurity event logs',
        controlId: '2-11-P-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-T-1-1',
        name: 'Activating and collecting of login event logs, and cybersecurity event logs on assets related to cloud services',
        controlId: '2-11-T-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-11-T-1-2',
        name: 'Monitoring shall include all activated cybersecurity logs on the cloud services of the CST',
        controlId: '2-11-T-1',
        mainDomainId: 2,
        subDomainId: '2-11',
    },
    {
        subControlId: '2-12-P-1-1',
        name: 'Subscribing in authorized and specialized organizations and groups to stay up-to-date on cybersecurity threats, common practices and key know-how',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-2',
        name: 'Training for employees and third-party personnel to respond to cybersecurity incidents, in line with their roles and responsibilities',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-3',
        name: 'Periodically testing the incident response capability',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-4',
        name: 'Root Cause Analysis of cybersecurity incidents and developing plans to address them',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-5',
        name: 'Support the CST in cases legal proceedings and forensics, protecting the chain of custody that falls under the management and responsibility of the CSP, in accordance with the related law and regulatory requirements',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-6',
        name: 'Real-time reporting to the CST of incidents that may affect CST; if the incident is discovered',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-7',
        name: 'Support for CSTs to handle security incidents according to the agreement between the CSP and CST',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-12-P-1-8',
        name: 'Measuring and monitoring cybersecurity incident metrics and monitor compliance with contracts and legislative requirements',
        controlId: '2-12-P-1',
        mainDomainId: 2,
        subDomainId: '2-12',
    },
    {
        subControlId: '2-13-P-1-1',
        name: "Continual monitoring of access to CSP's sites and buildings",
        controlId: '2-13-P-1',
        mainDomainId: 2,
        subDomainId: '2-13',
    },
    {
        subControlId: '2-13-P-1-2',
        name: 'Preventing unauthorized access to devices in the Cloud Technology Stack',
        controlId: '2-13-P-1',
        mainDomainId: 2,
        subDomainId: '2-13',
    },
    {
        subControlId: '2-13-P-1-3',
        name: 'Disposal of cloud infrastructure hardware, in particular, storage equipment (external or internal), by adopting relevant legislation and best practices',
        controlId: '2-13-P-1',
        mainDomainId: 2,
        subDomainId: '2-13',
    },
    {
        subControlId: '2-14-P-1-1',
        name: 'Protecting information involved in application service transactions against possible risks (e.g.: incomplete transmission, mis-routing, unauthorized message alteration, unauthorized disclosure….)',
        controlId: '2-14-P-1',
        mainDomainId: 2,
        subDomainId: '2-14',
    },
    {
        subControlId: '2-15-P-3-1',
        name: 'Ensure well-defined ownership for cryptographic keys',
        controlId: '2-15-P-3',
        mainDomainId: 2,
        subDomainId: '2-15',
    },
    {
        subControlId: '2-15-P-3-2',
        name: 'A secure cryptographic key retrieval mechanism in case of cryptographic key lost (such as backup of keys and enforcement of trusted key storage, strictly external to cloud)',
        controlId: '2-15-P-3',
        mainDomainId: 2,
        subDomainId: '2-15',
    },
    {
        subControlId: '2-15-P-3-3',
        name: 'Activating and monitoring of all audit trails of keys',
        controlId: '2-15-P-3',
        mainDomainId: 2,
        subDomainId: '2-15',
    },
    {
        subControlId: '2-15-T-3-1',
        name: 'Ensure well-defined ownership for cryptographic keys',
        controlId: '2-15-T-3',
        mainDomainId: 2,
        subDomainId: '2-15',
    },
    {
        subControlId: '2-15-T-3-2',
        name: 'A secure data retrieval mechanism in case of cryptographic encryption key lost (such as backup of keys and enforcement of trusted key storage, strictly external to cloud)',
        controlId: '2-15-T-3',
        mainDomainId: 2,
        subDomainId: '2-15',
    },
    {
        subControlId: '2-16-P-3-1',
        name: 'Considering cybersecurity requirements of the Cloud Technology Stack and relevant systems in the design and implementation of the cloud computing services',
        controlId: '2-16-P-3',
        mainDomainId: 2,
        subDomainId: '2-16',
    },
    {
        subControlId: '2-16-P-3-2',
        name: 'Protecting system development environments, testing environments (including data used in testing environment), and integration platforms',
        controlId: '2-16-P-3',
        mainDomainId: 2,
        subDomainId: '2-16',
    },
    {
        subControlId: '2-17-P-3-1',
        name: 'Enforcement of sanitization of media, prior to disposal or reuse',
        controlId: '2-17-P-3',
        mainDomainId: 2,
        subDomainId: '2-17',
    },
    {
        subControlId: '2-17-P-3-2',
        name: 'Using secure means when disposing of media',
        controlId: '2-17-P-3',
        mainDomainId: 2,
        subDomainId: '2-17',
    },
    {
        subControlId: '2-17-P-3-3',
        name: 'Provision to maintain confidentiality and integrity of data on removable media',
        controlId: '2-17-P-3',
        mainDomainId: 2,
        subDomainId: '2-17',
    },
    {
        subControlId: '2-17-P-3-4',
        name: 'Human readable labelling of media, to explain its classification and the sensitivity of the information it contains',
        controlId: '2-17-P-3',
        mainDomainId: 2,
        subDomainId: '2-17',
    },
    {
        subControlId: '2-17-P-3-5',
        name: 'Controlled and physically secure storage of removable media',
        controlId: '2-17-P-3',
        mainDomainId: 2,
        subDomainId: '2-17',
    },
    {
        subControlId: '2-17-P-3-6',
        name: 'Restriction and control of usage of portable media inside the Cloud Technology Stack',
        controlId: '2-17-P-3',
        mainDomainId: 2,
        subDomainId: '2-17',
    },
    {
        subControlId: '3-1-P-1-1',
        name: 'Developing and implementing disaster recovery and business continuity procedures in a secure manner',
        controlId: '3-1-P-1',
        mainDomainId: 3,
        subDomainId: '3-1',
    },
    {
        subControlId: '3-1-P-1-2',
        name: 'Developing and implementing procedures to ensure resilience and continuity of cybersecurity systems dedicated to the protection of Cloud Technology Stack',
        controlId: '3-1-P-1',
        mainDomainId: 3,
        subDomainId: '3-1',
    },
    {
        subControlId: '3-1-T-1-1',
        name: 'Developing and implementing disaster recovery and business continuity procedures related to cloud computing, in a secure manner',
        controlId: '3-1-T-1',
        mainDomainId: 3,
        subDomainId: '3-1',
    },
    {
        subControlId: '4-1-P-1-1',
        name: "Ensure that the CSP fulfills NCA's requests to remove software or services, provided by third-party providers that may be considered a cybersecurity threat to national organizations, from the marketplace provided to CSTs",
        controlId: '4-1-P-1',
        mainDomainId: 4,
        subDomainId: '4-1',
    },
    {
        subControlId: '4-1-P-1-2',
        name: 'Requirement to provide security documentation for any equipment or services from suppliers and third-party providers',
        controlId: '4-1-P-1',
        mainDomainId: 4,
        subDomainId: '4-1',
    },
    {
        subControlId: '4-1-P-1-3',
        name: 'Third party providers compliant with law and regulatory requirements relevant to their scope',
        controlId: '4-1-P-1',
        mainDomainId: 4,
        subDomainId: '4-1',
    },
    {
        subControlId: '4-1-P-1-4',
        name: 'Risk management and security governance on third-party providers as part of general cybersecurity risk management and governance',
        controlId: '4-1-P-1',
        mainDomainId: 4,
        subDomainId: '4-1',
    },
];
async function validateSubControl(subControl) {
    // Validate sub-control ID format (e.g., "1-1-P-1-1")
    const subControlIdPattern = /^\d+-\d+-[A-Z]-\d+-\d+$/;
    if (!subControlIdPattern.test(subControl.subControlId)) {
        throw new Error(`Invalid sub-control ID format for ${subControl.subControlId}`);
    }
    // Validate parent control ID format (e.g., "1-1-P-1")
    const controlIdPattern = /^\d+-\d+-[A-Z]-\d+$/;
    if (!controlIdPattern.test(subControl.controlId)) {
        throw new Error(`Invalid parent control ID format for ${subControl.controlId}`);
    }
    // Check if sub-control ID already exists
    const existingSubControl = await SubControl_1.default.findOne({
        subControlId: subControl.subControlId,
    });
    if (existingSubControl) {
        throw new Error(`Sub-control ID ${subControl.subControlId} already exists`);
    }
}
async function importSubControls() {
    try {
        // Connect to MongoDB
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await (0, mongoose_1.connect)(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        // Validate all sub-controls first
        console.log('Validating sub-controls...');
        for (const subControl of subControlsToImport) {
            await validateSubControl(subControl);
        }
        // Import sub-controls
        console.log('Importing sub-controls...');
        const results = await Promise.all(subControlsToImport.map(async (subControl) => {
            try {
                const created = await SubControl_1.default.create(subControl);
                return {
                    status: 'success',
                    subControlId: subControl.subControlId,
                    _id: created._id,
                };
            }
            catch (error) {
                return {
                    status: 'error',
                    subControlId: subControl.subControlId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        }));
        // Log results
        console.log('\nImport Results:');
        console.log('---------------');
        results.forEach((result) => {
            if (result.status === 'success') {
                console.log(`✅ ${result.subControlId} imported successfully`);
            }
            else {
                console.log(`❌ ${result.subControlId} failed: ${result.error}`);
            }
        });
        const successful = results.filter((r) => r.status === 'success').length;
        const failed = results.filter((r) => r.status === 'error').length;
        console.log('\nSummary:');
        console.log(`Total: ${results.length}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${failed}`);
    }
    catch (error) {
        console.error('Import failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    finally {
        // Disconnect from MongoDB
        await (0, mongoose_1.disconnect)();
        console.log('Disconnected from MongoDB');
    }
}
// Don't execute automatically - wait for manual execution
exports.default = importSubControls;
