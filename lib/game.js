import '../settings.js';
import { Jimp } from 'jimp';
import { sleep, clockString } from './function.js';

function pickRandom(list) {
	return list[Math.floor(list.length * Math.random())];
}

const rdGame = (db, id, time) =>
	Object.keys(db).find(key => key.startsWith(id) && key.endsWith(time));

const iGame = (db, id) =>
	(key => key && db[key].id)(Object.keys(db).find(key => key.startsWith(id)));

const tGame = (db, id) =>
	(key => key && db[key].time)(Object.keys(db).find(key => key.startsWith(id)));

const gameSlot = async (conn, m, db) => {
	if (db.users[m.sender].limit < 1) return m.reply(global.mess.limit);

	const fruits = ['🍇','🍉','🍋','🍌','🍎','🍑','🍒','🫐','🥥','🥑'];

	const slot1 = pickRandom(fruits);
	const slot2 = pickRandom(fruits);
	const slot3 = pickRandom(fruits);

	const row1 = `${pickRandom(fruits)} : ${pickRandom(fruits)} : ${pickRandom(fruits)}`;
	const row2 = `${slot1} : ${slot2} : ${slot3}`;
	const row3 = `${pickRandom(fruits)} : ${pickRandom(fruits)} : ${pickRandom(fruits)}`;

	const reward = Math.floor(Math.random() * 10);
	const botNumber = await conn.decodeJid(conn.user.id);

	try {
		if (slot1 === slot2 && slot2 === slot3) {
			db.users[m.sender].limit -= 1;
			db.set[botNumber].limit += 1;

			let result =
`[ 🎰 VIRTUAL SLOT 🎰 ]
------------------------

${row1}
${row2} <=====
${row3}

------------------------
[ 🎰 VIRTUAL SLOT 🎰 ]

*Result:*
_You Win! 🎉_
Limit + ${reward}
Money + ${reward * 500}`;

			conn.sendMessage(m.chat, { text: result }, { quoted: m });

			db.users[m.sender].limit += reward;
			db.users[m.sender].money += reward * 500;

		} else {

			db.users[m.sender].limit -= 1;
			db.set[botNumber].limit += 1;

			let result =
`[ 🎰 VIRTUAL SLOT 🎰 ]
------------------------

${row1}
${row2} <=====
${row3}

------------------------
[ 🎰 VIRTUAL SLOT 🎰 ]

*Result:*
_You Lose_
Limit -1`;

			conn.sendMessage(m.chat, { text: result }, { quoted: m });
		}
	} catch (e) {
		m.reply('Error!');
	}
};

const gameCasinoSolo = async (conn, m, prefix, db) => {
	try {

		let multiplier = 1;

		if (db.users[m.sender].limit < 1)
			return m.reply(global.mess.limit);

		const botNumber = await conn.decodeJid(conn.user.id);

		let botScore = `${Math.floor(Math.random() * 101)}`.trim();
		let playerScore = `${Math.floor(Math.random() * 81)}`.trim();

		let Bot = (botScore * 1);
		let Player = (playerScore * 1);

		let amount = m.args[0];

		amount = amount
			? amount === 'all'
				? Math.floor(db.users[m.sender].money / multiplier)
				: parseInt(amount)
			: 1;

		amount = Math.max(1, amount);

		if (m.args.length < 1)
			return m.reply(prefix + 'casino <amount>\n' + prefix + 'casino 1000');

		if (isNaN(m.args[0]))
			return m.reply(`Enter a valid amount!\nExample: ${prefix + m.command} 1000`);

		if (db.users[m.sender].money >= amount) {

			db.users[m.sender].limit -= 1;
			db.users[m.sender].money -= amount;
			db.set[botNumber].money += amount;

			if (Bot > Player) {

				m.reply(
`💰 Casino 💰
*You:* ${Player} Points
*Computer:* ${Bot} Points

*YOU LOSE*
You lost ${amount} money`
				);

			} else if (Bot < Player) {

				db.users[m.sender].money += amount * 2;

				m.reply(
`💰 Casino 💰
*You:* ${Player} Points
*Computer:* ${Bot} Points

*YOU WIN*
You received ${amount * 2} money`
				);

			} else {

				db.users[m.sender].money += amount;

				m.reply(
`💰 Casino 💰
*You:* ${Player} Points
*Computer:* ${Bot} Points

*DRAW*
Your bet has been refunded.`
				);
			}

		} else {
			m.reply(
				"You don't have enough money to play Casino. Earn more money first!"
			);
		}

	} catch (e) {
		m.reply('Error!');
	}
};

