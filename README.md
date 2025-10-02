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

> POST /reports – Submit hazard reports

> GET /reports – Retrieve hazard data

> GET /alerts – Fetch real-time alerts

Screenshots

 <img width="1904" height="863" alt="Screenshot 2025-09-30 153733" src="https://github.com/user-attachments/assets/27243248-8e0b-4660-9f45-3821fb60740f" />

Real-time hazard reporting and mapping dashboard

<img width="1919" height="897" alt="Screenshot 2025-09-30 131937" src="https://github.com/user-attachments/assets/bb2d8a58-cceb-40bc-8d28-fe4e98b03c9d" />

Early Warning System with location and details

<img width="1892" height="920" alt="Screenshot 2025-09-30 150501" src="https://github.com/user-attachments/assets/94a4805b-45df-4c3a-b757-200a36a0e562" />

Community disaster reporting and verification page

Contributing: 

We welcome contributions from developers and ocean enthusiasts

Fork the repository:

> Create a feature branch (git checkout -b feature-name)

> Commit your changes (git commit -m "Add feature")

> Push the branch (git push origin feature-name)

> Open a Pull Request

To run this Project:

add .env.local front end file
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

Front-End :
npm install react-leaflet@4
npm install --save-dev typescript @types/react @types/node
npm run dev

Backend :
mvn spring-boot:run
