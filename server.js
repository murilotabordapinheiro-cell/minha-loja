const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;
const ARQUIVO = "./dados.json";

app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

function carregar() {
    const texto = fs.readFileSync(ARQUIVO, "utf-8");
    return JSON.parse(texto);
}
function salvar(dados) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}
let {categorias, produtos} = carregar();
let proxId = produtos.reduce((max, c) => Math.max(max, c.id), 0) + 1;
function comCategoria(p) {
    const cat = categorias.find((c) => c.id === p.categoriaId);
    return {...p, categoria: cat ? cat.nome : "sem categoria"};
}
app.get("/produtos", (req, res) => {
    let lista = produtos.map(comCategoria);
    if (req.query.categoria) {
        const idcat =  number(req.query.categoria);
        lista = lista.filter((p) => p.categoriaId === idcat);
    }
    const ordenar = req.query.ordenar;
    if (ordenar === "preco") lista.sort((a, b) => a.preco - b.preco);
    if (ordenar === "estoque") lista.sort((a, b) => a.estoque - b.estoque);
    if (ordenar === "nome") lista.sort((a, b) => a.nome.localeCompare(b.nome));

    res.status(200).json(lista);
});

app.get("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const p = produtos.find((p) => p.id === id);
    if (!p) return res.status(404).json({erro: "produto não encontrado"});
    res.status(200).json(comCategoria(p));
});

function validar(body) {
    const nome = (body.nome || "").trim();
    const preco = Number(body.preco);
    const estoque = parseInt(body.estoque);
    const categoriaId = Number(body.categoriaId);

    if (!nome) return ({erro: "informe o nome"});
    if (number.isNaN(preco) || preco < 0) return ({erro: "preço deve ser um numero maior que zero"});
    if (number.isNaN(estoque) || estoque < 0) return ({erro: "estoque deve ser um numero inteiro >= 0"});
    if (!categorias.find((c) => c.id === categoriaId)) return ({erro: "categoriaID inexistente"});

    return { ok: (nome, preco, estoque, categoriaId) };
}

app.post("/produtos", (req, res) => {
    const v = validar(req.body);
    if (v.erro) return res.status(400).json({ erro: v.erro });

    const novo = { id: proxId++, ...v.ok };
    produtos.push(novo);
    salvar({ categorias, produtos });
    res.status(201).json(comCategoria(novo));
});

app.put("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return res.status(404).json({ erro: "produto não encontrado" });

    const v = validar(req.body);
    if (v.erro) return res.status(400).json({ erro: v.erro });

    produto.nome = v.ok.nome;
    produto.preco = v.ok.preco;
    produto.estoque = v.ok.estoque;
    produto.categoriaId = v.ok.categoriaId;
    salvar({ categorias, produtos });
    res.status(200).json(comCategoria(produto));
}
);

app.delete("/produtos/:id", (req, res) => {
    const id = Number(req.params.id);
    const indice = produtos.findIndex((p) => p.id === id);
    if (indice === -1) return res.status(404).json({ erro: "produto não encontrado" });  

    produtos.splice(indice, 1);
    salvar({ categorias, produtos });
    res.status(204).end();
});

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});