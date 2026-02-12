const axios = require('axios');

async function testFullFlow() {
    try {
        console.log('=== TESTING FULL API FLOW ===\n');

        // Call the actual backend API
        const response = await axios.get('https://api.ethiopianitpark.et/api/newsf');

        console.log('✅ Backend responded successfully\n');
        console.log('Response structure:', {
            success: response.data.success,
            newsCount: response.data.news?.length || 0
        });

        if (response.data.news && response.data.news.length > 0) {
            console.log('\n=== FIRST NEWS ITEM ===');
            const firstNews = response.data.news[0];
            console.log('Title:', firstNews.title.substring(0, 60) + '...');
            console.log('Image field type:', typeof firstNews.image);
            console.log('Image field value:', firstNews.image);
            console.log('Is Array?:', Array.isArray(firstNews.image));

            if (Array.isArray(firstNews.image)) {
                console.log('Array length:', firstNews.image.length);
                console.log('First element:', firstNews.image[0]);
                console.log('First element type:', typeof firstNews.image[0]);
            }

            console.log('\n=== SECOND NEWS ITEM ===');
            if (response.data.news.length > 1) {
                const secondNews = response.data.news[1];
                console.log('Title:', secondNews.title.substring(0, 60) + '...');
                console.log('Image field type:', typeof secondNews.image);
                console.log('Image field value:', secondNews.image);
                console.log('Is Array?:', Array.isArray(secondNews.image));

                if (Array.isArray(secondNews.image)) {
                    console.log('Array length:', secondNews.image.length);
                    console.log('First element:', secondNews.image[0]);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFullFlow();
