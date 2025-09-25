Oceanberg – Ocean Hazard & Crowdsourcing App

Oceanberg is a user-friendly platform designed to monitor, report, and analyze ocean hazards in real-time. It leverages crowdsourced data and predictive analytics to enhance maritime safety and environmental awareness. The app empowers users—fishermen, sailors, and environmental enthusiasts—to contribute observations while providing actionable insights to authorities and communities.

Key Features:

> Crowdsourced Hazard Reporting: Users can report hazards such as storms, high waves, or pollution events.

> Real-time Alerts: Notifications about imminent hazards based on user reports and predictive models.

> Interactive Maps & Charts: Visualize hazard trends and locations in real-time.

> Community Collaboration: Validate reports and engage with other users.

> Predictive Analytics: AI-powered forecasting for proactive hazard management.

Technology Stack:

> Backend: Spring Boot (Java 17+)

> Database: MongoDBfor development

> Frontend: React

> Mapping & Visualization: Google Maps API / Leaflet.js

Getting Started (Spring Boot / React):
Follow these steps to set up the Oceanberg backend locally:

> Clone the repository:
git clone https://github.com/nithish8711/oceanberg.git
cd oceanberg

> Install dependencies:
Ensure Java 17+ and Maven are installed. Maven will manage dependencies.

> Configure environment variables:
Add database URL, credentials, and API keys in src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/oceanberg

spring.datasource.username=root

spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update

> Build the application:
npm install /
mvn clean install

> Run the application:
npm start /
mvn spring-boot:run /
Default URL: http://localhost:8080

Test API Endpoints:
Use Postman or HTTP clients to test endpoints like:
POST /reports – Submit hazard reports
GET /reports – Retrieve hazard data
GET /alerts – Fetch real-time alerts

Screenshots

<img width="1907" height="896" alt="image" src="https://github.com/user-attachments/assets/557fa395-9592-4ac8-8928-3acbfa6967f5" />

Real-time hazard reporting and mapping dashboard

<img width="1904" height="914" alt="image" src="https://github.com/user-attachments/assets/0472ac7d-3863-4893-b0e8-0c1371ee58ad" />

Early Warning System with location and details

Contributing: 

We welcome contributions from developers and ocean enthusiasts

Fork the repository:

> Create a feature branch (git checkout -b feature-name)

> Commit your changes (git commit -m "Add feature")

> Push the branch (git push origin feature-name)

> Open a Pull Request
