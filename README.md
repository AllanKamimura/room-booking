# Room Booking Dashboard

A visually appealing, animated, and responsive dashboard for displaying meeting room bookings in your office. 

Designed for big screens, but works on any device.

## Features

- **Animated, visually appealing table**: Each row is a room, columns are hours, bookings are colored blocks with random animations.
- **Responsive design**: Works on large displays, tablets, and mobile devices.
- **Current time indicator**: Vertical line shows the current time.
- **Live date/time**: Displayed in the top-right corner.
- **Data from API**: Fetches rooms and bookings from configurable endpoints.
- **Backend with AWS Lambda (Python) + API Gateway**: Easily deployable serverless backend using AWS SAM.

---

## Frontend (React + Vite)

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the API base URL in a `.env` file:
   ```
   ROOM_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/Prod
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker

Build and run the app in a container:
```bash
docker build -t room-booking .
docker run -p 80:80 -e VITE_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/Prod room-booking
```

### Docker Compose

Edit `docker-compose.yml` to set your API base URL, then:
```bash
docker-compose up --build
```

---

## Backend (AWS Lambda + API Gateway, Python, AWS SAM)

### Structure

- `sam-backend/template.yaml`: AWS SAM template
- `sam-backend/src/rooms/app.py`: Lambda for `/rooms`
- `sam-backend/src/booking/app.py`: Lambda for `/booking`

### Local Development

1. Install [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
2. Build and run locally:
   ```bash
   cd sam-backend
   sam build --use-container
   sam local start-api
   ```
   The API will be available at [http://127.0.0.1:3000](http://127.0.0.1:3000).

### Deploy to AWS

```bash
cd sam-backend
sam build
sam deploy --guided
```
After deployment, set your frontend's `ROOM_API_BASE_URL` to the deployed API Gateway URL.

---

## Environment Variables

- `ROOM_API_BASE_URL`: Base URL for the backend API (e.g., https://your-api-id.execute-api.region.amazonaws.com/Prod)

---

## Customization

- To add or change rooms/colors, update the backend `/rooms` Lambda.
- To change booking logic, update the backend `/booking` Lambda.
- The frontend will automatically update every 10 minutes between 06:00 and 18:00.

---

## Responsive & Big Screen Ready

- The dashboard is designed for big screens but adapts to any device.
- Animations and layout scale down for tablets and mobile.

---

## License

MIT