const gameSamgongSolo = async (conn, m, db) => {
	const suits = ['♥️', '♦️', '♣️', '♠️'];
	const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

	if (db.users[m.sender].limit < 1)
		return m.reply(global.mess.limit);

	const bet = parseInt(m.args[0]);

	if (isNaN(bet) || bet < 5000)
		return m.reply('The minimum bet is 5000!');

	if (db.users[m.sender].money < bet)
		return m.reply("You don't have enough money to play Samgong. Earn more money first!");

	db.users[m.sender].money -= bet;
	db.users[m.sender].limit -= 1;

	let { key } = await m.reply('*🃏 Game Started!* Dealing cards...');
	await sleep(5000);

	const deck = ranks
		.flatMap(rank => suits.map(suit => `${rank} ${suit}`))
		.sort(() => Math.random() - 0.5);

	const draw = () => [deck.pop(), deck.pop(), deck.pop()];

	const calcScore = hand =>
		hand.reduce((sum, card) => {
			const value = card.split(' ')[0];
			if (['J', 'Q', 'K'].includes(value)) return sum + 10;
			if (value === 'A') return sum + 15;
			return sum + parseInt(value);
		}, 0);

	let playerHand = draw();
	let botHand = draw();

	let playerScore = calcScore(playerHand);
	let botScore = calcScore(botHand);

	await m.reply(
		`*🃏 Cards Dealt:*\n` +
		`🤓 *You:* ${playerHand.join(', ')}\n` +
		`🤖 *Bot:* ${botHand.join(', ')}`,
		{ edit: key }
	);

	await sleep(2000);

	while (playerScore < 30 && botScore < 30 && playerHand.length < 4) {
		if (playerScore < 30) playerHand.push(deck.pop());
		if (botScore < 30) botHand.push(deck.pop());

		playerScore = calcScore(playerHand);
		botScore = calcScore(botHand);
	}

	let winnings = bet * 1.5;

	let result =
		playerScore > 30
			? '💀 You Lose!'
			: playerScore === botScore
			? '🤝 Draw! Your bet has been refunded.'
			: botScore > 30 || playerScore > botScore
			? `🎉 You Win! +${winnings} Money`
			: '😞 Bot Wins!';

	if (playerScore <= 30 && (botScore > 30 || playerScore > botScore)) {
		db.users[m.sender].money +=
			playerScore === botScore ? bet : winnings;
	}

	await m.reply(
		`*🃏 Final Result:*\n` +
		`🤓 *You:* ${playerHand.join(', ')} (${playerScore})\n` +
		`🤖 *Bot:* ${botHand.join(', ')} (${botScore})\n\n` +
		result,
		{ edit: key }
	);
};

