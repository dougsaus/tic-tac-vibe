import 'phaser';

export const EMOJI_SOUND_KEY_MAP: Record<string, string> = {
    '😀': 'happy',
    '🚀': 'rocket',
    '🌟': 'star',
    '❤️': 'heart',
    '🎉': 'tada',
    '🐱': 'meow',
    '🍕': 'eat_slice',
    '⚽': 'kick_ball'
};

export interface PlayerConfig {
    name: string;
    symbol: string;
    color: string;
    soundKey: string;
}

export interface GameSetupData {
    player1: PlayerConfig;
    player2: PlayerConfig;
}

export class SetupScene extends Phaser.Scene {
    private setupForm!: HTMLElement;
    private player1NameInput!: HTMLInputElement;
    private player1SymbolSelect!: HTMLSelectElement;
    private player1ColorInput!: HTMLInputElement;
    private player2NameInput!: HTMLInputElement;
    private player2SymbolSelect!: HTMLSelectElement;
    private player2ColorInput!: HTMLInputElement;
    private startGameBtn!: HTMLElement;

    // To store original option texts for reset
    private originalPlayer1OptionTexts: Map<string, string> = new Map();
    private originalPlayer2OptionTexts: Map<string, string> = new Map();

    constructor() {
        super('SetupScene');
    }

    create() {
        this.setupForm = document.getElementById('setupForm')!;
        this.player1NameInput = document.getElementById('player1Name') as HTMLInputElement;
        this.player1SymbolSelect = document.getElementById('player1Symbol') as HTMLSelectElement;
        this.player1ColorInput = document.getElementById('player1Color') as HTMLInputElement;
        this.player2NameInput = document.getElementById('player2Name') as HTMLInputElement;
        this.player2SymbolSelect = document.getElementById('player2Symbol') as HTMLSelectElement;
        this.player2ColorInput = document.getElementById('player2Color') as HTMLInputElement;
        this.startGameBtn = document.getElementById('startGameBtn')!;

        // Store original option texts
        this.storeOriginalOptionTexts(this.player1SymbolSelect, this.originalPlayer1OptionTexts);
        this.storeOriginalOptionTexts(this.player2SymbolSelect, this.originalPlayer2OptionTexts);

        this.setupForm.style.display = 'block';
        if (this.game.canvas) {
            this.game.canvas.style.display = 'none';
        }

        this.player1SymbolSelect.addEventListener('change', () => this.synchronizeSymbolChoices());
        this.player2SymbolSelect.addEventListener('change', () => this.synchronizeSymbolChoices());
        // Color input changes don't need to re-trigger symbol choice sync with this new text-based approach
        // this.player1ColorInput.addEventListener('input', () => this.synchronizeSymbolChoices()); 
        // this.player2ColorInput.addEventListener('input', () => this.synchronizeSymbolChoices()); 

        this.startGameBtn.addEventListener('click', () => this.handleStartGame());
        
        this.synchronizeSymbolChoices();
    }

    storeOriginalOptionTexts(selectElement: HTMLSelectElement, map: Map<string, string>) {
        for (let i = 0; i < selectElement.options.length; i++) {
            const option = selectElement.options[i] as HTMLOptionElement;
            map.set(option.value, option.textContent || option.value); // Store current text or value if text empty
        }
    }

    synchronizeSymbolChoices() {
        const p1Name = this.player1NameInput.value.trim() || 'Player 1';
        const p2Name = this.player2NameInput.value.trim() || 'Player 2';

        this.applySymbolRestriction(this.player1SymbolSelect, this.player2SymbolSelect, p1Name, this.originalPlayer2OptionTexts);
        this.applySymbolRestriction(this.player2SymbolSelect, this.player1SymbolSelect, p2Name, this.originalPlayer1OptionTexts);

        if (this.player1SymbolSelect.value === this.player2SymbolSelect.value) {
            let p2Changed = false;
            for (let i = 0; i < this.player2SymbolSelect.options.length; i++) {
                if (!this.player2SymbolSelect.options[i].disabled && 
                    this.player2SymbolSelect.options[i].value !== this.player1SymbolSelect.value) {
                    this.player2SymbolSelect.value = this.player2SymbolSelect.options[i].value;
                    p2Changed = true;
                    break;
                }
            }
            if (p2Changed) {
                this.applySymbolRestriction(this.player1SymbolSelect, this.player2SymbolSelect, p1Name, this.originalPlayer2OptionTexts);
                this.applySymbolRestriction(this.player2SymbolSelect, this.player1SymbolSelect, p2Name, this.originalPlayer1OptionTexts);
            }
        }
    }

    applySymbolRestriction(sourceSelect: HTMLSelectElement, targetSelect: HTMLSelectElement, sourcePlayerName: string, targetOriginalTexts: Map<string, string>) {
        const symbolTakenBySource = sourceSelect.value;

        for (let i = 0; i < targetSelect.options.length; i++) {
            const option = targetSelect.options[i] as HTMLOptionElement;
            const originalText = targetOriginalTexts.get(option.value) || option.value;
            
            option.disabled = false;
            option.style.color = ''; // Reset text color
            option.textContent = originalText; // Reset to original emoji/text

            if (option.value === symbolTakenBySource) {
                option.disabled = true;
                option.textContent = `${originalText} - Taken by ${sourcePlayerName}`;
                option.style.color = '#999999'; // Dim the text color
            }
        }

        if (targetSelect.options[targetSelect.selectedIndex].disabled) {
            for (let i = 0; i < targetSelect.options.length; i++) {
                if (!targetSelect.options[i].disabled) {
                    targetSelect.value = targetSelect.options[i].value;
                    break;
                }
            }
        }
    }

    handleStartGame() {
        const player1Name = this.player1NameInput.value.trim() || 'Player 1';
        const player1Symbol = this.player1SymbolSelect.value;
        const player1Color = this.player1ColorInput.value;
        const player1SoundKey = EMOJI_SOUND_KEY_MAP[player1Symbol] || 'default_click';

        const player2Name = this.player2NameInput.value.trim() || 'Player 2';
        const player2Symbol = this.player2SymbolSelect.value;
        const player2Color = this.player2ColorInput.value;
        const player2SoundKey = EMOJI_SOUND_KEY_MAP[player2Symbol] || 'default_click';

        if (player1Symbol === player2Symbol) {
            alert('Players cannot choose the same symbol. Please select different symbols.');
            return;
        }

        if (!player1Color || !player2Color) {
            alert('Please select a line color for both players.');
            return;
        }

        const gameSetupData: GameSetupData = {
            player1: { name: player1Name, symbol: player1Symbol, color: player1Color, soundKey: player1SoundKey },
            player2: { name: player2Name, symbol: player2Symbol, color: player2Color, soundKey: player2SoundKey }
        };

        this.setupForm.style.display = 'none';
        if (this.game.canvas) {
            this.game.canvas.style.display = 'block';
        }
        
        this.scene.start('GameScene', gameSetupData);
    }
} 