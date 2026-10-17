import { useEffect, useState, useRef } from "react";
import "./App.css";

const EMOJIS = ["🎮", "🎯", "🎨", "🎭", "🎪", "🎸", "🎺", "🎲"];

const shuffleArray = (array) => {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

const createPars = () => {
	const pairs = [...EMOJIS, ...EMOJIS];
	const shuffled = shuffleArray(pairs);

	const finalPars = shuffled.map((emoji_, index) => ({
		id: index,
		emoji: emoji_,
		isFlipped: false,
		isMatched: false,
	}));
	return finalPars;
};

const formatTime = (totalSeconds) => {
	const minutes = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

function App() {
	const [cards, setCards] = useState(() => createPars());
	const [flippedCards, setFlippedCards] = useState([]);
	const [moves, setMoves] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const timeoutRef = useRef(null);
	const timerRef = useRef(null);

	const gameWon = cards.every((card) => card.isMatched);

	useEffect(() => {
		if (!gameWon) {
			timerRef.current = setInterval(() => {
				setSeconds((prev) => prev + 1);
			}, 1000);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [gameWon]);

	useEffect(() => {
		if (flippedCards.length === 2) {
			const [firstId, secondId] = flippedCards;
			const firstCard = cards.find((c) => c.id === firstId);
			const secondCard = cards.find((c) => c.id === secondId);

			if (firstCard.emoji === secondCard.emoji) {
				setCards((prevCards) =>
					prevCards.map((card) =>
						card.id === firstId || card.id === secondId
							? { ...card, isMatched: true, isFlipped: false }
							: card,
					),
				);
				setFlippedCards([]);
			} else {
				timeoutRef.current = setTimeout(() => {
					setCards((prevCards) =>
						prevCards.map((card) =>
							card.id === firstId || card.id === secondId
								? { ...card, isFlipped: false }
								: card,
						),
					);
					setFlippedCards([]);
				}, 1000);
			}

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}
	}, [flippedCards, cards]);

	const handleCardClick = (cardId) => {
		if (flippedCards.length === 2) return;
		if (flippedCards.includes(cardId)) return;

		const card = cards.find((c) => c.id === cardId);
		if (card.isMatched) return;

		const newFlipped = [...flippedCards, cardId];
		setFlippedCards(newFlipped);

		if (newFlipped.length === 2) {
			setMoves((prev) => prev + 1);
		}
	};

	const handleRestart = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setCards(createPars());
		setFlippedCards([]);
		setMoves(0);
		setSeconds(0);
	};

	return (
		<div>
			<h1>Memory Gameeee</h1>
			<div className="game-stats">
				<span>Moves: {moves} </span>
				<span>Time: {formatTime(seconds)}</span>
			</div>
			<div className="card-grid">
				{cards.map((card) => {
					const isFaceUp =
						card.isFlipped || card.isMatched || flippedCards.includes(card.id);
					return (
						<button
							key={card.id}
							className={`card ${isFaceUp ? "flipped" : ""} ${card.isMatched ? "matched" : ""}`}
							onClick={() => handleCardClick(card.id)}
							disabled={card.isMatched}
						>
							{isFaceUp ? card.emoji : "?"}
						</button>
					);
				})}
			</div>

			{gameWon && (
				<div className="game-over">
					<h2>Hmm, you won !!! </h2>
					<button className="restart-btn" onClick={handleRestart}>
						{" "}
						Play again{" "}
					</button>
				</div>
			)}
		</div>
	);
}

export default App;
