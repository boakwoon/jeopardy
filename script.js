class QuizGame {
    constructor(element, options={}) {
       
       this.useCategoryIds = options.useCategoryIds || [ 221, 1072, 3514, 218]; 
       /*
          Default Categories from public API Jservise https://jservice.io/search
       */      

       this.categories = [];
       this.clues = {};

       this.currentClue = null;
       this.total = 0;

       this.panelElement = element.querySelector(".panel");
       this.totalCountElement = element.querySelector(".total-count");
       this.formElement = element.querySelector("form");
       this.inputElement = element.querySelector("input[name=user-answer]");
       this.modalElement = element.querySelector(".card-modal");
       this.clueTextElement = element.querySelector(".clue-text");
       this.resultElement = element.querySelector(".result");
       this.resultTextElement = element.querySelector(".result_correct-answer-text");
       this.successTextElement = element.querySelector(".result_success");
       this.failTextElement = element.querySelector(".result_fail");
    }
 
    initGame() {

       this.panelElement.addEventListener("click", event => {
          if (event.target.dataset.clueId) {
             this.handleClueClick(event);
          }
       });
       this.formElement.addEventListener("submit", event => {
          this.handleFormSubmit(event);
       });

       this.updateTotal(0);
       
       this.fetchCategories();
    }
    
 
    fetchCategories() {      
       const categories = this.useCategoryIds.map(category_id => {
          return new Promise((resolve, reject) => {
             fetch(`https://jservice.io/api/category?id=${category_id}`)
                .then(response => response.json()).then(data => {
                   resolve(data);
                });
          });
       });

       Promise.all(categories).then(results => {
          
          results.forEach((result, categoryIndex) => {
             
             var category = {
                title: result.title,
                clues: []
             }

             var clues = shuffle(result.clues).splice(0,5).forEach((clue, index) => {
                console.log(clue)

                var clueId = categoryIndex + "-" + index;
                category.clues.push(clueId);
 
                this.clues[clueId] = {
                   question: clue.question,
                   answer: clue.answer,
                   value: (index + 1) * 100
                };
             })
             
             this.categories.push(category);
          });

          this.categories.forEach((c) => {
             this.renderCategory(c);
          });
       });
    }
 
    renderCategory(category) {      
       let column = document.createElement("div");
       column.classList.add("column");
       column.innerHTML = (
          `<header>${category.title}</header>
          <ul>
          </ul>`
       ).trim();
       
       var ul = column.querySelector("ul");
       category.clues.forEach(clueId => {
          var clue = this.clues[clueId];
          ul.innerHTML += `<li><button data-clue-id=${clueId}>${clue.value}</button></li>`
       })

       this.panelElement.appendChild(column);
    }
 
    updateTotal(change) {
       this.total += change;
       this.totalCountElement.textContent = this.total;
    }
 
    handleClueClick(event) {
       var clue = this.clues[event.target.dataset.clueId];
 
       event.target.classList.add("used");
       
       this.inputElement.value = "";
       
       this.currentClue = clue;
 
       this.clueTextElement.textContent = this.currentClue.question;
       this.resultTextElement.textContent = this.currentClue.answer;
 
       this.modalElement.classList.remove("showing-result");
       
       this.modalElement.classList.add("visible");
       this.inputElement.focus();
    }

    handleFormSubmit(event) {
       event.preventDefault();
       
       var isCorrect = this.cleanseAnswer(this.inputElement.value) === this.cleanseAnswer(this.currentClue.answer);
       if (isCorrect) {
          this.updateTotal(this.currentClue.value);
       }
       
       this.revealAnswer(isCorrect);
    }
    
    cleanseAnswer(input="") {
       var friendlyAnswer = input.toLowerCase();
       friendlyAnswer = friendlyAnswer.replace("<i>", "");
       friendlyAnswer = friendlyAnswer.replace("</i>", "");
       friendlyAnswer = friendlyAnswer.replace(/ /g, "");
       friendlyAnswer = friendlyAnswer.replace(/"/g, "");
       friendlyAnswer = friendlyAnswer.replace(/^a /, "");
       friendlyAnswer = friendlyAnswer.replace(/^an /, "");      
       return friendlyAnswer.trim();
    }
    
    revealAnswer(isCorrect) {
       this.successTextElement.style.display = isCorrect ? "block" : "none";
       this.failTextElement.style.display = !isCorrect ? "block" : "none";
       
       this.modalElement.classList.add("showing-result");
       
       setTimeout(() => {
          this.modalElement.classList.remove("visible");
       }, 3000);
    }
    
 }
 
 function shuffle(a) {
     var j, x, i;
     for (i = a.length - 1; i > 0; i--) {
         j = Math.floor(Math.random() * (i + 1));
         x = a[i];
         a[i] = a[j];
         a[j] = x;
     }
     return a;
 } 

 const game = new QuizGame( document.querySelector(".app"), {});
 game.initGame();
