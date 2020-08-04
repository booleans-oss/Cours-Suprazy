const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

bot.on('ready', () => {
    console.log('On')
})

bot.on('message', async message => {
    /*****************************************
    ************ COMMANDE HANDLER ************
    ******************************************/
    if (message.author.bot) return;
    let prefix = '!'
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);



        /**
    |--------------------------------------------------------------------------
    | Blacklist & Unblacklist
    |--------------------------------------------------------------------------
    |
    | La blacklist sera un fichier JSON qui comportera les ID des personnes
    | qui représentent un danger pour le serveur.
    | 
    |
    | * @black_list = le fichier JSON qui sera converti en objet JavaScript
    | Le fichier sera sous forme d'un tableau qui contiendra les ID.
    | De part cette configuration, il suffira de push/splice pour ajouter
    | ou retirer un membre.
    |
    */

   let wl = [VOTRE_ID, ID_PROPRIO, ID_DES_PERSONNES_AVEC_RANK]
   // Liste des ID qui seront autorisés à utiliser les commandes;



        /*************************************
        ********* COMMANDE BLACKLIST *********
        **************************************/
    if (command === `${prefix}blacklist`) {

        const black_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        // Lecture du fichier blacklist.json qui contiendra la liste

        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Vous n\'avez pas la permissions')
        if (!message.guild.me.hasPermission('ADMINISTRATOR')) return message.channel.send('J\'ai pas les permissions');
        //Vérification que l'utilisateur et le rôle ont les permissions 'ADMINISTRATOR' pour pouvoir éxecuter la commande

        let member = message.mentions.members.first() || message.guild.member(args[0]) || args[0];
        // Sélection du membre à blacklist (soit la mentioné, soit l'ID d'un membre ou une ID valide)
        if(!member) return message.channel.send("Veuillez mentionner un membre ou inclure un ID");
        //Vérification que l'auteur a bien mis la mention ou l'ID d'un membre

        let member_id = member.id ? member.id:member
        //Création de l'ID du membre à blacklist
        
        if (black_list["blacklist"].includes(member_id)) return message.channel.send("Utilisateur déjà blacklisted")
        /*************************************
        ******** SYSTÈME DE RÉACTIONS ********
        **************************************/
        message.channel.send(member + ' à bien été blacklist').then(async msg => {
            msg.react('✅')
            msg.react('❎')
        //Envoie du message ainsi que l'ajout des réactions
            let filter = (reaction, user) => wl.includes(user.id) 
            //Filtre: seul les membres dans la liste autorisé peuvent ajouter des réactions
            let reaction = (await msg.awaitReactions(filter, {
                max: 1
            })).first();
            //Séléction de la réaction que l'administrateur aura ajouté

            //Premier cas: si l'administrateur refuse.
            if (reaction._emoji.name === '❎') {
                return msg.delete() & message.channel.send('❎ | La blacklist à été refuser');
            };
            //Deuxième cas: si l'administrateur accepte
            if (reaction._emoji.name === '✅') {
                black_list["blacklist"].push(member_id)
                //Ajout dans le Tableau de la blacklist, l'ID du membre
                fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
                //Sauvegarde du tableau édité
                let raison = 'Blacklist'
                //Déclaration de la raison
                message.channel.send(`<@${member_id}> est maintenant blacklisted pour ${raison}`)
                //Message de confirmation
                if(member_id === member.id) { 
                    //Si le membre est sur le serveur ou un des serveurs
                    let mp = await member.send('Vous avez été blacklist du bot ' + bot.user.username)
                    //Envoie un message privé au membre blacklisted avant de le ban
                member.ban({reason: raison})
                //Bannissement du membre
            }
            }

        })
    }


    /***************************************
    ********* COMMANDE UNBLACKLIST *********
    ****************************************/

    if (command === `${prefix}unblacklist`) {

        const black_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
        // Lecture du fichier blacklist.json qui contiendra la liste

        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('Vous n\'avez pas la permissions')
        if (!message.guild.me.hasPermission('ADMINISTRATOR')) return message.channel.send('J\'ai pas les permissions');
        //Vérification que l'utilisateur et le rôle ont les permissions 'ADMINISTRATOR' pour pouvoir éxecuter la commande
        
        let member = message.mentions.members.first() || message.guild.member(args[0]) || args[0];
        // Sélection du membre à blacklist (soit la mentioné, soit l'ID d'un membre ou une ID valide)
        if(!member) return message.channel.send("Veuillez mentionner un membre ou inclure un ID");
        //Vérification que l'auteur a bien mis la mention ou l'ID d'un membre

        let member_id = member.id ? member.id:member
        //Création de l'ID du membre à blacklist
        
        try {
            black_list["blacklist"].splice(black_list["blacklist"].indexOf(member_id), 1)
            //Suppression de l'ID du membre dans le tableau blacklist
            fs.writeFileSync('./blacklist.json', JSON.stringify(black_list))
            //Sauvegarde du tableau édité
            if(member_id === member.id)message.guild.members.unban(member)
            //Débannissement du membre, si celui-ci est sur le serveur
            message.channel.send(`<@${member_id}> a été unblacklist`)
            //Message de confirmation
        } catch (e) {
            console.log(e.message)
            //Si il y a une erreur durant la procédure, elle apparaît dans la console 
        }

    }

})
/***************************************
********* EVENT NOUVEAU MEMBRE *********
****************************************/
bot.on('guildMemberAdd', async member => {

    const blacklist_list = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'));
    // Lecture du fichier blacklist.json qui contiendra la liste

    if (!blacklist_list["blacklist"].includes(member.id)) return;
    //Vérification si le membre est dans le tableau blacklist
    let mp = await member.send('Vous avez été blacklist du bot ' + bot.user.username);
    //Envoie du message de bannissement à l'utilisateur
    member.ban({reason: 'Blacklist'});
    //Bannisseemnt du membre
})

bot.login(TOKEN)
