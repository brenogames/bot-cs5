const mineflayer = require('mineflayer');
const express = require('express');

// --- SERVIDOR WEB (Para manter o bot na nuvem 24/7) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot da Creative Squad 5 v.shoope está online e ativo!');
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
    version: '1.20.6',
    checkTimeoutInterval: 60 * 1000, // Dá mais tempo para o Aternos responder
    skipValidation: true             // Ignora validações de conta oficial Microsoft
  });

  let targetPlayer = null;

  bot.on('spawn', () => {
    console.log('Bot conectado com sucesso na Creative Squad 5 v.shoope!');
    
    // Aguarda 5 segundos após carregar o mapa para iniciar o Anti-AFK (evita desconexões)
    setTimeout(() => {
      setInterval(() => {
        if (bot && bot.entity) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }
      }, 30000);
    }, 5000);
  });

  // Mensagem automática quando um jogador entra no servidor
  bot.on('playerJoined', (player) => {
    if (player.username !== bot.username) {
      bot.chat(`Bem-vindo(a) ao Creative Squad 5 v.shoope, ${player.username}! 🎉`);
    }
  });

  // Processador de comandos do Chat
  bot.on('chat', (username, message) => {
    if (username === bot.username) return; // Ignora as próprias mensagens do bot

    const msg = message.toLowerCase().trim();

    // Comando 1: Informar IP
    if (msg === '!ip') {
      bot.chat('O IP do servidor é: CreariveSquad5vShope.aternos.me:26575');
    }

    // Comando 2: Calculadora Matemática (!calcular 123*123)
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

    // Comando 3: Seguir Jogador
    if (msg === '!siga') {
      targetPlayer = username;
      bot.chat(`Entendido, ${username}! Agora estou te seguindo.`);
    }

    // Comando 4: Parar de Seguir
    if (msg === '!pare') {
      targetPlayer = null;
      bot.setControlState('forward', false);
      bot.chat('Parando de seguir.');
    }

    // Comando 5: Agachar (Animação)
    if (msg === '!agachar') {
      bot.setControlState('sneak', true);
      setTimeout(() => bot.setControlState('sneak', false), 1500);
    }
  });

  // Lógica contínua para seguir o jogador
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

  // Reconexão automática se for desconectado
  bot.on('end', () => {
    console.log('Conexão perdida. Tentando reconectar em 20 segundos...');
    setTimeout(createBot, 20000);
  });

  bot.on('error', (err) => {
    console.log('Erro na conexão do bot:', err);
  });
}

createBot();