# Mirante Vendas Frontend

Aplicação Angular para consultar vendas, visualizar os totais por produto e dia e importar vendas a partir de arquivos CSV.

## Requisitos

- Node.js e npm instalados.
- Google Chrome instalado para executar os testes com Karma.
- API de vendas disponível. O ambiente de desenvolvimento aponta para `http://localhost:5018/api`.

## Instalação

Na raiz do projeto, instale as dependências travadas no `package-lock.json`:

```bash
npm ci
```

## Executar localmente

```bash
npm start
```

A aplicação estará disponível em [http://localhost:4200](http://localhost:4200). O servidor recarrega a página quando os arquivos de código são alterados.

Para apontar para outra API, ajuste `apiUrl` em `src/environments/environment.ts`. O build de produção usa `src/environments/environment.prod.ts`.

## Build

```bash
npm run build
```

O Angular CLI usa a configuração de produção por padrão. Os arquivos gerados ficam em `dist/mirante-vendas-frontend/`.

## Testes unitários e cobertura

Execute os testes: (uma vez, sem watch, usando Chrome headless:)

```bash
npm run test
```

A configuração do projeto ativa a cobertura de código para os testes. O relatório HTML fica em `coverage/mirante-vendas-frontend/index.html`; o resumo também é exibido no terminal. Abra o relatório HTML no navegador para navegar pela cobertura por arquivo.

## Lint

```bash
npm run lint
```

## Organização do código

As telas são divididas por funcionalidade em `src/features`. As rotas de Dashboard e Import CSV carregam seus módulos sob demanda. Código reutilizado entre funcionalidades fica em `src/shared`.

### `features/menu`

Define a navegação principal da aplicação para Dashboard e Import CSV. O menu é exibido junto ao shell da aplicação.

### `features/dashboard`

Apresenta os dados de vendas em tabela ou gráfico. O estado da funcionalidade concentra paginação, ordenação, filtros e dados carregados; as vendas são agregadas por produto e dia. A tabela permite abrir os detalhes das vendas de um produto, e o botão de exportação gera um CSV dos totais exibidos.

### `features/import-csv`

Cuida do fluxo de importação: seleção e validação do arquivo, processamento do CSV em Web Worker, apresentação do estado do processamento e envio das vendas à API. O envio pode ser simultâneo ou sequencial; o modo sequencial aplica retentativas às requisições que falharem.

### `shared`

Contém recursos compartilhados, incluindo o serviço HTTP de vendas (`src/shared/api/vendas.service.ts`) e os componentes e serviços de notificação toast (`src/shared/toast`).

## Glossário

> `\uFEFF` é a notação Unicode do caractere BOM (Byte Order Mark ou Marca de Ordem de Byte), usado no início do CSV exportado para ajudar programas como planilhas a identificar a codificação do arquivo.
