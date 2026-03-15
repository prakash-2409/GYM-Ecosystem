import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { apiLimiter } from './middleware/rate-limit';
import routes from './routes';

// Cron jobs
import { startFeeReminderJob } from './jobs/feeReminder.job';
import { startFeeOverdueJob } from './jobs/feeOverdue.job';
import { startPlanExpiryJob } from './jobs/planExpiry.job';
import { startInactivityJob } from './jobs/inactivity.job';
import { startBirthdayJob } from './jobs/birthday.job';
import { startWeeklySummaryJob } from './jobs/weeklySummary.job';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: [env.WEB_URL, /\.mygymapp\.in$/],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('short'));
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

app.listen(env.API_PORT, () => {
  console.log(`GymStack API running on port ${env.API_PORT}`);

  // Start cron jobs
  startFeeReminderJob();
  startFeeOverdueJob();
  startPlanExpiryJob();
  startInactivityJob();
  startBirthdayJob();
  startWeeklySummaryJob();
  console.log('All cron jobs started');
});

export default app;
