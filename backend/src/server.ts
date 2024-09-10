import app from './app';
import 'dotenv';
import './jobs/acsInformJob';
import './jobs/scoresJob';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log( `listening on ${PORT}`));