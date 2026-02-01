# Summary of the interaction
## Basic information
    Domain: Real Estate & Property Management 
    Problem statement:To design and develop a web-based Real Estate and Property Management Marketplace that enables users to buy, sell, rent, and manage properties through a centralized, secure, and user-friendly platform, making dependency on intermediaries (if needed)and improving transparency, efficiency, and accessibility in property transactions. 
    Date of interaction: 01-02-2026
    Mode of interaction: video call
    Duration (in-minutes): 33 minutes
    Publicly accessible Video link: https://drive.google.com/file/d/1iTViH7HT-oQkO2eHkI8FxkzBqOhqY9mQ/view?usp=sharing
## Domain Expert Details
    Role/ designation : SDE
    Experience in the domain : 6 months in truva.in website
    Nature of work : Developer
## Domain Context and Terminology
    The overall purpose of this problem statement is to digitize and streamline the land buying and selling process by providing a centralized web-based platform where buyers, sellers, and administrators can interact efficiently.
    To provide a single online marketplace for buying, selling, or renting land properties. To enable buyers and tenants to search, filter, and shortlist properties easily. To allow sellers/landowners to list and manage their properties digitally. To improve trust and transparency through document verification. To reduce fraud and disputes using verification and admin controls. To support efficient site visit scheduling between buyers and sellers.To improve overall user experience and decision-making in land transactions.

| Term                 | Definition                                                                                                       |
|----------------------|------------------------------------------------------------------------------------------------------------------|
| Property             | A physical real estate asset such as land, house, apartment, or commercial space offered for rent or sale.       |
| Property Listing     | A published record of a property containing its details, pricing intent, and availability status.                |
| Property Seeker      | An individual who searches for properties with the intent to rent or purchase.                                   |
| Seller               | An individual or entity that owns a property and lists it for sale or rent.                                      |
| Agent                | An authorized intermediary responsible for verifying listings, scheduling visits, and facilitating transactions. |
| Shortlist            | A temporary collection of properties saved by a property seeker for future reference.                            |
| Site Visit           | A scheduled physical inspection of a property coordinated through an agent.                                      |
| Site Visit Request   | A request made by a property seeker to visit a listed property at a preferred time.                              |
| Offer                | A formal proposal submitted by a property seeker to purchase a property.                                         |
| Rental Request       | A formal request submitted by a property seeker to rent a property under specified terms.                        |
| Listing Verification | The process of validating the authenticity and eligibility of a property listing.                                |
| Deal                 | A finalized agreement resulting from an accepted offer or rental request.                                        |
 
## Actors and Responsibilities
| Actor / Role            | Responsibilities                                                                                           |
|-------------------------|------------------------------------------------------------------------------------------------------------|
| Buyer                   | Searches properties, shortlists listings, requests site visits, and submits offers or rental requests.     |
| Seller                  | Lists properties, manages property details, and approves or rejects site visit requests.                   |
| Agent                   | Verifies property listings, schedules site visits, and facilitates communication between buyer and seller. |
| Verification Officer    | Reviews and validates property documents to ensure authenticity and legal compliance.                      |

## Core workflows
Workflow 1: Property Listing and Verification
Start condition:
          Seller submits a new property listing with required details and documents.
Steps involved (in order):
          Seller enters property details and uploads documents.
          System forwards the listing to the Agent.
          Agent reviews listing information.
          Verification Officer verifies ownership and legal documents.
          Agent approves or rejects the property listing.
Outcome / End condition :
          Property listing is approved and published, or rejected with a request for correction.

Workflow 2: Property Search and Site Visit Request
Start condition :
          Buyer logs into the system and searches for available properties.
Steps involved (in order) :
          Buyer applies search filters and browses listings.
          Buyer views property details.
          Buyer shortlists selected properties.
          Buyer submits a site visit request for a chosen property.
          System notifies the Seller and Agent.
Outcome / End condition :
          Site visit request is successfully submitted and awaits approval.

Workflow 3: Site Visit Approval and Scheduling
Start condition :
          A site visit request is received for an approved property listing.
Steps involved (in order) :
          Seller reviews the site visit request.
          Seller approves or rejects the request.
          If approved, Agent selects an available date and time.
          Agent schedules the site visit.
          System notifies Buyer and Seller of the schedule.
Outcome / End condition :
          Site visit is scheduled and confirmed, or the request is rejected.
## Rules, Constraints, and Exceptions
Document rules that govern how the domain operates.
Mandatory rules or policies :
          Every property listing must be verified before it is published on the platform.
          Only registered and authenticated users are allowed to request site visits or submit offers.
          A site visit cannot be scheduled without seller approval.
          Property documents must be uploaded and approved by the Verification Officer.
          Agents are responsible for coordinating communication between buyers and sellers.
          A deal can be finalized only after a verified listing and an accepted offer or rental request.
Constraints or limitations :
          The platform does not guarantee property availability after listing approval.
          Online payments, if supported, are limited to booking or token amounts only.
          Verification time depends on document accuracy and availability.
          Site visits are subject to seller availability and location constraints.
          Listings may be temporarily disabled during verification or dispute resolution.
Common exceptions or edge cases :
          Property documents may be incomplete or unclear, causing verification failure.
          Sellers may reject site visit requests due to personal or scheduling conflicts.
          Buyers may cancel site visits after scheduling.
          Multiple buyers may submit offers for the same property simultaneously.
          Listings may be withdrawn by sellers before deal completion.
Situations where things usually go wrong :
          Uploading incorrect or outdated property documents.
          Delays in verification due to manual document checking.
          Miscommunication between buyer and seller regarding visit timings.
          Properties remaining listed even after being sold offline.
          Users abandoning the process due to lack of trust or delayed responses.
## Current challenges and pain points
          Most difficult or inefficient parts of the process
          Manual verification of property documents is time-consuming and error-prone.
          Coordinating site visit schedules between buyers, sellers, and agents is inefficient.
          Tracking the real-time availability of properties is difficult.
          Managing communication across multiple stakeholders lacks transparency.
          Where delays, errors, or misunderstandings usually occur
          During document verification due to incomplete or unclear records.
          In site visit approvals when sellers respond late.
          In price negotiations due to lack of clear offer history.
          When property status is not updated after offline transactions.
          Information hardest to track or manage today
          Authentic ownership and legal status of properties.
          History of site visit requests and approvals.
          Current availability of listed properties.
          Status of offers and negotiations across multiple buyers.

 ## Assumptions & Clarifications 
Assumptions made by the team that were confirmed
          Buyers prefer online search and filtering over manual property discovery.
          Document verification is essential to build trust on the platform.
          Agents play a critical role in coordinating transactions.
          Site visits are a mandatory step before finalizing deals.
          Assumptions that were corrected
          Not all sellers are comfortable with fully online transactions.
          Verification cannot be fully automated and requires human intervention.
          Buyers do not always want direct communication with sellers.
          Pricing is often negotiable rather than fixed.
     