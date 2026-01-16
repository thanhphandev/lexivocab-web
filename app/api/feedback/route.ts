import { NextResponse } from 'next/server';
import { Telegraf, Input } from 'telegraf';

/**
 * Escapes special characters for Telegram Markdown V1
 * Characters that need escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
function escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const type = formData.get('type') as string;
        const reason = formData.get('reason') as string | null;
        const message = formData.get('message') as string | null;
        const contact = formData.get('contact') as string | null;
        const rating = formData.get('rating') as string | null;
        const metadataRaw = formData.get('metadata') as string | null;
        const images = formData.getAll('images') as File[];

        // Parse metadata if present
        let metadata: Record<string, string> = {};
        if (metadataRaw) {
            try {
                metadata = JSON.parse(metadataRaw);
            } catch {
                // Ignore parse errors
            }
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.warn('Telegram credentials not configured');
            return NextResponse.json({ success: true });
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
        text += `📅 Time: ${escapeMarkdown(date)}\n`;
        text += `--------------------------------\n`;

        if (reason && reason !== 'null') text += `🏷️ *Reason:* ${escapeMarkdown(reason)}\n`;
        if (rating && rating !== 'null') text += `⭐ *Rating:* ${escapeMarkdown(rating)}/5\n`;
        if (message) text += `💬 *Message:* \n${escapeMarkdown(message)}\n`;
        if (contact) text += `📧 *Contact:* ${escapeMarkdown(contact)}\n`;

        // Add metadata section if available
        if (Object.keys(metadata).length > 0) {
            text += `--------------------------------\n`;
            text += `📊 *Environment:*\n`;
            if (metadata.browser) text += `   🌐 Browser: ${escapeMarkdown(metadata.browser)}\n`;
            if (metadata.os) text += `   💻 OS: ${escapeMarkdown(metadata.os)}\n`;
            if (metadata.extVersion && metadata.extVersion !== 'N/A') {
                text += `   📦 Ext Version: ${escapeMarkdown(metadata.extVersion)}\n`;
            }
            if (metadata.language) text += `   🌍 Language: ${escapeMarkdown(metadata.language)}\n`;
            if (metadata.screen) text += `   📐 Screen: ${escapeMarkdown(metadata.screen)}\n`;
            if (metadata.locale) text += `   🏳️ Locale: ${escapeMarkdown(metadata.locale)}\n`;
        }

        text += `--------------------------------\n`;

        if (images && images.length > 0) {
            const validImages = images.filter(img => img.size > 0);

            if (validImages.length === 1) {
                const image = validImages[0];
                const buffer = Buffer.from(await image.arrayBuffer());
                await bot.telegram.sendPhoto(chatId, Input.fromBuffer(buffer, image.name || 'screenshot.png'), {
                    caption: text,
                    parse_mode: 'Markdown'
                });
            } else if (validImages.length > 1) {
                const mediaGroup = await Promise.all(validImages.map(async (image, index) => {
                    const buffer = Buffer.from(await image.arrayBuffer());
                    return {
                        type: 'photo' as const,
                        media: Input.fromBuffer(buffer, image.name || `screenshot_${index}.png`),
                        caption: index === 0 ? text : '',
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
        return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
    }
}
