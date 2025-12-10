import cron from 'node-cron';
import { paymentService } from '../services/payment.service';

export const initializeScheduler = () => {
    console.log('Initializing Scheduler...');

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily payout job...');
        try {
            await paymentService.processPayouts();
        } catch (error) {
            console.error('Error running daily payout job:', error);
        }
    });
    
    console.log('Scheduler initialized: Daily Payout Job set for 00:00.');
};
