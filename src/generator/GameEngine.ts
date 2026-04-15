import { generateLevel } from './levelGenerator';

export class GameEngine {
    private container: HTMLElement;
    private levelData: any;
    private userCode: string = "";

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
    }

    public loadLevel(levelNum: number) {
        this.levelData = generateLevel(levelNum);
        
        this.render();
        
        this.attachEvents();
    }

    private render() {
        const { newConcept, difficulty } = this.levelData;

        let elementsHtml = '';
        for (let i = 0; i < difficulty.itemCount; i++) {
            elementsHtml += `<div class="target-element" id="item-${i}">Item ${i+1}</div>`;
        }

        this.container.innerHTML = `
            <div class="instruction-box">
                <span style="font-size: 1.5em">💡</span>
                <div>
                    <strong>Objectif :</strong> Utilise <code>${newConcept}</code> pour styliser les boîtes.
                    <br><small>Essaie de changer la couleur ou la taille !</small>
                </div>
            </div>

            <div class="game-area">
                <div class="workspace">
                    <div class="editor-pane">
                        <div class="editor-header">style.css</div>
                        <textarea id="cssEditor" class="code-input" spellcheck="false" 
placeholder="/* Écris ton CSS ici */
.target {
  ${newConcept}: ...;
}"></textarea>
                    </div>

                    <div class="preview-pane" id="previewArea">
                        ${elementsHtml}
                    </div>
                </div>

                <button id="checkAnswerBtn" class="check-btn">Vérifier</button>
                <div id="feedback" style="text-align: center; margin-top: 10px; font-weight: bold;"></div>
            </div>
        `;
    }

    private attachEvents() {
        const editor = document.getElementById('cssEditor') as HTMLTextAreaElement;
        const checkBtn = document.getElementById('checkAnswerBtn');
        const feedback = document.getElementById('feedback');
        let styleTag = document.getElementById('dynamic-game-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-game-style';
            document.head.appendChild(styleTag);
        }

        editor.addEventListener('input', (e) => {
            const val = (e.target as HTMLTextAreaElement).value;
            this.userCode = val;
            const scopedCSS = val.replace(/\.target/g, '#previewArea .target-element');
            styleTag.innerHTML = scopedCSS;
        });

        checkBtn?.addEventListener('click', () => {
            this.validateLevel(feedback!);
        });
    }

    private validateLevel(feedbackEl: HTMLElement) {
        const concept = this.levelData.newConcept;
        if (this.userCode.includes(concept)) {
            feedbackEl.style.color = "green";
            feedbackEl.innerHTML = "🎉 Bravo ! Tu as utilisé le bon concept.";
            document.querySelectorAll('.target-element').forEach((el: any) => {
                el.style.transform = "scale(1.1) rotate(5deg)";
                setTimeout(() => el.style.transform = "none", 500);
            });

        } else {
            feedbackEl.style.color = "red";
            feedbackEl.innerHTML = `❌ Il manque la propriété <code>${concept}</code> !`;
        }
    }
}