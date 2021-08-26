## Run 
- To run the project, define all the required env vars in a `.env` at the root of the project directory:
```bash
BASIC_AUTHORIZATION= # FUB Basic Auth Header (from Follow-Up Boss's API)
JWT_SECRET= # default: <secret key>
MONGODB_URI= # default: MONGO_HOST + IP + MONGO_PORT + jbg-admin
MONGO_HOST= # default: mongodb://
MONGO_PORT= # default: 27017
REDIS_TLS_URL
REDIS_URL
SMTP_PASS # email service login
SMTP_USER
```
- Install dependencies:
```bash
yarn
```
- Test the development server:
```bash
yarn development
```
