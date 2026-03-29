# Bookstore System

Ett fullstack-projekt för att hantera ett bibliotekssystem med böcker, kunder, författare och lån.
Systemet innehåller även en kalender där alla lån visualiseras över tid.

---

## Funktioner

* Hantera böcker och bokkopior
* Skapa och hantera kunder
* Lägga till författare
* Skapa lån med start- och slutdatum
* Visa lån i en kalender
* Se om en bok är tillgänglig eller utlånad

---

## Teknik

**Frontend**

* React (TypeScript)
* SCSS

**Backend**

* Node.js
* Express

**Databas**

* PostgreSQL

---

## Installation

### 1. Klona projektet

```bash
git clone https://github.com/AntonEi/bookstore-system.git
cd bookstore-system
```

---

### 2. Sätt upp databasen

Kör SQL-schemat:


Lägg sedan in testdata:


---

### 3. Starta backend

```bash
cd server
npm install
node server.js
```

Servern körs på:

```
http://localhost:5000
```

API finns för bland annat:

* Böcker
* Lån
* Kunder
* Författare



---

### 4. Starta frontend

```bash
cd client
npm install
npm start
```

---

## Struktur

```
client/    → frontend (React)
server/    → backend (Express)
database/  → SQL-filer
```

---

## Översikt

Systemet är uppbyggt så att:

* Frontend hämtar data via API från backend
* Backend kommunicerar med PostgreSQL
* Stored procedures används för att skapa data
* Triggers uppdaterar bokstatus automatiskt

Kalendern visar alla lån per bokkopia och gör det möjligt att se när böcker är upptagna.



---

## Författare

### Anton Eriksson 
### Lucas Wenehult