const gameRobbery = async (m, db) => {
	if (db.users[m.sender].limit < 1)
		return m.reply(global.mess.limit);

	db.users[m.sender].limit -= 1;

	let elapsed = new Date - db.users[m.sender].lastRobbery;
	let remaining = 3600000 - elapsed;
	let timer = clockString(remaining);

	if (new Date - db.users[m.sender].lastRobbery > 3600000) {

		let stolenMoney = Math.floor(Math.random() * 10000);
		let target;

		if (m.isGroup) {
			target = m.mentionedJid
				? m.mentionedJid[0]
				: m.quoted
				? m.quoted.sender
				: m.mentionedJid[0];
		} else {
			target = m.chat;
		}

		if (!target)
			return m.reply('Mention someone.');

		if (!db.users[target])
			return m.reply('Target is not registered in the database!');

		if (db.users[target].money < 10000)
			return m.reply('The target is too broke.');

		db.users[target].money -= stolenMoney;
		db.users[m.sender].money += stolenMoney;
		db.users[m.sender].lastRobbery = new Date * 1;

		m.reply(`Successfully stole ${stolenMoney} money from the target.`);

	} else {

		m.reply(
			`You already robbed someone and are hiding.\n` +
			`Wait ${timer} before robbing again.`
		);
	}
};

const gameMugging = async (conn, m, db) => {

	if (db.users[m.sender].limit < 1)
		return m.reply(global.mess.limit);

	db.users[m.sender].limit -= 1;

	let user = db.users[m.sender];

	let elapsed = new Date - user.lastbegal;
	let remaining = 3600000 - elapsed;
	let timer = clockString(remaining);

	const botNumber = await conn.decodeJid(conn.user.id);

	const randomMoney = Math.floor(Math.random() * 10001);

	let events = [
		{ text: 'The player escaped!', outcome: 0 },
		{ text: 'The player ran away!', outcome: 0 },
		{ text: 'The player is hiding!', outcome: 0 },
		{ text: 'The player committed suicide!', outcome: 2 },
		{ text: 'The player was caught!', outcome: 2 },
		{ text: 'Player not found!', outcome: 0 },
		{ text: 'The player is stronger than you!', outcome: 1 },
		{ text: 'The player used cheats!', outcome: 1 },
		{ text: 'The player called the police!', outcome: 0 },
		{ text: 'The player surrendered!', outcome: 2 }
	];

	let event = pickRandom(events);

	if (new Date - user.lastbegal > 3600000) {

		let { key } = await m.reply('Searching for a player...');
		await sleep(2000);

		if (event.outcome === 0) {

			await m.reply({ text: event.text, edit: key });
			await m.reply('Failed to find a player. Please try again.');

		} else if (event.outcome === 1) {

			await m.reply({ text: event.text, edit: key });

			await m.reply(
				`You were defeated by the player.\n` +
				`You lost *${randomMoney}* money.`
			);

			db.users[m.sender].money -= randomMoney;
			db.set[botNumber].money += randomMoney;

		} else {

			await m.reply({ text: event.text, edit: key });

			await m.reply(
				`Success! You obtained *${randomMoney}* money.`
			);

			db.users[m.sender].money += randomMoney;
			db.users[m.sender].lastbegal = new Date * 1;
		}

	} else {

		m.reply(
			`Please wait *⏱️ ${timer}* before playing again.`
		);
	}
};
  const daily = async (m, db) => {
	let user = db.users[m.sender];
	let elapsed = (new Date - user.lastclaim);
	let remaining = (86400000 - elapsed);
	let timer = clockString(remaining);

	if (new Date - user.lastclaim > 86400000) {
		m.reply(
`*Daily Reward*
✅ Successfully claimed!

Rewards:
• Limit: +10
• Money: +10000

Your daily claim has been reset.`
		);

		db.users[m.sender].limit += 10;
		db.users[m.sender].money += 10000;
		db.users[m.sender].lastclaim = new Date * 1;

	} else {
		m.reply(`Please wait *⏱️ ${timer}* before claiming again.`);
	}
};

const buy = async (m, args, db) => {
	if (args[0] === 'limit') {

		if (!args[1])
			return m.reply(
				`Enter the amount!\nExample: ${m.prefix + m.command} limit 10`
			);

		let count = parseInt(args[1]);

		if (db.users[m.sender].money >= count * 500) {

			db.users[m.sender].limit += count;
			db.users[m.sender].money -= count * 500;

			m.reply(
				`Successfully purchased ${count} limit(s) for ${count * 500} money.`
			);

		} else {

			m.reply(
`You don't have enough money to buy limits!

Remaining Money: ${db.users[m.sender].money}
Price for ${count} limit(s): ${count * 500}`
			);
		}

	} else {

		m.reply(
`Limit Shop

Price:
• 1 Limit = 500
• 2 Limits = 1000

Example:
.buy limit 3`
		);
	}
};

