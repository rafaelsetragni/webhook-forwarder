import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// Read target webhook URLs from environment
const targets = {
    'syn-kambam': process.env.TARGET_WEBHOOK_SYN_KAMBAM,
    'syn-frontend': process.env.TARGET_WEBHOOK_SYN_FRONTEND,
    'syn-backend': process.env.TARGET_WEBHOOK_SYN_BACKEND,
};

/**
 * Forward a webhook payload to the specified target URL.
 * @param {string} targetName - The name of the target (key in `targets`)
 * @param {object} payload - The request body to forward
 * @returns {Promise<number>} - HTTP status from the forwarded request
 */
async function forwardWebhook(targetName, payload) {
    const url = targets[targetName];
    if (!url) throw new Error(`Target webhook not configured: ${targetName}`);

    const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    return response.status;
}

// Create endpoints dynamically for each webhook target
Object.keys(targets).forEach((target) => {
    app.post(`/webhook/${target}`, async (req, res) => {
        try {
            const status = await forwardWebhook(target, req.body);
            res.status(status).send(`Webhook forwarded to ${target}`);
        } catch (err) {
            console.error(`Error forwarding to ${target}:`, err.message);
            res.status(500).send(`Failed to forward webhook to ${target}`);
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Webhook forwarder listening on port ${PORT}`));