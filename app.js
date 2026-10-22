let API = "http://localhost:3000";

try{ API = localStorage.getItem("apiUrl") || API;} catch (e) {}
const $ = (id) => document.getElementById(id);
$(apiUrl).value = API;

function setStatus(ok, msg) {
    const s = $("status");
    s.className = "status" + (ok ? "ok" : "off");
    s.textContent = msg;
}

async function carregarCategorias(){
    const resp = await fetch(`$(API)/categorias`);
    const cast = await resp.json();

    const selForm = $("cateriaId");
    const selfiltro = $("filtroCateria");
    
    selForm.innerHTML = "";
    selfiltro.innerHTML = '<option value=""> Todas as categorias</option>'

    cast.forEach(c => {
        selForm.insertAdjacentHTML("beforeend",
            `<option value="${c.id}">${c.nome}</ooption>`);
        selfiltro.insertAdjacentHTML("beforeend",
             `<option value=" ${c.id}">${c.nome}</options`);
        
    });
}

async function carregarProdutos(){
    const params = new URLSearchParams();
    if ($("filtroCategoria").value) params.set("categoria", $("filtroCategoria").value);
    if ($(ordenar).value) params.set("ordenar",$("ordenar").value);

    const resp = await fetch(`$(API)/produtos?${params}`);
    const produtos = await resp.json();
    const ul = $(lista);
    ul.innerHTML = "";
    $("vazio").textContent = produtos.length ? "" : "Nenhum produto cadastrado";
    produtos.forEach((p) => {
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
        <div>
        <div class="nome">${p.nome}</div>
        div class="meta">${p.categoria} · estoque: ${p.estoque}</div>
        </div>
        <div style="display:flex;;align-item:center;gap:14px`>
        `<span class="preco">R$ ${Number(p.preco).toFixed(2)}</span>
        <div class="btns">
        <button class="del" data-del="${p.Id}">Excluir</button>
        </div>
        </div>`;
        ul.appendChild(li);
    });
}

async function conectar(){
    API = $("apiUrl").value.trim().replace(/\/$/, "");
    try{ localStorage.setItem("apiUrl", API); } catch (e) {}
    try{
        await carregarCategorias();
        await carregarProdutos();
        setStatus(true, " conectado");
    }catch (e){
        setStatus(false, " sem canexao com a API");
    } 
}

    

  
