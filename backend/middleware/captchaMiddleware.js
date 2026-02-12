const axios = require('axios');

const verifyCaptcha = async (req, res, next) => {
    // Skip captcha for development if needed, but for production it's mandatory
    if (process.env.NODE_ENV === 'development' && !process.env.RECAPTCHA_SECRET_KEY) {
        console.warn('[SECURITY] reCAPTCHA validation skipped in development (RECAPTCHA_SECRET_KEY missing)');
        return next();
    }

    const { captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({
            success: false,
            message: 'reCAPTCHA token is required.'
        });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
        );

        if (response.data.success) {
            next();
        } else {
            console.error('[SECURITY] reCAPTCHA validation failed:', response.data['error-codes']);
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA validation failed. Please try again.'
            });
        }
    } catch (error) {
        console.error('[SECURITY] reCAPTCHA server error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error verifying reCAPTCHA.'
        });
    }
};

module.exports = verifyCaptcha;