const setLimit = (m, db) => {
	db.users[m.sender].limit -= 1;
};

const addLimit = (amount, userId, db) => {
	db.users[userId].limit += parseInt(amount);
};

const setMoney = (m, db) => {
	db.users[m.sender].money -= 1000;
};

const addMoney = (amount, userId, db) => {
	db.users[userId].money += parseInt(amount);
};

const transfer = async (m, args, db) => {

	if (args[0] === 'limit') {

		if (!args[1]?.length)
			return m.reply(
`Transfer Menu

Example:
${m.prefix + m.command} limit @user 10
${m.prefix + m.command} money @user 1000`
			);

		let count = parseInt(
			args[2] && args[2].length > 0
				? Math.min(9999999, Math.max(parseInt(args[2]), 1))
				: 1
		);

		let target =
			m.mentionedJid[0]
				? m.mentionedJid[0]
				: m.quoted
				? m.quoted.sender
				: args[1]
				? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
				: false;

		if (!target)
			return m.reply('Who do you want to transfer to?');

		if (db.users[target]) {

			if (db.users[m.sender].limit >= count) {

				try {
					db.users[m.sender].limit -= count;
					db.users[target].limit += count;

					m.reply(
						`Successfully transferred ${count} limit(s) to @${target.split('@')[0]}`
					);

				} catch (e) {

					db.users[m.sender].limit += count;
					m.reply('Transfer failed.');
				}

			} else {

				m.reply(
					`You don't have enough limits.\nRemaining limits: ${db.users[m.sender].limit}`
				);
			}

		} else {

			m.reply(`The number ${target.split('@')[0]} is not a registered bot user.`);
		}

	} else if (args[0] === 'money') {

		if (!args[1]?.length)
			return m.reply(
`Transfer Menu

Example:
${m.prefix + m.command} limit @user 10
${m.prefix + m.command} money @user 1000`
			);

		let count = parseInt(
			args[2] && args[2].length > 0
				? Math.min(9999999, Math.max(parseInt(args[2]), 1))
				: 1
		);

		let target =
			m.mentionedJid[0]
				? m.mentionedJid[0]
				: m.quoted
				? m.quoted.sender
				: args[1]
				? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
				: false;

		if (!target)
			return m.reply('Who do you want to transfer to?');

		if (db.users[target]) {

			if (db.users[m.sender].money >= count) {

				try {

					db.users[m.sender].money -= count;
					db.users[target].money += count;

					m.reply(
						`Successfully transferred ${count} money to @${target.split('@')[0]}`
					);

				} catch (e) {

					db.users[m.sender].money += count;
					m.reply('Transfer failed.');
				}

			} else {

				m.reply(
					`You don't have enough money.\nRemaining money: ${db.users[m.sender].money}`
				);
			}

		} else {

			m.reply(`The number ${target.split('@')[0]} is not a registered bot user.`);
		}

	} else {

		m.reply(
`Transfer Menu

Example:
${m.prefix + m.command} limit @user 10
${m.prefix + m.command} money @user 1000`
		);
	}
};

