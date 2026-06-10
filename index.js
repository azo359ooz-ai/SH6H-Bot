const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

const config = {
    token: process.env.DISCORD_TOKEN,
    prefix: '!',
    color: '#FF69B4',
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// ===================== نظام التقارير =====================
const reportedImages = new Set();
const userReportCount = {};

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
        .setTitle('عضو جديد!')
        .setDescription(`أهلاً وسهلاً **${member.user.username}** في سيرفر **${member.guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: 'SH6H Bot' })
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// ===================== رصد الصور التلقائي =====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // رصد الصور التلقائي
    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        const isImage = attachment.contentType?.startsWith('image/');

        if (isImage) {
            const imageUrl = (attachment.name + attachment.size).toString(); // const imageUrl = attachment.url.split('?')[0]; // إزالة الـ token من الرابط

            if (reportedImages.has(imageUrl)) {
                await message.reply('❌ هذه الصورة مكررة! تم رفضها.');
            } else {
                reportedImages.add(imageUrl);
                const userId = message.author.id;
                userReportCount[userId] = (userReportCount[userId] || 0) + 1;
                await message.reply(`✅ تم تسجيل الصورة! مجموع صورك: **${userReportCount[userId]}**`);
            }
        }
    }

    // الأوامر
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ────────── !مساعدة ──────────
    if (command === 'مساعدة') {
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('قائمة أوامر بوت SH6H')
            .addFields(
                { name: '!أعلى', value: 'أكثر ناس أرسلوا صور', inline: false },
                { name: '!صوري', value: 'كم صورة أرسلت', inline: false },
                { name: '!تخمين', value: 'لعبة تخمين الرقم', inline: false },
                { name: '!سؤال', value: 'سؤال ثقافة ألعاب', inline: false },
                { name: '!نرد', value: 'رمي النرد', inline: false },
                { name: '!سيرفر', value: 'معلومات السيرفر', inline: false },
                { name: '!مستخدم', value: 'معلوماتك', inline: false },
            )
            .setFooter({ text: 'SH6H Bot' })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }

    // ────────── !أعلى ──────────
    else if (command === 'أعلى') {
        if (Object.keys(userReportCount).length === 0) {
            return message.reply('ما في أحد أرسل صور بعد!');
        }

        const sorted = Object.entries(userReportCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('أكثر ناس أرسلوا صور')
            .setTimestamp();

        let description = '';
        for (let i = 0; i < sorted.length; i++) {
            const [userId, count] = sorted[i];
            description += `**${i + 1}.** <@${userId}> - **${count}** صورة\n`;
        }

        embed.setDescription(description);
        message.reply({ embeds: [embed] });
    }

    // ────────── !صوري ──────────
    else if (command === 'صوري') {
        const count = userReportCount[message.author.id] || 0;
        message.reply(`أرسلت **${count}** صورة حتى الآن!`);
    }

    // ────────── !تخمين ──────────
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

    // ────────── !سؤال ──────────
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
            .setTitle('سؤال ثقافة ألعاب!')
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

    // ────────── !نرد ──────────
    else if (command === 'نرد') {
        const result = Math.floor(Math.random() * 6) + 1;
        message.reply(`رميت النرد وطلع: **${result}**`);
    }

    // ────────── !سيرفر ──────────
    else if (command === 'سيرفر') {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`معلومات سيرفر ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'الأعضاء', value: `${guild.memberCount}`, inline: true },
                { name: 'تاريخ الإنشاء', value: guild.createdAt.toLocaleDateString('ar-SA'), inline: true },
            )
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }

    // ────────── !مستخدم ──────────
    else if (command === 'مستخدم') {
        const user = message.author;
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`معلومات ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'الآيدي', value: user.id, inline: true },
                { name: 'تاريخ الإنشاء', value: user.createdAt.toLocaleDateString('ar-SA'), inline: true },
            )
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
});

// ===================== تشغيل البوت =====================
client.login(config.token);
