const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// ===================== إعدادات البوت =====================
const config = {
    token: 'ضع_التوكن_هنا',  // ← ضع توكنك هنا
    prefix: '!',
    color: '#FF69B4',  // لون وردي
    newsApiKey: 'ضع_مفتاح_API_هنا', // من newsapi.org (مجاني)
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

// ===================== ترحيب بالأعضاء الجدد =====================
client.on('guildMemberAdd', member => {
    const channel = member.guild.systemChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎉 عضو جديد!')
        .setDescription(`أهلاً وسهلاً **${member.user.username}** في سيرفر **${member.guild.name}**! 🌸`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: `SH6H Bot` })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// ===================== الأوامر =====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ────────── !مساعدة ──────────
    if (command === 'مساعدة' || command === 'help') {
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('🤖 قائمة أوامر بوت SH6H')
            .setDescription('جميع الأوامر باللغة العربية! 🇸🇦')
            .addFields(
                { name: '📰 أخبار الألعاب', value: '`!أخبار` - أحدث أخبار الألعاب', inline: false },
                { name: '🎮 ألعاب', value: '`!تخمين` - لعبة تخمين الرقم\n`!سؤال` - سؤال عشوائي', inline: false },
                { name: '🎲 متفرقات', value: '`!نرد` - رمي النرد\n`!اختر` - اختيار عشوائي\n`!عشوائي` - رقم عشوائي', inline: false },
                { name: '📊 معلومات', value: '`!سيرفر` - معلومات السيرفر\n`!مستخدم` - معلوماتك', inline: false },
            )
            .setFooter({ text: 'SH6H Bot | زياد' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    // ────────── !أخبار ──────────
    else if (command === 'أخبار') {
        try {
            const res = await fetch(
                `https://newsapi.org/v2/everything?q=games+gaming&language=ar&pageSize=5&sortBy=publishedAt&apiKey=${config.newsApiKey}`
            );
            const data = await res.json();

            if (!data.articles || data.articles.length === 0) {
                return message.reply('❌ ما لقيت أخبار الحين، جرب بعد شوي!');
            }

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('🎮 أحدث أخبار الألعاب')
                .setTimestamp();

            data.articles.slice(0, 5).forEach((article, i) => {
                embed.addFields({
                    name: `${i + 1}. ${article.title}`,
                    value: `[اقرأ المزيد](${article.url})`,
                    inline: false
                });
            });

            message.reply({ embeds: [embed] });
        } catch (err) {
            message.reply('❌ صار خطأ في جلب الأخبار!');
        }
    }

    // ────────── !تخمين ──────────
    else if (command === 'تخمين') {
        const number = Math.floor(Math.random() * 10) + 1;

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('🎯 لعبة التخمين!')
            .setDescription('خمّن رقم من **1** إلى **10**\nعندك **3 ثواني** تكتب رقمك! ⏱️')

        message.reply({ embeds: [embed] });

        const filter = m => m.author.id === message.author.id && !isNaN(m.content);
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            if (parseInt(m.content) === number) {
                m.reply(`🎉 صح! الرقم كان **${number}**! أنت ذكي يا ${message.author.username}!`);
            } else {
                m.reply(`❌ غلط! الرقم الصح كان **${number}**، حظ أوفر المرة الجاية!`);
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.reply(`⏱️ انتهى الوقت! الرقم كان **${number}**`);
            }
        });
    }

    // ────────── !سؤال ──────────
    else if (command === 'سؤال') {
        const questions = [
            { q: '🎮 وش أول لعبة GTA طلعت؟', a: 'gta 1' },
            { q: '🎮 كم عمر Minecraft؟', a: '15' },
            { q: '🎮 وش اسم بطل لعبة Zelda؟', a: 'link' },
            { q: '🎮 وش اسم الشركة اللي سوّت FIFA؟', a: 'ea' },
            { q: '🎮 كم لاعب في Fortnite في نفس الوقت؟', a: '100' },
        ];

        const random = questions[Math.floor(Math.random() * questions.length)];

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('❓ سؤال ثقافة ألعاب!')
            .setDescription(random.q)
            .setFooter({ text: 'عندك 30 ثانية تجاوب!' })

        message.reply({ embeds: [embed] });

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', m => {
            if (m.content.toLowerCase().includes(random.a)) {
                m.reply(`✅ إجابة صحيحة! 🎉 أنت نجم يا ${message.author.username}!`);
            } else {
                m.reply(`❌ إجابة خاطئة! الجواب الصح: **${random.a}**`);
            }
        });
    }

    // ────────── !نرد ──────────
    else if (command === 'نرد') {
        const result = Math.floor(Math.random() * 6) + 1;
        const dice = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
        message.reply(`🎲 رميت النرد وطلع: **${dice[result - 1]}** (${result})`);
    }

    // ────────── !اختر ──────────
    else if (command === 'اختر') {
        if (args.length < 2) return message.reply('❌ اكتب: `!اختر خيار1 خيار2`');
        const choice = args[Math.floor(Math.random() * args.length)];
        message.reply(`🎯 اخترت: **${choice}**`);
    }

    // ────────── !عشوائي ──────────
    else if (command === 'عشوائي') {
        const max = parseInt(args[0]) || 100;
        const num = Math.floor(Math.random() * max) + 1;
        message.reply(`🔢 الرقم العشوائي: **${num}** (من 1 إلى ${max})`);
    }

    // ────────── !سيرفر ──────────
    else if (command === 'سيرفر') {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`📊 معلومات سيرفر ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👑 الأونر', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true },
                { name: '📅 تاريخ الإنشاء', value: guild.createdAt.toLocaleDateString('ar-SA'), inline: true },
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    // ────────── !مستخدم ──────────
    else if (command === 'مستخدم') {
        const user = message.author;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`👤 معلومات ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '🆔 الآيدي', value: user.id, inline: true },
                { name: '📅 تاريخ الإنشاء', value: user.createdAt.toLocaleDateString('ar-SA'), inline: true },
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
});

// ===================== تشغيل البوت =====================
client.login(config.token);