/*
 * Created by Naze
 * GitHub: https://github.com/nazedev
 * WhatsApp Channel:
 * https://whatsapp.com/channel/0029VaWOkNm7DAWtkvkJBK43
 */
    class Blackjack {
	constructor(data) {
		this.id = data.id || '';
		this.skip = data.skip || [];
		this.host = data.host || '';
		this.leader = data.leader || '';
		this.winner = data.winner || [];
		this.players = data.players || [];
		this.started = data.started || false;
		this.startCard = data.startCard || {};
		this.submitCard = data.submitCard || [];
		this.secondDeck = data.secondDeck || [];
		this.deck = data.deck || this.generateDeck();
	}

	generateDeck() {
		const suits = ['♥️', '♦️', '♣️', '♠️'];
		const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

		return suits.flatMap(suit =>
			ranks.map(rank => ({ rank, suit }))
		);
	}

	shuffleDeck() {
		for (let i = this.deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
	}

	distributeCards() {
		this.shuffleDeck();

		const cardsPerPlayer = {
			2: 10,
			3: 7,
			4: 7,
			5: 6,
			6: 6,
			7: 5,
			8: 5,
			9: 4,
			10: 4
		}[this.players.length] ?? 4;

		for (const player of this.players) {
			player.cards.push(...this.deck.splice(0, cardsPerPlayer));
		}

		this.startCard = this.deck.shift();
		this.secondDeck.push(this.startCard);
		this.leader = this.host;
		this.started = true;
	}

	hasMatching(playerId) {
		if (!this.startCard || !Object.keys(this.startCard).length)
			return false;

		return (
			this.players
				.find(player => player.id === playerId)
				?.cards?.some(card => card.suit === this.startCard.suit) ?? false
		);
	}

	cardValue(rank) {
		if (rank === 'A') return 14;
		if (rank === 'K') return 13;
		if (rank === 'Q') return 12;
		if (rank === 'J') return 11;
		return parseInt(rank) || 0;
	}

	resolveRound() {
		if (!this.submitCard.length) return null;

		const validCards = this.submitCard.filter(
			card => card.card.suit === this.startCard.suit
		);

		if (validCards.length === 0) {
			validCards.push(this.submitCard[0]);
		}

		const winningCard = validCards.reduce((highest, current) =>
			this.cardValue(current.card.rank) >
			this.cardValue(highest.card.rank)
				? current
				: highest
		);

		this.leader = winningCard.id;
		this.startCard = {};
		this.submitCard = [];
		this.skip = [];

		return `@${this.leader.split('@')[0]} leads the next round!`;
	}

	isRoundComplete() {
		return (
			this.submitCard.length + this.skip.length
		) >= this.players.length;
	}

	reuseSubmitCardsForDrinking() {
		const cards = this.submitCard.map(item => item.card);

		const drinkers = this.players.filter(
			player => !this.skip.includes(player.id)
		);

		// Only one player submitted a card
		if (this.submitCard.length === 1 && this.isRoundComplete()) {

			const owner = this.submitCard[0].id;

			this.submitCard = [];
			this.leader = owner;

			for (const player of this.players) {
				if (
					player.id !== owner &&
					!this.skip.includes(player.id)
				) {
					this.skip.push(player.id);
				}
			}

			return {
				msg: `Only @${owner.split('@')[0]} has a card — they become the new leader.`,
				continue: true
			};
		}

		// Redistribute the submitted cards
		cards.forEach((card, index) => {

			if (!drinkers.length) return;

			const player = this.players.find(
				p => p.id === drinkers[index % drinkers.length].id
			);

			if (!player) return;

			player.cards.push(card);

			if (!this.skip.includes(player.id)) {
				this.skip.push(player.id);
			}
		});

		this.submitCard = [];

		return {
			msg: 'The submitted cards have been redistributed to the players who must drink.',
			continue: true
		};
	}
    }
    class SnakeLadder {
	constructor(data) {
		this.turn = data.turn || 0;
		this.host = data.host || null;
		this.start = data.start || false;
		this.players = data.players || [];
		this.map = data.map || this.createMap();
	}

	rollDice() {
		return Math.floor(Math.random() * 6) + 1;
	}

	createMap() {
		const maps = [
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map1.jpg',
				move: {
					4: 56, 12: 50, 14: 55, 22: 58,
					41: 79, 54: 88,
					96: 42, 94: 71, 75: 32,
					48: 16, 37: 3, 28: 10
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map2.jpg',
				move: {
					7: 36, 21: 58, 31: 51,
					34: 84, 54: 89, 63: 82,
					96: 72, 78: 59, 66: 12,
					56: 20, 43: 24, 33: 5
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map3.jpg',
				move: {
					8: 29, 10: 32, 20: 39,
					27: 85, 51: 67, 72: 91,
					79: 100,
					98: 65, 94: 75, 93: 73,
					64: 60, 62: 19, 56: 24,
					53: 50, 17: 7
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map4.jpg',
				move: {
					8: 29, 10: 32, 20: 39,
					27: 85, 51: 67, 72: 91,
					79: 100,
					98: 65, 94: 75, 93: 73,
					64: 60, 62: 19, 56: 24,
					53: 50, 17: 7
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map5.jpg',
				move: {
					1: 38, 4: 14, 9: 31,
					21: 42, 28: 84,
					51: 67, 72: 91,
					80: 99,
					98: 79, 94: 75, 93: 73,
					87: 36, 64: 60,
					62: 19, 54: 34, 17: 7
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map6.jpg',
				move: {
					4: 23, 13: 46, 33: 52,
					42: 63, 50: 69, 62: 81,
					74: 93,
					99: 41, 95: 76,
					89: 53, 66: 45,
					54: 31, 43: 17,
					40: 2, 27: 5
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map7.jpg',
				move: {
					1: 38, 4: 14, 9: 31,
					21: 42, 28: 84,
					51: 67, 71: 91,
					80: 100,
					98: 79, 95: 75,
					93: 73, 87: 24,
					64: 60, 62: 19,
					54: 34, 17: 7
				},
				mode: ''
			},
			{
				url: 'https://raw.githubusercontent.com/nazedev/database/master/games/images/map/map8.jpg',
				move: {
					2: 38, 7: 14, 8: 31,
					15: 26, 21: 42,
					28: 84, 36: 44,
					51: 67, 71: 91,
					78: 98,
					87: 94,
					99: 80,
					95: 75,
					92: 88,
					89: 68,
					74: 53,
					64: 60,
					62: 19,
					49: 11,
					46: 25,
					16: 6
				},
				mode: ''
			}
		];

		return maps[Math.floor(Math.random() * maps.length)];
	}

	nextTurn() {
		this.turn = (this.turn + 1) % this.players.length;
	}

	async drawBoard(boardUrl, players = []) {
		try {
			const board = await Jimp.read(boardUrl);

			board.resize({ w: 612, h: 612 });

			const width = board.width;
			const height = board.height;
			const size = Math.min(width, height);

			board.crop({
				x: (width - size) / 2,
				y: (height - size) / 2,
				w: size,
				h: size
			});

			const tileSize = size / 10;

			players.filter(player => player.move !== null);

			for (let i = 0; i < players.length; i++) {
				const position = players[i].move;

				const row = Math.floor((position - 1) / 10);

				const col =
					row % 2 === 0
						? (position - 1) % 10
						: 9 - ((position - 1) % 10);

				const x = col * tileSize;
				const y = (9 - row) * tileSize;

				const token = await Jimp.read(
					`https://raw.githubusercontent.com/nazedev/database/master/games/images/player${i + 1}.png`
				);

				const tokenSize = tileSize * 0.7;

				token.resize({
					w: tokenSize,
					h: tokenSize
				});

				board.composite(
					token,
					x + tileSize / 2 - tokenSize / 2,
					y + tileSize / 2 - tokenSize / 2
				);
			}

			return await board.getBuffer('image/jpeg');

		} catch (error) {
			return null;
		}
	}
}

export {
	rdGame,
	iGame,
	tGame,
	gameSlot,
	gameCasinoSolo,
	gameSamgongSolo,
	gameRobbery,
	gameMugging,
	daily,
	buy,
	setLimit,
	addLimit,
	addMoney,
	setMoney,
	transfer,
	Blackjack,
	SnakeLadder
};
