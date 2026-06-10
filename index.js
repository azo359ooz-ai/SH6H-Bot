const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// ===================== إعدادات البوت =====================
const config = {
    token: process.env.DISCORD_TOKEN,
    prefix: '!',
    color: '#FF69B4',
    geminiKey: process.env.GEMINI_API_KEY || '',
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// ===================== عند تشغيل البوت =====================
client.once('ready', () => {
    console.log(`✅ البوت ${client.user.tag} شغّال!`);
    client.user.setActivity('🎮 SH6H | !مساعدة', { type: ActivityType.Watching });
});

// ===================== ترحيب بالأعضاء الجدد (بدون إيموجي) =====================
client.on('guildMemberAdd', member => {
    const channel = member.guild.systemChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('عضو جديد!')
        .setDescription(`أهلاً وسهلاً **${member.user.username}** في سيرفر **${member.guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: 'SH6H Bot' })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// ===================== الأوامر =====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'مساعدة' || command === 'help') {
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('قائمة أوامر بوت SH6H')
            .addFields(
                { name: 'اخبار الالعاب', value: '`!أخبار`', inline: false },
                { name: 'العاب', value: '`!تخمين` - `!سؤال`', inline: false },
                { name: 'متفرقات', value: '`!نرد` - `!اختر` - `!عشوائي`', inline: false },
                { name: 'معلومات', value: '`!سيرفر` - `!مستخدم`', inline: false },
                { name: 'ذكاء اصطناعي', value: 'اذكر اسمي SH6H في رسالتك', inline: false },
            )
            .setFooter({ text: 'SH6H Bot' })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }

    else if (command === 'تخمين') {
        const number = Math.floor(Math.random() * 10) + 1;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('لعبة التخمين!')
            .setDescription('خمّن رقم من **1** إلى **10** - عندك 15 ثانية!');
        message.reply({ embeds: [embed] });

        const filter = m => m.author.id === message.author.id && !isNaN(m.content);
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });
        collector.on('collect', m => {
            if (parseInt(m.content) === number) {
                m.reply(`صح! الرقم كان **${number}**!`);
            } else {
                m.reply(`غلط! الرقم الصح كان **${number}**`);
            }
        });
        collector.on('end', collected => {
            if (collected.size === 0) message.reply(`انتهى الوقت! الرقم كان **${number}**`);
        });
    }

    else if (command === 'سؤال') {
        const questions = [
            { q: 'وش أول لعبة GTA طلعت؟', a: 'gta 1' },
            { q: 'وش اسم بطل لعبة Zelda؟', a: 'link' },
            { q: 'وش اسم الشركة اللي سوّت FIFA؟', a: 'ea' },
            { q: 'كم لاعب في Fortnite في نفس الوقت؟', a: '100' },
        ];
        const random = questions[Math.floor(Math.random() * questions.length)];
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('سؤال ثقافة العاب!')
            .setDescription(random.q)
            .setFooter({ text: 'عندك 30 ثانية تجاوب!' });
        message.reply({ embeds: [embed] });

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });
        collector.on('collect', m => {
            if (m.content.toLowerCase().includes(random.a)) {
                m.reply('إجابة صحيحة!');
            } else {
                m.reply(`إجابة خاطئة! الجواب: **${random.a}**`);
            }
        });
    }

    else if (command === 'نرد') {
        const result = Math.floor(Math.random() * 6) + 1;
        message.reply(`رميت النرد وطلع: **${result}**`);
    }

    else if (command === 'اختر') {
        if (args.length < 2) return message.reply('اكتب: `!اختر خيار1 خيار2`');
        const choice = args[Math.floor(Math.random() * args.length)];
        message.reply(`اخترت: **${choice}**`);
    }

    else if (command === 'عشوائي') {
        const max = parseInt(args[0]) || 100;
        const num = Math.floor(Math.random() * max) + 1;
        message.reply(`الرقم العشوائي: **${num}**`);
    }

    else if (command === 'سيرفر') {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`معلومات سيرفر ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'الاعضاء', value: `${guild.memberCount}`, inline: true },
                { name: 'تاريخ الإنشاء', value: guild.createdAt.toLocaleDateString('ar-SA'), inline: true },
            )
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }

    else if (command === 'مستخدم') {
        const user = message.author;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`معلومات ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'الايدي', value: user.id, inline: true },
                { name: 'تاريخ الإنشاء', value: user.createdAt.toLocaleDateString('ar-SA'), inline: true },
            )
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
});

// ===================== الذكاء الاصطناعي (Gemini) =====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content.startsWith(config.prefix)) return;

    const botMentioned = message.mentions.has(client.user);
    const nameInMessage = message.content.toLowerCase().includes('sh6h');

    if (!botMentioned && !nameInMessage) return;

    const userMessage = message.content
        .replace(/<@!?\d+>/g, '')
        .replace(/sh6h/gi, '')
        .trim();

    if (!userMessage) return message.reply('أهلاً! كيف أقدر أساعدك؟');

    try {
        message.channel.sendTyping();

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: 'أنت بوت ديسكورد اسمك SH6H. تتحدث بالعربية فقط. ردودك قصيرة ومفيدة. أنت بوت ألعاب وترفيه.' }]
                    },
                    contents: [{ parts: [{ text: userMessage }] }]
                })
            }
        );

        const data = await response.json();
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'معذرة، ما قدرت أجاوب!';
        message.reply(aiReply.substring(0, 1999));

    } catch (err) {
        console.error('Gemini Error:', err);
        message.reply('صار خطأ، جرب مرة ثانية!');
    }
});

// ===================== تشغيل البوت =====================
client.login(config.token);
