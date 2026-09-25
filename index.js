const mineflayer = require('mineflayer');
const express = require('express');

// --- SERVIDOR WEB (para manter a nuvem ativa) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot da Creative Squad 5 v.shoope está online!');
});

app.listen(PORT, () => {
  console.log(`Servidor Web rodando na porta ${PORT}`);
});

// --- CÓDIGO DO BOT DO MINECRAFT ---
function createBot() {
  const bot = mineflayer.createBot({
    host: 'CreariveSquad5vShope.aternos.me',
    port: 26575,
    username: 'Bot_CS5_AFK',
    version: '1.20.4',
    checkTimeoutInterval: 60 * 1000,
    skipValidation: true,
    hideErrors: true
  });

  let targetPlayer = null;

 bot.on('spawn', () => {
    console.log('Bot conectado com sucesso na Creative Squad 5 v.shoope!');
    
    // Aguarda 10 segundos antes de começar o Anti-AFK
    setTimeout(() => {
      setInterval(() => {
        if (bot && bot.entity) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
      }, 30000);
    }, 10000);
  });

  // Renasce automaticamente se morrer para monstros, queda ou fome
  bot.on('death', () => {
    console.log('O bot morreu! Renascendo automaticamente...');
    setTimeout(() => {
      bot.respawn();
    }, 1000);
  });

  // Boas-vindas automáticas
  bot.on('playerJoined', (player) => {
    if (player.username !== bot.username) {
      bot.chat(`Bem-vindo(a) ao Creative Squad 5 v.shoope, ${player.username}! 🎉`);
    }
  });

  // Comandos do Chat
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const msg = message.toLowerCase().trim();

    if (msg === '!ip') {
      bot.chat('O IP do servidor é: CreariveSquad5vShope.aternos.me:26575');
    }

    if (msg.startsWith('!calcular ')) {
      const expressao = message.slice(10).replace(/x/gi, '*');
      try {
        if (/^[0-9+\-*/. ()]+$/.test(expressao)) {
          const resultado = Function(`"use strict"; return (${expressao})`)();
          bot.chat(`@${username}, o resultado de ${expressao} é: ${resultado}`);
        } else {
          bot.chat(`@${username}, use apenas números e operadores válidos (+, -, *, /). Ex: !calcular 123*123`);
        }
      } catch (err) {
        bot.chat(`@${username}, conta inválida! Exemplo correto: !calcular 123*123`);
      }
    }

    if (msg === '!siga') {
      targetPlayer = username;
      bot.chat(`Entendido, ${username}! Agora estou te seguindo.`);
    }

    if (msg === '!pare') {
      targetPlayer = null;
      bot.setControlState('forward', false);
      bot.chat('Parando de seguir.');
    }

    if (msg === '!agachar') {
      bot.setControlState('sneak', true);
      setTimeout(() => bot.setControlState('sneak', false), 1500);
    }
  });

  bot.on('physicsTick', () => {
    if (targetPlayer) {
      const playerEntity = bot.players[targetPlayer]?.entity;
      if (playerEntity) {
        bot.lookAt(playerEntity.position.offset(0, playerEntity.height, 0));
        const distance = bot.entity.position.distanceTo(playerEntity.position);
        
        if (distance > 3) {
          bot.setControlState('forward', true);
        } else {
          bot.setControlState('forward', false);
        }
      }
    }
  });

  // Tenta reconectar automaticamente quando o servidor desliga ou cai
  bot.on('end', () => {
    console.log('Conexão perdida. Tentando reconectar em 20 segundos...');
    setTimeout(createBot, 20000);
  });

  bot.on('error', (err) => {
    console.log('Erro na conexão do bot:', err);
  });
}

createBot();