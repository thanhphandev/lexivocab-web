import { NextResponse } from 'next/server';
import { Telegraf, Input } from 'telegraf';

export async function POST(request: Request) {
    try {
        // Check Content-Type to determine how to parse the body
        const contentType = request.headers.get('content-type') || '';

        let type: string | null = null;
        let reason: string | null = null;
        let message: string | null = null;
        let contact: string | null = null;
        let rating: string | null = null;
        let images: File[] = [];

        if (contentType.includes('multipart/form-data')) {
            // Handle FormData
            const formData = await request.formData();
            type = formData.get('type') as string;
            reason = formData.get('reason') as string;
            message = formData.get('message') as string;
            contact = formData.get('contact') as string;
            rating = formData.get('rating') as string;
            images = formData.getAll('images') as File[];
        } else if (contentType.includes('application/json')) {
            // Handle JSON
            const json = await request.json();
            type = json.type;
            reason = json.reason;
            message = json.message;
            contact = json.contact;
            rating = json.rating?.toString();
        } else {
            // Try FormData first, fallback to JSON
            try {
                const formData = await request.formData();
                type = formData.get('type') as string;
                reason = formData.get('reason') as string;
                message = formData.get('message') as string;
                contact = formData.get('contact') as string;
                rating = formData.get('rating') as string;
                images = formData.getAll('images') as File[];
            } catch {
                const json = await request.json();
                type = json.type;
                reason = json.reason;
                message = json.message;
                contact = json.contact;
                rating = json.rating?.toString();
            }
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.warn('Telegram credentials not configured');
            return NextResponse.json({ success: true, warning: 'Configuration missing' });
        }

        const bot = new Telegraf(botToken);

        let icon = '📝';
        let title = 'Feedback Received';

        if (type === 'uninstall') {
            icon = '💔';
            title = 'UNINSTALL FEEDBACK';
        } else if (type === 'bug') {
            icon = '🐛';
            title = 'BUG REPORT';
        } else if (type === 'feature') {
            icon = '💡';
            title = 'FEATURE REQUEST';
        }

        const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });

        let text = `${icon} *${title}*\n`;
        text += `📅 Time: ${date}\n`;
        text += `--------------------------------\n`;

        if (reason && reason !== 'null') text += `🏷️ *Reason:* ${reason}\n`;
        if (rating && rating !== 'null') text += `⭐ *Rating:* ${rating}/5\n`;
        if (message) text += `💬 *Message:* \n${message}\n`;
        if (contact) text += `📧 *Contact:* ${contact}\n`;

        text += `--------------------------------\n`;

        if (images && images.length > 0) {
            const validImages = images.filter(img => img.size > 0);

            if (validImages.length === 1) {
                // Single image
                const image = validImages[0];
                const buffer = Buffer.from(await image.arrayBuffer());
                await bot.telegram.sendPhoto(chatId, Input.fromBuffer(buffer, image.name || 'screenshot.png'), {
                    caption: text,
                    parse_mode: 'Markdown'
                });
            } else if (validImages.length > 1) {
                // Multiple images (Media Group)
                const mediaGroup = await Promise.all(validImages.map(async (image, index) => {
                    const buffer = Buffer.from(await image.arrayBuffer());
                    return {
                        type: 'photo' as const,
                        media: Input.fromBuffer(buffer, image.name || `screenshot_${index}.png`),
                        caption: index === 0 ? text : '', // Attach caption only to the first image
                        parse_mode: 'Markdown' as const
                    };
                }));

                await bot.telegram.sendMediaGroup(chatId, mediaGroup);
            } else {
                await bot.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' });
            }
        } else {
            await bot.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error handling feedback:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
