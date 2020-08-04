const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

bot.on('ready', () => {

    console.log('On')
})

bot.on('message', async message => {

    if (message.author.bot) return;

    let prefix = '!'
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);




    if (command === `${prefix}blacklist`) {

        let wl = [VOTRE_ID, ID_PROPRIO, ID_DES_PERSONNES_AVEC_RANK]
        
        const black_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Vous n\'avez pas la permissions')
        if (!message.guild.me.hasPermission('ADMINISTRATOR')) return message.channel.send('J\'ai pas les permissions');

        let member = message.mentions.members.first() || message.guild.member(args[0]) || args[0];
        let member_id = member.id ? member.id:member
        if (!member) {
            return message.channel.send('Merci de mentionner un utilisateur')
        }
        message.channel.send(member + ' à bien été blacklist').then(async msg => {
            msg.react('✅')
            msg.react('❎')

            let filter = (reaction, user) => wl.includes(user.id)
            let reaction = (await msg.awaitReactions(filter, {
                max: 1
            })).first();

            if (reaction._emoji.name === '❎') {
                return msg.delete() & message.channel.send('❎ | La blacklist à été refuser')
            };
            if (reaction._emoji.name === '✅') {

                if (!black_list["blacklist"].includes(member_id)) black_list["blacklist"].push(member_id)
                fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
                let raison = 'Blacklist'
                message.channel.send(`<@${member_id}> est maintenant blacklisted pour ${raison}`)
                if(member_id === member.id) { let mp = await member.send('Vous avez été blacklist du bot ' + bot.user.username)
                member.ban({
                    reason: raison
                })
            }
            }

        })
    }

    if (command === `${prefix}unblacklist`) {

        const black_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Vous n\'avez pas la permissions')
        if (!message.guild.me.hasPermission('ADMINISTRATOR')) return message.channel.send('J\'ai pas les permissions');

        let member = await bot.users.fetch(args[0]);
        if (!member) {
            return message.channel.send('La personne à unblacklist est introuvable')
        }
        let member_id = member.id ? member.id:member

        try {
            black_list["blacklist"].splice(black_list["blacklist"].indexOf(member_id), 1)
            fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
            if(member_id === member.id)message.guild.members.unban(member)
            message.channel.send(`<@${member_id}> a été unblacklist`)
        } catch (e) {
            console.log(e.message)
        }

    }

})

bot.on('guildMemberAdd', async member => {

    const blacklist_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
    if (!blacklist_list["blacklist"].includes(member.id)) return;
    let mp = await member.send('Vous avez été blacklist du bot ' + bot.user.username)
    member.ban({
            reason: 'Blacklist'
    })
    console.log('Okay')
})

bot.login(TOKEN)
