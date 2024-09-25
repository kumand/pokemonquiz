const pokemonImage = document.getElementById('pokemon-image');
const optionsContainer = document.getElementById('options');
const nextButton = document.getElementById('next-button');
const scoreElement = document.getElementById('score-value');
const generationSelect = document.getElementById('generation');

let correctAnswer = '';
const pokemonNames = {};
let score = 0;
let currentGeneration = 1;

const generationRanges = {
    1: { start: 1, end: 151 },
    2: { start: 152, end: 251 },
    3: { start: 252, end: 386 },
    4: { start: 387, end: 493 },
    5: { start: 494, end: 649 }
};

async function fetchPokemonNames() {
    console.log('ポケモン名を取得中...');
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=649');
        const data = await response.json();
        
        const promises = data.results.map(async (species) => {
            const speciesResponse = await fetch(species.url);
            const speciesData = await speciesResponse.json();
            const japaneseName = speciesData.names.find(name => name.language.name === 'ja-Hrkt')?.name;
            if (japaneseName) {
                pokemonNames[speciesData.id] = japaneseName;
            }
        });

        await Promise.all(promises);
        console.log('ポケモン名の取得完了:', Object.keys(pokemonNames).length);
    } catch (error) {
        console.error('ポケモン名の取得中にエラーが発生しました:', error);
    }
}

async function fetchRandomPokemon() {
    const { start, end } = generationRanges[currentGeneration];
    const randomId = Math.floor(Math.random() * (end - start + 1)) + start;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const data = await response.json();
    return data;
}

async function generateQuiz() {
    const pokemon = await fetchRandomPokemon();
    correctAnswer = pokemonNames[pokemon.id] || pokemon.name;
    
    pokemonImage.style.opacity = '0';
    setTimeout(() => {
        pokemonImage.style.backgroundImage = `url(${pokemon.sprites.other['official-artwork'].front_default})`;
        pokemonImage.style.opacity = '1';
    }, 300);

    const options = [correctAnswer];
    while (options.length < 4) {
        const randomPokemon = await fetchRandomPokemon();
        const japaneseName = pokemonNames[randomPokemon.id] || randomPokemon.name;
        if (!options.includes(japaneseName)) {
            options.push(japaneseName);
        }
    }

    optionsContainer.innerHTML = '';
    options.sort(() => Math.random() - 0.5).forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        button.addEventListener('click', () => checkAnswer(option));
        optionsContainer.appendChild(button);
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function checkAnswer(selectedAnswer) {
    const buttons = optionsContainer.getElementsByTagName('button');
    for (let button of buttons) {
        button.disabled = true;
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'green';
            button.style.color = 'white';
        }
    }

    if (selectedAnswer === correctAnswer) {
        score++;
        scoreElement.textContent = score;
        alert('正解！');
    } else {
        alert(`不正解。正解は${correctAnswer}でした。`);
    }
}

nextButton.addEventListener('click', generateQuiz);
generationSelect.addEventListener('change', (e) => {
    currentGeneration = parseInt(e.target.value);
    generateQuiz();
});

// アプリケーションの初期化
async function initApp() {
    generateQuiz(); // まずクイズを開始
    await fetchPokemonNames(); // バックグラウンドでポケモン名を取得
}

initApp();