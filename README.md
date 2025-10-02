# 🌊 Oceanberg – Ocean Hazard & Crowdsourcing App

Oceanberg is a user-friendly platform designed to **monitor, report, and analyze ocean hazards in real-time**.  
It leverages **crowdsourced data** and **predictive analytics** to enhance **maritime safety** and **environmental awareness**.  

The app empowers users—fishermen, sailors, and environmental enthusiasts—to contribute observations, while providing actionable insights to authorities and communities.

---

## 🚀 Key Features

- **Crowdsourced Hazard Reporting** – Users can report hazards such as storms, high waves, or pollution events.  
- **Real-time Alerts** – Notifications about imminent hazards based on user reports and predictive models.  
- **Interactive Maps & Charts** – Visualize hazard trends and locations in real-time.  
- **Community Collaboration** – Validate reports and engage with other users.  
- **Predictive Analytics** – AI-powered forecasting for proactive hazard management.  

---

## 🛠 Technology Stack

- **Backend:** Spring Boot (Java 17+)  
- **Database:** MongoDB (development)  
- **Frontend:** React  
- **Mapping & Visualization:** Google Maps API / Leaflet.js  

---

## ⚙️ Getting Started (Spring Boot / React)

### 1. Clone the repository
```bash
git clone https://github.com/nithish8711/oceanberg.git
cd oceanberg
2. Install dependencies
Ensure Java 17+ and Maven are installed.

Maven will handle backend dependencies.

For frontend, install Node.js dependencies.

bash
Copy code
npm install
mvn clean install
3. Configure environment variables
Edit src/main/resources/application.properties for the backend:

properties
Copy code
spring.datasource.url=jdbc:mysql://localhost:3306/oceanberg
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
Add a .env.local file for the frontend:

env
Copy code
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
4. Build & Run the Application
Frontend:

bash
Copy code
npm run dev
Backend:

bash
Copy code
mvn spring-boot:run
Default backend URL: http://localhost:8080

📡 Test API Endpoints
Use Postman or any HTTP client:

POST /reports → Submit hazard reports

GET /reports → Retrieve hazard data

GET /alerts → Fetch real-time alerts

🖼 Screenshots
Real-time hazard reporting and mapping dashboard
<img width="1904" height="863" alt="Screenshot" src="https://github.com/user-attachments/assets/27243248-8e0b-4660-9f45-3821fb60740f" />
Early Warning System with location and details
<img width="1919" height="897" alt="Screenshot" src="https://github.com/user-attachments/assets/bb2d8a58-cceb-40bc-8d28-fe4e98b03c9d" />
Community disaster reporting and verification page
<img width="1892" height="920" alt="Screenshot" src="https://github.com/user-attachments/assets/94a4805b-45df-4c3a-b757-200a36a0e562" />
🤝 Contributing
We welcome contributions from developers and ocean enthusiasts!

Fork the repository

Create a feature branch

bash
Copy code
git checkout -b feature-name
Commit your changes

bash
Copy code
git commit -m "Add feature"
Push to the branch

bash
Copy code
git push origin feature-name
Open a Pull Request

📌 Frontend Setup
bash
Copy code
npm install react-leaflet@4
npm install --save-dev typescript @types/react @types/node
Run locally:

bash
Copy code
npm run dev
📌 Backend Setup
Run Spring Boot backend:

bash
Copy code
mvn spring-boot:run
📜 License
This project is part of the Oceanberg – Ocean Hazard & Crowdsourcing System.
Feel free to use and adapt with proper attribution.
