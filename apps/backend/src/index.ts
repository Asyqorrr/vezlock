import express from 'express';
import cors from 'cors';
import { User } from '@vezlock/shared';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'backend' });
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
