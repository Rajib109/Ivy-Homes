```markdown
# Ivy Homes Frontend & API Analysis

This repository contains the frontend application and data analysis for the Ivy Homes engineering assignment. 

Tools used: **[Insert Stack, e.g., React, Vite, Tailwind CSS]**, **[Insert LLMs used, e.g., Claude 3.5 Sonnet for initial UI boilerplate, GPT-4o for SQL query generation]**.

## How to run it

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Rajib109/Ivy-Homes.git
   cd Ivy-Homes

```

2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the root directory and add your API key:
```env
VITE_API_KEY=IVY26-0F408E87FC93

```


4. Start the development server:
```bash
npm run dev

```


5. Open `http://localhost:5173` in your browser. Use the provided demo credentials to log in.

## How I worked out what to distrust, and what I did about it

My first step was ignoring the frontend entirely. I wrote a Node script to bypass the pagination limits, pulling all listings, rentals, and projects into a local SQLite database. This allowed me to treat the API payload as ground truth and run SQL queries against it to test the documentation's claims.

I categorized my distrust into two areas and handled them differently:

1. **Structural API Lies (Endpoints, Pagination, Filters)**
I tested the documentation's behavioral claims via Postman and unit tests. When the UI requests filtered data, the interceptor fetches the payload and applies the missing filters client-side before returning the data to the components.
2. **Data Integrity Lies (Corrupt data, Frauds, Duplicates)**
I assumed sellers/agents would input garbage data. I ran SQL aggregations looking for physical impossibilities and exact matches across different `listing_id`s. When rendering the UI, particularly the Insights dashboard, I chose to explicitly expose these anomalies (e.g., displaying a "Data Confidence Score") rather than silently hiding the fake records, as a real estate operations team would need visibility into platform fraud.

## What I checked that turned out to be fine

Finding the anomalies required testing hypotheses that ultimately proved false. Here are a few things I suspected were broken, but the API handled correctly:

* **Cross-Account Favourites Vulnerability (IDOR):** Because the documentation mentioned the API was rushed, I suspected the `/v1/favourites` endpoint might lack authorization checks. I logged in as `demo1`, saved a listing, and tried to issue a `DELETE` request for that listing using `demo2`'s token. The server correctly threw a 403/404, proving tenant isolation works perfectly.
* **Price Standardization (Not Fraud):** I noticed several distinct listings in the same project with the exact same `carpet_area` and identical `price`, down to the rupee. My initial hypothesis was that these were duplicate/fraudulent listings trying to dominate the search feed. However, cross-referencing their `floor` and `facing_direction` revealed they were distinct units. Builders simply use rigid price matrices for identical floorplans.
* **Negative Pagination:** I hypothesized that passing `page=-1` or `limit=9999` would crash the database or return the entire dataset in one giant payload, overriding the max limit of 200. The API correctly defaulted to standard parameters and returned a 400 Bad Request, proving the data validation layer is solid.

## What I would do with another two days

1. **Runtime Schema Validation:** I would implement `Zod` in the API fetching layer. Right now, if the API suddenly changes a number field to a string, the frontend might break silently. Zod would catch type mismatches at the boundary and log them to an error tracking service.
2. **Advanced Data Visualization:** The current Insights screen uses basic HTML/CSS tables. Given more time, I would integrate `Recharts` or `Chart.js` to build scatter plots mapping `carpet_area` against `price` to visually highlight the extreme outliers (the fake/corrupt listings) for the operations team.
3. **Optimistic UI Updates:** For the Favorites functionality, the current implementation waits for the `POST` request to resolve before toggling the heart icon. I would update this to an optimistic UI pattern, providing instant feedback to the user and rolling back if the network request fails.