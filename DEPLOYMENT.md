# Guia de Deployment - Betengine

## ⚠️ Requisitos Importantes

Este projeto é uma **aplicação full-stack** (React + Node.js + SQLite). Ele NÃO é apenas um site estático.

## Opção 1: Hostinger com Node.js (RECOMENDADO)

### Pré-requisitos:
- Hostinger com suporte a Node.js (Hostinger Premium ou Business)
- Acesso SSH ou Terminal

### Passos:

1. **Crie uma pasta no servidor:**
   ```bash
   mkdir ~/public_html/betengine
   cd ~/public_html/betengine
   ```

2. **Envie os arquivos:**
   - Envie TODOS os arquivos do projeto (não apenas o `dist`)
   - Incluindo: `package.json`, `server.ts`, `tsconfig.json`, `src/`, etc.

3. **Na pasta do servidor, execute:**
   ```bash
   npm install --production
   npm run build
   npm start
   ```

4. **Configure a porta:**
   - Se usar porta 3000, acesse: `https://seu-dominio.com:3000`
   - Ou configure o Node.js como aplicação no painel da Hostinger

## Opção 2: Apenas Frontend (Limitado)

Se a Hostinger NÃO suporta Node.js:

1. Envie apenas os arquivos dentro da pasta `dist/`
2. Crie um arquivo `.htaccess` na raiz:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

⚠️ **Problema:** Sem o backend, login/registro NÃO funcionarão!

## Estrutura de Arquivos para Upload

```
betengine/
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── database.sqlite (será criado automaticamente)
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   └── ...
└── dist/
    ├── index.html
    ├── assets/
    └── ...
```

## Variáveis de Ambiente

Crie um arquivo `.env` no servidor com:

```env
JWT_SECRET=seu-secreto-super-seguro-aqui
GEMINI_API_KEY=sua-chave-de-api-opcional
NODE_ENV=production
```

## Troubleshooting

**"Login não funciona"** → Servidor Node.js não está rodando
**"Página branca"** → Verifique os logs: `npm run dev`
**"Erro 404"** → Verifique se o `.htaccess` está configurado (Opção 2)

---

Qual opção você quer usar?
