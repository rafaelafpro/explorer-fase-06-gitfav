//classe que vai conter a lógica dos dados
//como os dados serão estruturados
import { GithubUser } from "./GithubUser.js";



export class Favorites{
    constructor(root){
        this.root = document.querySelector(root);
        this.load();

        
    }

    load(){
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save(){
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username){
        try{

            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists){
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username);
  
            if(user.login === undefined){
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
        } catch(error) {
            alert(error.message)
        }
        

    }

    delete(user){
        const filteredEntries = this.entries.filter((entry)=>{
            return entry == user ? false : true
        })

        this.entries = filteredEntries;
        this.update();
    }


    // delete(user){
    //     const userIndex = this.entries.indexOf(user);
    //     this.entries.splice(userIndex, '1')
    // }


}


//classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites{
    constructor(root){
        super(root);

        this.tbody = this.root.querySelector('table tbody');

        this.update();
        this.onadd();
    }

    onadd(){
        const addButton = document.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value);
            this.root.querySelector('.search input').value = '';
        }

        this.root.querySelector('.search input').onkeyup = ({key}) => {
          if(key == 'Enter'){
            addButton.click();
          }
           
        }
    }

    update(){
        this.removeAllTr();



        this.entries.forEach((user)=>{
            const row = this.createRow();
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.user span').textContent = user.login;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;

            row.querySelector('.remove').onclick = (event)=>{
                const canDelete = confirm('Tem certeza que deseja deletar essa linha?')
                if(canDelete){
                    this.delete(user);
                }
            }

            this.tbody.append(row);
        })

        this.save();
    }

    createRow(){
        const tr = document.createElement("tr");

        const content = `
        <td class="user">
            <img src="https://github.com/rafaelafpro.png" alt="">
            <a href="https://github.com/rafaelafpro" target="_blank">
                <p>Rafael Andrade</p>
                <span>rafaelafpro</span>
            </a>
        </td>
        <td class="repositories">
            76
        </td>
        <td class="followers">
            982
        </td>
        <td><button class="remove">&times;</button></td>
        `
        tr.innerHTML = content;

        return tr;
    }

    removeAllTr(){

        this.tbody.querySelectorAll('tr')
            .forEach((tr)=>{
                tr.remove();
            })
    }
}