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

        let member = message.mentions.members.first() || message.guild.member(args[0]) || args[0]
        if (!member) {
            return message.channel.send('Merci de mentionner un utilisateur')
        }
        if (black_list["blacklist"].includes(member.id ? member.id:member)) return message.channel.send("Utilisateur déjà blacklisted")
        message.channel.send((member || `[${args[0]}]`) + ' à bien été blacklist').then(async msg => {
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
                if(member.id) {
                black_list["blacklist"].push(member.id)
                fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
                let raison = 'Blacklist'
                message.channel.send(member + ' est maintenant blacklisted pour ' + raison)
                let msg = await member.send('Vous avez été blacklist du bot ' + bot.user.username)
                member.ban({
                    reason: raison
                })
            }
            else {
                if (!black_list["blacklist"].includes(member)) black_list["blacklist"].push(member)
                fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
                let raison = 'Blacklist'
                message.channel.send(member + ' est maintenant blacklisted pour ' + raison)
            }
            }

        })
    }

    if (command === `${prefix}unblacklist`) {

        const black_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Vous n\'avez pas la permissions')
        if (!message.guild.me.hasPermission('ADMINISTRATOR')) return message.channel.send('J\'ai pas les permissions');

        let member = message.mentions.members.first() || message.guild.member(args[0]) || args[0]
        if (!member) {
            return message.channel.send('Merci de mentionner un utilisateur')
        }
        if (!black_list["blacklist"].includes(member.id ? member.id:member)) return message.channel.send("Cet utilisateur n'est pas blacklisted")
        if(member.id) {
        try {
            black_list["blacklist"].splice(black_list["blacklist"].indexOf(member.id), 1)
            fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
            message.guild.members.unban(member)
            message.channel.send(`${member} a été unblacklist`)
        } catch (e) {
            console.log(e.message)
        }
    } else {
        try {
            black_list["blacklist"].splice(black_list["blacklist"].indexOf(member), 1)
            fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
            message.channel.send(`${member} a été unblacklist`)
        } catch (e) {
            console.log(e.message)
        }
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
