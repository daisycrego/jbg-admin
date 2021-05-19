## Contributions
- Initial code came from https://github.com/shamahoque/mern-skeleton, props to Shama Hoque

## Run 
- To run the project, first define all the required env vars in a `.env` at the root of the project directory:
```bash
PORT= // default: 3000
NODE_ENV= // default: development
JWT_SECRET= // default: YOUR_secret_key
MONGODB_URI= // default: MONGO_HOST + IP + MONGO_PORT + jbg-admin
MONGO_HOST= // default: mongodb://
MONGO_PORT= // default: 27017
IP= // default: localhost
```
- Install dependencies:
```bash
yarn
```
- Test the development server:
```bash
yarn development
```
